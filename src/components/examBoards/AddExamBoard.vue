<template>
  <div class="">
    <form class="examBoard-form m-auto" @submit.prevent="submitForm">
      <TitleSection title="Add exam board" title-size="small" />

      <!-- Name input -->
      <div class="form-group mb-3">
        <FloatLabel variant="on">
          <InputText
            class="w-100"
            id="examBoardName"
            v-model="v$.name.$model"
            :invalid="v$.name.$error"
          />
          <label for="examBoardName">Exam board name</label>
        </FloatLabel>
        <Message size="small" severity="error" v-if="v$.name.$error" variant="simple">
          <div v-for="error of v$.name.$errors" :key="error.$uid">
            <div>{{ error.$message }}</div>
          </div>
        </Message>
      </div>
      <div class="form-group mb-3">
        <FloatLabel variant="on">
          <Select
            id="examBoardCurriculum"
            :placeholder="isGettingCurriculums ? 'Fetching curriculums...' : 'Curriculum'"
            checkmark
            :options="curriculums"
            option-label="name"
            option-value="id"
            v-model="v$.curriculumId.$model"
            :invalid="v$.curriculumId.$error"
            class="w-100"
            :loading="isGettingCurriculums"
            :disabled="isGettingCurriculums"
          />
          <label for="examBoardCurriculum">Curriculum</label>
        </FloatLabel>
        <Message size="small" severity="error" v-if="v$.curriculumId.$error" variant="simple">
          <div v-for="error of v$.name.$errors" :key="error.$uid">
            <div>{{ error.$message }}</div>
          </div>
        </Message>
      </div>

      <!-- Submit button -->
      <Button
        fluid
        type="submit"
        :label="isAddingExamBoard ? 'Adding...' : 'Add exam board'"
        :loading="isAddingExamBoard"
        :disabled="v$.$errors.length > 0 || isAddingExamBoard"
        size="small"
        severity="primary"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from "vue";
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";
import Button from "primevue/button";
import { Message } from "primevue";
//Vuelidate for login form validation
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";
import TitleSection from "../shared/TitleSection.vue";
import { useExamBoardStore } from "@/stores/examBoard";
import type { Curriculum } from "@/models/curriculum";
import { useCurriculumStore } from "@/stores/curriculum";
import Select from "primevue/select";

// Access the store
const examBoardStore = useExamBoardStore();
const toast = useToast();
const router = useRouter();

onMounted(() => {
  //get all curriculums to allow admin to select a curriculum for the exam board
  getAllCurriculums();
});
const isAddingExamBoard = ref(false);
const curriculums: Ref<Curriculum[]> = ref([]);
const curriculumStore = useCurriculumStore();
const isGettingCurriculums = ref(false);

//form validation with Vuelidate start
const formData = ref({
  name: "",
  curriculumId: 0,
});

const rules = {
  name: { required },
  curriculumId: { required },
};

const v$ = useVuelidate(rules, formData.value);
//form validation with Vuelidate end

const submitForm = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (isFormCorrect) {
    isAddingExamBoard.value = true;
    examBoardStore
      .addExamBoard(formData.value)
      .then((message) => {
        toast.add({
          severity: "success",
          summary: "Success",
          detail: message,
          life: 5000,
        });
        router.push("/exam-boards");
      })
      .catch((message) => {
        toast.add({
          severity: "error",
          summary: "Adding Exam Board Failed",
          detail: message,
          life: 10000,
        });
      })
      .finally(() => (isAddingExamBoard.value = false));
  }
};

/**
 * Fetches all curriculums from the backend. These curriculums are used
 * to select the curriculum an exam board falls under.
 *
 * Retrieves the first 100 curriculums (page size = 100), which is currently
 * more than enough since the total number of curriculums in the system is small.
 *
 * Using 100 ensures all available curriculums are fetched in one request.
 * If the dataset grows significantly in the future, the page size can be
 * reduced or proper pagination logic can be implemented.
 */
const getAllCurriculums = () => {
  isGettingCurriculums.value = true;
  const page = 1;
  const pageSize = 100;
  curriculumStore
    .getCurriculums(page, pageSize)
    .then((data) => (curriculums.value = data.items))
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

<style scoped>
a {
  text-decoration: none;
}
@media (min-width: 768px) {
  .examBoard-form {
    max-width: 30rem;
  }
}
</style>
