<template>
  <div class="container mx-auto">
    <TitleSection title="Levels" title-size="small" align-items="center" />

    <div class="list-actions row mt-3 justify-content-md-end g-3">
      <!-- Filter by curriculum -->
      <div class="col-6 col-md-3">
        <Select
          placeholder="Curriculum"
          checkmark
          v-model="selectedCurriculumFilter"
          :options="curriculums"
          option-label="name"
          @change="getAllLevels"
          size="small"
          class="w-100"
        />
      </div>
      <div class="col-6 col-md-3">
        <Select
          placeholder="Exam board"
          checkmark
          v-model="selectedExamBoardFilter"
          :options="selectedCurriculumFilter?.examBoards"
          option-label="name"
          @change="getAllLevels"
          size="small"
          class="w-100"
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
          @change="getAllLevels"
          size="small"
          class="w-100"
          show-clear
        />
      </div>

      <!-- Button -->
      <div class="col-auto">
        <router-link to="/exam-boards/add">
          <Button label="New level" icon="pi pi-plus" size="small" severity="primary" />
        </router-link>
      </div>
    </div>

    <!--Skeleton table start-->
    <div id="level-list" v-if="isGettingLevels" class="card">
      <DataTable :value="rowSkeletons">
        <Column field="levelName" header="Level Name">
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
    <div id="level-list" v-else-if="levels.items.length > 0" class="card">
      <DataTable :value="levels.items">
        <Column field="levelName" header="Level Name">
          <template #body="slotProps">
            <!--Level name-->
            <span>{{ slotProps.data.name }}</span>
          </template>
        </Column>
        <Column field="curriculum" header="Curriculum">
          <template #body="slotProps">
            <!--Curriculum name-->
            <span>{{ slotProps.data.curriculum?.name }}</span>
          </template>
        </Column>

        <Column field="id" header="Actions">
          <template #body="slotProps">
            <div class="d-flex justify-content-start align-items-center gap-2">
              <!--Button to see more details-->
              <router-link :to="'exam-boards/' + slotProps.data.id + '/details'">
                <Button
                  label="More details"
                  severity="contrast"
                  variant="outlined"
                  size="small"
                  icon="pi pi-info-circle"
                  class="no-wrap-btn me-2"
              /></router-link>

              <!--Delete level button-->
              <DeletePopup
                title="Are You Sure?"
                message="Deleting this level is permanent. Proceed?"
                :delete-callback="() => deleteLevel(slotProps.data.id)"
                :is-deleting-item="
                  slotProps.data.id == deletingLevel.id && deletingLevel.inProgress
                "
              />
            </div>
          </template>
        </Column>
      </DataTable>
      <!-- Pagination start -->
      <Paginator
        :rows="levels.pageSize"
        :totalRecords="levels.totalItems"
        @page="onPageChange"
        :first="(levels.page - 1) * levels.pageSize"
      />
      <!-- Pagination end -->
    </div>
    <!--Table end-->

    <!--No Levels Start-->
    <EmptyList v-else message="No level data to display at the moment." />
    <!--No Levels End-->
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
import type { Level } from "@/models/level";
import { LevelSortOption } from "@/enums/levels/levelSortOption";
import { DataTable } from "primevue";
import Paginator, { type PageState } from "primevue/paginator";
import DeletePopup from "../shared/DeletePopup.vue";
import { DeletionState } from "@/models/deletionState";
import { SmoothScrollHelper } from "@/helpers/smoothScrollHelper";
import { useLevelStore } from "@/stores/level";
import type { Curriculum } from "@/models/curriculum";
import { useCurriculumStore } from "@/stores/curriculum";
import type { Ref } from "vue";
import type { ExamBoard } from "@/models/examBoard";

//table row skeletons
const rowSkeletons = ref(new Array(10));

const levelStore = useLevelStore();
const curriculumStore = useCurriculumStore();
const toast = useToast();
const levels = ref(new PageInfo<Level>());
//used for filtering levels by curriculum name
const curriculums: Ref<Curriculum[]> = ref([]);
const selectedCurriculumFilter: Ref<Curriculum | null> = ref(null);
const selectedExamBoardFilter: Ref<ExamBoard | null> = ref(null);
const isGettingLevels = ref(false);
const deletingLevel = ref(new DeletionState());

//sorting info
const sortOptions = ref([
  { name: "Name", value: LevelSortOption.Name },
  { name: "Date Created", value: LevelSortOption.DateCreated },
]);
const selectedSortOption = ref(LevelSortOption.DateCreated);

onMounted(() => {
  //get all levels
  getAllLevels();
  //get all curriculums
  getAllCurriculums();
});
//get all levels
const getAllLevels = () => {
  isGettingLevels.value = true;
  const { page, pageSize } = levels.value;
  levelStore
    .getLevels(page, pageSize, selectedSortOption.value, selectedExamBoardFilter.value?.id || 0)
    .then((data) => (levels.value = data))
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: message,
        life: 5000,
      });
    })
    .finally(() => (isGettingLevels.value = false));
};

/**
 * Fetches all curriculums from the backend. These curriculums are used
 * to filter levels by curriculum name.
 *
 * Retrieves the first 100 curriculums (page size = 100), which is currently
 * more than enough since the total number of curriculums in the system is small.
 *
 * Using 100 ensures all available curriculums are fetched in one request.
 * If the dataset grows significantly in the future, the page size can be
 * reduced or proper pagination logic can be implemented.
 */
const getAllCurriculums = () => {
  const page = 1;
  const pageSize = 100;
  curriculumStore
    .getCurriculums(page, pageSize)
    .then((data) => (curriculums.value = data.items))
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: message,
        life: 5000,
      });
    });
};

/**
 * Called when the user switches pages in the paginator.
 * 1. Converts PrimeVue's 0-based page index to 1-based.
 * 2. Stores the new page in state.
 * 3. Fetches the updated levels list and scrolls to the top of that list.
 */
const onPageChange = (state: PageState) => {
  // PrimeVue uses a 0-based page index, so add 1 before sending
  // the request to the backend, which expects 1-based indexing.
  levels.value.page = state.page + 1;
  getAllLevels();

  //smoothly scroll to the top of the list
  const elementId = "level-list";
  SmoothScrollHelper.scrollToElement(elementId);
};

//Delete a level with a given ID
const deleteLevel = (id: number) => {
  deletingLevel.value = { id, inProgress: true };
  levelStore
    .deleteLevel(id)
    .then(() => {
      toast.add({
        severity: "success",
        summary: "Done",
        detail: "The level was successfully deleted.",
        life: 5000,
      });
      //refresh the level list
      getAllLevels();
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Delete Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (deletingLevel.value.inProgress = false));
};
</script>

<style lang="scss" scoped>
.btn {
  display: inline-block;
}
</style>
