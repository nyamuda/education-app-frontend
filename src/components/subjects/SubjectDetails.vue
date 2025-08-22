<template>
  <div class="">
    <LevelDetailsSkeleton v-if="isGettingLevel" />

    <Card v-else-if="level">
      <template #title>
        <h6><Chip label="Educational Level" /></h6>
        <h2 class="mb-2">{{ level.name }}</h2>
      </template>
      <template #subtitle
        ><h5 class="text-muted mb-3">
          Curriculum: <strong>{{ level.examBoard?.curriculum?.name }}</strong>
        </h5>
        <h5 class="text-muted mb-3">
          Exam board: <strong>{{ level.examBoard?.name }}</strong>
        </h5>
      </template>
      <template #content>
        <h5>Subjects:</h5>
        <div class="d-flex flex-wrap gap-2">
          <span v-for="subject in level.subjects" :key="subject.id" class="badge bg-primary">
            {{ subject.name }}
          </span>
        </div>
      </template>
      <template #footer>
        <div class="row justify-content-md-end mt-1 g-2">
          <!-- Edit button -->
          <div class="col-6 col-md-3 col-lg-2">
            <router-link :to="'/levels/' + level.id + '/edit'">
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
              :delete-callback="deleteLevel"
              :is-deleting-item="deletingLevel.inProgress"
              title="Are You Sure?"
              message="Deleting this level is permanent. Proceed?"
            />
          </div>
        </div>
      </template>
    </Card>
    <ItemNotFound
      v-else
      title="Level Not Found"
      message="The level you are looking for does not exist or may have been removed."
    />
  </div>
</template>

<script setup lang="ts">
import { Level } from "@/models/level";
import { useLevelStore } from "@/stores/level";
import { useToast } from "primevue";
import { onMounted, ref, type Ref } from "vue";
import { useRouter } from "vue-router";
import ItemNotFound from "../shared/ItemNotFound.vue";

import Button from "primevue/button";
import DeletePopup from "../shared/DeletePopup.vue";
import Card from "primevue/card";
import { DeletionState } from "@/models/deletionState";
import LevelDetailsSkeleton from "./skeletons/LevelDetailsSkeleton.vue";
import Chip from "primevue/chip";

const levelStore = useLevelStore();
const toast = useToast();
const router = useRouter();

const level: Ref<Level | null> = ref(null);
const levelId: Ref<number | null> = ref(null);
const deletingLevel = ref(new DeletionState());
const isGettingLevel = ref(false);

onMounted(() => {
  //scroll up to the top of the page
  window.scrollTo(0, 0);

  //get the level ID from a query parameter
  const id = router.currentRoute.value.params["id"];

  //fetch level with the given ID from the backend
  if (id) {
    levelId.value = Number(id);
    getLevelById(levelId.value);
  }
});

//fetch a level with a given ID
const getLevelById = (id: number) => {
  isGettingLevel.value = true;
  levelStore
    .getLevelById(id)
    .then((data) => {
      level.value = data;
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Fetch Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (isGettingLevel.value = false));
};

//Delete a level with a given ID
const deleteLevel = () => {
  const id = levelId.value;
  if (!id) return;
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
      router.push("/levels");
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
