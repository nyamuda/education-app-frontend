<template>
  <div>
    <TitleSection title="Tell the story behind your question" subtitle="New Question" />

    <div class="row mb-2">
      <p class="col-md-6">
        Let the world see what you’ve been working on. Add a title, description, image, and any
        links that showcase your question. You can save it as a draft or publish it when you’re
        ready.
      </p>
    </div>
    <!-- Save button start-->
    <div class="d-flex flex-column gap-2 align-items-end mb-5">
      <!-- Save button -->
      <div class="d-flex justify-content-end gap-3 align-items-center">
        <Button
          size="small"
          @click="saveQuestionAsDraft"
          :label="isSavingQuestion ? 'Saving...' : 'Save draft'"
          severity="contrast"
          :loading="isSavingQuestion"
          :disabled="isSavingQuestion || v$.$errors.length > 0"
        />
      </div>
      <!-- Form error message -->
      <Message
        v-if="v$.$error"
        icon="pi pi-times-circle"
        severity="error"
        variant="simple"
        size="small"
        >{{ invalidFormMessage }}</Message
      >
    </div>
    <!-- Save button end-->
    <form class="">
      <!-- Title input -->
      <div class="form-group mb-3">
        <FloatLabel variant="on">
          <InputText fluid id="title" v-model="v$.title.$model" :invalid="v$.title.$error" />
          <label for="title">Title</label>
        </FloatLabel>
        <Message size="small" severity="error" v-if="v$.title.$error" variant="simple">
          <div v-for="error of v$.title.$errors" :key="error.$uid">
            <div>{{ error.$message }}</div>
          </div>
        </Message>
      </div>

      <!-- Question input -->
      <div class="form-group mb-3">
        <FloatLabel variant="on">
          <Textarea
            id="question"
            v-model="v$.question.$model"
            :invalid="v$.question.$error"
            rows="4"
            class="w-100"
            style="resize: none"
          />
          <label for="question">Question</label>
        </FloatLabel>
        <Message size="question" severity="error" v-if="v$.question.$error" variant="simple">
          <div v-for="error of v$.question.$errors" :key="error.$uid">
            <div>{{ error.$message }}</div>
          </div>
        </Message>
      </div>

      <!-- Answer input -->
      <div class="form-group mb-3">
        <FloatLabel variant="on">
          <Textarea
            id="answer"
            v-model="v$.answer.$model"
            :invalid="v$.answer.$error"
            rows="4"
            class="w-100"
            style="resize: none"
          />
          <label for="answer">Answer</label>
        </FloatLabel>
        <Message size="answer" severity="error" v-if="v$.answer.$error" variant="simple">
          <div v-for="error of v$.answer.$errors" :key="error.$uid">
            <div>{{ error.$message }}</div>
          </div>
        </Message>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from "vue";
//import { useQuestionStore } from "@/stores/question";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { Message } from "primevue";
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";
import Button from "primevue/button";
//import IconField from "primevue/iconfield";
//import InputIcon from "primevue/inputicon";
import TitleSection from "../shared/TitleSection.vue";
// import { useToast } from "primevue/usetoast";
// import { useRouter } from "vue-router";
import Textarea from "primevue/textarea";
//import AutoComplete from "primevue/autocomplete";
import { Question } from "@/models/question";
import { QuestionStatus } from "@/enums/questions/questionStatus";
import type { QuestionFormData } from "@/interfaces/questions/questionFormData";

// Access the store
// const questionStore = useQuestionStore();
// const toast = useToast();
// const router = useRouter();

onMounted(() => {
  v$.value.$touch();

  // Load the saved question draft from localStorage (if it exists),
  // or start with a new question instance
  const savedQuestion = localStorage.getItem(localStorageKey);
  question.value = savedQuestion ? (JSON.parse(savedQuestion) as Question) : new Question();
});

// The new question being created
const question: Ref<Question> = ref(new Question());
// Key used to store and retrieve the in-progress question draft from localStorage
const localStorageKey = "newQuestion";

const invalidFormMessage = ref(
  "Some fields are missing or invalid. Please fix them to save or publish your question.",
);

const isSavingQuestion = ref(false);

//form validation start
const formData: Ref<QuestionFormData> = ref({
  title: null,
  question: null,
  answer: null,
  curriculumId: null,
  examBoardId: null,
  levelId: null,
  subjectId: null,
  topicId: null,
  subtopicId: null,
  tags: [],
});
const rules = {
  title: { required },
  question: { required },
  answer: {},
  curriculumId: { required },
  examBoardId: { required },
  levelId: { required },
  subjectId: { required },
  topicId: {},
  subtopicId: {},
  tags: {
    required: helpers.withMessage("You need to include at least one tag", required),
  },
};
const v$ = useVuelidate(rules, formData);
//form validation end

//Change the question status to Draft if user has clicked the "Save" button
const saveQuestionAsDraft = async () => {
  isSavingQuestion.value = true;
  //change the status to Draft
  question.value.status = QuestionStatus.Draft;
  //then submit the question
  await submitQuestion();
};

const submitQuestion = async () => {
  // Validate the entire form (main fields + paragraph + challenge + achievement + feedback sections)
  const isValid = await v$.value.$validate();
  if (!isValid) return;
};

/**
 * Watches the question object and saves it to localStorage whenever it changes.
 *
 * This helps prevent accidental data loss if the user navigates away or reloads the page
 * before submitting the question.
 */
watch(
  question,
  (updatedQuestion) => {
    const serialized = JSON.stringify(updatedQuestion);
    localStorage.setItem(localStorageKey, serialized);
  },
  { deep: true },
);
</script>

<style scoped lang="scss">
@media (min-width: 768px) {
  .register-form {
    max-width: 30rem;
  }
}
</style>
