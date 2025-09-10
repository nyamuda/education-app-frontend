<template>
  <div>
    <Select
      id="curriculumSelectInput"
      :placeholder="isGettingCurriculums ? 'Loading curriculums...' : placeholder"
      checkmark
      :options="curriculums"
      option-label="name"
      option-value="id"
      v-model="v$.curriculumId.$model"
      :invalid="v$.curriculumId.$error"
      class="w-100"
      :loading="isGettingCurriculums"
      :disabled="isGettingCurriculums"
      @change="onSelect"
      :size="size"
      :show-clear="showClear"
    />

    <Message size="small" severity="error" v-if="v$.curriculumId.$error" variant="simple">
      <div v-for="error of v$.curriculumId.$errors" :key="error.$uid">
        <div>{{ error.$message }}</div>
      </div>
    </Message>
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

const props = defineProps({
  //placeholder text of the select input
  placeholder: {
    type: String,
    default: "Curriculum",
  },
  //size of the input
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
});

const emit = defineEmits(["isLoading", "change", "curriculums"]);

onMounted(() => {
  v$.value.$touch();
});

const toast = useToast();
const curriculums: Ref<Curriculum[]> = ref([]);
const curriculumStore = useCurriculumStore();
const isGettingCurriculums = ref(false);

//const initialCurriculumId = computed(() => props.curriculumId);

//select input validation start
const formData: Ref<{ curriculumId: number | null }> = ref({
  curriculumId: null,
});

const rules = computed(() => {
  if (isGettingCurriculums.value || !props.isRequired) return { curriculumId: {} };
  return { curriculumId: { required: helpers.withMessage("Select curriculum", required) } };
});

const v$ = useVuelidate(rules, formData);
//select input validation end

const onSelect = async (event: SelectChangeEvent) => {
  //get and emit the selected curriculum
  const curriculum = curriculums.value.find((c) => c.id == event.value);
  emit("change", curriculum);
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
const getAllCurriculums = async () => {
  isGettingCurriculums.value = true;

  // tell the parent component that the curriculums are being loaded
  emit("isLoading", true);

  const page = 1;
  const pageSize = 100;

  try {
    const data = await curriculumStore.getCurriculums(page, pageSize);
    curriculums.value = data.items;
    //emit the loaded curriculums
    emit("curriculums", curriculums.value);
  } catch (message) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: message,
      life: 5000,
    });
  } finally {
    isGettingCurriculums.value = false;
    emit("isLoading", false);
  }
};

/**
 * Applies the default value for curriculum if it was provided via query params.
 * This method is called once the list of curriculums is loaded.
 * This makes sure the correct option shows up in the select input instead of staying empty.
 */
const applyDefaultValue = (defaultCurriculumId: number | null) => {
  try {
    formData.value.curriculumId = defaultCurriculumId;
  } catch {}
};
defineExpose({ getAllCurriculums, applyDefaultValue });
</script>
