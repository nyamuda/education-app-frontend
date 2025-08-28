<template>
  <div class="">
    <!-- Curriculum select -->
    <div class="mb-3" v-if="showCurriculum">
      <Select
        id="curriculumSelectInput"
        :placeholder="isGettingCurriculums ? 'Loading curriculums...' : 'Curriculum'"
        checkmark
        :options="curriculums"
        option-label="name"
        option-value="id"
        v-model="v$.curriculumId.$model"
        :invalid="v$.curriculumId.$error"
        class="w-100"
        :loading="isGettingCurriculums"
        :disabled="isGettingCurriculums"
        @change="onCurriculumSelect"
        :size="size"
        :show-clear="showClear"
      />
      <!-- Validation errors -->
      <Message size="small" severity="error" v-if="v$.curriculumId.$error" variant="simple">
        <div v-for="error of v$.curriculumId.$errors" :key="error.$uid">
          <div>{{ error.$message }}</div>
        </div>
      </Message>
    </div>
    <!-- Exam board select -->
    <div class="mb-3" v-if="showExamBoard">
      <Select
        id="examBoardSelectInput"
        :placeholder="isGettingCurriculums ? 'Loading exam boards...' : 'Exam board'"
        checkmark
        :options="selectedCurriculum?.examBoards"
        option-label="name"
        option-value="id"
        v-model="v$.examBoardId.$model"
        :invalid="v$.examBoardId.$error"
        class="w-100"
        :loading="isGettingCurriculums"
        :disabled="isGettingCurriculums"
        @change="onExamBoardSelect"
        :size="size"
        :show-clear="showClear"
      />
      <!-- Validation errors -->
      <Message size="small" severity="error" v-if="v$.examBoardId.$error" variant="simple">
        <div v-for="error of v$.examBoardId.$errors" :key="error.$uid">
          <div>{{ error.$message }}</div>
        </div>
      </Message>
    </div>
    <!-- Level select -->
    <div class="mb-3" v-if="showLevel">
      <Select
        id="levelSelectInput"
        :placeholder="isGettingCurriculums ? 'Loading levels...' : 'Level'"
        checkmark
        :options="selectedExamBoard?.levels"
        option-label="name"
        option-value="id"
        v-model="v$.levelId.$model"
        :invalid="v$.levelId.$error"
        class="w-100"
        :loading="isGettingCurriculums"
        :disabled="isGettingCurriculums"
        @change="onLevelSelect"
        :size="size"
        :show-clear="showClear"
      />
      <!-- Validation errors -->
      <Message size="small" severity="error" v-if="v$.levelId.$error" variant="simple">
        <div v-for="error of v$.levelId.$errors" :key="error.$uid">
          <div>{{ error.$message }}</div>
        </div>
      </Message>
    </div>
    <!-- Subject select -->
    <div class="mb-3" v-if="showSubject">
      <Select
        id="subjectSelectInput"
        :placeholder="isGettingCurriculums || isGettingSubjects ? 'Loading subjects...' : 'Subject'"
        checkmark
        :options="selectedLevel?.subjects"
        option-label="name"
        option-value="id"
        v-model="v$.subjectId.$model"
        :invalid="v$.subjectId.$error && !isGettingSubjects"
        class="w-100"
        :loading="isGettingCurriculums || isGettingSubjects"
        :disabled="isGettingCurriculums || isGettingSubjects"
        @change="onSubjectSelect"
        :size="size"
        :show-clear="showClear"
      />
      <!-- Validation errors -->
      <Message
        size="small"
        severity="error"
        v-if="v$.subjectId.$error && !isGettingSubjects"
        variant="simple"
      >
        <div v-for="error of v$.subjectId.$errors" :key="error.$uid">
          <div>{{ error.$message }}</div>
        </div>
      </Message>
    </div>

    <!-- Topic select -->
    <div class="mb-3" v-if="showTopic">
      <Select
        id="topicSelectInput"
        :placeholder="isGettingCurriculums ? 'Loading topics...' : 'Topic'"
        checkmark
        :options="selectedSubject?.topics"
        option-label="name"
        option-value="id"
        v-model="v$.topicId.$model"
        :invalid="v$.topicId.$error"
        class="w-100"
        :loading="isGettingCurriculums"
        :disabled="isGettingCurriculums"
        @change="onTopicSelect"
        :size="size"
        :show-clear="showClear"
      />
      <!-- Validation errors -->
      <Message size="small" severity="error" v-if="v$.topicId.$error" variant="simple">
        <div v-for="error of v$.topicId.$errors" :key="error.$uid">
          <div>{{ error.$message }}</div>
        </div>
      </Message>
    </div>
  </div>
  --- {{ selectedSubject }}
</template>

<script setup lang="ts">
/**
 * Multi-step select component:
 *  Curriculum → Exam Board → Educational Level → Subject → Topic
 *
 * Each select filters the next one.
 * Example:
 *   - Choosing a curriculum sets exam boards tied to that curriculum
 *   - Choosing an exam board sets levels tied to that exam board
 *   - Choosing a level sets subjects tied to that level
 *   - Choosing a subject sets topics tied to that subject
 *
 * Emits change events so the parent component can react.
 */

import Select, { type SelectChangeEvent } from "primevue/select";
import { Curriculum } from "@/models/curriculum";
import { useCurriculumStore } from "@/stores/curriculum";
//import FloatLabel from "primevue/floatlabel";
import { computed, onMounted, ref, type Ref } from "vue";
import { useToast } from "primevue";
import { helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { Message } from "primevue";
import type { ExamBoard } from "@/models/examBoard";
import type { Level } from "@/models/level";
import type { Subject } from "@/models/subject";
import { useSubjectStore } from "@/stores/subject";
import type { SubjectQueryParams } from "@/interfaces/subjects/subjectQueryParams";
import { SubjectSortOption } from "@/enums/subjects/subjectSortOption";

const props = defineProps({
  //size of the input
  size: {
    type: String,
    default: "normal",
  },
  //whether or not to show a clear icon that resets the select input
  showClear: {
    type: Boolean,
    default: true,
  },

  //whether the input values are required or not
  //controls whether to show error messages or not
  isRequired: {
    type: Boolean,
    default: false,
  },
  // Default pre-selected IDs (useful when editing forms)
  defaultCurriculumId: { type: Number, default: null },
  defaultExamBoardId: { type: Number, default: null },
  defaultLevelId: { type: Number, default: null },
  defaultSubjectId: { type: Number, default: null },
  defaultTopicId: { type: Number, default: null },

  // Props to control which select inputs should be visible
  showCurriculum: {
    type: Boolean,
    default: true,
  },
  showExamBoard: {
    type: Boolean,
    default: true,
  },
  showLevel: {
    type: Boolean,
    default: true,
  },
  showSubject: {
    type: Boolean,
    default: true,
  },
  showTopic: {
    type: Boolean,
    default: true,
  },
});

// Events emitted to parent
const emit = defineEmits([
  "isLoading", // tells parent when loading state changes
  "isLoadingSubjects",
  "changeCurriculum",
  "changeExamBoard",
  "changeLevel",
  "changeSubject",
  "changeTopic",
]);

onMounted(() => {
  v$.value.$touch();
});

const toast = useToast();
const subjectStore = useSubjectStore();
const curriculums: Ref<Curriculum[]> = ref([]);
const selectedCurriculum: Ref<Curriculum | null> = ref(null);
const selectedExamBoard: Ref<ExamBoard | null> = ref(null);
const selectedLevel: Ref<Level | null> = ref(null);
const selectedSubject: Ref<Subject | null> = ref(null);
const curriculumStore = useCurriculumStore();
const isGettingCurriculums = ref(false);
const isGettingSubjects = ref(false);

//select inputs validation start
const formData: Ref<{
  curriculumId: number | null;
  examBoardId: number | null;
  levelId: number | null;
  subjectId: number | null;
  topicId: number | null;
}> = ref({
  curriculumId: null,
  examBoardId: null,
  levelId: null,
  subjectId: null,
  topicId: null,
});

const rules = computed(() => {
  if (isGettingCurriculums.value || !props.isRequired)
    return { curriculumId: {}, examBoardId: {}, levelId: {}, subjectId: {}, topicId: {} };
  return {
    curriculumId: { required: helpers.withMessage("Select curriculum", required) },
    examBoardId: { required: helpers.withMessage("Select exam board", required) },
    levelId: { required: helpers.withMessage("Select level", required) },
    subjectId: { required: helpers.withMessage("Select subject", required) },
    topicId: { required: helpers.withMessage("Select topic", required) },
  };
});

const v$ = useVuelidate(rules, formData);
//select inputs validation end

// When a curriculum is selected, reset dependent values
const onCurriculumSelect = async (event: SelectChangeEvent) => {
  const curriculum = curriculums.value.find((c) => c.id === event.value) ?? null;
  selectedCurriculum.value = curriculum;
  resetExamBoardLevelSubjectTopicSelectedValues();
  emit("changeCurriculum", curriculum);
};

// When an exam board is selected, reset dependent values
const onExamBoardSelect = async (event: SelectChangeEvent) => {
  const examBoard = selectedCurriculum.value?.examBoards.find((e) => e.id === event.value) ?? null;
  selectedExamBoard.value = examBoard;
  resetLevelSubjectTopicSelectedValues();
  // emit selected exam board
  emit("changeExamBoard", examBoard);
};
// When a level is selected, reset dependent values and fetch subjects for that level
const onLevelSelect = async (event: SelectChangeEvent) => {
  const level = selectedExamBoard.value?.levels?.find((l) => l.id === event.value) ?? null;
  selectedLevel.value = level;
  resetSubjectTopicSelectedValues();
  emit("changeLevel", level);

  if (!level) return;
  getSubjectsForLevel(level.id);
};

// When a subject is selected, reset topic
const onSubjectSelect = async (event: SelectChangeEvent) => {
  const subject = selectedLevel.value?.subjects?.find((s) => s.id === event.value) ?? null;
  selectedSubject.value = subject;
  resetTopicSelectedValues();
  emit("changeSubject", subject);
};
// When a topic is selected
const onTopicSelect = async (event: SelectChangeEvent) => {
  const topic = selectedSubject.value?.topics?.find((t) => t.id === event.value) ?? null;
  emit("changeTopic", topic);
};

//Resets all selections
const resetAllSelectedValues = () => {
  selectedCurriculum.value = null;
  selectedExamBoard.value = null;
  selectedLevel.value = null;
  selectedSubject.value = null;
  formData.value.curriculumId = null;
  formData.value.examBoardId = null;
  formData.value.levelId = null;
  formData.value.subjectId = null;
  formData.value.topicId = null;
};

//Resets exam board, level, subject, and topic => when a curriculum is changed
const resetExamBoardLevelSubjectTopicSelectedValues = () => {
  selectedExamBoard.value = null;
  selectedLevel.value = null;
  selectedSubject.value = null;
  formData.value.examBoardId = null;
  formData.value.levelId = null;
  formData.value.subjectId = null;
  formData.value.topicId = null;
};

//Resets level, subject, and topic => when an exam board is changed
const resetLevelSubjectTopicSelectedValues = () => {
  selectedLevel.value = null;
  selectedSubject.value = null;
  formData.value.levelId = null;
  formData.value.subjectId = null;
  formData.value.topicId = null;
};
//Resets subject and topic => when a level is changed
const resetSubjectTopicSelectedValues = () => {
  selectedSubject.value = null;
  formData.value.subjectId = null;
  formData.value.topicId = null;
};

//Resets topic => when a subject is changed
const resetTopicSelectedValues = () => {
  formData.value.topicId = null;
};

/**
 * Loads curriculums (with exam boards, levels, subjects, and topics).
 *
 * Retrieves the first 100 curriculums (page size = 100), which is currently
 * more than enough since the total number of curriculums in the system is small.
 *
 * Using 100 ensures all available curriculums are fetched in one request.
 * If the dataset grows significantly in the future, the page size can be
 * reduced or proper pagination logic can be implemented.
 */
const getAllCurriculums = () => {
  isGettingCurriculums.value = true;

  //tell the parent component that the curriculums are being loaded
  emit("isLoading", true);

  const page = 1;
  const pageSize = 100;

  curriculumStore
    .getCurriculums(page, pageSize)
    .then((data) => {
      curriculums.value = data.items;
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: message,
        life: 5000,
      });
    })
    .finally(() => {
      isGettingCurriculums.value = false;
      emit("isLoading", false);
    });
};

/**
 * Applies the default values passed via props for the select inputs (if provided).
 * This method is called once the list of curriculums is loaded.
 * This makes sure the correct option shows up in the select input instead of staying empty.
 */
const applyDefaultValues = () => {
  if (props.defaultCurriculumId) {
    formData.value.curriculumId = props.defaultCurriculumId;
    //set the default curriculum
    selectedCurriculum.value =
      curriculums.value.find((c) => c.id == props.defaultCurriculumId) ?? null;
  }
  if (props.defaultExamBoardId) {
    formData.value.examBoardId = props.defaultExamBoardId;
    //set the default exam board
    selectedExamBoard.value =
      selectedCurriculum.value?.examBoards.find((e) => e.id === props.defaultExamBoardId) ?? null;
  }
  if (props.defaultLevelId) {
    formData.value.levelId = props.defaultLevelId;
    //set the default level
    selectedLevel.value =
      selectedExamBoard.value?.levels.find((l) => l.id === props.defaultLevelId) ?? null;
  }
  if (props.defaultSubjectId) {
    //set the default subject
    formData.value.subjectId = props.defaultSubjectId;
    selectedSubject.value =
      selectedLevel.value?.subjects.find((s) => s.id == props.defaultSubjectId) ?? null;
  }
  if (props.defaultTopicId) {
    //set the default topic
    formData.value.topicId = props.defaultTopicId;
  }
};

/**
 * Fetches all subjects from the backend for a given educational level. These subjects are used
 * to select the subject for things like topics, subtopics,questions in forms
 * and dropdowns and where a user needs to choose which subject they are working with.
 *
 * Retrieves the first 100 subjects (page size = 100), which is currently
 * more than enough since the total number of subjects per educational level in the system is small.
 *
 * Using 100 ensures all available subjects are fetched in one request.
 * If the dataset grows significantly in the future, the page size can be
 * reduced or proper pagination logic can be implemented.
 */
const getSubjectsForLevel = (levelId: number) => {
  
  if (!levelId || !props.showSubject) return;
  isGettingSubjects.value = true;

  //tell the parent component that the subjects are being loaded
  emit("isLoadingSubjects", true);

  const page = 1;
  const pageSize = 100;

  const queryParams: SubjectQueryParams = {
    page,
    pageSize,
    levelId,
    sortBy: SubjectSortOption.Name,
    curriculumId: null,
    examBoardId: null,
  };

  subjectStore
    .getSubjectsForLevel(queryParams)
    .then((data) => {
      if (!selectedLevel.value) return;
      selectedLevel.value.subjects = data.items;
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: message,
        life: 5000,
      });
    })
    .finally(() => {
      isGettingSubjects.value = false;
      emit("isLoadingSubjects", false);
    });
};

defineExpose({ getAllCurriculums, getSubjectsForLevel, resetAllSelectedValues });
</script>
