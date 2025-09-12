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
import { useQuestionStore } from "@/stores/question";
import Select from "primevue/select";
import { onMounted, ref, type Ref } from "vue";
import { useRouter } from "vue-router";

onMounted(() => {
  applyDefaultFromQuery();
});
const router = useRouter();
const questionStore = useQuestionStore();

const selectedSortOption: Ref<QuestionSortOption | null> = ref(null);
// List of available sort options
const sortOptions = ref([
  { name: "Newest", value: QuestionSortOption.Newest },
  { name: "Oldest", value: QuestionSortOption.Oldest },
  { name: "Top Rated", value: QuestionSortOption.MostUpvoted },
  { name: "Most Answered", value: QuestionSortOption.MostAnswered },
  { name: "No Answers Yet", value: QuestionSortOption.Unanswered },
  { name: "Highest Marks", value: QuestionSortOption.HighestMarks },
]);

const onChange = () => {
  // Update the store
  questionStore.filter.sortBy = selectedSortOption.value;

  //update browser URL with new filter query params
  questionStore.filter.applyFilterToBrowserUrl();
};
// Apply default sort option from query parameter if present in the URL
const applyDefaultFromQuery = () => {
  const query = router.currentRoute.value.query;

  if (query.sortBy) {
    switch (query.sortBy) {
      case QuestionSortOption.Newest:
        selectedSortOption.value = QuestionSortOption.Newest;
        //save the sort option to the filter state
        questionStore.filter.sortBy = QuestionSortOption.Newest;
        break;
      case QuestionSortOption.Oldest:
        selectedSortOption.value = QuestionSortOption.Oldest;
        //save the sort option to the filter state
        questionStore.filter.sortBy = QuestionSortOption.Oldest;
        break;
      case QuestionSortOption.MostUpvoted:
        selectedSortOption.value = QuestionSortOption.MostUpvoted;
        //save the sort option to the filter state
        questionStore.filter.sortBy = QuestionSortOption.MostUpvoted;
        break;
      case QuestionSortOption.MostAnswered:
        selectedSortOption.value = QuestionSortOption.MostAnswered;
        //save the sort option to the filter state
        questionStore.filter.sortBy = QuestionSortOption.MostAnswered;
        break;
      case QuestionSortOption.Unanswered:
        selectedSortOption.value = QuestionSortOption.Unanswered;
        //save the sort option to the filter state
        questionStore.filter.sortBy = QuestionSortOption.Unanswered;
        break;
      case QuestionSortOption.HighestMarks:
        selectedSortOption.value = QuestionSortOption.HighestMarks;
        //save the sort option to the filter state
        questionStore.filter.sortBy = QuestionSortOption.HighestMarks;
        break;
      default:
        break;
    }
  }
};
</script>
