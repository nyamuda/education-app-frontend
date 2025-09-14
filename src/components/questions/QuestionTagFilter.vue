<template>
  <DynamicTags
    @tags="(val: string[]) => tagsToQueryParam(val)"
    @tags-query="(val: string) => (questionStore.filter.tags = val)"
  />
</template>

<script setup lang="ts">
import { useQuestionStore } from "@/stores/question";
import DynamicTags from "../shared/DynamicTags.vue";

defineProps({});

const questionStore = useQuestionStore();

/**
 * Updates the filter's tags field in the question store
 * by converting the current array of selected tags into
 * a single comma-separated string.
 *
 * This prepares the tags for use as a query parameter
 * when sending requests to the backend.
 *
 * Example:
 *   ["definition", "electricity", "ohm"]
 *   → "definition,electricity,ohm"
 */
const tagsToQueryParam = (tags: string[]) => {
  questionStore.filter.tags = tags.join(",");

  //update browser URL with the new tags
  questionStore.filter.applyFilterToBrowserUrl();
};
</script>

<style lang="scss" scoped></style>
