<template>
  <div class="form-group mb-3">
    <FloatLabel variant="on">
      <Select
        id="examBoardCurriculum"
        :placeholder="isGettingCurriculums ? 'Fetching curriculums...' : 'Curriculum'"
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
      />
      <label for="examBoardCurriculum">Curriculum</label>
    </FloatLabel>
    <Message size="small" severity="error" v-if="v$.curriculumId.$error" variant="simple">
      <div v-for="error of v$.name.$errors" :key="error.$uid">
        <div>{{ error.$message }}</div>
      </div>
    </Message>
  </div>
</template>

<script setup lang="ts">
import Select from "primevue/select";
import type { Curriculum } from "@/models/curriculum";
import { useCurriculumStore } from "@/stores/curriculum";
import FloatLabel from "primevue/floatlabel";
import { onMounted, ref, type Ref } from "vue";
import { useToast } from "primevue";
import { required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { Message } from "primevue";

defineProps({
  placeholder: {
    type: String,
    default: "Curriculum",
  },
});

const emit = defineEmits(["curriculumId"]);

onMounted(() => {
  getAllCurriculums();
});

const toast = useToast();
const curriculums: Ref<Curriculum[]> = ref([]);
const curriculumStore = useCurriculumStore();
const isGettingCurriculums = ref(false);

//select input validation start
const inputData = ref({
  curriculumId: Number,
});

const rules = {
  curriculumId: { required },
};

const v$ = useVuelidate(rules, inputData.value);
//select input validation end

const onSelect = () => {
  emit("curriculumId", inputData.value.curriculumId);
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
