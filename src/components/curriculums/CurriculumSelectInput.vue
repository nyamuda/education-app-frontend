<template>
  <div class="form-group mb-3">
    <Select
      id="examBoardCurriculum"
      :placeholder="isGettingCurriculums ? 'Fetching curriculums...' : placeholder"
      checkmark
      :options="curriculums"
      option-label="name"
      v-model="v$.curriculum.$model"
      :invalid="v$.curriculum.$error"
      class="w-100"
      :loading="isGettingCurriculums"
      :disabled="isGettingCurriculums"
      @change="onSelect"
    />

    <Message size="small" severity="error" v-if="v$.curriculum.$error" variant="simple">
      <div v-for="error of v$.curriculum.$errors" :key="error.$uid">
        <div>{{ error.$message }}</div>
      </div>
    </Message>
  </div>
</template>

<script setup lang="ts">
import Select from "primevue/select";
import { Curriculum } from "@/models/curriculum";
import { useCurriculumStore } from "@/stores/curriculum";
//import FloatLabel from "primevue/floatlabel";
import { onMounted, ref, type Ref } from "vue";
import { useToast } from "primevue";
import { helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { Message } from "primevue";

defineProps({
  placeholder: {
    type: String,
    default: "Curriculum",
  },
});

const emit = defineEmits(["curriculum"]);

onMounted(() => {
  getAllCurriculums();
  v$.value.$touch();
});

const toast = useToast();
const curriculums: Ref<Curriculum[]> = ref([]);
const curriculumStore = useCurriculumStore();
const isGettingCurriculums = ref(false);

//select input validation start
const inputData = ref({
  curriculum: "",
});

const rules = {
  curriculum: { required: helpers.withMessage("Select curriculum", required) },
};

const v$ = useVuelidate(rules, inputData.value);
//select input validation end

const onSelect = () => {
  emit("curriculum", inputData.value.curriculum);
};

/**
 * Fetches all curriculums from the backend. These curriculums are used
 * to select the curriculum for things like exam boards, subjects, topics and so on.
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
  const page = 1;
  const pageSize = 100;
  curriculumStore
    .getCurriculums(page, pageSize)
    .then((data) => (curriculums.value = data.items))
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: message,
        life: 5000,
      });
    })
    .finally(() => (isGettingCurriculums.value = false));
};
</script>
