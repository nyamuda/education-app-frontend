<template>
  <div class="">
    <form class="subtopic-form m-auto" @submit.prevent="submitForm">
      <TitleSection title="Edit subtopic" title-size="small" />

      <!-- Name input -->
      <div class="form-group mb-3">
        <FloatLabel variant="on">
          <InputText
            class="w-100"
            id="subtopicName"
            v-model="v$.name.$model"
            :invalid="v$.name.$error"
            :disabled="isUpdatingSubtopic || isGettingSubtopic"
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
        <CurriculumExamBoardLevelSubjectTopicSelect
          :default-curriculum-id="formData.curriculumId ?? undefined"
          :default-exam-board-id="formData.examBoardId ?? undefined"
          :default-level-id="formData.levelId ?? undefined"
          :default-subject-id="formData.subjectId ?? undefined"
          :default-topic-id="formData.topicId ?? undefined"
          @change-curriculum="(val: Curriculum) => (formData.curriculumId = val.id)"
          @change-exam-board="(val: ExamBoard) => (formData.examBoardId = val.id)"
          @change-level="(val: Level) => (formData.levelId = val.id)"
          @change-subject="(val: Subject) => (formData.subjectId = val.id)"
          @change-topic="(val: Topic) => (formData.topicId = val.id)"
          :is-required="true"
          @is-loading-curriculums="(val: boolean) => (isLoadingCurriculumsOrSubjects = val)"
          @is-loading-subjects="(val: boolean) => (isLoadingCurriculumsOrSubjects = val)"
          :show-curriculum="true"
          :show-exam-board="true"
          :show-level="true"
          :show-subject="true"
          :show-topic="true"
          :crud-context="CrudContext.Update"
          ref="curriculumExamBoardLevelSubjectTopicSelectRef"
        />
      </div>
      <!-- Submit button -->
      <Button
        fluid
        type="submit"
        :label="
          isUpdatingSubtopic
            ? 'Saving changes...'
            : isGettingSubtopic || isLoadingCurriculumsOrSubjects
              ? 'Retrieving subtopic information…'
              : 'Update subtopic'
        "
        :loading="isUpdatingSubtopic"
        :disabled="
          v$.$errors.length > 0 ||
          isUpdatingSubtopic ||
          isLoadingCurriculumsOrSubjects ||
          isGettingSubtopic
        "
        size="small"
        severity="primary"
        :variant="isGettingSubtopic || isLoadingCurriculumsOrSubjects ? 'outlined' : ''"
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
import type { Subject } from "@/models/subject";
import CurriculumExamBoardLevelSubjectTopicSelect from "../shared/selects/multi-selects/CurriculumExamBoardLevelSubjectTopicSelect.vue";
import type { Subtopic } from "@/models/subtopic";
import type { Topic } from "@/models/topic";
import { CrudContext } from "@/enums/crudContext";

onMounted(async () => {
  v$.value.$touch();

  const id = router.currentRoute.value.params["id"];

  if (!id) return;

  try {
    subtopicId.value = Number(id);

    await getSubtopicById(subtopicId.value);
  } catch {}
});

// Access the store
const subtopicStore = useSubtopicStore();
const toast = useToast();
const router = useRouter();
const isUpdatingSubtopic = ref(false);
const isGettingSubtopic = ref(false);
const subtopicId: Ref<number | null> = ref(null);
//check if the curriculums or subjects for the select inputs are being loaded
const isLoadingCurriculumsOrSubjects = ref(false);
const curriculumExamBoardLevelSubjectTopicSelectRef = ref();
//form validation start
const formData: Ref<SubtopicFormData> = ref({
  name: "",
  curriculumId: null,
  examBoardId: null,
  levelId: null,
  subjectId: null,
  topicId: null,
});

const rules = {
  name: { required },
  curriculumId: { required },
  examBoardId: { required },
  levelId: { required },
  subjectId: { required },
  topicId: { required },
};

const v$ = useVuelidate(rules, formData.value);
//form validation end

const submitForm = async () => {
  //validate the form
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) return;

  //get the updated name and subject ID
  const { name, topicId } = formData.value;
  if (topicId == null || subtopicId.value == null) return;

  //update subtopic
  isUpdatingSubtopic.value = true;
  subtopicStore
    .updateSubtopic(subtopicId.value, { name, topicId })
    .then(() => {
      toast.add({
        severity: "success",
        summary: "Update Successful",
        detail: "Changes to the subtopic have been saved.",
        life: 5000,
      });
      router.push(`/subtopics/${subtopicId.value}/details`);
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Update Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (isUpdatingSubtopic.value = false));
};

//Gets a subtopic by ID and populates form data with the fetched details
const getSubtopicById = async (id: number) => {
  try {
    isGettingSubtopic.value = true;
    const subtopic: Subtopic = await subtopicStore.getSubtopicById(id);
    //populate the form with subtopic data
    formData.value.name = subtopic.name;
    formData.value.curriculumId = subtopic.topic?.subject?.level?.examBoard?.curriculumId ?? null;
    formData.value.examBoardId = subtopic.topic?.subject?.level?.examBoardId ?? null;
    formData.value.levelId = subtopic.topic?.subject?.levelId ?? null;
    formData.value.subjectId = subtopic.topic?.subjectId ?? null;
    formData.value.topicId = subtopic.topicId;

    // Load curriculums (and related exam boards, levels, subjects, topics)
    // so the dropdowns show the right options instead of staying blank.
    curriculumExamBoardLevelSubjectTopicSelectRef.value.getAllCurriculums(formData.value.levelId);
  } catch {
    toast.add({
      severity: "error",
      summary: "Fetch Failed",
      detail: "Failed to fetch subtopic details.",
      life: 10000,
    });
  } finally {
    isGettingSubtopic.value = false;
  }
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
