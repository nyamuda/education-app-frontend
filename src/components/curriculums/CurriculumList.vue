<template>
  <div class="container mx-auto">
    <TitleSection title="All Curriculums" title-size="small" align-items="center" />

    <div
      class="d-flex justify-content-start justify-content-md-end align-items-center gap-3 flex-wrap mt-3 mb-5"
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
          @change="getAllCurriculums"
          size="small"
        />

        <!-- For mobile screens -->
        <Select
          class="w-100 d-md-none"
          placeholder="Sort by"
          checkmark
          v-model="selectedSortOption"
          :options="sortOptions"
          @change="getAllCurriculums"
          size="small"
        />
      </div>
      <router-link to="/curriculums/add">
        <Button label="New curriculum" icon="pi pi-plus" size="small" severity="primary" />
      </router-link>
    </div>

    <!--Skeleton table start-->
    <div v-if="isGettingCurriculums" class="card">
      <DataTable :value="rowSkeletons">
        <Column field="name" header="Name">
          <template #body>
            <Skeleton></Skeleton>
          </template>
        </Column>
        <Column field="examBoard" header="Exam Board">
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
    <div v-else-if="curriculums.items.length > 0" class="card">
      <DataTable :value="curriculums.items">
        <Column field="name" header="Name">
          <template #body="slotProps">
            <!--Curriculum name-->
            <span>{{ slotProps.data.name }}</span>
          </template>
        </Column>
        <Column field="examBoards" header="Exam Boards">
          <template #body="slotProps">
            <!--Curriculum exam boards-->
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
              <router-link :to="'curriculums/' + slotProps.data.id + '/details'">
                <Button
                  label="More details"
                  severity="contrast"
                  variant="outlined"
                  size="small"
                  icon="pi pi-info-circle"
                  class="no-wrap-btn me-2"
              /></router-link>

              <!--Delete Curriculum Button-->
              <Button severity="danger" label="delete" size="small" icon="pi pi-trash" />
            </div>
          </template>
        </Column>
      </DataTable>
      <!-- Pagination start -->
      <Paginator
        :rows="curriculums.pageSize"
        :totalRecords="curriculums.totalItems"
        @page="onPageChange"
        :first="(curriculums.page - 1) * curriculums.pageSize"
        sever
      />
      <!-- Pagination end -->
    </div>

    <!--Table end-->

    <!--No Curriculums Start-->
    <EmptyList v-else />
    <!--No Curriculums End-->
  </div>
  {{ curriculums.totalItems }}
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Column from "primevue/column";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import { useToast } from "primevue/usetoast";
import EmptyList from "../shared/EmptyList.vue";
import TitleSection from "../shared/TitleSection.vue";
import { useCurriculumStore } from "@/stores/curriculum";
import { PageInfo } from "@/models/pageInfo";
import Select from "primevue/select";
import type { Curriculum } from "@/models/curriculum";
import { CurriculumSortOption } from "@/enums/curriculums/curriculumSortOption";
import { DataTable } from "primevue";
import Paginator, { type PageState } from "primevue/paginator";

//table row skeletons
const rowSkeletons = ref(new Array(10));

const curriculumStore = useCurriculumStore();
const toast = useToast();
const curriculums = ref(new PageInfo<Curriculum>());
const isGettingCurriculums = ref(false);

//sorting info
const sortOptions = ref([
  { name: "Name", value: CurriculumSortOption.Name },
  { name: "Date Created", value: CurriculumSortOption.DateCreated },
]);
const selectedSortOption = ref(CurriculumSortOption.DateCreated);

onMounted(() => {
  //get all curriculums
  getAllCurriculums();
});
//get all curriculums
const getAllCurriculums = () => {
  isGettingCurriculums.value = true;
  const { page, pageSize } = curriculums.value;
  curriculumStore
    .getCurriculums(page, pageSize, selectedSortOption.value)
    .then((data) => (curriculums.value = data))
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: message,
        life: 5000,
      });
    })
    .finally(() => (isGettingCurriculums.value = false));
};

/**
 * Called when the user switches pages in the paginator.
 * 1. Converts PrimeVue's 0-based page index to 1-based.
 * 2. Stores the new page in state.
 * 3. Fetches the updated curriculums list.
 */
const onPageChange = (state: PageState) => {
  // PrimeVue uses a 0-based page index, so add 1 before sending
  // the request to the backend, which expects 1-based indexing.
  curriculums.value.page = state.page + 1;
  getAllCurriculums();
};
</script>

<style lang="scss" scoped></style>
