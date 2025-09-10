<template>
  <div class="">
    <Select
      id="examBoardExamBoard"
      :placeholder="isGettingExamBoards ? 'Loading exam boards...' : placeholder"
      checkmark
      :options="examBoards"
      option-label="name"
      option-value="id"
      v-model="v$.examBoardId.$model"
      :invalid="v$.examBoardId.$error"
      class="w-100"
      :loading="isGettingExamBoards"
      :disabled="isGettingExamBoards"
      @change="onSelect"
      :size="size"
      :show-clear="showClear"
    />

    <Message size="small" severity="error" v-if="v$.examBoardId.$error" variant="simple">
      <div v-for="error of v$.examBoardId.$errors" :key="error.$uid">
        <div>{{ error.$message }}</div>
      </div>
    </Message>
  </div>
</template>

<script setup lang="ts">
import Select, { type SelectChangeEvent } from "primevue/select";
import { ExamBoard } from "@/models/examBoard";
//import { useExamBoardStore } from "@/stores/examBoard";
//import FloatLabel from "primevue/floatlabel";
import { computed, onMounted, ref, toRef, watch, type PropType, type Ref } from "vue";
//import { useToast } from "primevue";
import { helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { Message } from "primevue";
import { useRouter } from "vue-router";

const props = defineProps({
  //placeholder text of the select input
  placeholder: {
    type: String,
    default: "ExamBoard",
  },
  //size of the select input
  size: {
    type: String,
    default: "small",
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

  //Exam boards to use as options
  examBoards: {
    type: Array as PropType<ExamBoard[]>,
    required: false,
    default: new Array<ExamBoard>(),
  },
  //ID of the default exam board (if any)
  defaultExamBoardId: {
    type: Number,
    required: false,
  },

  isGettingExamBoards: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["change", "isLoading"]);
const router = useRouter();

onMounted(() => {
  v$.value.$touch();
  // apply the default value (if provided).
  // This makes sure the correct option shows up in the select input instead of staying empty.
  if (props.defaultExamBoardId) {
    formData.value.examBoardId = props.defaultExamBoardId;
  }
});

//select input validation start
const formData: Ref<{ examBoardId: number | null }> = ref({
  examBoardId: null,
});

const rules = computed(() => {
  if (props.isGettingExamBoards || !props.isRequired) return { examBoardId: {} };
  return { examBoardId: { required: helpers.withMessage("Select exam board", required) } };
});

const v$ = useVuelidate(rules, formData);
//select input validation end

const onSelect = async (event: SelectChangeEvent) => {
  //get and emit the selected exam board
  const examBoard = props.examBoards.find((x) => x.id == event.value);

  emit("change", examBoard);
};

const resetSelectedValue = () => {
  formData.value.examBoardId = null;
};
//expose the `resetSelectedValue` method to call it in parent components
defineExpose({ resetSelectedValue });

/**
 * Applies the default value for exam board if it was provided via query params.
 * This method is called once the list of exam boards is loaded.
 * This makes sure the correct option shows up in the select input instead of staying empty.
 */
const applyDefaultValue = () => {
  try {
    const query = router.currentRoute.value.query;
    const defaultExamBoardId = query.curriculumId ? Number(query.examBoardId) : null;
    if (defaultExamBoardId) {
      formData.value.examBoardId = defaultExamBoardId;

      //get and emit the default exam board
      const examBoard = props.examBoards.find((x) => x.id == defaultExamBoardId);

      emit("change", examBoard);
    }
  } catch {}
};

// make examBoards reactive
const examBoards = toRef(props, "examBoards");

/**
 * Watches the `examBoards` prop for changes.
 * Once the list of exam boards is populated (length > 0),
 * it triggers `applyDefaultValue()` to check if a default
 * exam board ID was provided via query params and apply it.
 *
 * This ensures that when the exam boards are loaded asynchronously,
 * the select input correctly reflects the user’s previously selected
 * exam board (from URL query params) instead of remaining empty.
 */
watch(
  examBoards,
  (val) => {
    if (val.length > 0) {
      applyDefaultValue();
    }
  },
  { deep: true },
);
</script>
