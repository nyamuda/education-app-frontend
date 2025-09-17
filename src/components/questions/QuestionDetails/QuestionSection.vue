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
                {{ question?.marks }} marks
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
                <h2 class="question-title text-secondary">{{ question?.title }}</h2>

                <div class="ms-auto d-flex gap-3 meta-text mb-2">
                  <small class="text-muted">Created 15h ago</small>
                  <small class="text-muted">Modified 3h ago</small>
                </div>
                <p class="question-body mb-3">{{ question?.contentText }}</p>

                <!-- Metadata -->
                <dl class="row">
                  <dt class="col-sm-3">Curriculum</dt>
                  <dd class="col-sm-9">
                    {{ question?.subject?.level?.examBoard?.curriculum?.name }}
                  </dd>
                  <dt class="col-sm-3">Exam Board</dt>
                  <dd class="col-sm-9">{{ question?.subject?.level?.examBoard?.name }}</dd>
                  <dt class="col-sm-3">Level</dt>
                  <dd class="col-sm-9">{{ question?.subject?.level?.name }}</dd>
                  <dt class="col-sm-3">Subject</dt>
                  <dd class="col-sm-9">{{ question?.subject?.name }}</dd>
                  <dt class="col-sm-3">Topic</dt>
                  <dd class="col-sm-9">{{ question?.topic?.name }}</dd>
                  <dt class="col-sm-3">Subtopic</dt>
                  <dd class="col-sm-9">{{ question?.subtopic?.name }}</dd>
                </dl>

                <hr class="separator my-2" />

                <!-- Action buttons + author -->
                <div class="d-flex flex-column">
                  <div class="action-bar d-flex gap-3 mt-0">
                    <UpvoteButton
                      :count="upvotes.length"
                      :is-upvoted="hasUpvoted"
                      :onUpvote="upvoteQuestion"
                      :onRemoveUpvote="removeQuestionUpvote"
                    />

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
                      <span class="d-block fw-bold cursor-pointer">{{
                        question?.user?.username
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from "vue";

import Card from "primevue/card";
import Avatar from "primevue/avatar";
import Button from "primevue/button";
import Tag from "primevue/tag";
import UpvoteButton from "@/components/shared/UpvoteButton.vue";
import { useRouter } from "vue-router";
import type { Question } from "@/models/question";
import { useToast } from "primevue";
import { useQuestionStore } from "@/stores/question";
import { useUpvoteStore } from "@/stores/upvote";
import type { Upvote } from "@/models/upvote";
import { useAuthStore } from "@/stores/auth";

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
    await getQuestionUpvotes();
  } catch {}
});

const router = useRouter();
const toast = useToast();
const questionStore = useQuestionStore();
const upvoteStore = useUpvoteStore();
const authStore = useAuthStore();
const questionId: Ref<number | null> = ref(null);
const question: Ref<Question | null> = ref(null);
const upvotes: Ref<Upvote[]> = ref([]);

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

    await getQuestionUpvotes();
  } catch {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to upvote this question.",
      life: 10000,
    });
  }
};

//Checks whether the current user has upvoted this question
const hasUpvoted = computed(() => upvotes.value.some((x) => x.userId === authStore.user?.id));

// Removes the current user's upvote from the question.
const removeQuestionUpvote = async () => {
  try {
    if (!questionId.value) return;
    await upvoteStore.deleteQuestionUpvote(questionId.value);

    await getQuestionUpvotes();
  } catch {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to remove your upvote from this question.",
      life: 10000,
    });
  }
};

//Gets all upvotes for the question.
const getQuestionUpvotes = async () => {
  try {
    if (!questionId.value) return;
    upvotes.value = await upvoteStore.getQuestionUpvotes(questionId.value);
  } catch {}
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
