<template>
  <div>
    <Select
      placeholder="Sort by"
      checkmark
      :options="sortOptions"
      v-model="selectedSortOption"
      option-label="name"
      option-value="value"
      @change="onChange"
      size="small"
      class="w-100"
      show-clear
    />
  </div>
</template>

<script setup lang="ts">
/**
 * QuestionSortingSelect
 *
 * A reusable select dropdown component for sorting questions.
 *
 * Features:
 * - Displays available sorting options for questions.
 * - Default sort option can be preselected based on the "sortBy" query parameter in the URL.
 * - Emits the selected sort option to the parent component when changed.
 *
 */

import { QuestionSortOption } from "@/enums/questions/questionSortOption";
import Select from "primevue/select";
import { onMounted, ref, type Ref } from "vue";
import { useRouter } from "vue-router";

onMounted(() => {
  applyDefaultFromQuery();
});
const router = useRouter();
const emit = defineEmits(["selectedSortOption"]);

const selectedSortOption: Ref<QuestionSortOption | null> = ref(null);
// List of available sort options
const sortOptions = ref([{ name: "Date Created", value: QuestionSortOption.DateCreated }]);

const onChange = () => emit("selectedSortOption", selectedSortOption.value);

// Apply default sort option from query parameter if present in the URL
const applyDefaultFromQuery = () => {
  //get default sort option from the query parameter
  const query = router.currentRoute.value.query;
  if (query.sortBy) {
    switch (query.sortBy) {
      case "DateCreated":
        selectedSortOption.value = QuestionSortOption.DateCreated;
        break;
      default:
        break;
    }
  }
};
</script>
