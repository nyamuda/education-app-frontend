<template>
  <div class="container mx-auto">
    <TitleSection title="Subjects" title-size="small" align-items="center" />

    <div class="list-actions row mt-3 justify-content-md-end g-3">
      <!-- Filter by curriculum -->
      <div class="col-6 col-md-3">
        <CurriculumSelectInput
          placeholder="Curriculum"
          :is-required="false"
          @change="onCurriculumChange"
        />
      </div>
      <!-- Filter by exam board -->
      <div class="col-6 col-md-3">
        <ExamBoardSelectInput
          @change="onExamBoardChange"
          :exam-boards="selectedCurriculumFilter?.examBoards"
          placeholder="Exam board"
          :is-required="false"
          ref="examBoardSelectInputRef"
        />
      </div>
      <!-- Filter by level -->
      <div class="col-6 col-md-3">
        <LevelSelect
          @change="onLevelChange"
          :levels="selectedExamBoardFilter?.levels"
          placeholder="Level"
          :is-required="false"
          ref="levelSelectInputRef"
        />
      </div>

      <!-- Sorting -->
      <div class="col-6 col-md-3">
        <Select
          placeholder="Sort by"
          checkmark
          v-model="selectedSortOption"
          :options="sortOptions"
          option-label="name"
          option-value="value"
          @change="getAllSubjects"
          size="small"
          class="w-100"
          show-clear
        />
      </div>

      <!-- Button -->
      <div class="col-auto">
        <router-link to="/subjects/add">
          <Button label="New subject" icon="pi pi-plus" size="small" severity="primary" />
        </router-link>
      </div>
    </div>

    <!--Skeleton table start-->
    <div id="subject-list" v-if="isGettingSubjects" class="card">
      <DataTable :value="rowSkeletons">
        <Column field="subjectName" header="Subject Name">
          <template #body>
            <Skeleton></Skeleton>
          </template>
        </Column>
        <Column field="level" header="Level">
          <template #body>
            <Skeleton></Skeleton>
          </template>
        </Column>
        <Column field="examBoard" header="Exam Board">
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
    <div id="subject-list" v-else-if="subjects.items?.length > 0" class="card">
      <DataTable :value="subjects.items">
        <!--Subject name-->
        <Column field="subjectName" header="Subject Name">
          <template #body="slotProps">
            <span>{{ slotProps.data.name }}</span>
          </template>
        </Column>
        <!--Level name-->
        <Column field="level" header="Level">
          <template #body="slotProps">
            <span>{{ slotProps.data.level?.name }}</span>
          </template>
        </Column>
        <!--Exam board name-->
        <Column field="examBoard" header="Exam Board">
          <template #body="slotProps">
            <span>{{ slotProps.data.level?.examBoard?.name }}</span>
          </template>
        </Column>
        <!--Curriculum name-->
        <Column field="curriculum" header="Curriculum">
          <template #body="slotProps">
            <span>{{ slotProps.data.level?.examBoard?.curriculum?.name }}</span>
          </template>
        </Column>

        <Column field="id" header="Actions">
          <template #body="slotProps">
            <div class="d-flex justify-content-start align-items-center gap-2">
              <!--Button to see more details-->
              <router-link :to="'subjects/' + slotProps.data.id + '/details'">
                <Button
                  label=""
                  severity="contrast"
                  variant="text"
                  size="small"
                  icon="pi pi-info-circle"
                  class="no-wrap-btn me-2"
              /></router-link>

              <!--Delete subject button-->
              <DeletePopup
                class="no-wrap-btn"
                button-label=""
                button-variant="text"
                title="Are You Sure?"
                message="Deleting this subject is permanent. Proceed?"
                :delete-callback="() => deleteSubject(slotProps.data.id)"
                :is-deleting-item="
                  slotProps.data.id == deletingSubject.id && deletingSubject.inProgress
                "
              />
            </div>
          </template>
        </Column>
      </DataTable>
      <!-- Pagination start -->
      <Paginator
        :rows="subjects.pageSize"
        :totalRecords="subjects.totalItems"
        @page="onPageChange"
        :first="(subjects.page - 1) * subjects.pageSize"
      />
      <!-- Pagination end -->
    </div>
    <!--Table end-->

    <!--No Subjects Start-->
    <EmptyList v-else message="No subject data to display at the moment." />
    <!--No Subjects End-->
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
import type { Subject } from "@/models/subject";
import { SubjectSortOption } from "@/enums/subjects/subjectSortOption";
import { DataTable } from "primevue";
import Paginator, { type PageState } from "primevue/paginator";
import DeletePopup from "../shared/DeletePopup.vue";
import { DeletionState } from "@/models/deletionState";
import { SmoothScrollHelper } from "@/helpers/smoothScrollHelper";
import { useSubjectStore } from "@/stores/subject";
import { Curriculum } from "@/models/curriculum";
import type { Ref } from "vue";
import type { ExamBoard } from "@/models/examBoard";
import CurriculumSelectInput from "../shared/selects/CurriculumSelect.vue";
import ExamBoardSelectInput from "../shared/selects/ExamBoardSelect.vue";
import type { SubjectQueryParams } from "@/interfaces/subjects/subjectQueryParams";
import LevelSelect from "../shared/selects/LevelSelect.vue";
import type { Level } from "@/models/level";

//table row skeletons
const rowSkeletons = ref(new Array(10));

const subjectStore = useSubjectStore();

const toast = useToast();
const subjects = ref(new PageInfo<Subject>());
const selectedCurriculumFilter: Ref<Curriculum | null> = ref(null);
const selectedExamBoardFilter: Ref<ExamBoard | null> = ref(null);
const selectedLevelFilter: Ref<Level | null> = ref(null);
const examBoardSelectInputRef = ref();
const levelSelectInputRef = ref();
const isGettingSubjects = ref(false);
const deletingSubject = ref(new DeletionState());

//sorting info
const sortOptions = ref([
  { name: "Name", value: SubjectSortOption.Name },
  { name: "Date Created", value: SubjectSortOption.DateCreated },
]);
const selectedSortOption = ref(SubjectSortOption.DateCreated);

onMounted(() => {
  //get all subjects
  getAllSubjects();
});
//get all subjects
const getAllSubjects = () => {
  isGettingSubjects.value = true;
  const { page, pageSize } = subjects.value;
  const curriculumId = selectedCurriculumFilter.value?.id ?? null;
  const examBoardId = selectedExamBoardFilter.value?.id ?? null;
  const levelId = selectedLevelFilter.value?.id ?? null;
  const params: SubjectQueryParams = {
    page,
    pageSize,
    sortBy: selectedSortOption.value,
    curriculumId,
    examBoardId,
    levelId,
  };
  subjectStore
    .getSubjects(params)
    .then((data) => (subjects.value = data))
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: message,
        life: 5000,
      });
    })
    .finally(() => (isGettingSubjects.value = false));
};

/**
 * Called when the user switches pages in the paginator.
 * 1. Converts PrimeVue's 0-based page index to 1-based.
 * 2. Stores the new page in state.
 * 3. Fetches the updated subjects list and scrolls to the top of that list.
 */
const onPageChange = (state: PageState) => {
  // PrimeVue uses a 0-based page index, so add 1 before sending
  // the request to the backend, which expects 1-based indexing.
  subjects.value.page = state.page + 1;
  getAllSubjects();

  //smoothly scroll to the top of the list
  const elementId = "subject-list";
  SmoothScrollHelper.scrollToElement(elementId);
};

//Called when the curriculum select input filter value changes
const onCurriculumChange = (curriculum: Curriculum) => {
  resetFilters();
  selectedCurriculumFilter.value = curriculum;
  getAllSubjects();
};
//Called when the exam board select input filter value changes
const onExamBoardChange = (examBoard: ExamBoard) => {
  selectedExamBoardFilter.value = examBoard;
  getAllSubjects();
};
//Called when the level select input filter value changes
const onLevelChange = (level: Level) => {
  selectedLevelFilter.value = level;
  getAllSubjects();
};
//Resets filters
const resetFilters = () => {
  selectedCurriculumFilter.value = null;
  selectedExamBoardFilter.value = null;
  selectedLevelFilter.value = null;
  //reset exam board select input value
  examBoardSelectInputRef.value.resetSelectedValue();
  //reset level select input value
  levelSelectInputRef.value.resetSelectedValue();
};

//Delete a subject with a given ID
const deleteSubject = (id: number) => {
  deletingSubject.value = { id, inProgress: true };
  subjectStore
    .deleteSubject(id)
    .then(() => {
      toast.add({
        severity: "success",
        summary: "Done",
        detail: "The subject was successfully deleted.",
        life: 5000,
      });
      //refresh the subject list
      getAllSubjects();
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Delete Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (deletingSubject.value.inProgress = false));
};
</script>

<style lang="scss" scoped>
.btn {
  display: inline-block;
}
</style>
