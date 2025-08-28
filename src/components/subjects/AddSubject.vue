<template>
  <div class="">
    <form class="subject-form m-auto" @submit.prevent="submitForm">
      <TitleSection title="Add subject" title-size="small" />

      <!-- Name input -->
      <div class="form-group mb-3">
        <FloatLabel variant="on">
          <InputText
            class="w-100"
            id="subjectName"
            v-model="v$.name.$model"
            :invalid="v$.name.$error"
          />
          <label for="subjectName">Subject name</label>
        </FloatLabel>
        <Message size="small" severity="error" v-if="v$.name.$error" variant="simple">
          <div v-for="error of v$.name.$errors" :key="error.$uid">
            <div>{{ error.$message }}</div>
          </div>
        </Message>
      </div>
      <!-- Curriculum, exam board and level inputs -->
      <div class="form-group mb-3">
        <CurriculumExamBoardLevelSubjectTopicSelect
          :default-curriculum-id="formData.curriculumId ?? undefined"
          :default-exam-board-id="formData.examBoardId ?? undefined"
          :default-level-id="formData.levelId ?? undefined"
          @change-curriculum="(val: Curriculum) => (formData.curriculumId = val.id)"
          @change-exam-board="(val: ExamBoard) => (formData.examBoardId = val.id)"
          @change-level="(val: Level) => (formData.levelId = val.id)"
          :is-required="true"
          :show-subject="false"
          :show-topic="false"
          @is-loading-data="(val: boolean) => (isLoadingSelectionData = val)"
          ref="curriculumSelectRef"
        />
      </div>
      <!-- Submit button -->
      <Button
        fluid
        type="submit"
        :label="isAddingSubject ? 'Adding...' : 'Add subject'"
        :loading="isAddingSubject"
        :disabled="v$.$errors.length > 0 || isAddingSubject || isLoadingSelectionData"
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
import { useSubjectStore } from "@/stores/subject";
import type { Curriculum } from "@/models/curriculum";
import type { ExamBoard } from "@/models/examBoard";
import type { SubjectFormData } from "@/interfaces/subjects/subjectFormData";

import type { Level } from "@/models/level";
import CurriculumExamBoardLevelSubjectTopicSelect from "../shared/selects/multi-selects/CurriculumExamBoardLevelSubjectTopicSelect.vue";

onMounted(() => {
  v$.value.$touch();
  // Load curriculums (with exam boards, and levels)
  // so the user can select from the dropdown.
  curriculumSelectRef.value.getAllCurriculums();
});

// Access the store
const subjectStore = useSubjectStore();
const toast = useToast();
const router = useRouter();
const isAddingSubject = ref(false);
//check if the curriculums for the dropdowns are being loaded
const isLoadingSelectionData = ref(false);
const curriculumSelectRef = ref();
//form validation start
const formData: Ref<SubjectFormData> = ref({
  name: "",
  curriculumId: null,
  examBoardId: null,
  levelId: null,
});

const rules = {
  name: { required },
  curriculumId: { required },
  examBoardId: { required },
  levelId: { required },
};

const v$ = useVuelidate(rules, formData.value);
//form validation end

const submitForm = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) return;

  const { name, levelId } = formData.value;
  if (levelId == null) return;

  isAddingSubject.value = true;
  subjectStore
    .addSubject({ name, levelId })
    .then((message) => {
      toast.add({
        severity: "success",
        summary: "Success",
        detail: message,
        life: 5000,
      });
      router.push("/subjects");
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Adding Subject Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (isAddingSubject.value = false));
};
</script>

<style lang="scss" scoped>
a {
  text-decoration: none;
}
@media (min-width: 768px) {
  .subject-form {
    max-width: 30rem;
  }
}
</style>
