<template>
  <div>
    <div class="row">
      <!-- Main Content -->
      <div class="col-12 col-lg-8">
        <!-- Question Section -->
        <QuestionSection />

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
import { useRouter } from "vue-router";
import type { Question } from "@/models/question";
import { useToast } from "primevue";
import { useQuestionStore } from "@/stores/question";
import QuestionSection from "./QuestionSection.vue";

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
</script>
<style scoped lang="scss"></style>
