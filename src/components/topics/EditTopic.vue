<template>
  <div class="">
    <form class="topic-form m-auto" @submit.prevent="submitForm">
      <TitleSection title="Edit topic" title-size="small" />

      <!-- Name input -->
      <div class="form-group mb-3">
        <FloatLabel variant="on">
          <InputText
            class="w-100"
            id="topicName"
            v-model="v$.name.$model"
            :invalid="v$.name.$error"
            :disabled="isUpdatingTopic || isGettingTopic"
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
        :label="
          isUpdatingTopic
            ? 'Saving changes...'
            : isGettingTopic
              ? 'Retrieving topic information…'
              : 'Update topic'
        "
        :loading="isUpdatingTopic"
        :disabled="
          v$.$errors.length > 0 || isUpdatingTopic || isLoadingCurriculums || isGettingTopic
        "
        size="small"
        severity="primary"
        :variant="isGettingTopic ? 'outlined' : ''"
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
import CurriculumExamBoardLevelSubjectSelect from "../shared/selects/multi-selects/CurriculumExamBoardLevelSubjectSelect.vue";
import type { Topic } from "@/models/topic";

onMounted(async () => {
  v$.value.$touch();

  const id = router.currentRoute.value.params["id"];

  if (!id) return;

  try {
    topicId.value = Number(id);

    await getTopicById(topicId.value);
  } catch {}
});

// Access the store
const topicStore = useTopicStore();
const toast = useToast();
const router = useRouter();
const isUpdatingTopic = ref(false);
const isGettingTopic = ref(false);
const topicId: Ref<number | null> = ref(null);
//check if the curriculums for the select input are being loaded
const isLoadingCurriculums = ref(false);
const curriculumExamBoardLevelSubjectSelectRef = ref();
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
  //validate the form
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) return;

  //get the updated name and subject ID
  const { name, subjectId } = formData.value;
  if (subjectId == null || topicId.value == null) return;

  //update topic
  isUpdatingTopic.value = true;
  topicStore
    .updateTopic(topicId.value, { name, subjectId })
    .then(() => {
      toast.add({
        severity: "success",
        summary: "Update Successful",
        detail: "Changes to the topic have been saved.",
        life: 5000,
      });
      router.push(`/topics/${topicId.value}/details`);
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Update Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (isUpdatingTopic.value = false));
};

//Gets a topic by ID and populates form data with the fetched details
const getTopicById = async (id: number) => {
  try {
    isGettingTopic.value = true;
    const topic: Topic = await topicStore.getTopicById(id);
    //populate the form with topic data
    formData.value.name = topic.name;
    formData.value.curriculumId = topic.subject?.level?.examBoard?.curriculumId ?? null;
    formData.value.examBoardId = topic.subject?.level?.examBoardId ?? null;
    formData.value.levelId = topic.subject?.levelId ?? null;
    formData.value.subjectId = topic.subjectId;

    // fetch curriculums for the curriculum select input and its dependant select inputs (e.g exam board, level)
    // this makes sure the correct options show up in the select inputs instead of staying empty.
    curriculumExamBoardLevelSubjectSelectRef.value.getAllCurriculums();
  } catch {
    toast.add({
      severity: "error",
      summary: "Fetch Failed",
      detail: "Failed to fetch topic details.",
      life: 10000,
    });
  } finally {
    isGettingTopic.value = false;
  }
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
