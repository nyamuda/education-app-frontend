<template>
  <div>
    <div class="row">
      <!-- Main Content -->
      <div class="col-12 col-lg-8">
        <!-- Question Section -->
        <Card class="position-relative">
          <template #content>
            <div class="d-flex flex-column flex-md-row">
              <!-- Ribbon -->
              <div
                class="position-absolute top-0 end-0 bg-secondary text-white px-3 py-1 rounded-start"
              >
                {{ question.marks }} marks
              </div>

              <!-- Main content -->
              <div class="flex-grow-1">
                <!-- Tags + meta -->
                <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                  <Tag value="blockchain" severity="info" rounded class="tag-chip" />
                  <Tag value="computer-science" severity="info" rounded class="tag-chip" />
                  <Tag value="cryptography" severity="info" rounded class="tag-chip" />
                </div>

                <!-- Title + body -->
                <h2 class="question-title text-secondary">{{ question.title }}</h2>

                <div class="ms-auto d-flex gap-3 meta-text mb-2">
                  <small class="text-muted">Created 15h ago</small>
                  <small class="text-muted">Modified 3h ago</small>
                </div>
                <p class="question-body mb-3">{{ question.body }}</p>

                <!-- Metadata -->
                <dl class="row">
                  <dt class="col-sm-3">Curriculum</dt>
                  <dd class="col-sm-9">{{ question.curriculum }}</dd>
                  <dt class="col-sm-3">Exam Board</dt>
                  <dd class="col-sm-9">{{ question.examBoard }}</dd>
                  <dt class="col-sm-3">Level</dt>
                  <dd class="col-sm-9">{{ question.level }}</dd>
                  <dt class="col-sm-3">Subject</dt>
                  <dd class="col-sm-9">{{ question.subject }}</dd>
                  <dt class="col-sm-3">Topic</dt>
                  <dd class="col-sm-9">{{ question.topic }}</dd>
                  <dt class="col-sm-3">Subtopic</dt>
                  <dd class="col-sm-9">{{ question.subtopic }}</dd>
                </dl>

                <hr class="separator my-2" />

                <!-- Action buttons + author -->
                <div class="d-flex flex-column">
                  <div class="action-bar d-flex gap-3 mt-0">
                    <VotePanel />

                    <Button
                      icon="pi pi-share-alt"
                      text
                      size="small"
                      severity="secondary"
                      class="action-btn"
                      label="Share"
                    />
                    <Button
                      icon="pi pi-bookmark"
                      text
                      severity="secondary"
                      size="small"
                      class="action-btn"
                      label="Bookmark"
                    />
                    <Button
                      icon="pi pi-flag"
                      text
                      size="small"
                      severity="secondary"
                      class="action-btn"
                      label="Flag"
                    />
                  </div>

                  <div class="author-info d-flex align-items-center gap-2 ms-auto">
                    <Avatar label="A" shape="circle" />
                    <div>
                      <span class="d-block fw-bold cursor-pointer">{{ question.author }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Answers Section -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="mb-0">{{ answers.length }} Answers</h4>
          <Dropdown v-model="sortBy" :options="sortOptions" optionLabel="label" class="w-auto" />
        </div>

        <Card v-for="answer in answers" :key="answer.id" class="mb-3">
          <template #content>
            <div class="d-flex">
              <!-- Votes -->
              <div class="me-3 text-center">
                <Button icon="pi pi-arrow-up" text @click="voteAnswer(answer.id, 'up')" />
                <div>{{ answer.votes }}</div>
                <Button icon="pi pi-arrow-down" text @click="voteAnswer(answer.id, 'down')" />
              </div>

              <!-- Answer content -->
              <div class="flex-grow-1">
                <p>{{ answer.body }}</p>
                <div class="d-flex justify-content-between align-items-center mt-2">
                  <div class="d-flex align-items-center gap-2 text-muted">
                    <Avatar label="A" size="small" />
                    <small>by Nyamuda</small>
                  </div>
                  <div class="d-flex gap-2">
                    <Button icon="pi pi-comments" text size="small" />
                    <Button icon="pi pi-flag" text size="small" />
                  </div>
                </div>

                <!-- Comments -->
                <div class="mt-3 ps-3 border-start">
                  <div v-for="comment in answer.comments" :key="comment.id" class="mb-2">
                    <small>
                      <strong>{{ comment.author }}:</strong> {{ comment.text }}
                      <span class="text-muted">• {{ comment.date }}</span>
                    </small>
                  </div>
                  <div class="d-flex gap-2 mt-2">
                    <InputText
                      v-model="newComment"
                      placeholder="Add a comment"
                      class="flex-grow-1"
                    />
                    <Button label="Post" size="small" @click="postComment(answer.id)" />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Sidebar -->
      <div class="col-12 col-lg-4 mt-4 mt-lg-0">
        <Card>
          <template #title>
            <h5>Related Questions</h5>
          </template>
          <template #content>
            <ul class="list-unstyled mb-0">
              <li v-for="q in relatedQuestions" :key="q.id">
                <a href="#" class="d-block mb-2">{{ q.title }}</a>
              </li>
            </ul>
          </template>
        </Card>

        <Card class="mt-4">
          <template #title>
            <h5>Popular Tags</h5>
          </template>
          <template #content>
            <div class="d-flex flex-wrap gap-2">
              <Tag v-for="tag in popularTags" :key="tag" :value="tag" severity="info" rounded />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from "vue";

import Card from "primevue/card";
import Avatar from "primevue/avatar";
import Button from "primevue/button";
import Tag from "primevue/tag";
//import Avatar from "primevue/avatar";
// import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import VotePanel from "../shared/UpvoteButton.vue";
import { useRouter } from "vue-router";
import type { Question } from "@/models/question";
import { useToast } from "primevue";
import { useQuestionStore } from "@/stores/question";
import { useUpvoteStore } from "@/stores/upvote";

onMounted(async () => {
  //scroll up to the top of the page
  window.scrollTo(0, 0);

  //get the question ID from a query parameter
  const id = router.currentRoute.value.params["id"];

  //fetch question with the given ID from the backend
  if (!id) return;

  try {
    questionId.value = Number(id);
    await getQuestionById();
  } catch {}
});

const router = useRouter();
const toast = useToast();
const questionStore = useQuestionStore();
const upvoteStore = useUpvoteStore();
const questionId: Ref<number | null> = ref(null);
const question: Ref<Question | null> = ref(null);

const answers = ref([
  {
    id: 1,
    body: "Oxygen is released during the light-dependent reactions...",
    votes: 8,
    author: "John Smith",
    date: "1 day ago",
    comments: [{ id: 1, author: "Alex", text: "Thanks, this helped!", date: "10h ago" }],
  },
  {
    id: 2,
    body: "It comes from the splitting of water molecules in the thylakoids...",
    votes: 3,
    author: "Sarah Lee",
    date: "5h ago",
    comments: [],
  },
]);

const relatedQuestions = ref([
  { id: 1, title: "What is the role of chlorophyll?" },
  { id: 2, title: "Why are plants green?" },
]);

const popularTags = ref(["biology", "chemistry", "physics", "math"]);

const sortBy = ref();
const sortOptions = [
  { label: "Most Upvoted", value: "votes" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

const newComment = ref("");

// function vote(direction: "up" | "down") {
//   console.log("vote on question", direction);
// }
function voteAnswer(id: number, direction: "up" | "down") {
  console.log("vote on answer", id, direction);
}
function postComment(answerId: number) {
  console.log("posting comment to", answerId, newComment.value);
  newComment.value = "";
}

const getQuestionById = async () => {
  try {
    if (!questionId.value) return;
    question.value = await questionStore.getQuestionById(questionId.value);
  } catch (message) {
    toast.add({
      severity: "error",
      summary: "Fetch Failed",
      detail: message,
      life: 10000,
    });
  }
};
//Adds an upvote to the question on behalf of the current user.
const upvoteQuestion = async () => {
  try {
    if (!questionId.value) return;
    await upvoteStore.addQuestionUpvote(questionId.value);
  } catch {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to upvote this question.",
      life: 10000,
    });
  }
};
</script>
<style scoped lang="scss">
.meta-text small {
  font-size: 0.8rem;
}

.tag-chip {
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #e9f2ff;
  color: #2196f3;
  border: 1px solid #bbdffc;
}

.question-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #2c3e50;
}

.question-body {
  font-size: 1rem;
  line-height: 1.6;
  color: #495057;
}

/*
.action-btn {
  color: #6c757d;
  font-weight: 500;
  transition: color 0.2s ease-in-out;
  &:hover {
    color: #2196f3;
  }
}*/
</style>
