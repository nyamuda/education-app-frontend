<template>
  <div class="">
    <form class="subject-form m-auto" @submit.prevent="submitForm">
      <TitleSection title="Edit subject" title-size="small" />

      <!-- Name input -->
      <div class="form-group mb-3">
        <FloatLabel variant="on">
          <InputText
            class="w-100"
            id="subjectName"
            v-model="v$.name.$model"
            :invalid="v$.name.$error"
            :disabled="isUpdatingSubject || isGettingSubject"
          />
          <label for="subjectName">Subject name</label>
        </FloatLabel>
        <Message size="small" severity="error" v-if="v$.name.$error" variant="simple">
          <div v-for="error of v$.name.$errors" :key="error.$uid">
            <div>{{ error.$message }}</div>
          </div>
        </Message>
      </div>
      <!-- Curriculum, exam board and level inputs -->
      <div class="form-group mb-3">
        <CurriculumExamBoardLevelSubjectTopicSelect
          :default-curriculum-id="formData.curriculumId ?? undefined"
          :default-exam-board-id="formData.examBoardId ?? undefined"
          :default-level-id="formData.levelId ?? undefined"
          @change-curriculum="(val: Curriculum) => (formData.curriculumId = val.id)"
          @change-exam-board="(val: ExamBoard) => (formData.examBoardId = val.id)"
          @change-level="(val: Level) => (formData.levelId = val.id)"
          :is-required="true"
          :show-subject="false"
          :show-topic="false"
          @is-loading-data="(val: boolean) => (isLoadingSelectionData = val)"
          :crud-context="CrudContext.Update"
          ref="curriculumSelectRef"
        />
      </div>
      <!-- Submit button -->
      <Button
        fluid
        type="submit"
        :label="
          isUpdatingSubject
            ? 'Saving changes...'
            : isGettingSubject
              ? 'Retrieving subject information…'
              : 'Update subject'
        "
        :loading="isUpdatingSubject"
        :disabled="
          v$.$errors.length > 0 || isUpdatingSubject || isLoadingSelectionData || isGettingSubject
        "
        size="small"
        severity="primary"
        :variant="isGettingSubject ? 'outlined' : ''"
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
import { useSubjectStore } from "@/stores/subject";
import type { Curriculum } from "@/models/curriculum";
import type { ExamBoard } from "@/models/examBoard";
import type { SubjectFormData } from "@/interfaces/subjects/subjectFormData";
import type { Level } from "@/models/level";
import type { Subject } from "@/models/subject";
import CurriculumExamBoardLevelSubjectTopicSelect from "../shared/selects/multi-selects/CurriculumExamBoardLevelSubjectTopicSelect.vue";
import { CrudContext } from "@/enums/crudContext";

onMounted(async () => {
  v$.value.$touch();

  const id = router.currentRoute.value.params["id"];

  if (!id) return;

  try {
    subjectId.value = Number(id);

    await getSubjectById(subjectId.value);
  } catch {}
});

// Access the store
const subjectStore = useSubjectStore();
const toast = useToast();
const router = useRouter();
const isUpdatingSubject = ref(false);
const isGettingSubject = ref(false);
const subjectId: Ref<number | null> = ref(null);
//check if the curriculums for the dropdowns are being loaded
const isLoadingSelectionData = ref(false);
const curriculumSelectRef = ref();
//form validation start
const formData: Ref<SubjectFormData> = ref({
  name: "",
  curriculumId: null,
  examBoardId: null,
  levelId: null,
});

const rules = {
  name: { required },
  curriculumId: { required },
  examBoardId: { required },
  levelId: { required },
};

const v$ = useVuelidate(rules, formData.value);
//form validation end

const submitForm = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) return;

  const { name, levelId } = formData.value;
  if (!levelId || !subjectId.value) return;

  isUpdatingSubject.value = true;
  subjectStore
    .updateSubject(subjectId.value, { name, levelId })
    .then(() => {
      toast.add({
        severity: "success",
        summary: "Update Successful",
        detail: "Changes to the subject have been saved.",
        life: 5000,
      });
      router.push(`/subjects/${subjectId.value}/details`);
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Update Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (isUpdatingSubject.value = false));
};

//Gets a subject by ID and populates form data with the fetched details
const getSubjectById = async (id: number) => {
  try {
    isGettingSubject.value = true;
    const subject: Subject = await subjectStore.getSubjectById(id);
    //populate the form with subject data
    formData.value.name = subject.name;
    formData.value.curriculumId = subject.level?.examBoard?.curriculumId ?? null;
    formData.value.examBoardId = subject.level?.examBoardId ?? null;
    formData.value.levelId = subject.levelId;

    // Load curriculums (and related exam boards, levels)
    // so the dropdowns auto-select and show the right options instead of staying blank.
    curriculumSelectRef.value.getAllCurriculums();
  } catch {
    toast.add({
      severity: "error",
      summary: "Fetch Failed",
      detail: "Failed to fetch subject details.",
      life: 10000,
    });
  } finally {
    isGettingSubject.value = false;
  }
};
</script>

<style lang="scss" scoped>
a {
  text-decoration: none;
}
@media (min-width: 768px) {
  .subject-form {
    max-width: 30rem;
  }
}
</style>
