<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Main Content -->
      <div class="col-12 col-lg-8 w-100">
        <!-- Question Section -->
        <Card class="position-relative">
          <template #content>
            <div class="d-flex flex-column flex-md-row">
              <!-- Ribbon -->
              <div
                v-if="question?.marks"
                class="position-absolute top-0 end-0 bg-secondary text-white px-3 py-1 rounded-start"
              >
                {{ question?.marks == 1 ? question?.marks + " mark" : question?.marks + " marks" }}
              </div>

              <!-- Main content -->
              <div class="flex-grow-1">
                <!-- Tags + meta -->
                <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                  <Tag
                    v-for="tag in question?.tags"
                    :key="tag.id"
                    :value="tag.name"
                    severity="info"
                    rounded
                    class="tag-chip cursor-pointer"
                    @click="() => onTagClick(tag.name)"
                  />
                </div>

                <!-- Title + body -->
                <h2 class="question-title text-secondary">{{ question?.title }}</h2>

                <div class="ms-auto d-flex gap-4 meta-text mb-2">
                  <small
                    ><span class="text-muted me-1">Created</span
                    >{{ dayjs.utc(question?.createdAt).local().fromNow() }}</small
                  >
                  <small
                    ><span class="text-muted me-1">Modified</span
                    >{{ dayjs.utc(question?.updatedAt).local().fromNow() }}</small
                  >
                </div>
                <p class="question-body mb-3 text-dark">{{ question?.contentText }}</p>

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
                  <dt v-if="question?.topic?.name" class="col-sm-3">Topic</dt>
                  <dd v-if="question?.topic?.name" class="col-sm-9">{{ question?.topic?.name }}</dd>
                  <dt v-if="question?.subtopic?.name" class="col-sm-3">Subtopic</dt>
                  <dd v-if="question?.subtopic?.name" class="col-sm-9">
                    {{ question?.subtopic?.name }}
                  </dd>
                </dl>

                <hr class="separator my-2" />

                <!-- Action buttons + author -->
                <div class="d-flex flex-column">
                  <div class="action-bar d-flex gap-3 mt-0">
                    <UpvoteButton
                      :count="question?.totalUpvotes ?? 0"
                      :is-upvoted="question?.isUpvoted ?? false"
                      :onUpvote="upvoteQuestion"
                      :onRemoveUpvote="removeQuestionUpvote"
                      upvoted-tooltip-text="This question is clear, helpful, and adds value for students (click to undo your upvote)."
                      not-upvoted-tooltip-text="This question is clear, helpful, and adds value for students."
                    />

                    <ShareButton title="hello world" :share-url="shareUrl" />
                    <BookmarkButton
                      :is-bookmarked="question?.isBookmarked ?? false"
                      :onBookmark="bookmarkQuestion"
                      :onRemoveBookmark="removeQuestionBookmark"
                      bookmarked-tooltip-text="Unsave this question."
                      not-bookmarked-tooltip-text="Save this question."
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

                  <div class="author-info d-flex align-items-center gap-2 ms-auto mt-2 mt-md-0">
                    <div
                      style="font-size: small"
                      class="d-flex flex-column align-items-start gap-1"
                    >
                      <!-- Date created -->
                      <span
                        >Created
                        {{
                          dayjs.utc(question?.createdAt).local().format("MMM D, YYYY [at] H:mm")
                        }}</span
                      >
                      <!-- Avatar and user name -->
                      <div class="d-flex align-items-center gap-2">
                        <Avatar :label="question?.user?.username[0].toUpperCase()" />
                        <span class="d-block cursor-pointer text-primary">{{
                          question?.user?.username
                        }}</span>
                      </div>
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
import dayjs from "dayjs";
import { SmoothScrollHelper } from "@/helpers/smoothScrollHelper";
import { useBookmarkStore } from "@/stores/bookmark";
import BookmarkButton from "@/components/shared/BookmarkButton.vue";
import ShareButton from "@/components/shared/ShareButton.vue";

onMounted(async () => {
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
const bookmarkStore = useBookmarkStore();
const questionId: Ref<number | null> = ref(null);
const question: Ref<Question | null> = ref(null);
const isUpvoting = ref(false);
const isRemovingUpvote = ref(false);
const isBookmarking = ref(false);
const isRemovingBookmark = ref(false);

//Url for sharing the question
const shareUrl = computed(() => {
  return `${window.location.origin}/questions/${router.currentRoute.value.params["id"]}/details`;
});

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
    if (!questionId.value || isUpvoting.value || isRemovingUpvote.value) return;

    isUpvoting.value = true;
    await upvoteStore.addQuestionUpvote(questionId.value);
  } catch {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to upvote this question.",
      life: 10000,
    });
  } finally {
    isUpvoting.value = false;
  }
};

// Removes the current user's upvote from the question.
const removeQuestionUpvote = async () => {
  try {
    if (!questionId.value || isUpvoting.value || isRemovingUpvote.value) return;

    isRemovingUpvote.value = true;
    await upvoteStore.deleteQuestionUpvote(questionId.value);
  } catch {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to remove your upvote from this question.",
      life: 10000,
    });
  } finally {
    isRemovingUpvote.value = false;
  }
};

//Adds a bookmark for the question on behalf of the current user.
const bookmarkQuestion = async () => {
  try {
    if (!questionId.value || isBookmarking.value || isRemovingBookmark.value) return;

    isBookmarking.value = true;
    await bookmarkStore.addQuestionBookmark(questionId.value);
  } catch {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to bookmark this question.",
      life: 10000,
    });
  } finally {
    isBookmarking.value = false;
  }
};

// Removes the current user's bookmark for the question.
const removeQuestionBookmark = async () => {
  try {
    if (!questionId.value || isBookmarking.value || isRemovingBookmark.value) return;

    isRemovingBookmark.value = true;
    await bookmarkStore.deleteQuestionBookmark(questionId.value);
  } catch {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to remove your bookmark for this question.",
      life: 10000,
    });
  } finally {
    isRemovingBookmark.value = false;
  }
};

/**
 * Handles clicking on a tag.
 *
 * - Resets any existing filters.
 * - Applies the selected tag as the active filter.
 * - Updates the browser URL with the new filter query parameters.
 * - Navigates to the questions page and fetches filtered questions.
 *
 * @param tagName The name of the tag that was clicked.
 */
const onTagClick = async (tagName: string) => {
  // Clear any previously applied filters
  questionStore.filter.clear();

  // Apply the clicked tag as the active filter
  questionStore.filter.tags = tagName;

  // Update the browser URL to reflect the current filter state
  const availableQueryParams = questionStore.filter.applyFilterToBrowserUrl();
  router.push({ path: "/questions", query: { ...availableQueryParams } });

  //smoothly scroll to the top of the question list
  const elementId = "question-list";
  SmoothScrollHelper.scrollToElement(elementId);

  // Fetch the list of questions based on the updated filter
  await questionStore.getQuestions(questionStore.filter.toQueryParams());
};
</script>
<style scoped lang="scss">
.text-primary {
  color: #1a73e8 !important;
}

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
