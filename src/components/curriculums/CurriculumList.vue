<template>
  <div class="container mx-auto">
    <TitleSection title="All Curriculums" title-size="small" align-items="center" />

    <div
      class="d-flex justify-content-start justify-content-md-end align-items-center gap-3 flex-wrap mt-3"
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
        <Button label="Add" icon="pi pi-plus" size="small" />
      </router-link>
    </div>

    <!--Table section start-->
    <div
      class="mt-4"
      v-if="curriculums != null && (curriculums.items.length > 0 || isGettingCurriculums)"
    >
      <div class="card">
        <!--Skeleton table start-->
        <DataTable :value="rowSkeletons" v-if="isGettingCurriculums">
          <Column field="vehicleType" header="Vehicle Type">
            <template #body>
              <Skeleton></Skeleton>
            </template>
          </Column>
          <Column field="serviceType" header="Service Type">
            <template #body>
              <Skeleton></Skeleton>
            </template>
          </Column>

          <Column field="scheduledAt" header="Scheduled At">
            <template #body>
              <Skeleton></Skeleton>
            </template>
          </Column>
          <Column field="status" header="Status">
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
        <!--Skeleton table end-->
        <!--Table start-->
        <DataTable v-else :value="curriculums?.items">
          <Column field="vehicleType" header="Vehicle Type"></Column>
          <Column field="serviceType" header="Service Type">
            <template #body="slotProps">
              <!--Service type name and price-->
              <span>{{ slotProps.data.name }}</span>
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
        <!--Table end-->
      </div>
    </div>

    <!--No Curriculums  Start-->
    <EmptyList v-else />

    <!--No Curriculums End-->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref } from "vue";
//import Select from "primevue/select";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import { useToast } from "primevue/usetoast";
import EmptyList from "../shared/EmptyList.vue";
import TitleSection from "../shared/TitleSection.vue";
import { useCurriculumStore } from "@/stores/curriculum";
import type { PageInfo } from "@/models/pageInfo";
import type { Curriculum } from "@/models/curriculum";

//table row skeletons
const rowSkeletons = ref(new Array(10));

const curriculumStore = useCurriculumStore();
const toast = useToast();

const curriculums: Ref<PageInfo<Curriculum> | null> = ref(null);
const isGettingCurriculums = ref(false);

onMounted(() => {
  //get all curriculums
  getAllCurriculums();
});
//get all curriculums
const getAllCurriculums = () => {
  isGettingCurriculums.value = false;
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
</script>

<style lang="scss" scoped></style>
