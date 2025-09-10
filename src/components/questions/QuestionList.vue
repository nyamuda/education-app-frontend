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
    <CurriculumHierarchyFilters
      :callback-method="getAllQuestions"
      @filter="(val: CurriculumHierarchyFilter) => (questionStore.filter = val)"
    >
      <template #extraContent>
        <!-- Sorting -->
        <div class="col-6 col-md-3">
          <Select
            placeholder="Sort by"
            checkmark
            v-model="selectedSortOption"
            :options="sortOptions"
            option-label="name"
            option-value="value"
            @change="getAllQuestions"
            size="small"
            class="w-100"
            show-clear
          />
        </div>

        <!-- Button -->
      </template>
    </CurriculumHierarchyFilters>
    <!-- Hierarchy filters end-->

    <!--Skeletons start-->
    <div id="question-list" v-if="isGettingQuestions">
      <QuestionListItemSkeleton v-for="i in 5" :key="i" />
    </div>
    <!--Skeletons end-->

    <!--Questions start-->
    <div id="question-list" v-else-if="questions.items?.length > 0">
      <QuestionListItem
        v-for="question in questions.items"
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
      <!-- Pagination start -->
      <Paginator
        :rows="questions.pageSize"
        :totalRecords="questions.totalItems"
        @page="onPageChange"
        :first="(questions.page - 1) * questions.pageSize"
      />
      <!-- Pagination end -->
    </div>
    <!--Table end-->

    <!--No Questions Start-->
    <EmptyList v-else message="No question data to display at the moment." />
    <!--No Questions End-->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import Button from "primevue/button";

import { useToast } from "primevue/usetoast";
import EmptyList from "../shared/EmptyList.vue";
import TitleSection from "../shared/TitleSection.vue";
import { PageInfo } from "@/models/pageInfo";
import Select from "primevue/select";
import type { Question } from "@/models/question";
import { QuestionSortOption } from "@/enums/questions/questionSortOption";

import Paginator, { type PageState } from "primevue/paginator";

import { SmoothScrollHelper } from "@/helpers/smoothScrollHelper";
import { useQuestionStore } from "@/stores/question";
import { QuestionQueryParams } from "@/interfaces/questions/questionQueryParams";
import CurriculumHierarchyFilters from "../shared/CurriculumHierarchyFilters.vue";
import { CurriculumHierarchyFilter } from "@/models/curriculumHierarchyFilter";
import QuestionListItemSkeleton from "./skeletons/QuestionListItemSkeleton.vue";
import QuestionListItem from "./QuestionListItem.vue";

const questionStore = useQuestionStore();

const toast = useToast();
const questions = ref(new PageInfo<Question>());
const isGettingQuestions = ref(false);


//sorting info
const sortOptions = ref([{ name: "Date Created", value: QuestionSortOption.DateCreated }]);
const selectedSortOption = ref(QuestionSortOption.DateCreated);

onMounted(() => {
  //get all questions
  getAllQuestions();
});
//get all questions
const getAllQuestions = () => {
  isGettingQuestions.value = true;
  //prepare the query parameter before fetching the questions
  const { page, pageSize } = questions.value;
  const curriculumId = questionStore.filter.curriculum?.id ?? null;
  const examBoardId = questionStore.filter.examBoard?.id ?? null;
  const levelId = questionStore.filter.level?.id ?? null;
  const subjectId = questionStore.filter.subject?.id ?? null;
  const params: QuestionQueryParams = {
    page,
    pageSize,
    sortBy: selectedSortOption.value,
    curriculumId,
    examBoardId,
    levelId,
    subjectId,
  };
  //fetch the questions
  questionStore
    .getQuestions(params)
    .then((data) => (questions.value = data))
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: message,
        life: 5000,
      });
    })
    .finally(() => (isGettingQuestions.value = false));
};

/**
 * Called when the user switches pages in the paginator.
 * 1. Converts PrimeVue's 0-based page index to 1-based.
 * 2. Stores the new page in state.
 * 3. Fetches the updated questions list and scrolls to the top of that list.
 */
const onPageChange = (state: PageState) => {
  // PrimeVue uses a 0-based page index, so add 1 before sending
  // the request to the backend, which expects 1-based indexing.
  questions.value.page = state.page + 1;
  getAllQuestions();

  //smoothly scroll to the top of the list
  const elementId = "question-list";
  SmoothScrollHelper.scrollToElement(elementId);
};
</script>

<style lang="scss" scoped>
.btn {
  display: inline-block;
}
</style>
