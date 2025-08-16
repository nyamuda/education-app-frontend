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
      <!-- Curriculum input -->
      <CurriculumSelectInput @curriculum="(c: Curriculum) => (formData.curriculumId = c.id)" />

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
    {{ formData.curriculumId }}
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
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
import CurriculumSelectInput from "../curriculums/CurriculumSelectInput.vue";
import type { Curriculum } from "@/models/curriculum";

onMounted(() => {
  v$.value.$touch();
});

// Access the store
const examBoardStore = useExamBoardStore();
const toast = useToast();
const router = useRouter();
const isAddingExamBoard = ref(false);

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
