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
          :disabled="isSavingQuestion || v$.$errors.length > 0 || hasInvalidSubForms"
        />
      </div>
      <!-- Form error message -->
      <Message
        v-if="hasInvalidSubForms || v$.$error"
        icon="pi pi-times-circle"
        severity="error"
        variant="simple"
        size="small"
        >{{ invalidFormMessage }}</Message
      >
    </div>
    <!-- Save button end-->
    <form class="">
      <!-- Question main details start -->
      <Panel class="mb-3" toggleable>
        <template #header>
          <div class="d-flex justify-content-start align-items-center gap-1 fw-bold text-secondary">
            <i class="pi pi-tags mt-1" style="font-size: 1.2rem"></i>
            <span class="fs-4">About This Post</span>
          </div>
        </template>
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
        <!-- Topic input -->
        <div class="form-group mb-3">
          <FloatLabel variant="on">
            <InputText fluid id="topic" v-model="v$.topic.$model" :invalid="v$.topic.$error" />
            <label for="topic">Topic</label>
          </FloatLabel>
          <Message size="small" severity="error" v-if="v$.topic.$error" variant="simple">
            <div v-for="error of v$.topic.$errors" :key="error.$uid">
              <div>{{ error.$message }}</div>
            </div>
          </Message>
        </div>

        <!-- Summary input -->
        <div class="form-group mb-3">
          <FloatLabel variant="on">
            <Textarea
              id="summary"
              v-model="v$.summary.$model"
              :invalid="v$.summary.$error"
              rows="4"
              class="w-100"
              style="resize: none"
            />
            <label for="summary">Summary</label>
          </FloatLabel>
          <Message size="summary" severity="error" v-if="v$.summary.$error" variant="simple">
            <div v-for="error of v$.summary.$errors" :key="error.$uid">
              <div>{{ error.$message }}</div>
            </div>
          </Message>
        </div>

        <!-- Image URL -->
        <div class="form-group mb-3">
          <FloatLabel variant="on">
            <IconField>
              <InputIcon class="pi pi-image" />
              <InputText
                fluid
                id="imageUrl"
                v-model="v$.imageUrl.$model"
                :invalid="v$.imageUrl.$error"
                type="url"
              />
            </IconField>
            <label for="imageUrl">Image URL</label>
          </FloatLabel>
          <Message size="small" severity="error" v-if="v$.imageUrl.$error" variant="simple">
            <div v-for="error of v$.imageUrl.$errors" :key="error.$uid">
              <div>{{ error.$message }}</div>
            </div>
          </Message>
        </div>

        <!-- Tags input -->
        <div>
          <FloatLabel variant="on">
            <AutoComplete
              v-model="v$.tags.$model"
              :invalid="v$.tags.$error"
              inputId="addQuestionTags"
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
      </Panel>
      <!-- Question main details end -->
      <!-- Question content paragraphs start  -->
      <Panel id="add-question-paragraphs" class="mb-3" toggleable :collapsed="false">
        <template #header>
          <div class="d-flex justify-content-start align-items-center gap-1 fw-bold text-secondary">
            <i class="pi pi-file-edit mt-1" style="font-size: 1.2rem"></i>
            <span class="fs-4">Question Content</span>
          </div>
        </template>
        <p class="mb-3">
          Write the detailed content of your question here. Use multiple paragraphs to explain
          concepts, tell your story, and provide meaningful value to your readers.
        </p>

        <ParagraphList
          :paragraphType="ParagraphType.QuestionSection"
          @paragraphs="(paragraphs) => (question.content = paragraphs)"
          @has-invalid-paragraphs="(isInvalid) => (hasInvalidContentForms = isInvalid)"
          :crudContext="CrudContext.Create"
          :fallback-container-id="'add-question-paragraphs'"
        />
      </Panel>
      <!-- Question content paragraphs end  -->
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, type Ref } from "vue";
import { useQuestionStore } from "@/stores/question";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers, url } from "@vuelidate/validators";
import { Message } from "primevue";
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";
import Button from "primevue/button";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import TitleSection from "../shared/TitleSection.vue";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";
import Panel from "primevue/panel";
import Textarea from "primevue/textarea";
import AutoComplete from "primevue/autocomplete";
import { Question } from "@/models/question";
import ParagraphList from "../paragraphs/ParagraphListEditor.vue";
import { QuestionStatus } from "@/enums/questions/questionStatus";
import { ParagraphType } from "@/enums/paragraphType";
import { CrudContext } from "@/enums/crudContext";
import { QuestionHelper } from "@/helpers/questionHelper";

// Access the store
const questionStore = useQuestionStore();
const toast = useToast();
const router = useRouter();

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
// Track whether any content paragraph form is invalid
const hasInvalidContentForms: Ref<boolean> = ref(false);

// Check whether any of the question’s sub-sections (e.g. background, challenges,
// achievements, or feedback) contain invalid forms. Returns true if at least one
// sub-form is invalid
const hasInvalidSubForms = computed(() => hasInvalidContentForms.value);
// Check the validity of the entire form
const isEntireFormInvalid = async (): Promise<boolean> => {
  // Validate the main form fields
  const areMainFieldsValid = await v$.value.$validate();
  // Return true if any section (main or sub-forms) is invalid
  return !areMainFieldsValid || hasInvalidSubForms.value;
};

const isSavingQuestion = ref(false);

//form validation start
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
const v$ = useVuelidate(rules, question);
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
  const isInvalid = await isEntireFormInvalid();

  // Only proceed if form is valid
  if (!isInvalid) {
    //sanitize the question to be submitted
    const sanitizedQuestion = QuestionHelper.prepareQuestionForSubmission(question.value);
    //save the question
    questionStore
      .addNewQuestion(sanitizedQuestion)
      .then(({ id }) => {
        // Show success toast notification
        toast.add({
          severity: "success",
          summary: "Question Saved as Draft",
          detail: "You can continue editing and publish it when you're ready.",
          life: 1000,
        });

        //remove the saved question draft from localStorage (if it exists)
        //since the user has successfully submitted the question
        localStorage.removeItem(localStorageKey);

        router.push(`/questions/${id}/edit`);
      })
      .catch(() => {
        // Show error toast notification

        toast.add({
          severity: "error",
          summary: "Failed to Save Draft",
          detail: "We couldn’t save your draft. Make sure you're connected and try again.",
          life: 10000,
        });
      })
      .finally(() => {
        isSavingQuestion.value = false;
      });
  }
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
