<template>
  <div class="">
    <form class="level-form m-auto" @submit.prevent="submitForm">
      <TitleSection title="Add educational level" title-size="small" />

      <!-- Name input -->
      <div class="form-group mb-3">
        <FloatLabel variant="on">
          <InputText
            class="w-100"
            id="levelName"
            v-model="v$.name.$model"
            :invalid="v$.name.$error"
          />
          <label for="levelName">Level name</label>
        </FloatLabel>
        <Message size="small" severity="error" v-if="v$.name.$error" variant="simple">
          <div v-for="error of v$.name.$errors" :key="error.$uid">
            <div>{{ error.$message }}</div>
          </div>
        </Message>
      </div>
      <!-- Curriculum input -->
      <!-- Curriculum and exam board inputs -->
      <div class="form-group mb-3">
        <CurriculumExamBoardLevelSubjectTopicSelect
          :default-curriculum-id="formData.curriculumId ?? undefined"
          :default-exam-board-id="formData.examBoardId ?? undefined"
          @change-curriculum="(val: Curriculum) => (formData.curriculumId = val.id)"
          @change-exam-board="(val: ExamBoard) => (formData.examBoardId = val.id)"
          :is-required="true"
          @is-loading-data="(val: boolean) => (isLoadingSelectionData = val)"
          ref="curriculumSelectRef"
        />
      </div>
      <!-- Submit button -->
      <Button
        fluid
        type="submit"
        :label="isAddingLevel ? 'Adding...' : 'Add level'"
        :loading="isAddingLevel"
        :disabled="v$.$errors.length > 0 || isAddingLevel || isLoadingSelectionData"
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
import { useLevelStore } from "@/stores/level";
import type { Curriculum } from "@/models/curriculum";
import type { ExamBoard } from "@/models/examBoard";
import type { LevelFormData } from "@/interfaces/levels/levelFormData";
import CurriculumExamBoardLevelSubjectTopicSelect from "../shared/selects/multi-selects/CurriculumExamBoardLevelSubjectTopicSelect.vue";

onMounted(() => {
  v$.value.$touch();
  // Load curriculums (with exam boards)
  // so the user can select from the dropdown.
  curriculumSelectRef.value.getAllCurriculums();
});

// Access the store
const levelStore = useLevelStore();
const toast = useToast();
const router = useRouter();
const isAddingLevel = ref(false);
//check if the curriculums for the dropdowns are being loaded
const isLoadingSelectionData = ref(false);
const curriculumSelectRef = ref();
//form validation start
const formData: Ref<LevelFormData> = ref({
  name: "",
  curriculumId: null,
  examBoardId: null,
});

const rules = {
  name: { required },
  curriculumId: { required },
  examBoardId: { required },
};

const v$ = useVuelidate(rules, formData.value);
//form validation end

const submitForm = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) return;

  const { name, examBoardId } = formData.value;
  if (examBoardId == null) return;

  isAddingLevel.value = true;
  levelStore
    .addLevel({ name, examBoardId })
    .then((message) => {
      toast.add({
        severity: "success",
        summary: "Success",
        detail: message,
        life: 5000,
      });
      router.push("/levels");
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Adding Level Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (isAddingLevel.value = false));
};
</script>

<style lang="scss" scoped>
a {
  text-decoration: none;
}
@media (min-width: 768px) {
  .level-form {
    max-width: 30rem;
  }
}
</style>
