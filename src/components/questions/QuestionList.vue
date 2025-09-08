<template>
  <div class="container mx-auto">
    <TitleSection title="Questions" title-size="small" align-items="center" />

    <!-- Hierarchy filters start-->
    <CurriculumHierarchyFilters
      :callback-method="getAllQuestions"
      :show-question="false"
      @filter="(val: CurriculumHierarchyFilter) => (filter = val)"
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
        <div class="col-auto">
          <router-link to="/questions/add">
            <Button label="New question" icon="pi pi-plus" size="small" severity="primary" />
          </router-link>
        </div>
        <div class="col-auto">
          <router-link to="/questions/upload">
            <Button
              label="Upload questions"
              icon="pi pi-upload"
              size="small"
              severity="primary"
              variant="outlined"
            />
          </router-link>
        </div>
      </template>
    </CurriculumHierarchyFilters>
    <!-- Hierarchy filters end-->

    <!--Skeleton table start-->
    <div id="question-list" v-if="isGettingQuestions" class="card">
      <DataTable :value="rowSkeletons">
        <Column field="questionName" header="Question Name">
          <template #body>
            <Skeleton></Skeleton>
          </template>
        </Column>
        <Column field="subject" header="Subject">
          <template #body>
            <Skeleton></Skeleton>
          </template>
        </Column>
        <Column field="level" header="Level">
          <template #body>
            <Skeleton></Skeleton>
          </template>
        </Column>

        <Column field="curriculum" header="Curriculum">
          <template #body>
            <Skeleton></Skeleton>
          </template>
        </Column>

        <Column field="actions" header="Actions">
          <template #body>
            <Skeleton></Skeleton>
          </template>
        </Column>
      </DataTable>
    </div>
    <!--Skeleton table end-->

    <!--Table start-->
    <div id="question-list" v-else-if="questions.items?.length > 0" class="card">
      <DataTable :value="questions.items">
        <!--Question name-->
        <Column field="questionName" header="Question Name">
          <template #body="slotProps">
            <span>{{ slotProps.data.name }}</span>
          </template>
        </Column>
        <!--Subject name-->
        <Column field="subject" header="Subject">
          <template #body="slotProps">
            <span>{{ slotProps.data.subject?.name }}</span>
          </template>
        </Column>
        <!--Level name-->
        <Column field="level" header="Level">
          <template #body="slotProps">
            <span>{{ slotProps.data.subject?.level?.name }}</span>
          </template>
        </Column>

        <!--Curriculum name-->
        <Column field="curriculum" header="Curriculum">
          <template #body="slotProps">
            <span>{{ slotProps.data.subject?.level?.examBoard?.curriculum?.name }}</span>
          </template>
        </Column>

        <Column field="id" header="Actions">
          <template #body="slotProps">
            <div class="d-flex justify-content-start align-items-center gap-2">
              <!--Button to see more details-->
              <router-link :to="'questions/' + slotProps.data.id + '/details'">
                <Button
                  label=""
                  severity="contrast"
                  variant="text"
                  size="small"
                  icon="pi pi-info-circle"
                  class="no-wrap-btn me-2"
              /></router-link>

              <!--Delete question button-->
              <DeletePopup
                button-label=""
                button-variant="text"
                title="Are You Sure?"
                message="Deleting this question is permanent. Proceed?"
                :delete-callback="() => deleteQuestion(slotProps.data.id)"
                :is-deleting-item="
                  slotProps.data.id == deletingQuestion.id && deletingQuestion.inProgress
                "
              />
            </div>
          </template>
        </Column>
      </DataTable>
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
import Column from "primevue/column";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import { useToast } from "primevue/usetoast";
import EmptyList from "../shared/EmptyList.vue";
import TitleSection from "../shared/TitleSection.vue";
import { PageInfo } from "@/models/pageInfo";
import Select from "primevue/select";
import type { Question } from "@/models/question";
import { QuestionSortOption } from "@/enums/questions/questionSortOption";
import { DataTable } from "primevue";
import Paginator, { type PageState } from "primevue/paginator";
import DeletePopup from "../shared/DeletePopup.vue";
import { DeletionState } from "@/models/deletionState";
import { SmoothScrollHelper } from "@/helpers/smoothScrollHelper";
import { useQuestionStore } from "@/stores/question";
import type { QuestionQueryParams } from "@/interfaces/questions/questionQueryParams";
import CurriculumHierarchyFilters from "../shared/CurriculumHierarchyFilters.vue";
import { CurriculumHierarchyFilter } from "@/models/curriculumHierarchyFilter";

//table row skeletons
const rowSkeletons = ref(new Array(10));

const questionStore = useQuestionStore();

const toast = useToast();
const questions = ref(new PageInfo<Question>());
const isGettingQuestions = ref(false);
const deletingQuestion = ref(new DeletionState());
const filter = ref(new CurriculumHierarchyFilter());

//sorting info
const sortOptions = ref([
  { name: "Name", value: QuestionSortOption.Name },
  { name: "Date Created", value: QuestionSortOption.DateCreated },
]);
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
  const curriculumId = filter.value.curriculum?.id ?? null;
  const examBoardId = filter.value.examBoard?.id ?? null;
  const levelId = filter.value.level?.id ?? null;
  const subjectId = filter.value.subject?.id ?? null;
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

//Delete a question with a given ID
const deleteQuestion = (id: number) => {
  deletingQuestion.value = { id, inProgress: true };
  questionStore
    .deleteQuestion(id)
    .then(() => {
      toast.add({
        severity: "success",
        summary: "Done",
        detail: "The question was successfully deleted.",
        life: 5000,
      });
      //refresh the question list
      getAllQuestions();
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Delete Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (deletingQuestion.value.inProgress = false));
};
</script>

<style lang="scss" scoped>
.btn {
  display: inline-block;
}
</style>
