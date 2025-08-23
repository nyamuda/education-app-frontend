<template>
  <div class="">
    <form class="topic-form m-auto" @submit.prevent="submitForm">
      <TitleSection title="Upload topics" title-size="small" />

      <!-- Curriculum, exam board and level inputs -->
      <div class="form-group mb-3">
        <CurriculumDownToSubjectSelect
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
          ref="curriculumDownToSubjectSelectRef"
        />
      </div>
      <!--JSON file upload section-->
      <div class="d-flex flex-column align-items-start gap-1 mb-3">
        <p style="font-size: 0.9rem" class="fst-italic text-muted mb-0">Max file size is 5MB</p>
        <FileUpload
          mode="basic"
          @select="onFileSelect"
          accept=".json,application/json"
          customUpload
          choose-icon="pi pi-file"
          choose-label="Select JSON file"
          class="p-button-outlined p-button-contrast"
          :maxFileSize="maxFileSize"
        />
        <Message size="small" severity="error" v-if="v$.file.$error" variant="simple">
          <div v-for="error of v$.file.$errors" :key="error.$uid">
            <div>{{ error.$message }}</div>
          </div>
        </Message>
      </div>
      <!-- Submit button -->
      <Button
        fluid
        type="submit"
        :label="isAddingTopics ? 'Uploading...' : 'Add topics'"
        :loading="isAddingTopics"
        :disabled="v$.$errors.length > 0 || isAddingTopics || isLoadingCurriculums"
        size="small"
        severity="primary"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from "vue";
import Button from "primevue/button";
import { Message } from "primevue";
//Vuelidate for login form validation
import { useVuelidate } from "@vuelidate/core";
import { helpers, required } from "@vuelidate/validators";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";
import TitleSection from "../shared/TitleSection.vue";
import { useTopicStore } from "@/stores/topic";
import type { Curriculum } from "@/models/curriculum";
import type { ExamBoard } from "@/models/examBoard";
import type { Level } from "@/models/level";
import CurriculumDownToSubjectSelect from "../shared/selects/multi-selects/CurriculumDownToSubjectSelect.vue";
import type { Subject } from "@/models/subject";
import FileUpload, { type FileUploadSelectEvent } from "primevue/fileupload";
import type { TopicUploadFormData } from "@/interfaces/topics/topicUploadFormData";

onMounted(() => {
  v$.value.$touch();
  //fetch curriculums for the curriculum and exam board select inputs
  curriculumDownToSubjectSelectRef.value.getAllCurriculums();
});

// Access the store
const topicStore = useTopicStore();
const toast = useToast();
const router = useRouter();
const isAddingTopics = ref(false);
//check if the curriculums for the select input are being loaded
const isLoadingCurriculums = ref(false);
const maxFileSize = ref(5 * 1024 * 1024);
const curriculumDownToSubjectSelectRef = ref();
//form validation start
const formData: Ref<TopicUploadFormData> = ref({
  curriculumId: null,
  examBoardId: null,
  levelId: null,
  subjectId: null,
  file: null,
});

const rules = {
  curriculumId: { required },
  examBoardId: { required },
  levelId: { required },
  subjectId: { required },
  file: { required: helpers.withMessage("Please select a JSON file to upload.", required) },
};

const v$ = useVuelidate(rules, formData.value);
//form validation end

const submitForm = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) return;

  const { subjectId, file } = formData.value;
  if (subjectId == null || file == null) return;

  // Build FormData payload to send the file to the API.
  const uploadData = new FormData();
  uploadData.append("File", file);

  isAddingTopics.value = true;
  topicStore
    .uploadTopics(subjectId, uploadData)
    .then(() => {
      toast.add({
        severity: "success",
        summary: "Topics added",
        detail: "The topics have been successfully added to the subject.",
        life: 5000,
      });
      router.push("/topics");
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Adding Topics Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (isAddingTopics.value = false));
};

/**
 * Handles the file selection event from the FileUpload component.
 * Stores the first selected file in the formData object for later submission.
 *
 * @param event - The FileUploadSelectEvent emitted by the FileUpload component.
 */
const onFileSelect = (event: FileUploadSelectEvent) => {
  const file = event.files[0];
  if (!file) return;

  formData.value.file = file; // Store the actual file,
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
