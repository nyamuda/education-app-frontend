<template>
  <div class="container mx-auto">
    <div class="d-flex justify-content-between">
      <TitleSection title="Questions" title-size="small" align-items="center" />
      <div class="col-auto">
        <router-link to="/questions/add">
          <Button label="New question" icon="pi pi-plus" size="small" severity="primary" />
        </router-link>
      </div>
    </div>

    <!-- Hierarchy filters start-->
    <CurriculumHierarchyQuestionFilter ref="curriculumHierarchyQuestionFilterRef">
      <template #extraContent>
        <!-- Sorting select input -->
        <div class="col-6 col-md-3">
          <QuestionSortingSelect />
        </div>

        <div class="col-6 col-md-3">
          <!-- Apply button -->
          <Button
            label="Apply"
            icon="pi pi-filter"
            size="small"
            variant="outlined"
            severity="contrast"
            @click="getAllQuestions"
            :disabled="isGettingCurriculums || questionStore.isGettingQuestions"
          />
        </div>
      </template>
    </CurriculumHierarchyQuestionFilter>
    <!-- Hierarchy filters end-->

    <!--Skeletons start-->
    <div id="question-list" v-if="questionStore.isGettingQuestions || isGettingCurriculums">
      <QuestionListItemSkeleton v-for="i in 5" :key="i" />
    </div>
    <!--Skeletons end-->

    <!--Questions start-->
    <div id="question-list" v-else-if="questionStore.questions.items?.length > 0">
      <QuestionListItem
        v-for="question in questionStore.questions.items"
        :key="question.id"
        :title="question.title"
        :content="question.contentText"
        :marks="question.marks ?? 0"
        :answers="question.totalAnswers ?? 0"
        :upvotes="question.totalUpvotes ?? 0"
        :curriculum="question.subject?.level?.examBoard?.curriculum?.name ?? null"
        :exam-board="question.subject?.level?.examBoard?.name ?? null"
        :level="question.subject?.level?.name ?? null"
        :subject="question.subject?.name ?? null"
        :topic="question.topic?.name"
        :subtopic="question.subtopic?.name"
        :modified="question.updatedAt"
        :username="question.user?.username ?? null"
        :tags="question.tags"
      />

      <LoadMoreButton
        @click-callback="loadMoreQuestions"
        :is-loading="isLoadingMoreQuestions"
        :has-more="questionStore.questions.hasMore"
        label="Load more questions"
        loading-label="Loading questions..."
        end-label="No more questions to show"
        end-variant="text"
      />
      <!-- Pagination start -->
      <!-- <Paginator
        :rows="questionStore.questions.pageSize"
        :totalRecords="questionStore.questions.totalItems"
        @page="onPageChange"
        :first="(questionStore.questions.page - 1) * questionStore.questions.pageSize"
      /> -->
      <!-- Pagination end -->
    </div>
    <!--Table end-->

    <!--No Questions Start-->
    <EmptyList
      v-else
      title="No Questions Available"
      message="We couldn’t find any questions. Try adjusting your filters or search terms."
    />
    <!--No Questions End-->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Button from "primevue/button";
import { useToast } from "primevue/usetoast";
import EmptyList from "../shared/EmptyList.vue";
import TitleSection from "../shared/TitleSection.vue";
//import Paginator, { type PageState } from "primevue/paginator";
//import { SmoothScrollHelper } from "@/helpers/smoothScrollHelper";
import { useQuestionStore } from "@/stores/question";
import QuestionListItemSkeleton from "./skeletons/QuestionListItemSkeleton.vue";
import QuestionListItem from "./QuestionListItem.vue";
import QuestionSortingSelect from "../shared/selects/QuestionSortingSelect.vue";
import CurriculumHierarchyQuestionFilter from "../shared/CurriculumHierarchyQuestionFilter.vue";
import LoadMoreButton from "../shared/LoadMoreButton.vue";

const questionStore = useQuestionStore();

const toast = useToast();
const isGettingCurriculums = ref(false);
const curriculumHierarchyQuestionFilterRef = ref();
const isLoadingMoreQuestions = ref(false);

onMounted(async () => {
  await getCurriculumsAndApplyDefaults();
  await getAllQuestions();
});

/**
 * Gets all curriculums to use in the filter dropdowns
 * and applies any default filter values.
 */
const getCurriculumsAndApplyDefaults = async () => {
  isGettingCurriculums.value = true;
  await curriculumHierarchyQuestionFilterRef.value?.getCurriculumsAndApplyDefaults();
  isGettingCurriculums.value = false;
};

// Gets all questions based on the current filter state
const getAllQuestions = async () => {
  try {
    // Prepare the query parameters from the current filter
    const params = questionStore.filter.toQueryParams();

    // Prevent duplicate requests:
    // If a fetch is already in progress (for example, triggered by the
    // AutoComplete search component when the user presses Enter), cancel this call.
    if (questionStore.isGettingQuestions) return;

    await questionStore.getQuestions(params);
  } catch {
    toast.add({
      severity: "error",
      summary: "Unable to Fetch Questions",
      detail: "We couldn’t retrieve the questions. Please retry.",
      life: 5000,
    });
  }
};

// Load mores questions
const loadMoreQuestions = async () => {
  try {
    // Determine the next page number based on the current pagination state
    const page = questionStore.questions.page + 1;
    const pageSize = questionStore.questions.pageSize;
    // Prepare the query parameters from the current filter
    const params = questionStore.filter.toQueryParams(page, pageSize);
    isLoadingMoreQuestions.value = true;
    await questionStore.loadMoreQuestions(params);
  } catch {
    toast.add({
      severity: "error",
      summary: "Unable to Load More Questions",
      detail: "Something went wrong while fetching more questions.",
      life: 5000,
    });
  } finally {
    isLoadingMoreQuestions.value = false;
  }
};

/**
 * Called when the user switches pages in the paginator.
 * 1. Converts PrimeVue's 0-based page index to 1-based.
 * 2. Stores the new page in state.
 * 3. Fetches the updated questions list and scrolls to the top of that list.
 */
// const onPageChange = (state: PageState) => {
//   // PrimeVue uses a 0-based page index, so add 1 before sending
//   // the request to the backend, which expects 1-based indexing.
//   questionStore.filter.page = state.page + 1;
//   getAllQuestions();

//   //smoothly scroll to the top of the list
//   const elementId = "question-list";
//   SmoothScrollHelper.scrollToElement(elementId);
// };
</script>

<style lang="scss" scoped>
.btn {
  display: inline-block;
}
</style>
