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
      :default-value="defaultExamBoardId"
      :size="size"
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
import { computed, onMounted, ref, type PropType } from "vue";
//import { useToast } from "primevue";
import { helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { Message } from "primevue";

const props = defineProps({
  //placeholder text of the select input
  placeholder: {
    type: String,
    default: "ExamBoard",
  },
  //size of the input
  size: {
    type: String,
    default: "small",
  },

  //whether the input value is required or not
  //controls whether to show error messages or not
  isRequired: {
    type: Boolean,
    default: false,
  },

  //ID of the default exam board(if any)
  defaultExamBoardId: {
    type: Number,
    required: false,
  },
  //Exam boards to use as options
  examBoards: {
    type: [] as PropType<ExamBoard[]>,
    required: false,
    default: [],
  },
  isGettingExamBoards: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["change", "isLoading"]);

onMounted(() => {
  // if (props.defaultExamBoards?.length > 0) {
  //   examBoards.value = props.defaultExamBoards;
  // }
  //getAllExamBoards();
  v$.value.$touch();
});

//const toast = useToast();
//const examBoards: Ref<ExamBoard[]> = ref([]);
//const examBoardStore = useExamBoardStore();
//const isGettingExamBoards = ref(false);

//select input validation start
const inputData = ref({
  examBoardId: "",
});

const rules = computed(() => {
  if (props.isGettingExamBoards || !props.isRequired) return { examBoardId: {} };
  return { examBoardId: { required: helpers.withMessage("Select exam board", required) } };
});

const v$ = useVuelidate(rules, inputData);
//select input validation end

const onSelect = async (event: SelectChangeEvent) => {
  //check if select input is valid
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  //get and emit the selected exam board
  const examBoard = props.examBoards.find((x) => x.id == event.value);

  emit("change", examBoard);
};

/**
 * Fetches all exam boards from the backend. These exam boards are used
 * to select the exam board for things like exam boards, subjects, topics in forms
 * and dropdowns and where a user needs to choose which exam board they are working with.
 *
 * Retrieves the first 100 exam boards (page size = 100), which is currently
 * more than enough since the total number of exam boards in the system is small.
 *
 * Using 100 ensures all available exam boards are fetched in one request.
 * If the dataset grows significantly in the future, the page size can be
 * reduced or proper pagination logic can be implemented.
 */
// const getAllExamBoards = () => {
//   isGettingExamBoards.value = true;

//   //tell the parent component that the exam boards are being loaded
//   emit("isLoading", true);

//   const page = 1;
//   const pageSize = 100;

//   examBoardStore
//     .getExamBoards(page, pageSize)
//     .then((data) => (examBoards.value = data.items))
//     .catch((message) => {
//       toast.add({
//         severity: "error",
//         summary: "Error",
//         detail: message,
//         life: 5000,
//       });
//     })
//     .finally(() => {
//       isGettingExamBoards.value = false;
//       emit("isLoading", false);
//     });
// };
</script>
