<template>
  <div class="container">
    <!-- Title and description start -->
    <TitleSection title="Update your question content" subtitle="Question Editor" />
    <div class="row mb-2">
      <div class="col-md-6">
        <p>
          Feel free to continue working on your question post. Changes will be saved automatically
          as you go. If the post is already published, any updates you make will be visible on your
          public question right away. You can also choose to save manually whenever needed.
        </p>
      </div>
    </div>
    <!-- Title and description end -->

    <!-- Loader -->
    <div v-if="isLoadingQuestion && displayLoadingSpinner" class="mb-5">
      <ProgressBar mode="indeterminate" style="height: 6px"></ProgressBar>
    </div>
    <!-- Buttons start-->
    <div v-else>
      <div v-if="!isPlaceholderQuestion" class="d-flex flex-column align-items-end mb-5 gap-3">
        <div class="d-flex justify-content-end gap-3 align-items-center flex-wrap">
          <!-- Form error message -->
          <Message
            v-if="v$.$error"
            icon="pi pi-times-circle"
            severity="error"
            variant="simple"
            size="small"
            >{{ invalidFormMessage }}</Message
          >
          <!-- Save changes button -->
          <Button
            v-else
            :icon="
              isPublishingQuestion || isSavingQuestion
                ? 'pi pi-spin pi-spinner-dotted'
                : !hasUnsavedChanges && !isInitialLoad
                  ? 'pi pi pi-check-circle'
                  : hasUnsavedChanges
                    ? 'pi pi-save'
                    : 'pi pi-pencil'
            "
            :label="
              isSavingQuestion
                ? 'Saving changes...'
                : isPublishingQuestion
                  ? 'Publishing question...'
                  : !hasUnsavedChanges && !isInitialLoad
                    ? 'Last saved ' + dayjs.utc(question.updatedAt).local().fromNow()
                    : hasUnsavedChanges
                      ? 'Save changes'
                      : 'No changes yet'
            "
            severity="contrast"
            @click="saveQuestion"
            size="small"
            :disabled="
              isPublishingQuestion ||
              isDeletingQuestion ||
              isSavingQuestion ||
              v$.$errors.length > 0 ||
              hasInvalidSubForms ||
              !hasUnsavedChanges
            "
            :variant="!hasUnsavedChanges && !isInitialLoad ? 'text' : ''"
          />

          <!-- Turn auto save on/off -->
          <div
            class="d-flex align-items-center gap-1 text-secondary"
            style="font-size: 0.9rem; margin-top: 0.2rem"
          >
            AutoSave
            <ToggleSwitch
              @value-change="onChangeAutoSave"
              :modelValue="isAutoSaveEnabled"
              :disabled="isPublishingQuestion || isSavingQuestion || isDeletingQuestion"
            >
            </ToggleSwitch>
          </div>
        </div>
        <div class="d-flex gap-3">
          <!-- Publish question button -->
          <Button
            v-if="question.status != QuestionStatus.Published"
            @click="publishQuestion"
            label="Publish question"
            size="small"
            :disabled="
              isPublishingQuestion ||
              isSavingQuestion ||
              v$.$errors.length > 0 ||
              hasInvalidSubForms ||
              isDeletingQuestion ||
              hasUnsavedChanges
            "
          />
          <!-- Delete question button -->
          <ConfirmDeleteButton
            title="Delete Question"
            buttonLabel="Delete question"
            message="Are you sure you want to delete this question?"
            :delete-callback="deleteQuestion"
            button-accept-label="Yes, delete it"
            :is-deleting="isDeletingQuestion"
            :isDisabled="isPublishingQuestion || isSavingQuestion"
          />
        </div>
      </div>
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
              inputId="addQuestionTags"
              option-value="name"
              multiple
              fluid
              :typeahead="false"
            />
            <label for="addQuestionTags">Tags</label>
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
import debounce from "lodash.debounce";
import { CrudContext } from "@/enums/crudContext";
import ContentEditor from "../shared/selects/ContentEditor.vue";
import type { QuestionSubmission } from "@/interfaces/questions/questionSubmission";
import { QuestionStatus } from "@/enums/questions/questionStatus";
import { useAnswerStore } from "@/stores/answer";
import type { AnswerSubmission } from "@/interfaces/answers/answerSubmission";
type QuestionSaveStatus = "idle" | "saving" | "publishing" | "autoSaving";

const questionStore = useQuestionStore();
const answerStore = useAnswerStore();
const toast = useToast();
const router = useRouter();
const question: Ref<Question | null> = ref();

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
const localStorageAutoSaveKey = ref("isQuestionAutoSaveEnabled");
const curriculumSelectRef = ref();
const invalidFormMessage = ref(
  "Some fields are missing or invalid. Please fix them to save or publish your question.",
);
const answerHelperMessage =
  "You can add an answer if you know it. This helps you quickly revise both the question and its solution later and also lets others see different ways of answering the same question.";

//ref for the rich text editor
const contentEditorRef = ref();

// Tracks whether the user has made any changes to the question since the last save.
// This is used to enable or disable the "Save Changes" button and prevent unnecessary saves.
const hasUnsavedChanges = ref(false);

// Tracks whether the question was saved automatically (via auto-save) or manually by the user.
// This is used to decide whether a toast notification should be shown.
// If the question was saved automatically, no toast is displayed.
const isAutoSaved = ref(true);
// Controls whether autosave is enabled
const isAutoSaveEnabled = ref(true);

// Toggle autosave setting and persist it in localStorage
const onChangeAutoSave = () => {
  isAutoSaveEnabled.value = !isAutoSaveEnabled.value;
  //save setting to local storage
  localStorage.setItem(localStorageAutoSaveKey.value, JSON.stringify(isAutoSaveEnabled.value));
  //if autosave is disabled, cancel a pending auto-save if there is already one in progress
  if (!isAutoSaveEnabled.value) {
    debouncedSubmitQuestion.cancel();
  }
};

// Debounced version of the submitQuestion function
// This ensures that the function will only be called after 10 seconds of inactivity.
// If the user makes another change before 10 seconds pass, the timer is reset.
const debouncedSubmitQuestion = debounce(async () => {
  //Don't auto save if form is invalid
  if (v$.value.$error) return;

  saveStatus.value = "autoSaving";
  await submitQuestion();
}, 10000);

// Flag to determine if the current change to the questionFormData object is the initial load.
// This is used to prevent triggering auto-save when the question is first loaded from the backend.
const isInitialLoad = ref(false);

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

//Fetch a question with a given ID
const getQuestionById = (id: number) => {
  isLoadingQuestion.value = true;
  questionStore
    .getQuestionById(id)
    .then((data) => {
      isInitialLoad.value = true;
      question.value = data;
      //initialize the content paragraphs
      paragraphListEditorRef.value?.initializeParagraphs(data.content);
    })
    .catch((message) => {
      // Show error toast if the question fetching fails
      toast.add({
        severity: "error",
        summary: "Failed to Fetch Question Details",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (isLoadingQuestion.value = false));
};

const publishQuestion = () => {
  saveStatus.value = "publishing";

  submitQuestion(QuestionStatus.Published);
};

//Submit question
const submitQuestion = async (status: QuestionStatus | null = null) => {
  const submissionData = await prepareQuestionSubmission(status);
  if (!submissionData) return;

  questionStore
    .addQuestion(submissionData)
    .then(() => {
      const message =
        saveStatus.value == "publishing"
          ? "Your question has been published successfully."
          : "Your question has been saved as a draft.";
      const summary = saveStatus.value == "publishing" ? "Question Published" : "Draft Saved";

      toast.add({
        severity: "success",
        summary: summary,
        detail: message,
        life: 5000,
      });
      // remove any question form data saved in local storage
      // since the question has been successfully saved to the database
      localStorage.removeItem(localStorageKey);
      router.push("/");
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Question Submission Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => {
      saveStatus.value = "idle";
    });
};

//Update an answer if it exists
const submitAnswer = () => {
  if (
    question.value &&
    !question.value?.authorAnswer &&
    formData.value.answerHtml &&
    formData.value.answerText
  ) {
    const payload: AnswerSubmission = {
      questionId: question.value.id,
      contentHtml: formData.value.answerHtml,
      contentText: formData.value.answerText,
    };

    answerStore
      .addAnswer(payload)
      .then()
      .catch((message) => {
        toast.add({
          severity: "error",
          summary: "Answer Submission Failed",
          detail: message,
          life: 10000,
        });
      });

    return;
  }
  if (
    question.value &&
    question.value?.authorAnswer &&
    formData.value.answerHtml &&
    formData.value.answerText
  ) {

  }
};

/**
 * Prepares and returns the question submission data after validating the form.
 *
 * @returns The prepared question data, or null if validation fails.
 */
const prepareQuestionSubmission = async (
  status: QuestionStatus | null,
): Promise<QuestionSubmission | null> => {
  // Validate the entire form
  const isValid = await v$.value.$validate();
  if (!isValid) return null;

  const {
    title,
    questionText,
    answerText,
    answerHtml,
    marks,
    subjectId,
    topicId,
    subtopicId,
    tags,
  } = formData.value;

  // Build the QuestionSubmission object
  const submissionData: QuestionSubmission = {
    title,
    questionText,
    answerHtml,
    answerText,
    marks,
    subjectId,
    topicId,
    subtopicId,
    tags,
    status: status ? status : question.value.status,
  };

  return submissionData;
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
