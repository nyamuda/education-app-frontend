<template>
  <div class="container my-4">
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

const examBoardStore = useExamBoardStore();
const toast = useToast();
const router = useRouter();

const examBoard: Ref<ExamBoard | null> = ref(null);
const examBoardId: Ref<number | null> = ref(null);
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
</script>
