<template>
  <div class="">
    <form class="level-form m-auto" @submit.prevent="submitForm">
      <TitleSection title="Update educational level" title-size="small" />

      <!-- Name input -->
      <div class="form-group mb-3">
        <FloatLabel variant="on">
          <InputText
            class="w-100"
            id="levelName"
            v-model="v$.name.$model"
            :invalid="v$.name.$error"
          />
          <label for="levelName">Level name</label>
        </FloatLabel>
        <Message size="small" severity="error" v-if="v$.name.$error" variant="simple">
          <div v-for="error of v$.name.$errors" :key="error.$uid">
            <div>{{ error.$message }}</div>
          </div>
        </Message>
      </div>
      <!-- Curriculum input -->
      <div class="form-group mb-3">
        <CurriculumExamBoardSelect
          :default-curriculum-id="formData.curriculumId ?? undefined"
          :default-exam-board-id="formData.examBoardId ?? undefined"
          @change-curriculum="(val: Curriculum) => (formData.curriculumId = val.id)"
          @change-exam-board="(val: ExamBoard) => (formData.examBoardId = val.id)"
          :is-required="true"
        />
      </div>
      <!-- Submit button -->
      <Button
        fluid
        type="submit"
        :label="isUpdatingLevel ? 'Saving changes...' : 'Update level'"
        :loading="isUpdatingLevel"
        :disabled="v$.$errors.length > 0 || isUpdatingLevel || isLoadingCurriculums"
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
import { useLevelStore } from "@/stores/level";
import type { LevelFormData } from "@/interfaces/levels/levelFormData";
import type { Level } from "@/models/level";
import CurriculumExamBoardSelect from "../shared/CurriculumExamBoardSelect.vue";
import type { Curriculum } from "@/models/curriculum";
import type { ExamBoard } from "@/models/examBoard";

onMounted(async () => {
  v$.value.$touch();
  //get the ID route parameter
  const id = router.currentRoute.value.params["id"];
  if (!id) return;
  levelId.value = Number(id);
  await getLevelById(levelId.value);
});

// Access the store
const levelStore = useLevelStore();
const toast = useToast();
const router = useRouter();
const isUpdatingLevel = ref(false);
//check if the curriculums for the select input are being loaded
const isLoadingCurriculums = ref(false);
// const selectedCurriculum: Ref<Curriculum | null> = ref(null);
// const examBoardSelectInputRef = ref();
const levelId: Ref<number | null> = ref(null);
const isGettingLevel = ref(false);
//form validation start
const formData: Ref<LevelFormData> = ref({
  name: "",
  curriculumId: null,
  examBoardId: null,
});

const rules = {
  name: { required },
  curriculumId: { required },
  examBoardId: { required },
};

const v$ = useVuelidate(rules, formData.value);
//form validation end

const submitForm = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) return;

  const { name, examBoardId } = formData.value;
  if (examBoardId == null) return;

  isUpdatingLevel.value = true;
  levelStore
    .addLevel({ name, examBoardId })
    .then((message) => {
      toast.add({
        severity: "success",
        summary: "Success",
        detail: message,
        life: 5000,
      });
      router.push("/levels");
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Adding Level Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (isUpdatingLevel.value = false));
};

//Called when the curriculum select input value changes
// const onCurriculumChange = (curriculum: Curriculum) => {
//   resetSelectedInputValues();
//   selectedCurriculum.value = curriculum;
//   formData.value.curriculumId = curriculum.id;
// };
//resets selected curriculum and exam board values
// const resetSelectedInputValues = () => {
//   selectedCurriculum.value = null;
//   formData.value.curriculumId = null;
//   formData.value.examBoardId = null;
//   //reset exam board select input component value
//   examBoardSelectInputRef.value.resetSelectedValue();
// };

//Gets a level by ID and populates form data with the fetched details
const getLevelById = async (id: number) => {
  try {
    isGettingLevel.value = true;
    const level: Level = await levelStore.getLevelById(id);
    //populate the form with level data
    formData.value.name = level.name;
    formData.value.curriculumId = level.examBoard?.curriculumId ?? null;
    formData.value.examBoardId = level.examBoardId;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Fetch Failed",
      detail: error,
      life: 10000,
    });
  } finally {
    isGettingLevel.value = false;
  }
};
</script>

<style lang="scss" scoped>
a {
  text-decoration: none;
}
@media (min-width: 768px) {
  .level-form {
    max-width: 30rem;
  }
}
</style>
