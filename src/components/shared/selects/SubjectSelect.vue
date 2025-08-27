<template>
  <div class="">
    <Select
      id="subjectSubject"
      :placeholder="isGettingSubjects ? 'Loading subjects...' : placeholder"
      checkmark
      :options="subjects"
      option-label="name"
      option-value="id"
      v-model="v$.subjectId.$model"
      :invalid="v$.subjectId.$error"
      class="w-100"
      :loading="isGettingSubjects"
      :disabled="isGettingSubjects"
      @change="onSelect"
      :size="size"
      :show-clear="showClear"
    />

    <Message size="small" severity="error" v-if="v$.subjectId.$error" variant="simple">
      <div v-for="error of v$.subjectId.$errors" :key="error.$uid">
        <div>{{ error.$message }}</div>
      </div>
    </Message>
  </div>
</template>

<script setup lang="ts">
import Select, { type SelectChangeEvent } from "primevue/select";
import { Subject } from "@/models/subject";
import { computed, onMounted, ref, type Ref } from "vue";
import { helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { Message, useToast } from "primevue";
import { useSubjectStore } from "@/stores/subject";
import type { SubjectQueryParams } from "@/interfaces/subjects/subjectQueryParams";
import { SubjectSortOption } from "@/enums/subjects/subjectSortOption";

const props = defineProps({
  //placeholder text of the select input
  placeholder: {
    type: String,
    default: "Subject",
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
  defaultSubjectId: {
    type: Number,
    required: false,
  },
  //the level the subjects are under
  levelId: {
    type: [Number, null],
    required: true,
  },
});

const emit = defineEmits(["change", "isLoading"]);

const subjectStore = useSubjectStore();
const isGettingSubjects = ref(false);
const subjects: Ref<Subject[]> = ref([]);
const toast = useToast();

onMounted(() => {
  v$.value.$touch();
});

//select input validation start
const formData: Ref<{ subjectId: number | null }> = ref({
  subjectId: null,
});

const rules = computed(() => {
  if (isGettingSubjects.value || !props.isRequired) return { subjectId: {} };
  return { subjectId: { required: helpers.withMessage("Select subject", required) } };
});

const v$ = useVuelidate(rules, formData);
//select input validation end

const onSelect = async (event: SelectChangeEvent) => {
  //get and emit the selected subject
  const subject = subjects.value.find((x) => x.id == event.value);

  emit("change", subject);
};

const resetSelectedValue = () => {
  formData.value.subjectId = null;
};

/**
 * Fetches all subjects from the backend. These subjects are used
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
const getAllSubjects = () => {
  isGettingSubjects.value = true;

  //tell the parent component that the subjects are being loaded
  emit("isLoading", true);

  const page = 1;
  const pageSize = 100;

  const queryParams: SubjectQueryParams = {
    page,
    pageSize,
    levelId: props.levelId,
    sortBy: SubjectSortOption.Name,
    curriculumId: null,
    examBoardId: null,
  };

  subjectStore
    .getSubjects(queryParams)
    .then((data) => {
      subjects.value = data.items;
      // Once the list of subjects is loaded, apply the default value (if provided).
      // This makes sure the correct option shows up in the select input instead of staying empty.
      if (props.defaultSubjectId) {
        formData.value.subjectId = props.defaultSubjectId;
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
      isGettingSubjects.value = false;
      emit("isLoading", false);
    });
};

//expose the `resetSelectedValue` method to call it in parent component
//expose the `GetAllSubjects` method to call it in the parent component
defineExpose({ resetSelectedValue, getAllSubjects });
</script>
