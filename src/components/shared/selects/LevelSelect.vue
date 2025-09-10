<template>
  <div class="">
    <Select
      id="levelLevel"
      :placeholder="isGettingLevels ? 'Loading levels...' : placeholder"
      checkmark
      :options="levels"
      option-label="name"
      option-value="id"
      v-model="v$.levelId.$model"
      :invalid="v$.levelId.$error"
      class="w-100"
      :loading="isGettingLevels"
      :disabled="isGettingLevels"
      @change="onSelect"
      :size="size"
      :show-clear="showClear"
    />

    <Message size="small" severity="error" v-if="v$.levelId.$error" variant="simple">
      <div v-for="error of v$.levelId.$errors" :key="error.$uid">
        <div>{{ error.$message }}</div>
      </div>
    </Message>
  </div>
</template>

<script setup lang="ts">
import Select, { type SelectChangeEvent } from "primevue/select";
import { Level } from "@/models/level";
import { computed, onMounted, ref, toRef, type PropType, type Ref } from "vue";
import { helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { Message, useToast } from "primevue";
import { useSubjectStore } from "@/stores/subject";
import type { SubjectQueryParams } from "@/interfaces/subjects/subjectQueryParams";
import { SubjectSortOption } from "@/enums/subjects/subjectSortOption";
import { watch } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  //placeholder text of the select input
  placeholder: {
    type: String,
    default: "Level",
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

  //Levels to use as options
  levels: {
    type: Array as PropType<Level[]>,
    required: false,
    default: new Array<Level>(),
  },
  //ID of the default level(if any)
  defaultLevelId: {
    type: Number,
    required: false,
  },

  isGettingLevels: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["change", "isLoadingLevels", "isLoadingSubjects", "subjects"]);
const router = useRouter();

onMounted(() => {
  v$.value.$touch();
});

const subjectStore = useSubjectStore();
const isGettingSubjects = ref(false);
const toast = useToast();

const levels = toRef(props, "levels");

//select input validation start
const formData: Ref<{ levelId: number | null }> = ref({
  levelId: null,
});

const rules = computed(() => {
  if (props.isGettingLevels || !props.isRequired) return { levelId: {} };
  return { levelId: { required: helpers.withMessage("Select level", required) } };
});

const v$ = useVuelidate(rules, formData);
//select input validation end

const onSelect = async (event: SelectChangeEvent) => {
  //get and emit the selected level
  const level = props.levels.find((x) => x.id == event.value) ?? null;

  emit("change", level);

  //fetch subjects for the level
  if (!level) return;
  getSubjectsForLevel(level.id);
};

const resetSelectedValue = () => {
  formData.value.levelId = null;
};
//expose the `resetSelectedValue` method to call it in parent components
defineExpose({ resetSelectedValue });

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
  if (!levelId) return;
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
      emit("subjects", data.items);
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

/**
 * Applies the default value for level if it was provided via query params.
 * This method is called once the list of levels is loaded.
 * This makes sure the correct option shows up in the select input instead of staying empty.
 */
const applyDefaultValue = () => {
  try {
    const query = router.currentRoute.value.query;
    const defaultLevelId = query.levelId ? Number(query.levelId) : null;
    if (defaultLevelId) {
      formData.value.levelId = defaultLevelId;

      //get and emit the default level
      const level = props.levels.find((x) => x.id == defaultLevelId);

      emit("change", level);
    }
  } catch {}
};

/**
 * Watches the `levels` prop for changes.
 * Once the list of levels is populated (length > 0),
 * it triggers `applyDefaultValue()` to check if a default
 * level ID was provided via query params and apply it.
 *
 * This ensures that when the levels are loaded asynchronously,
 * the select input correctly reflects the user’s previously selected
 * level (from URL query params) instead of remaining empty.
 */
watch(
  levels,
  (val) => {
    if (val.length > 0) {
      applyDefaultValue();
    }
  },
  { deep: true },
);
</script>
