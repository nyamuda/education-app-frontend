<template>
  <div class="">
    <SubtopicDetailsSkeleton v-if="isGettingSubtopic" />

    <Card v-else-if="subtopic">
      <template #title>
        <h6><Chip label="Subtopic" /></h6>
        <h2 class="mb-2">{{ subtopic.name }}</h2>
      </template>
      <template #subtitle
        ><h5 class="text-muted mb-3">
          Curriculum:
          <strong>{{ subtopic.topic?.subject?.level?.examBoard?.curriculum?.name }}</strong>
        </h5>
        <h5 class="text-muted mb-3">
          Exam board: <strong>{{ subtopic.topic?.subject?.level?.examBoard?.name }}</strong>
        </h5>
        <h5 class="text-muted mb-3">
          Level: <strong>{{ subtopic.topic?.subject?.level?.name }}</strong>
        </h5>
        <h5 class="text-muted mb-3">
          Subject: <strong>{{ subtopic.topic?.subject?.name }}</strong>
        </h5>
        <h5 class="text-muted mb-3">
          Topic: <strong>{{ subtopic.topic?.name }}</strong>
        </h5>
      </template>

      <template #footer>
        <div class="row justify-content-md-end mt-1 g-2">
          <!-- Edit button -->
          <div class="col-6 col-md-3 col-lg-2">
            <router-link :to="'/subtopics/' + subtopic.id + '/edit'">
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
              :delete-callback="deleteSubtopic"
              :is-deleting-item="deletingSubtopic.inProgress"
              title="Are You Sure?"
              message="Deleting this subtopic is permanent. Proceed?"
            />
          </div>
        </div>
      </template>
    </Card>
    <ItemNotFound
      v-else
      title="Subtopic Not Found"
      message="The subtopic you are looking for does not exist or may have been removed."
    />
  </div>
</template>

<script setup lang="ts">
import { Subtopic } from "@/models/subtopic";
import { useSubtopicStore } from "@/stores/subtopic";
import { useToast } from "primevue";
import { onMounted, ref, type Ref } from "vue";
import { useRouter } from "vue-router";
import ItemNotFound from "../shared/ItemNotFound.vue";
import Button from "primevue/button";
import DeletePopup from "../shared/DeletePopup.vue";
import Card from "primevue/card";
import { DeletionState } from "@/models/deletionState";
import SubtopicDetailsSkeleton from "./skeletons/SubtopicDetailsSkeleton.vue";
import Chip from "primevue/chip";

const subtopicStore = useSubtopicStore();
const toast = useToast();
const router = useRouter();

const subtopic: Ref<Subtopic | null> = ref(null);
const subtopicId: Ref<number | null> = ref(null);
const deletingSubtopic = ref(new DeletionState());
const isGettingSubtopic = ref(false);

onMounted(() => {
  //scroll up to the top of the page
  window.scrollTo(0, 0);

  //get the subtopic ID from a query parameter
  const id = router.currentRoute.value.params["id"];

  //fetch subtopic with the given ID from the backend
  if (!id) return;

  try {
    subtopicId.value = Number(id);
    getSubtopicById(subtopicId.value);
  } catch {}
});

//fetch a subtopic with a given ID
const getSubtopicById = (id: number) => {
  isGettingSubtopic.value = true;
  subtopicStore
    .getSubtopicById(id)
    .then((data) => {
      subtopic.value = data;
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Fetch Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (isGettingSubtopic.value = false));
};

//Delete a subtopic with a given ID
const deleteSubtopic = () => {
  const id = subtopicId.value;
  if (!id) return;
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
      router.push("/subtopics");
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
