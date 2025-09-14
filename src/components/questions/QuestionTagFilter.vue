<template>
  <DynamicTags />
  <div>
    <AutoComplete
      v-model="tags"
      @change="tagsToQueryParam"
      multiple
      :typeahead="false"
      :size="'small'"
      placeholder="Tags"
    />
  </div>
</template>

<script setup lang="ts">
import { useQuestionStore } from "@/stores/question";

import AutoComplete from "primevue/autocomplete";

import { onMounted, ref, type Ref } from "vue";
import { useRouter } from "vue-router";
import DynamicTags from "./DynamicTags.vue";

defineProps({});
const router = useRouter();
const tags: Ref<string[]> = ref([]);
const questionStore = useQuestionStore();

onMounted(() => {
  applyDefaultsFromQuery();
});

/**
 * Applies default tags from the query parameters to the question filter.
 *
 * The `tags` query parameter is expected to be a comma-separated string
 * (e.g. `tags=definition,electricity,ohm`). This method splits that string
 * into an array and assigns it to the `questionStore.filter.tags`.
 *
 * This ensures that when a user lands on the questions page with tags in
 * the URL (e.g. `/questions?curriculumId=1&examBoardId=2&levelId=3&tags=ohm,voltage`),
 * the correct tags are pre-selected, keeping the filter state in sync with
 * the query string.
 */
const applyDefaultsFromQuery = () => {
  const query = router.currentRoute.value.query;

  if (query.tags) {
    //store the tags query in the store
    questionStore.filter.tags = query.tags.toString();

    //preselect the default tags
    tags.value = query.tags
      .toString()
      .split(",")
      .map((t) => t.trim());
  }
};

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
const tagsToQueryParam = async () => {
  questionStore.filter.tags = tags.value.join(",");

  //update browser URL with the new tags
  questionStore.filter.applyFilterToBrowserUrl();
};
</script>

<style lang="scss" scoped></style>
