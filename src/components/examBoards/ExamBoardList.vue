<template>
  <div class="container mx-auto">
    <TitleSection title="All Exam Boards" title-size="small" align-items="center" />

    <div
      class="d-flex justify-content-start justify-content-md-end align-items-center gap-3 flex-wrap mt-3 mb-4"
    >
      <div class="flex-grow-1 flex-md-grow-0">
        <!-- For desktop screens -->
        <Select
          style="width: 12rem"
          class="d-none d-md-flex"
          placeholder="Sort by"
          checkmark
          v-model="selectedSortOption"
          :options="sortOptions"
          option-label="name"
          option-value="value"
          @change="getAllExamBoards"
          size="small"
        />

        <!-- For mobile screens -->
        <Select
          class="w-100 d-md-none"
          placeholder="Sort by"
          checkmark
          v-model="selectedSortOption"
          :options="sortOptions"
          option-label="name"
          option-value="value"
          @change="getAllExamBoards"
          size="small"
        />
      </div>
      <router-link to="/exam-boards/add">
        <Button label="New exam board" icon="pi pi-plus" size="small" severity="primary" />
      </router-link>
    </div>

    <!--Skeleton table start-->
    <div id="examBoard-list" v-if="isGettingExamBoards" class="card">
      <DataTable :value="rowSkeletons">
        <Column field="name" header="Name">
          <template #body>
            <Skeleton></Skeleton>
          </template>
        </Column>
        <Column field="examBoard" header="Exam Boards">
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
    <div id="examBoard-list" v-else-if="examBoards.items.length > 0" class="card">
      <DataTable :value="examBoards.items">
        <Column field="name" header="Name">
          <template #body="slotProps">
            <!--ExamBoard name-->
            <span>{{ slotProps.data.name }}</span>
          </template>
        </Column>
        <Column field="examBoards" header="Exam Boards">
          <template #body="slotProps">
            <!--ExamBoard exam boards-->
            <div class="d-flex flex-wrap align-items-center">
              <div v-for="(examBoard, index) in slotProps.data.examBoards" :key="examBoard.id">
                <span>{{ examBoard.name }} </span>
                <!-- exam board separator -->
                <span class="mx-2" v-if="index < slotProps.data.examBoards.length - 1">&bull;</span>
              </div>
            </div>
          </template>
        </Column>

        <Column field="id" header="Actions">
          <template #body="slotProps">
            <div class="d-flex justify-content-start align-items-center gap-2">
              <!--Button to see more details-->
              <router-link :to="'exam-boards/' + slotProps.data.id + '/details'">
                <Button
                  label="Edit"
                  severity="contrast"
                  variant="outlined"
                  size="small"
                  icon="pi pi-info-circle"
                  class="no-wrap-btn me-2"
              /></router-link>

              <!--Delete exam board button-->
              <DeletePopup
                title="Are You Sure?"
                message="Deleting this exam board is permanent. Proceed?"
                :delete-callback="() => deleteExamBoard(slotProps.data.id)"
                :is-deleting-item="
                  slotProps.data.id == deletingExamBoard.id && deletingExamBoard.inProgress
                "
              />
            </div>
          </template>
        </Column>
      </DataTable>
      <!-- Pagination start -->
      <Paginator
        :rows="examBoards.pageSize"
        :totalRecords="examBoards.totalItems"
        @page="onPageChange"
        :first="(examBoards.page - 1) * examBoards.pageSize"
      />
      <!-- Pagination end -->
    </div>
    <!--Table end-->

    <!--No ExamBoards Start-->
    <EmptyList v-else message="No examboard data to display at the moment." />
    <!--No ExamBoards End-->
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
import type { ExamBoard } from "@/models/examBoard";
import { ExamBoardSortOption } from "@/enums/examBoards/examBoardSortOption";
import { DataTable } from "primevue";
import Paginator, { type PageState } from "primevue/paginator";
import DeletePopup from "../shared/DeletePopup.vue";
import { DeletionState } from "@/models/deletionState";
import { SmoothScrollHelper } from "@/helpers/smoothScrollHelper";
import { useExamBoardStore } from "@/stores/examBoard";

//table row skeletons
const rowSkeletons = ref(new Array(10));

const examBoardStore = useExamBoardStore();
const toast = useToast();
const examBoards = ref(new PageInfo<ExamBoard>());
const isGettingExamBoards = ref(false);
const deletingExamBoard = ref(new DeletionState());

//sorting info
const sortOptions = ref([
  { name: "Name", value: ExamBoardSortOption.Name },
  { name: "Curriculum", value: ExamBoardSortOption.Name },
  { name: "Date Created", value: ExamBoardSortOption.DateCreated },
]);
const selectedSortOption = ref(ExamBoardSortOption.DateCreated);

onMounted(() => {
  //get all exam boards
  getAllExamBoards();
});
//get all exam boards
const getAllExamBoards = () => {
  isGettingExamBoards.value = true;
  const { page, pageSize } = examBoards.value;
  examBoardStore
    .getExamBoards(page, pageSize, selectedSortOption.value)
    .then((data) => (examBoards.value = data))
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: message,
        life: 5000,
      });
    })
    .finally(() => (isGettingExamBoards.value = false));
};

/**
 * Called when the user switches pages in the paginator.
 * 1. Converts PrimeVue's 0-based page index to 1-based.
 * 2. Stores the new page in state.
 * 3. Fetches the updated exam boards list and scrolls to the top of that list.
 */
const onPageChange = (state: PageState) => {
  // PrimeVue uses a 0-based page index, so add 1 before sending
  // the request to the backend, which expects 1-based indexing.
  examBoards.value.page = state.page + 1;
  getAllExamBoards();

  //smoothly scroll to the top of the list
  const elementId = "examBoard-list";
  SmoothScrollHelper.scrollToElement(elementId);
};

//Delete a exam board with a given ID
const deleteExamBoard = (id: number) => {
  deletingExamBoard.value = { id, inProgress: true };
  examBoardStore
    .deleteExamBoard(id)
    .then(() => {
      toast.add({
        severity: "success",
        summary: "Done",
        detail: "The exam board was successfully deleted.",
        life: 5000,
      });
      //refresh the exam board list
      getAllExamBoards();
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Delete Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (deletingExamBoard.value.inProgress = false));
};
</script>

<style lang="scss" scoped>
.btn {
  display: inline-block;
}
</style>
