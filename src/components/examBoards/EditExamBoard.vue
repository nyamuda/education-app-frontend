<template>
  <div class="">
    <form class="examBoard-form m-auto" @submit.prevent="submitForm">
      <TitleSection title="Update exam board" title-size="small" />

      <!-- Name input -->
      <div class="form-group mb-3">
        <FloatLabel variant="on">
          <InputText
            class="w-100"
            id="examBoardName"
            v-model="v$.name.$model"
            :invalid="v$.name.$error"
            :disabled="isGettingExamBoard"
          />
          <label for="examBoardName">Exam board name</label>
        </FloatLabel>
        <Message size="small" severity="error" v-if="v$.name.$error" variant="simple">
          <div v-for="error of v$.name.$errors" :key="error.$uid">
            <div>{{ error.$message }}</div>
          </div>
        </Message>
      </div>
      <!-- Curriculum input -->
      <div class="form-group mb-3">
        <CurriculumSelectInput
          @curriculum="(val: Curriculum) => (formData.curriculumId = val.id)"
          @is-loading="(val: boolean) => (isLoadingCurriculums = val)"
          :default-curriculum-id="initialCurriculumId || 0"
          placeholder="Select a curriculum"
          :is-required="true"
        />
      </div>

      <!-- Submit button -->
      <Button
        fluid
        type="submit"
        :label="
          isUpdatingExamBoard
            ? 'Saving changes...'
            : isGettingExamBoard
              ? 'Retrieving exam board information…'
              : 'Update exam board'
        "
        :loading="isUpdatingExamBoard || isGettingExamBoard"
        :disabled="v$.$errors.length > 0 || isUpdatingExamBoard || isGettingExamBoard"
        :variant="isGettingExamBoard ? 'outlined' : ''"
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
import CurriculumSelectInput from "../curriculums/CurriculumSelectInput.vue";

// Access the store
const examBoardStore = useExamBoardStore();
const toast = useToast();
const router = useRouter();

onMounted(() => {
  //get the exam board ID from a query parameter
  const id = router.currentRoute.value.params["id"];

  //fetch exam board with the given ID from the backend
  if (id) {
    examBoardId.value = Number(id);
    getExamBoardById(examBoardId.value);
  }
});
const isUpdatingExamBoard = ref(false);
const isGettingExamBoard = ref(false);
const examBoardId: Ref<number | null> = ref(null);
//check if the curriculums for the select input are being loaded
const isLoadingCurriculums = ref(false);
//ID of curriculum initially selected
const initialCurriculumId: Ref<number | null> = ref(null);

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
  if (isFormCorrect && examBoardId.value) {
    isUpdatingExamBoard.value = true;
    examBoardStore
      .updateExamBoard(examBoardId.value, formData.value)
      .then(() => {
        toast.add({
          severity: "success",
          summary: "Update Successful",
          detail: "Changes to the exam board have been saved.",
          life: 5000,
        });
        router.push("/exam-boards");
      })
      .catch((message) => {
        toast.add({
          severity: "error",
          summary: "Update Failed",
          detail: message,
          life: 10000,
        });
      })
      .finally(() => (isUpdatingExamBoard.value = false));
  }
};

//fetch exam board with given ID
const getExamBoardById = (id: number) => {
  isGettingExamBoard.value = true;
  examBoardStore
    .getExamBoardById(id)
    .then((data) => {
      //populate the form
      formData.value.name = data.name;
      formData.value.curriculumId = data.curriculumId;
      initialCurriculumId.value = data.curriculumId;
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
