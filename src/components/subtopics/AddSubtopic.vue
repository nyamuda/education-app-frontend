<template>
  <div class="">
    <form class="subtopic-form m-auto" @submit.prevent="submitForm">
      <TitleSection title="Add subtopic" title-size="small" />

      <!-- Name input -->
      <div class="form-group mb-3">
        <FloatLabel variant="on">
          <InputText
            class="w-100"
            id="subtopicName"
            v-model="v$.name.$model"
            :invalid="v$.name.$error"
          />
          <label for="subtopicName">Subtopic name</label>
        </FloatLabel>
        <Message size="small" severity="error" v-if="v$.name.$error" variant="simple">
          <div v-for="error of v$.name.$errors" :key="error.$uid">
            <div>{{ error.$message }}</div>
          </div>
        </Message>
      </div>
      <!-- Curriculum, exam board, level and subject inputs -->
      <div class="form-group mb-3">
        <CurriculumExamBoardLevelSubjectSelect
          :default-curriculum-id="formData.curriculumId ?? undefined"
          :default-exam-board-id="formData.examBoardId ?? undefined"
          :default-level-id="formData.levelId ?? undefined"
          :default-subject-id="formData.subjectId ?? undefined"
          @change-curriculum="(val: Curriculum) => (formData.curriculumId = val.id)"
          @change-exam-board="(val: ExamBoard) => (formData.examBoardId = val.id)"
          @change-level="(val: Level) => (formData.levelId = val.id)"
          @change-subject="(val: Subject) => (formData.subjectId = val.id)"
          :is-required="true"
          @is-loading="(val: boolean) => (isLoadingCurriculums = val)"
          ref="curriculumExamBoardLevelSubjectSelectRef"
        />
      </div>
      <!-- Submit button -->
      <Button
        fluid
        type="submit"
        :label="isAddingSubtopic ? 'Adding...' : 'Add subtopic'"
        :loading="isAddingSubtopic"
        :disabled="v$.$errors.length > 0 || isAddingSubtopic || isLoadingCurriculums"
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
import { useSubtopicStore } from "@/stores/subtopic";
import type { Curriculum } from "@/models/curriculum";
import type { ExamBoard } from "@/models/examBoard";
import type { SubtopicFormData } from "@/interfaces/subtopics/subtopicFormData";
import type { Level } from "@/models/level";
import CurriculumExamBoardLevelSubjectSelect from "../shared/selects/multi-selects/CurriculumExamBoardLevelSubjectSelect.vue";
import type { Subject } from "@/models/subject";

onMounted(() => {
  v$.value.$touch();
  //fetch curriculums for the curriculum and exam board select inputs
  curriculumExamBoardLevelSubjectSelectRef.value.getAllCurriculums();
});

// Access the store
const subtopicStore = useSubtopicStore();
const toast = useToast();
const router = useRouter();
const isAddingSubtopic = ref(false);
//check if the curriculums for the select input are being loaded
const isLoadingCurriculums = ref(false);
const curriculumExamBoardLevelSubjectSelectRef = ref();
//form validation start
const formData: Ref<SubtopicFormData> = ref({
  name: "",
  curriculumId: null,
  examBoardId: null,
  levelId: null,
  subjectId: null,
});

const rules = {
  name: { required },
  curriculumId: { required },
  examBoardId: { required },
  levelId: { required },
  subjectId: { required },
};

const v$ = useVuelidate(rules, formData.value);
//form validation end

const submitForm = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) return;

  const { name, subjectId } = formData.value;
  if (subjectId == null) return;

  isAddingSubtopic.value = true;
  subtopicStore
    .addSubtopic({ name, subjectId })
    .then(() => {
      toast.add({
        severity: "success",
        summary: "Success",
        detail: "Subtopic added successfully.",
        life: 5000,
      });
      router.push("/subtopics");
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Adding Subtopic Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (isAddingSubtopic.value = false));
};
</script>

<style lang="scss" scoped>
a {
  text-decoration: none;
}
@media (min-width: 768px) {
  .subtopic-form {
    max-width: 30rem;
  }
}
</style>
