<template>
  <div class="">
    <form class="topic-form m-auto" @submit.prevent="submitForm">
      <TitleSection title="Add topic" title-size="small" />

      <!-- Name input -->
      <div class="form-group mb-3">
        <FloatLabel variant="on">
          <InputText
            class="w-100"
            id="topicName"
            v-model="v$.name.$model"
            :invalid="v$.name.$error"
          />
          <label for="topicName">Topic name</label>
        </FloatLabel>
        <Message size="small" severity="error" v-if="v$.name.$error" variant="simple">
          <div v-for="error of v$.name.$errors" :key="error.$uid">
            <div>{{ error.$message }}</div>
          </div>
        </Message>
      </div>
      <!-- Curriculum, exam board, level and subject inputs -->
      <div class="form-group mb-3">
        <CurriculumExamBoardLevelSubjectTopicSelect
          @change-curriculum="(val: Curriculum) => (formData.curriculumId = val.id)"
          @change-exam-board="(val: ExamBoard) => (formData.examBoardId = val.id)"
          @change-level="(val: Level) => (formData.levelId = val.id)"
          @change-subject="(val: Subject) => (formData.subjectId = val.id)"
          :show-curriculum="true"
          :show-exam-board="true"
          :show-level="true"
          :show-subject="true"
          :is-required="true"
          @is-loading-data="(val: boolean) => (isLoadingSelectionData = val)"
          ref="curriculumSelectRef"
        />
      </div>
      <!-- Submit button -->
      <Button
        fluid
        type="submit"
        :label="isAddingTopic ? 'Adding...' : 'Add topic'"
        :loading="isAddingTopic"
        :disabled="v$.$errors.length > 0 || isAddingTopic || isLoadingSelectionData"
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
import { useTopicStore } from "@/stores/topic";
import type { Curriculum } from "@/models/curriculum";
import type { ExamBoard } from "@/models/examBoard";
import type { TopicFormData } from "@/interfaces/topics/topicFormData";
import type { Level } from "@/models/level";
import type { Subject } from "@/models/subject";
import CurriculumExamBoardLevelSubjectTopicSelect from "../shared/selects/multi-selects/CurriculumExamBoardLevelSubjectTopicSelect.vue";

onMounted(() => {
  v$.value.$touch();
  // Load curriculums (with exam boards, levels, and subjects)
  // so the user can select from the dropdown.
  curriculumSelectRef.value.getAllCurriculums();
});

// Access the store
const topicStore = useTopicStore();
const toast = useToast();
const router = useRouter();
const isAddingTopic = ref(false);
//check if the curriculums or subjects for the dropdowns are being loaded
const isLoadingSelectionData = ref(false);
const curriculumSelectRef = ref();
//form validation start
const formData: Ref<TopicFormData> = ref({
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

  isAddingTopic.value = true;
  topicStore
    .addTopic({ name, subjectId })
    .then(() => {
      toast.add({
        severity: "success",
        summary: "Success",
        detail: "Topic added successfully.",
        life: 5000,
      });
      router.push("/topics");
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Adding Topic Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (isAddingTopic.value = false));
};
</script>

<style lang="scss" scoped>
a {
  text-decoration: none;
}
@media (min-width: 768px) {
  .topic-form {
    max-width: 30rem;
  }
}
</style>
