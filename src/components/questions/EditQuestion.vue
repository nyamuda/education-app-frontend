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
import type { Question } from "@/models/question";
import { QuestionHelper } from "@/helpers/questionHelper";
import { DeletionState } from "@/models/deletionState";
type QuestionSaveStatus = "idle" | "saving" | "publishing" | "autoSaving";

const questionStore = useQuestionStore();
const answerStore = useAnswerStore();
const toast = useToast();
const router = useRouter();
const question: Ref<Question | null> = ref(null);

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

  //get the question ID from the url
  try {
    const id = router.currentRoute.value.params["id"];
    if (!id) return;
    questionId.value = Number(id);

    getQuestionById(questionId.value);
  } catch {}
});

//check if the curriculums or subjects for the dropdowns are being loaded
const isLoadingSelectionData = ref(false);
const questionId: Ref<number | null> = ref(null);
const isLoadingQuestion = ref(false);
const deletingQuestion = ref(new DeletionState());
//whether the question is being published, auto saved etc
const saveStatus: Ref<QuestionSaveStatus> = ref("idle");
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
// Controls whether autosave is enabled
const isAutoSaveEnabled = ref(true);

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

//Retrieves a question with a given ID
const getQuestionById = (id: number) => {
  isLoadingQuestion.value = true;
  questionStore
    .getQuestionById(id)
    .then((data) => {
      isInitialLoad.value = true;
      question.value = data;
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

/**
 * Publishes the question by first saving any unsaved changes
 * and then updating its status to "Published".
 * This makes sure the latest version of the question is made public.
 */
const publishQuestion = async () => {
  try {
    if (!questionId.value) throw Error();
    //cancel a pending auto-save if there is one in progress
    debouncedSaveQuestionChanges.cancel();

    //change question save status
    saveStatus.value = "publishing";

    //save any changes that were made
    await saveQuestionChanges(false); //don't display the toast when the save is a success
    //then publish the question
    await questionStore.updateQuestionStatus(questionId.value, QuestionStatus.Published);

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
 * Saves updates to a question and its author answer (if present).
 * @param displayToastOnSave - Determines if a success toast should be shown. Default is true.
 */
const saveQuestionChanges = async (displayToastOnSave: boolean = true) => {
  try {
    // Validate the entire form
    const isValid = await v$.value.$validate();
    if (!isValid || !questionId.value) throw Error();

    //Prepare question data for submission to the the backend
    const submissionData = QuestionHelper.prepareQuestionSubmission(formData.value);

    saveStatus.value = "saving";

    //save changes
    await questionStore.updateQuestion(questionId.value, submissionData);

    //save the answer if it exists or was provided
    await submitAnswer();

    if (displayToastOnSave) {
      toast.add({
        severity: "success",
        summary: "Changes Saved",
        detail: "Your question has been updated successfully.",
        life: 5000,
      });
    }
    //changes have be successfully saved
    hasUnsavedChanges.value = false;
  } catch {
    toast.add({
      severity: "error",
      summary: "Save Failed",
      detail: "We couldn’t save your changes. Please try again.",
      life: 8000,
    });
  } finally {
    saveStatus.value = "idle";
    //cancel a pending auto-save if there is one in progress
    debouncedSaveQuestionChanges.cancel();
  }
};

/**
 * Submits an answer for the current question.
 *
 * This function handles both creating a new answer and updating an existing one.
 * - If the question does not have an existing authorAnswer, a new answer is created.
 * - If the question already has an authorAnswer, the existing answer is updated.
 *
 * Only submits if both `answerHtml` and `answerText` are provided in `formData`.
 */
const submitAnswer = async () => {
  if (!question.value) return; // No question loaded, nothing to submit

  const { answerHtml, answerText } = formData.value;

  // Only proceed if both answer fields are provided
  if (!answerHtml || !answerText) return;

  const payload: AnswerSubmission = {
    questionId: question.value.id,
    contentHtml: answerHtml,
    contentText: answerText,
  };

  try {
    // If there is no existing answer, create a new one
    if (!question.value.authorAnswer) {
      await answerStore.addAnswer(payload);
    }
    // If there is an existing answer, update it
    else {
      const answerId = question.value.authorAnswer.id;
      await answerStore.updateAnswer(answerId, payload);
    }
  } catch {
    toast.add({
      severity: "error",
      summary: "Answer Submission Failed",
      detail: "An unexpected error occurred while submitting the answer.",
      life: 10000,
    });
  }
};

// ================= Auto-Save Section =================
// This section handles automatic saving of question edits.
// Changes are saved after 10 seconds of inactivity to prevent data loss.
// It uses a debounced function and watches formData for changes.

// Debounced version of the saveQuestionChanges function
// This ensures that the function will only be called after 10 seconds of inactivity.
// If the user makes another change before 10 seconds pass, the timer is reset.
const debouncedSaveQuestionChanges = debounce(async () => {
  saveStatus.value = "autoSaving";
  //save any changes that were made
  await saveQuestionChanges(false); //don't display the toast when the save is a success
}, 10000);

// Flag to determine if the current change to the questionFormData object is the initial load.
// This is used to prevent triggering auto-save when the question is first loaded from the backend.
const isInitialLoad = ref(false);

/**
 * Toggles the auto-save feature on or off.
 *
 * - Persists the new setting in `localStorage` so it persists across sessions.
 * - If auto-save is turned off, cancels any pending debounced auto-save calls to prevent unwanted saves.
 */
const toggleAutoSave = () => {
  isAutoSaveEnabled.value = !isAutoSaveEnabled.value;
  //save setting to local storage
  localStorage.setItem(localStorageAutoSaveKey.value, JSON.stringify(isAutoSaveEnabled.value));
  //if autosave is disabled, cancel a pending auto-save if there is already one in progress
  if (!isAutoSaveEnabled.value) debouncedSaveQuestionChanges.cancel();
};

/**
 * Watches the question form data and saves it to localStorage whenever it changes.
 *
 * This helps prevent accidental data loss if the user navigates away or reloads the page
 * before submitting the question.
 */

// Watcher that observes any deep changes to the question formData object.
// Purpose:
// - To automatically save changes the user makes while editing a blog.
// - After any change is detected, the debounced submitBlog function is triggered.
// - This avoids excessive saves and only calls the save function after 10 seconds of inactivity.
watch(
  formData,
  () => {
    // Skip the first watcher trigger, which happens when the question is initially loaded
    // from the backend. We only want to auto-save user-initiated edits.
    if (isInitialLoad.value) {
      isInitialLoad.value = false;
      return;
    }

    //make sure there is no deletion in progress before saving any changes
    if (deletingQuestion.value.inProgress) return;

    //Don't auto save if form is invalid
    if (v$.value.$error) return;

    hasUnsavedChanges.value = true;

    // Trigger the debounced save function if the auto save is turned on
    // This ensures we wait for 10 seconds of no changes before saving
    if (isAutoSaveEnabled.value) debouncedSaveQuestionChanges();
  },
  { deep: true },
);
</script>

<style scoped lang="scss"></style>
