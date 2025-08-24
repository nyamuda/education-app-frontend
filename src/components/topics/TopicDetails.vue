<template>
  <div class="">
    <TopicDetailsSkeleton v-if="isGettingTopic" />

    <Card v-else-if="topic">
      <template #title>
        <h6><Chip label="Topic" /></h6>
        <h2 class="mb-2">{{ topic.name }}</h2>
      </template>
      <template #subtitle
        ><h5 class="text-muted mb-3">
          Curriculum: <strong>{{ topic.subject?.level?.examBoard?.curriculum?.name }}</strong>
        </h5>
        <h5 class="text-muted mb-3">
          Exam board: <strong>{{ topic.subject?.level?.examBoard?.name }}</strong>
        </h5>
        <h5 class="text-muted mb-3">
          Level: <strong>{{ topic.subject?.level?.name }}</strong>
        </h5>
        <h5 class="text-muted mb-3">
          SUbject: <strong>{{ topic.subject?.name }}</strong>
        </h5>
      </template>
      <template #content>
        <h5>Subtopics:</h5>
        <div class="d-flex flex-wrap gap-2">
          <span v-for="subtopic in topic.subtopics" :key="subtopic.id" class="badge bg-primary">
            {{ subtopic.name }}
          </span>
        </div>
      </template>
      <template #footer>
        <div class="row justify-content-md-end mt-1 g-2">
          <!-- Edit button -->
          <div class="col-6 col-md-3 col-lg-2">
            <router-link :to="'/topics/' + topic.id + '/edit'">
              <Button
                label="Edit"
                severity="contrast"
                variant="outlined"
                size="small"
                icon="pi pi-pencil"
                class="no-wrap-btn me-2"
                fluid
            /></router-link>
          </div>
          <!-- Delete button -->
          <div class="col-6 col-md-3 col-lg-2">
            <DeletePopup
              :delete-callback="deleteTopic"
              :is-deleting-item="deletingTopic.inProgress"
              title="Are You Sure?"
              message="Deleting this topic is permanent. Proceed?"
            />
          </div>
        </div>
      </template>
    </Card>
    <ItemNotFound
      v-else
      title="Topic Not Found"
      message="The topic you are looking for does not exist or may have been removed."
    />
  </div>
</template>

<script setup lang="ts">
import { Topic } from "@/models/topic";
import { useTopicStore } from "@/stores/topic";
import { useToast } from "primevue";
import { onMounted, ref, type Ref } from "vue";
import { useRouter } from "vue-router";
import ItemNotFound from "../shared/ItemNotFound.vue";
import Button from "primevue/button";
import DeletePopup from "../shared/DeletePopup.vue";
import Card from "primevue/card";
import { DeletionState } from "@/models/deletionState";
import TopicDetailsSkeleton from "./skeletons/TopicDetailsSkeleton.vue";
import Chip from "primevue/chip";

const topicStore = useTopicStore();
const toast = useToast();
const router = useRouter();

const topic: Ref<Topic | null> = ref(null);
const topicId: Ref<number | null> = ref(null);
const deletingTopic = ref(new DeletionState());
const isGettingTopic = ref(false);

onMounted(() => {
  //scroll up to the top of the page
  window.scrollTo(0, 0);

  //get the topic ID from a query parameter
  const id = router.currentRoute.value.params["id"];

  //fetch topic with the given ID from the backend
  if (!id) return;

  try {
    topicId.value = Number(id);
    getTopicById(topicId.value);
  } catch {}
});

//fetch a topic with a given ID
const getTopicById = (id: number) => {
  isGettingTopic.value = true;
  topicStore
    .getTopicById(id)
    .then((data) => {
      topic.value = data;
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Fetch Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (isGettingTopic.value = false));
};

//Delete a topic with a given ID
const deleteTopic = () => {
  const id = topicId.value;
  if (!id) return;
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
      router.push("/topics");
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
