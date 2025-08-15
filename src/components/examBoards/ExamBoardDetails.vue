<template>
  <div class="">
    <TitleSection title="Exam Board Details" title-size="small" />
    <div v-if="isGettingExamBoard" class="text-center py-5">
      <ProgressSpinner />
      <p>Loading Exam Board...</p>
    </div>

    <div v-else-if="examBoard">
      <div class="card shadow-sm p-4">
        <h2 class="mb-2">{{ examBoard.name }}</h2>
        <h6 class="text-muted mb-3">
          Curriculum: <strong>{{ examBoard.curriculum?.name }}</strong>
        </h6>

        <div>
          <h5>Levels:</h5>
          <div class="d-flex flex-wrap gap-2">
            <span v-for="level in examBoard.levels" :key="level.id" class="badge bg-primary">
              {{ level.name }}
            </span>
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-evenly justify-content-md-end align-items-start flex-wrap">
        <!--Button to see more details-->
        <router-link :to="'exam-boards/' + examBoard.id + '/edit'">
          <Button
            label="More details"
            severity="contrast"
            variant="outlined"
            size="small"
            icon="pi pi-info-circle"
            class="no-wrap-btn me-2"
        /></router-link>

        <DeletePopup
          :delete-callback="deleteExamBoard"
          :is-deleting-item="deletingExamBoard.inProgress"
        />
      </div>
    </div>

    <ItemNotFound v-else />
  </div>
</template>

<script setup lang="ts">
import { ExamBoard } from "@/models/examBoard";
import { useExamBoardStore } from "@/stores/examBoard";
import { useToast } from "primevue";
import { onMounted, ref, type Ref } from "vue";
import { useRouter } from "vue-router";
import ProgressSpinner from "primevue/progressspinner";
import ItemNotFound from "../shared/ItemNotFound.vue";
import TitleSection from "../shared/TitleSection.vue";
import Button from "primevue/button";
import DeletePopup from "../shared/DeletePopup.vue";
import { DeletionState } from "@/models/deletionState";

const examBoardStore = useExamBoardStore();
const toast = useToast();
const router = useRouter();

const examBoard: Ref<ExamBoard | null> = ref(null);
const examBoardId: Ref<number | null> = ref(null);
const deletingExamBoard = ref(new DeletionState());
const isGettingExamBoard = ref(false);
onMounted(() => {
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
