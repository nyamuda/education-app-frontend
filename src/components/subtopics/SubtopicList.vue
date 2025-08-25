<template>
  <div class="container mx-auto">
    <TitleSection title="Subtopics" title-size="small" align-items="center" />

    <div class="list-actions row mt-3 justify-content-start g-3">
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
          :exam-boards="filters?.curriculum?.examBoards"
          placeholder="Exam board"
          :is-required="false"
          ref="examBoardSelectInputRef"
        />
      </div>
      <!-- Filter by level -->
      <div class="col-6 col-md-3">
        <LevelSelect
          @change="onLevelChange"
          :levels="filters?.examBoard?.levels"
          placeholder="Level"
          :is-required="false"
          ref="levelSelectInputRef"
        />
      </div>
      <!-- Filter by subject -->
      <div class="col-6 col-md-3">
        <SubjectSelect
          @change="onSubjectChange"
          :subjects="filters?.level?.subjects"
          placeholder="Subject"
          :is-required="false"
          ref="subjectSelectInputRef"
        />
      </div>
      <!-- Filter by topic -->
      <div class="col-6 col-md-3">
        <TopicSelect
          @change="onTopicChange"
          :topics="filters?.subject?.topics"
          placeholder="Subject"
          :is-required="false"
          ref="topicSelectInputRef"
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
          @change="getAllSubtopics"
          size="small"
          class="w-100"
          show-clear
        />
      </div>

      <!-- Button -->
      <div class="col-auto">
        <router-link to="/subtopics/add">
          <Button label="New subtopic" icon="pi pi-plus" size="small" severity="primary" />
        </router-link>
      </div>
      <div class="col-auto">
        <router-link to="/subtopics/upload">
          <Button
            label="Upload subtopics"
            icon="pi pi-upload"
            size="small"
            severity="primary"
            variant="outlined"
          />
        </router-link>
      </div>
    </div>

    <!--Skeleton table start-->
    <div id="subtopic-list" v-if="isGettingSubtopics" class="card">
      <DataTable :value="rowSkeletons">
        <Column field="subtopicName" header="Subtopic Name">
          <template #body>
            <Skeleton></Skeleton>
          </template>
        </Column>
        <Column field="topic" header="Topic">
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
    <div id="subtopic-list" v-else-if="subtopics.items?.length > 0" class="card">
      <DataTable :value="subtopics.items">
        <!--Subtopic name-->
        <Column field="subtopicName" header="Subtopic Name">
          <template #body="slotProps">
            <span>{{ slotProps.data.name }}</span>
          </template>
        </Column>
        <!--Topic name-->
        <Column field="topic" header="Topic">
          <template #body="slotProps">
            <span>{{ slotProps.data.topic?.name }}</span>
          </template>
        </Column>
        <!--Subject name-->
        <Column field="subject" header="Subject">
          <template #body="slotProps">
            <span>{{ slotProps.data.topic?.subject?.name }}</span>
          </template>
        </Column>
        <!--Level name-->
        <Column field="level" header="Level">
          <template #body="slotProps">
            <span>{{ slotProps.data.topic?.subject?.level?.name }}</span>
          </template>
        </Column>

        <!--Curriculum name-->
        <Column field="curriculum" header="Curriculum">
          <template #body="slotProps">
            <span>{{ slotProps.data.topic?.subject?.level?.examBoard?.curriculum?.name }}</span>
          </template>
        </Column>
        <!-- Actions -->
        <Column field="id" header="Actions">
          <template #body="slotProps">
            <div class="d-flex justify-content-start align-items-center gap-2">
              <!--Button to see more details-->
              <router-link :to="'subtopics/' + slotProps.data.id + '/details'">
                <Button
                  label=""
                  severity="contrast"
                  variant="text"
                  size="small"
                  icon="pi pi-info-circle"
                  class="no-wrap-btn me-2"
              /></router-link>

              <!--Delete subtopic button-->
              <DeletePopup
                button-label=""
                button-variant="text"
                title="Are You Sure?"
                message="Deleting this subtopic is permanent. Proceed?"
                :delete-callback="() => deleteSubtopic(slotProps.data.id)"
                :is-deleting-item="
                  slotProps.data.id == deletingSubtopic.id && deletingSubtopic.inProgress
                "
              />
            </div>
          </template>
        </Column>
      </DataTable>
      <!-- Pagination start -->
      <Paginator
        :rows="subtopics.pageSize"
        :totalRecords="subtopics.totalItems"
        @page="onPageChange"
        :first="(subtopics.page - 1) * subtopics.pageSize"
      />
      <!-- Pagination end -->
    </div>
    <!--Table end-->

    <!--No Subtopics Start-->
    <EmptyList v-else message="No subtopic data to display at the moment." />
    <!--No Subtopics End-->
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
import type { Subtopic } from "@/models/subtopic";
import { SubtopicSortOption } from "@/enums/subtopics/subtopicSortOption";
import { DataTable } from "primevue";
import Paginator, { type PageState } from "primevue/paginator";
import DeletePopup from "../shared/DeletePopup.vue";
import { DeletionState } from "@/models/deletionState";
import { SmoothScrollHelper } from "@/helpers/smoothScrollHelper";
import { useSubtopicStore } from "@/stores/subtopic";
import { Curriculum } from "@/models/curriculum";
import type { Ref } from "vue";
import type { ExamBoard } from "@/models/examBoard";
import CurriculumSelectInput from "../shared/selects/CurriculumSelect.vue";
import ExamBoardSelectInput from "../shared/selects/ExamBoardSelect.vue";
import type { SubtopicQueryParams } from "@/interfaces/subtopics/subtopicQueryParams";
import LevelSelect from "../shared/selects/LevelSelect.vue";
import type { Level } from "@/models/level";
import type { Subject } from "@/models/subject";
import SubjectSelect from "../shared/selects/SubjectSelect.vue";
import type { Topic } from "@/models/topic";
import { HierarchyFilter } from "@/models/hierarchyFilter";
import TopicSelect from "../shared/selects/TopicSelect.vue";

//table row skeletons
const rowSkeletons = ref(new Array(10));

const subtopicStore = useSubtopicStore();

const toast = useToast();
const subtopics = ref(new PageInfo<Subtopic>());
const filters: Ref<HierarchyFilter> = ref(new HierarchyFilter());
const examBoardSelectInputRef = ref();
const levelSelectInputRef = ref();
const subjectSelectInputRef = ref();
const topicSelectInputRef = ref();
const isGettingSubtopics = ref(false);
const deletingSubtopic = ref(new DeletionState());

//sorting info
const sortOptions = ref([
  { name: "Name", value: SubtopicSortOption.Name },
  { name: "Date Created", value: SubtopicSortOption.DateCreated },
]);
const selectedSortOption = ref(SubtopicSortOption.DateCreated);

onMounted(() => {
  //get all subtopics
  getAllSubtopics();
});
//get all subtopics
const getAllSubtopics = () => {
  isGettingSubtopics.value = true;
  //prepare the query parameter before fetching the subtopics
  const { page, pageSize } = subtopics.value;
  const curriculumId = filters.value.curriculum?.id ?? null;
  const examBoardId = filters.value.examBoard?.id ?? null;
  const levelId = filters.value.level?.id ?? null;
  const subjectId = filters.value.subject?.id ?? null;
  const topicId = filters.value.topic?.id ?? null;

  const params: SubtopicQueryParams = {
    page,
    pageSize,
    sortBy: selectedSortOption.value,
    curriculumId,
    examBoardId,
    levelId,
    subjectId,
    topicId,
  };
  //fetch the subtopics
  subtopicStore
    .getSubtopics(params)
    .then((data) => (subtopics.value = data))
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: message,
        life: 5000,
      });
    })
    .finally(() => (isGettingSubtopics.value = false));
};

/**
 * Called when the user switches pages in the paginator.
 * 1. Converts PrimeVue's 0-based page index to 1-based.
 * 2. Stores the new page in state.
 * 3. Fetches the updated subtopics list and scrolls to the top of that list.
 */
const onPageChange = (state: PageState) => {
  // PrimeVue uses a 0-based page index, so add 1 before sending
  // the request to the backend, which expects 1-based indexing.
  subtopics.value.page = state.page + 1;
  getAllSubtopics();

  //smoothly scroll to the top of the list
  const elementId = "subtopic-list";
  SmoothScrollHelper.scrollToElement(elementId);
};

//Called when the curriculum select input filter value changes
const onCurriculumChange = (curriculum: Curriculum) => {
  filters.value.reset();
  filters.value.onCurriculumChange(curriculum);
  //reset exam board select input value
  examBoardSelectInputRef.value.resetSelectedValue();
  //reset level select input value
  levelSelectInputRef.value.resetSelectedValue();
  //reset subject select input value
  subjectSelectInputRef.value.resetSelectedValue();
  //reset topic select input value
  topicSelectInputRef.value.resetSelectedValue();
  getAllSubtopics();
};
//Called when the exam board select input filter value changes
const onExamBoardChange = (examBoard: ExamBoard) => {
  filters.value.onExamBoardChange(examBoard);
  //reset level select input value
  levelSelectInputRef.value.resetSelectedValue();
  //reset subject select input value
  subjectSelectInputRef.value.resetSelectedValue();
  //reset topic select input value
  topicSelectInputRef.value.resetSelectedValue();
  getAllSubtopics();
};
//Called when the level select input filter value changes
const onLevelChange = (level: Level) => {
  filters.value.onLevelChange(level);
  //reset subject select input value
  subjectSelectInputRef.value.resetSelectedValue();
  //reset topic select input value
  topicSelectInputRef.value.resetSelectedValue();
  getAllSubtopics();
};
//Called when the subject select input filter value changes
const onSubjectChange = (subject: Subject) => {
  filters.value.onSubjectChange(subject);
  //reset topic select input value
  topicSelectInputRef.value.resetSelectedValue();
  getAllSubtopics();
};
const onTopicChange = (topic: Topic) => {
  filters.value.onTopicChange(topic);
  getAllSubtopics();
};

//Delete a subtopic with a given ID
const deleteSubtopic = (id: number) => {
  deletingSubtopic.value = { id, inProgress: true };
  subtopicStore
    .deleteSubtopic(id)
    .then(() => {
      toast.add({
        severity: "success",
        summary: "Done",
        detail: "The subtopic was successfully deleted.",
        life: 5000,
      });
      //refresh the subtopic list
      getAllSubtopics();
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Delete Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (deletingSubtopic.value.inProgress = false));
};
</script>

<style lang="scss" scoped>
.btn {
  display: inline-block;
}
</style>
