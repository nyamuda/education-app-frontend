<template>
  <div class="container">
    <TitleSection title="Tell the story behind your question" subtitle="New Question" />

    <div class="row mb-2">
      <p class="col-md-6">
        Let the world see what you’ve been working on. Add a title, description, image, and any
        links that showcase your question. You can save it as a draft or publish it when you’re
        ready.
      </p>
    </div>
    <!-- Buttons start-->
    <div class="d-flex flex-column gap-2 align-items-end mb-5">
      <div class="d-flex justify-content-end gap-3 align-items-center">
        <!-- Save button -->
        <Button
          size="small"
          @click="saveQuestionAsDraft"
          :label="saveStatus == 'savingDraft' ? 'Saving question...' : 'Save draft'"
          severity="contrast"
          :loading="saveStatus == 'savingDraft'"
          :disabled="
            saveStatus == 'savingDraft' ||
            saveStatus == 'publishing' ||
            isLoadingSelectionData ||
            v$.$errors.length > 0
          "
        />

        <!-- Publish button -->
        <Button
          size="small"
          @click="publishQuestion"
          :label="saveStatus == 'publishing' ? 'Publishing question...' : 'Publish'"
          severity="primary"
          :loading="saveStatus == 'publishing'"
          :disabled="
            saveStatus == 'savingDraft' ||
            saveStatus == 'publishing' ||
            isLoadingSelectionData ||
            v$.$errors.length > 0
          "
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
    <!--Buttons end-->

    <form>
      <!-- Curriculum, exam board, level, subject, topic and subtopic inputs -->
      <!-- `CrudContext` is set to `Update`because a user can edit the draft from localStorage -->
      <div class="form-group">
        <CurriculumExamBoardLevelSubjectTopicSelect
          :crud-context="CrudContext.Update"
          :default-curriculum-id="formData.curriculumId ?? undefined"
          :default-exam-board-id="formData.examBoardId ?? undefined"
          :default-level-id="formData.levelId ?? undefined"
          :default-subject-id="formData.subjectId ?? undefined"
          :default-topic-id="formData.topicId ?? undefined"
          :default-subtopic-id="formData.subtopicId ?? undefined"
          @change-curriculum="(val: Curriculum) => (formData.curriculumId = val?.id ?? null)"
          @change-exam-board="(val: ExamBoard) => (formData.examBoardId = val?.id ?? null)"
          @change-level="(val: Level) => (formData.levelId = val?.id ?? null)"
          @change-subject="(val: Subject) => (formData.subjectId = val?.id ?? null)"
          @change-topic="(val: Topic) => (formData.topicId = val?.id ?? null)"
          @change-subtopic="(val: Subtopic) => (formData.subtopicId = val?.id ?? null)"
          :is-required="true"
          :show-curriculum="true"
          :show-exam-board="true"
          :show-level="true"
          :show-subject="true"
          :show-topic="true"
          :show-subtopic="true"
          :is-topic-required="false"
          :is-subtopic-required="false"
          @is-loading-data="(val: boolean) => (isLoadingSelectionData = val)"
          ref="curriculumSelectRef"
          :container-classes="'row row-cols-md-3 gy-1'"
        />
      </div>

      <!-- Title input -->
      <div class="form-group mb-3">
        <FloatLabel variant="on">
          <InputText
            maxlength="150"
            fluid
            id="title"
            v-model="v$.title.$model"
            :invalid="v$.title.$error"
          />
          <label for="title">Question title</label>
        </FloatLabel>
        <Message size="small" severity="error" v-if="v$.title.$error" variant="simple">
          <div v-for="error of v$.title.$errors" :key="error.$uid">
            <div>{{ error.$message }}</div>
          </div>
        </Message>
        <Message v-else size="small" severity="secondary" variant="simple" :life="60000"
          >Think of the title as a headline: short and to the point (e.g., 'Newton’s 2nd Law,'
          'Ionic vs Covalent Bonds').</Message
        >
      </div>

      <!-- Question input -->
      <div class="form-group mb-3">
        <FloatLabel variant="on">
          <Textarea
            id="question"
            v-model="v$.questionText.$model"
            :invalid="v$.questionText.$error"
            rows="4"
            class="w-100"
            style="resize: none"
          />
          <label for="question">Question</label>
        </FloatLabel>
        <Message size="small" severity="error" v-if="v$.questionText.$error" variant="simple">
          <div v-for="error of v$.questionText.$errors" :key="error.$uid">
            <div>{{ error.$message }}</div>
          </div>
        </Message>
        <Message v-else size="small" severity="secondary" variant="simple" :life="30000"
          >Write your question in your own words. Avoid copying exam questions word-for-word (unless
          it’s a short factual/definition-type question). If it’s based on a past paper, make sure
          to paraphrase or reword it instead of copying exactly.</Message
        >
      </div>

      <!-- Tags and marks inputs -->
      <div class="row g-3 mb-3">
        <!-- Tags input -->
        <div class="col-md-8">
          <FloatLabel variant="on">
            <AutoComplete
              v-model="v$.tags.$model"
              :invalid="v$.tags.$error"
              inputId="addBlogTags"
              option-value="name"
              multiple
              fluid
              :typeahead="false"
            />
            <label for="addBlogTags">Tags</label>
          </FloatLabel>
          <Message size="small" severity="error" v-if="v$.tags.$error" variant="simple">
            <div v-for="error of v$.tags.$errors" :key="error.$uid">
              <div>{{ error.$message }}</div>
            </div>
          </Message>
        </div>
        <!-- Marks input -->
        <div class="form-group col-md-4">
          <FloatLabel variant="on">
            <InputNumber
              v-model="v$.marks.$model"
              inputId="marks"
              showButtons
              :min="1"
              :invalid="v$.marks.$error"
              :suffix="formData.marks == 1 ? ' mark' : ' marks'"
              fluid
            >
            </InputNumber>
            <label for="marks">Marks (Optional)</label>
          </FloatLabel>
          <Message size="small" severity="error" v-if="v$.marks.$error" variant="simple">
            <div v-for="error of v$.marks.$errors" :key="error.$uid">
              <div>{{ error.$message }}</div>
            </div>
          </Message>
          <Message v-else size="small" severity="secondary" variant="simple"
            >Fill in the marks if you know them. This is useful for revision and exam
            preparation.</Message
          >
        </div>
      </div>

      <!-- Answer input -->
      <div class="form-group mb-4">
        <ContentEditor
          label="Answer (Optional)"
          placeholder="Add answer"
          :helper-message="answerHelperMessage"
          @content-html="(val: string) => (formData.answerHtml = val)"
          @content-text="(val: string) => (formData.answerText = val)"
          ref="contentEditorRef"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from "vue";
import { useQuestionStore } from "@/stores/question";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { Message } from "primevue";
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";
import Button from "primevue/button";
import TitleSection from "../shared/TitleSection.vue";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";
import Textarea from "primevue/textarea";
import AutoComplete from "primevue/autocomplete";
import InputNumber from "primevue/inputnumber";
import CurriculumExamBoardLevelSubjectTopicSelect from "../shared/selects/multi-selects/CurriculumExamBoardLevelSubjectTopicSelect.vue";
import type { Curriculum } from "@/models/curriculum";
import type { ExamBoard } from "@/models/examBoard";
import type { Level } from "@/models/level";
import type { Subject } from "@/models/subject";
import type { Topic } from "@/models/topic";
import type { QuestionFormData } from "@/interfaces/questions/questionFormData";
import type { Subtopic } from "@/models/subtopic";

import { CrudContext } from "@/enums/crudContext";
import ContentEditor from "../shared/selects/ContentEditor.vue";
import { QuestionStatus } from "@/enums/questions/questionStatus";
import { QuestionHelper } from "@/helpers/questionHelper";

// Access the store
const questionStore = useQuestionStore();
const toast = useToast();
const router = useRouter();
type QuestionSaveStatus = "idle" | "savingDraft" | "publishing";

onMounted(() => {
  v$.value.$touch();

  // Load the saved question form data draft from localStorage (if it exists),
  const savedFormData = localStorage.getItem(localStorageKey);
  if (savedFormData) {
    formData.value = JSON.parse(savedFormData);

    //load the saved answer in content editor
    contentEditorRef.value?.loadDefaultContent(formData.value.answerHtml);
  }

  // Load curriculums (with exam boards, levels, subjects, topics and subtopics)
  // so the user can select from the dropdown.
  curriculumSelectRef.value.getAllCurriculums(formData.value.levelId);
});

//check if the curriculums or subjects for the dropdowns are being loaded
const isLoadingSelectionData = ref(false);
//whether the question is being published or saved as a draft
const saveStatus: Ref<QuestionSaveStatus> = ref("idle");
// Key used to store and retrieve the in-progress question draft from localStorage
const localStorageKey = "newQuestion";
const curriculumSelectRef = ref();
const invalidFormMessage = ref(
  "Some fields are missing or invalid. Please fix them to save or publish your question.",
);
const answerHelperMessage =
  "You can add an answer if you know it. This helps you quickly revise both the question and its solution later and also lets others see different ways of answering the same question.";

//ref for the rich text editor for the answer field
const contentEditorRef = ref();

//form validation start
const formData: Ref<QuestionFormData> = ref({
  title: null,
  questionText: null,
  answerHtml: null,
  answerText: null,
  curriculumId: null,
  examBoardId: null,
  levelId: null,
  subjectId: null,
  topicId: null,
  subtopicId: null,
  tags: [],
  marks: null,
});
const rules = {
  title: {
    required: helpers.withMessage(
      "Enter a short, clear title (e.g., Difference between acids and bases).",
      required,
    ),
  },
  answerHtml: {},
  answerText: {},
  questionText: {
    required: helpers.withMessage("Please enter a question (e.g., Define a vector).", required),
  },
  curriculumId: { required },
  examBoardId: { required },
  levelId: { required },
  subjectId: { required },
  topicId: {},
  subtopicId: {},
  marks: {},
  tags: {
    required: helpers.withMessage(
      "Include at least one tag so others can easily find your question.",
      required,
    ),
  },
};
const v$ = useVuelidate(rules, formData);
//form validation end

/**
 * Publishes a question by first creating it
 * and then updating its status to "Published".
 */
const publishQuestion = async () => {
  try {
    // Validate the entire form
    const isValid = await v$.value.$validate();
    if (!isValid) return;

    //Prepare question data for submission to the the backend
    const submissionData = QuestionHelper.prepareQuestionSubmission(formData.value);
    saveStatus.value = "publishing";
    //submit the new question to the backend
    const newlyCreatedQuestion = await questionStore.addQuestion(submissionData);
    //then change its status to published
    await questionStore.updateQuestionStatus(newlyCreatedQuestion.id, QuestionStatus.Published);

    // remove any question form data saved in local storage
    // since the question has been successfully saved to the database
    localStorage.removeItem(localStorageKey);
    router.push(`/questions/${newlyCreatedQuestion.id}/edit`);

    toast.add({
      severity: "success",
      summary: "Question Published",
      detail: "Your question has been published successfully.",
      life: 5000,
    });
  } catch {
    toast.add({
      severity: "error",
      summary: "Publish Failed",
      detail: "We couldn’t publish your question. Please try again.",
      life: 8000,
    });
  } finally {
    saveStatus.value = "idle";
  }
};

/**
 * Creates a new question as a draft (the default status)
 */
const saveQuestionAsDraft = async () => {
  try {
    // Validate the entire form
    const isValid = await v$.value.$validate();
    if (!isValid) return;
    //Prepare question data for submission to the the backend
    const submissionData = QuestionHelper.prepareQuestionSubmission(formData.value);
    saveStatus.value = "savingDraft";
    //submit the new question to the backend
    const newlyCreatedQuestion = await questionStore.addQuestion(submissionData);
    // remove any question form data saved in local storage
    // since the question has been successfully saved to the database
    localStorage.removeItem(localStorageKey);
    router.push(`/questions/${newlyCreatedQuestion.id}/edit`);

    toast.add({
      severity: "success",
      summary: "Draft Saved",
      detail: "Your question has been saved as a draft.",
      life: 5000,
    });
  } catch {
    toast.add({
      severity: "error",
      summary: "Question Submission Failed",
      detail: "We couldn’t submit your question. Please try again.",
      life: 8000,
    });
  } finally {
    saveStatus.value = "idle";
  }
};

/**
 * Watches the question form data and saves it to localStorage whenever it changes.
 *
 * This helps prevent accidental data loss if the user navigates away or reloads the page
 * before submitting the question.
 */
watch(
  formData,
  (newFormData) => {
    //first, remove the existing item
    localStorage.removeItem(localStorageKey);
    // //then add a new one
    const serialized = JSON.stringify(newFormData);
    localStorage.setItem(localStorageKey, serialized);
  },
  { deep: true },
);
</script>

<style scoped lang="scss"></style>
