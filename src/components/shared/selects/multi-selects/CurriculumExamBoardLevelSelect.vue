<template>
  <div class="">
    <!-- Curriculum select -->
    <div class="mb-3">
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

      <Message size="small" severity="error" v-if="v$.curriculumId.$error" variant="simple">
        <div v-for="error of v$.curriculumId.$errors" :key="error.$uid">
          <div>{{ error.$message }}</div>
        </div>
      </Message>
    </div>
    <!-- Exam board select -->
    <div class="mb-3">
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

      <Message size="small" severity="error" v-if="v$.examBoardId.$error" variant="simple">
        <div v-for="error of v$.examBoardId.$errors" :key="error.$uid">
          <div>{{ error.$message }}</div>
        </div>
      </Message>
    </div>
    <!-- Level select -->
    <div class="mb-3">
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

      <Message size="small" severity="error" v-if="v$.levelId.$error" variant="simple">
        <div v-for="error of v$.levelId.$errors" :key="error.$uid">
          <div>{{ error.$message }}</div>
        </div>
      </Message>
    </div>
  </div>
</template>

<script setup lang="ts">
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

  //whether the input value is required or not
  //controls whether to show error messages or not
  isRequired: {
    type: Boolean,
    default: false,
  },

  defaultCurriculumId: {
    type: Number,
    default: null,
  },
  defaultExamBoardId: {
    type: Number,
    default: null,
  },
  defaultLevelId: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["isLoading", "changeCurriculum", "changeExamBoard", "changeLevel"]);

onMounted(() => {
  v$.value.$touch();
});

const toast = useToast();
const curriculums: Ref<Curriculum[]> = ref([]);
const selectedCurriculum: Ref<Curriculum | null> = ref(null);
const selectedExamBoard: Ref<ExamBoard | null> = ref(null);
const curriculumStore = useCurriculumStore();
const isGettingCurriculums = ref(false);

//const initialCurriculumId = computed(() => props.curriculumId);

//select input validation start
const formData: Ref<{
  curriculumId: number | null;
  examBoardId: number | null;
  levelId: number | null;
}> = ref({
  curriculumId: null,
  examBoardId: null,
  levelId: null,
});

const rules = computed(() => {
  if (isGettingCurriculums.value || !props.isRequired)
    return { curriculumId: {}, examBoardId: {}, levelId: {} };
  return {
    curriculumId: { required: helpers.withMessage("Select curriculum", required) },
    examBoardId: { required: helpers.withMessage("Select exam board", required) },
    levelId: { required: helpers.withMessage("Select level", required) },
  };
});

const v$ = useVuelidate(rules, formData);
//select input validation end

const onCurriculumSelect = async (event: SelectChangeEvent) => {
  const curriculum = curriculums.value.find((c) => c.id === event.value) ?? null;
  selectedCurriculum.value = curriculum;
  formData.value.examBoardId = null; // reset exam board when curriculum changes
  // reset level when curriculum changes
  formData.value.levelId = null;
  selectedExamBoard.value = null;
  emit("changeCurriculum", curriculum);
};

const onExamBoardSelect = async (event: SelectChangeEvent) => {
  const examBoard = selectedCurriculum.value?.examBoards.find((e) => e.id === event.value) ?? null;
  selectedExamBoard.value = examBoard;
  // since level depends on exam board, reset level when exam board changes
  formData.value.levelId = null;
  // emit selected exam board
  emit("changeExamBoard", examBoard);
};

const onLevelSelect = async (event: SelectChangeEvent) => {
  const level = selectedExamBoard.value?.levels?.find((l) => l.id === event.value) ?? null;
  emit("changeLevel", level);
};

//Resets all selections
const resetSelectedValues = () => {
  selectedCurriculum.value = null;
  selectedExamBoard.value = null;
  formData.value.curriculumId = null;
  formData.value.examBoardId = null;
  formData.value.levelId = null;
};

/**
 * Fetches all curriculums from the backend. These curriculums are used
 * to select the curriculum for things like exam boards, subjects, topics in forms
 * and dropdowns and where a user needs to choose which curriculum they are working with.
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
      // Once the list of curriculums is loaded, apply the default values (if provided).
      // This makes sure the correct option shows up in the select input instead of staying empty.
      if (props.defaultCurriculumId) {
        formData.value.curriculumId = props.defaultCurriculumId;
        selectedCurriculum.value =
          curriculums.value.find((c) => c.id == props.defaultCurriculumId) ?? null;
      }
      if (props.defaultExamBoardId) {
        formData.value.examBoardId = props.defaultExamBoardId;
      }
      if (props.defaultLevelId) {
        formData.value.levelId = props.defaultLevelId;
      }
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
defineExpose({ getAllCurriculums, resetSelectedValues });
</script>
