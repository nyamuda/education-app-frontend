<template>
  <div class="">
    <!-- <div v-if="isGettingExamBoard" class="text-center py-5">
      <ProgressSpinner />
      <p>Loading Exam Board...</p>
    </div> -->

    <ExamBoardDetailsSkeletons v-if="isGettingExamBoard" />

    <Card v-else-if="examBoard">
      <template #title>
        <h6><Chip label="Exam Board" /></h6>
        <h2 class="mb-2">{{ examBoard.name }}</h2>
      </template>
      <template #subtitle
        ><h6 class="text-muted mb-3">
          Curriculum: <strong>{{ examBoard.curriculum?.name }}</strong>
        </h6></template
      >
      <template #content>
        <h5>Levels:</h5>
        <div class="d-flex flex-wrap gap-2">
          <span v-for="level in examBoard.levels" :key="level.id" class="badge bg-primary">
            {{ level.name }}
          </span>
        </div>
      </template>
      <template #footer>
        <div class="row justify-content-md-end mt-1 g-2">
          <!-- Edit button -->
          <div class="col-6 col-md-3 col-lg-2">
            <router-link :to="'/exam-boards/' + examBoard.id + '/edit'">
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
              :delete-callback="deleteExamBoard"
              :is-deleting-item="deletingExamBoard.inProgress"
              title="Are You Sure?"
              message="Deleting this exam board is permanent. Proceed?"
            />
          </div>
        </div>
      </template>
    </Card>
    <ItemNotFound
      v-else
      title="Exam Board Not Found"
      message="The exam board you are looking for does not exist or may have been removed."
    />
  </div>
</template>

<script setup lang="ts">
import { ExamBoard } from "@/models/examBoard";
import { useExamBoardStore } from "@/stores/examBoard";
import { useToast } from "primevue";
import { onMounted, ref, type Ref } from "vue";
import { useRouter } from "vue-router";
//import ProgressSpinner from "primevue/progressspinner";
import ItemNotFound from "../shared/ItemNotFound.vue";

import Button from "primevue/button";
import DeletePopup from "../shared/DeletePopup.vue";
import Card from "primevue/card";
import { DeletionState } from "@/models/deletionState";
import ExamBoardDetailsSkeletons from "./skeletons/ExamBoardDetailsSkeleton.vue";
import Chip from "primevue/chip";

const examBoardStore = useExamBoardStore();
const toast = useToast();
const router = useRouter();

const examBoard: Ref<ExamBoard | null> = ref(null);
const examBoardId: Ref<number | null> = ref(null);
const deletingExamBoard = ref(new DeletionState());
const isGettingExamBoard = ref(false);
onMounted(() => {
  //scroll up to the top of the page
  window.scrollTo(0, 0);

  //get the exam board ID from a query parameter
  const id = router.currentRoute.value.params["id"];

  //fetch exam board with the given ID from the backend
  if (id) {
    examBoardId.value = Number(id);
    getExamBoardById(examBoardId.value);
  }
});

//fetch exam board with given ID
const getExamBoardById = (id: number) => {
  isGettingExamBoard.value = true;
  examBoardStore
    .getExamBoardById(id)
    .then((data) => {
      examBoard.value = data;
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Fetch Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (isGettingExamBoard.value = false));
};

//Delete an exam board with a given ID
const deleteExamBoard = () => {
  const id = examBoardId.value;
  if (!id) return;
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
      router.push("/exam-boards");
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
