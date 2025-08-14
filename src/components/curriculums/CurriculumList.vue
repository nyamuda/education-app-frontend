<template>
  <div class="container mx-auto">
    <TitleSection title="All Curriculums" title-size="small" align-items="center" />

    <div
      class="d-flex justify-content-start justify-content-md-end align-items-center gap-3 flex-wrap my-3"
    >
      <div class="flex-grow-1 flex-md-grow-0">
        <!-- For desktop screens -->
        <!-- <Select
          style="width: 12rem"
          class="d-none d-md-flex"
          placeholder="Filter curriculums"
          checkmark
          v-model="filterCurriculumsBy"
          :options="statusFilters"
          @change="filterCurriculums"
        /> -->

        <!-- For mobile screens -->
        <!-- <Select
          class="w-100 d-md-none"
          placeholder="Filter curriculums"
          checkmark
          v-model="filterCurriculumsBy"
          :options="statusFilters"
          @change=""
        /> -->
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

        <Column field="actions" header="Actions">
          <template #body>
            <Skeleton></Skeleton>
          </template>
        </Column>
      </DataTable>
    </div>
    <!--Skeleton table end-->

    <!--Table start-->
    <div v-else-if="curriculums != null && curriculums?.items.length > 0" class="card">
      <DataTable
        :value="curriculums.items"
        paginator
        @page="onPageChange"
        :rows="2"
        :total-records="curriculums.totalItems"
      >
        <Column field="name" header="Name">
          <template #body="slotProps">
            <!--Curriculum name-->
            <span>{{ slotProps.data.name }}</span>
          </template>
        </Column>
        <Column field="examBoards" header="Exam Boards">
          <template #body="slotProps">
            <!--Curriculum exam boards-->
            <span class="" v-for="examBoard in slotProps.data.examBoards" :key="examBoard.id"
              >{{ examBoard.name }} /
            </span>
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
                  icon="fas fa-info"
                  class="no-wrap-btn me-2"
              /></router-link>

              <!--Delete Curriculum Button-->
              <Button severity="danger" label="delete" size="small" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
    <!--Table end-->

    <!--No Curriculums Start-->
    <EmptyList v-else />
    <!--No Curriculums End-->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref } from "vue";
//import Select from "primevue/select";
import DataTable, { type DataTablePageEvent } from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import { useToast } from "primevue/usetoast";
import EmptyList from "../shared/EmptyList.vue";
import TitleSection from "../shared/TitleSection.vue";
import { useCurriculumStore } from "@/stores/curriculum";
import type { PageInfo } from "@/models/pageInfo";
import type { Curriculum } from "@/models/curriculum";
import { CurriculumSortOption } from "@/enums/curriculums/curriculumSortOption";

//table row skeletons
const rowSkeletons = ref(new Array(10));

const curriculumStore = useCurriculumStore();
const toast = useToast();

const curriculums: Ref<PageInfo<Curriculum> | null> = ref(null);
const isGettingCurriculums = ref(false);
const sortOptions = ref([CurriculumSortOption.Name, CurriculumSortOption.DateCreated]);
const selectedSortOption = ref(CurriculumSortOption.DateCreated);

onMounted(() => {
  //get all curriculums
  getAllCurriculums();
});
//get all curriculums
const getAllCurriculums = () => {
  isGettingCurriculums.value = true;
  curriculumStore
    .getCurriculums()
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

//change pagination page
const onPageChange = (event: DataTablePageEvent) => {
  alert(event.page);
};
</script>

<style lang="scss" scoped></style>
