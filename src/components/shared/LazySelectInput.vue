<template>
  <Select
    v-model="selectedCurriculum"
    :options="curriculums.items"
    optionLabel="name"
    optionValue="id"
    size="small"
    :virtualScrollerOptions="virtualScrollerOptions"
    style="width: 300px"
    :placeholder="placeholder"
  />
</template>
<script setup lang="ts">
import type { Curriculum } from "@/models/curriculum";
import { PageInfo } from "@/models/pageInfo";
import { useCurriculumStore } from "@/stores/curriculum";
import type { VirtualScrollerLazyEvent } from "primevue";
import Select from "primevue/select";
import { computed, ref } from "vue";

defineProps({
  placeholder: {
    type: String,
    default: "Select curriculum",
  },
});

const curriculumStore = useCurriculumStore();
const selectedCurriculum = ref(null);
const curriculums = ref(new PageInfo<Curriculum>());
const loading = ref(false);

// Computed virtual scroller options
const virtualScrollerOptions = computed(() => ({
  lazy: true,
  onLazyLoad: onLazyLoad,
  itemSize: 38,
  showLoader: true,
  loading: loading.value,
  delay: 250,
}));

/**
 * Handles lazy loading of curriculums for a PrimeVue Select component
 * using VirtualScroller.
 *
 * This function is triggered whenever the user scrolls near the end of
 * the currently loaded items. It calculates the correct page to fetch
 * from the backend and appends any new items to the existing list,
 * ensuring no duplicates are added.
 *
 * @param {VirtualScrollerLazyEvent} event - Contains the start index
 *        (`first`) of the items currently needed by the VirtualScroller.
 */
const onLazyLoad = async (event: VirtualScrollerLazyEvent) => {
  // Prevent multiple simultaneous requests or fetching beyond total items
  if (
    loading.value ||
    (curriculums.value.totalItems > 0 && event.first >= curriculums.value.totalItems)
  ) {
    return;
  }

  try {
    loading.value = true;

    // The number of items per page
    const pageSize = 5;

    // Calculate which page to fetch based on the starting index
    // Formula: first = (page - 1) * pageSize
    const page = Math.floor(event.first / pageSize + 1);

    // Fetch the curriculums for this page from the backend
    const response = await curriculumStore.getCurriculums(page, pageSize);

    // Merge newly fetched items into the existing list, avoiding duplicates
    curriculums.value = {
      ...response,
      items: [
        ...curriculums.value.items,
        ...response.items.filter(
          (newItem) => !curriculums.value.items.some((item) => item.id === newItem.id),
        ),
      ],
    };
  } catch (err) {
    // Log any errors during the fetch
    console.error("Failed to fetch curriculums", err);
  } finally {
    // Reset the loading state once fetch is complete
    loading.value = false;
  }
};
</script>
