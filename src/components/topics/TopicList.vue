<template>
  <div class="container mx-auto">
    <TitleSection title="Topics" title-size="small" align-items="center" />

    <!-- Hierarchy filters start-->
    <CurriculumHierarchyFilters
      :callback-method="getAllTopics"
      :show-topic="false"
      @filters="(val: CurriculumHierarchyFilter) => (filter = val)"
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
            @change="getAllTopics"
            size="small"
            class="w-100"
            show-clear
          />
        </div>

        <!-- Button -->
        <div class="col-auto">
          <router-link to="/topics/add">
            <Button label="New topic" icon="pi pi-plus" size="small" severity="primary" />
          </router-link>
        </div>
        <div class="col-auto">
          <router-link to="/topics/upload">
            <Button
              label="Upload topics"
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
    <div id="topic-list" v-if="isGettingTopics" class="card">
      <DataTable :value="rowSkeletons">
        <Column field="topicName" header="Topic Name">
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
    <div id="topic-list" v-else-if="topics.items?.length > 0" class="card">
      <DataTable :value="topics.items">
        <!--Topic name-->
        <Column field="topicName" header="Topic Name">
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
              <router-link :to="'topics/' + slotProps.data.id + '/details'">
                <Button
                  label=""
                  severity="contrast"
                  variant="text"
                  size="small"
                  icon="pi pi-info-circle"
                  class="no-wrap-btn me-2"
              /></router-link>

              <!--Delete topic button-->
              <DeletePopup
                button-label=""
                button-variant="text"
                title="Are You Sure?"
                message="Deleting this topic is permanent. Proceed?"
                :delete-callback="() => deleteTopic(slotProps.data.id)"
                :is-deleting-item="
                  slotProps.data.id == deletingTopic.id && deletingTopic.inProgress
                "
              />
            </div>
          </template>
        </Column>
      </DataTable>
      <!-- Pagination start -->
      <Paginator
        :rows="topics.pageSize"
        :totalRecords="topics.totalItems"
        @page="onPageChange"
        :first="(topics.page - 1) * topics.pageSize"
      />
      <!-- Pagination end -->
    </div>
    <!--Table end-->

    <!--No Topics Start-->
    <EmptyList v-else message="No topic data to display at the moment." />
    <!--No Topics End-->
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
import type { Topic } from "@/models/topic";
import { TopicSortOption } from "@/enums/topics/topicSortOption";
import { DataTable } from "primevue";
import Paginator, { type PageState } from "primevue/paginator";
import DeletePopup from "../shared/DeletePopup.vue";
import { DeletionState } from "@/models/deletionState";
import { SmoothScrollHelper } from "@/helpers/smoothScrollHelper";
import { useTopicStore } from "@/stores/topic";
import type { TopicQueryParams } from "@/interfaces/topics/topicQueryParams";
import { CurriculumHierarchyFilter } from "@/models/curriculumHierarchyFilter";

//table row skeletons
const rowSkeletons = ref(new Array(10));

const topicStore = useTopicStore();

const toast = useToast();
const topics = ref(new PageInfo<Topic>());
const isGettingTopics = ref(false);
const deletingTopic = ref(new DeletionState());
const filter = ref(new CurriculumHierarchyFilter());

//sorting info
const sortOptions = ref([
  { name: "Name", value: TopicSortOption.Name },
  { name: "Date Created", value: TopicSortOption.DateCreated },
]);
const selectedSortOption = ref(TopicSortOption.DateCreated);

onMounted(() => {
  //get all topics
  getAllTopics();
});
//get all topics
const getAllTopics = () => {
  isGettingTopics.value = true;
  //prepare the query parameter before fetching the topics
  const { page, pageSize } = topics.value;
  const curriculumId = filter.value.curriculum?.id ?? null;
  const examBoardId = filter.value.examBoard?.id ?? null;
  const levelId = filter.value.level?.id ?? null;
  const subjectId = filter.value.subject?.id ?? null;
  const params: TopicQueryParams = {
    page,
    pageSize,
    sortBy: selectedSortOption.value,
    curriculumId,
    examBoardId,
    levelId,
    subjectId,
  };
  //fetch the topics
  topicStore
    .getTopics(params)
    .then((data) => (topics.value = data))
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: message,
        life: 5000,
      });
    })
    .finally(() => (isGettingTopics.value = false));
};

/**
 * Called when the user switches pages in the paginator.
 * 1. Converts PrimeVue's 0-based page index to 1-based.
 * 2. Stores the new page in state.
 * 3. Fetches the updated topics list and scrolls to the top of that list.
 */
const onPageChange = (state: PageState) => {
  // PrimeVue uses a 0-based page index, so add 1 before sending
  // the request to the backend, which expects 1-based indexing.
  topics.value.page = state.page + 1;
  getAllTopics();

  //smoothly scroll to the top of the list
  const elementId = "topic-list";
  SmoothScrollHelper.scrollToElement(elementId);
};

//Delete a topic with a given ID
const deleteTopic = (id: number) => {
  deletingTopic.value = { id, inProgress: true };
  topicStore
    .deleteTopic(id)
    .then(() => {
      toast.add({
        severity: "success",
        summary: "Done",
        detail: "The topic was successfully deleted.",
        life: 5000,
      });
      //refresh the topic list
      getAllTopics();
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Delete Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (deletingTopic.value.inProgress = false));
};
</script>

<style lang="scss" scoped>
.btn {
  display: inline-block;
}
</style>
