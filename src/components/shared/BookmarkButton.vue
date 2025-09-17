<template>
  <Button
    text
    size="small"
    class="action-btn"
    label="Bookmark"
    :icon="localIsBookmarked ? 'pi pi-bookmark-fill' : 'pi pi-bookmark'"
    @click="handleClick"
    :severity="localIsBookmarked ? 'primary' : 'secondary'"
    v-tooltip="tooltipMessage"
  />
</template>

<script setup lang="ts">
/**
 * Reusable BookmarkButton component.
 *
 * Lets the user bookmark or remove their bookmark.
 */

import { ref, watch, type PropType } from "vue";
import Button from "primevue/button";
import { useToast } from "primevue";

const props = defineProps({
  /** Whether the current user has bookmarked this item */
  isBookmarked: {
    type: Boolean,
    required: true,
  },

  /** Callback to call when adding a bookmark */
  onBookmark: {
    type: Function as PropType<() => Promise<void>>,
    required: true,
  },

  /** Callback to call when removing a bookmark */
  onRemoveBookmark: {
    type: Function as PropType<() => Promise<void>>,
    required: true,
  },

  /**Tooltip text to show when a user hovers over the button */
  tooltipMessage: {
    type: String,
    required: true,
  },
});

const toast = useToast();

const localIsBookmarked = ref(props.isBookmarked);
const loading = ref(false);

/**
 * WATCHERS
 * --------
 * If the parent component sends a new value for isBookmarked,
 * update our local copy so the button stays in sync.
 */
watch([() => props.isBookmarked], ([newIsBookmarked]) => {
  localIsBookmarked.value = newIsBookmarked;
});

/**
 * Handles the click event on the button.
 * - Called when the button is clicked.
 * - If already bookmarked → remove the bookmark.
 * - If not yet bookmarked → add a new bookmark.
 * - Updates the UI immediately (optimistic) then calls the backend.
 * - If the backend call fails, it resets the UI and shows an error.
 */
const handleClick = async () => {
  if (loading.value) return;

  loading.value = true;

  try {
    if (localIsBookmarked.value) {
      // Optimistically update UI
      localIsBookmarked.value = false;
      await props.onRemoveBookmark();
    } else {
      localIsBookmarked.value = true;
      await props.onBookmark();
    }
  } catch (message) {
    // Revert optimistic update on failure
    localIsBookmarked.value = props.isBookmarked;

    toast.add({
      severity: "error",
      summary: "Error",
      detail: message,
      life: 10000,
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");
.action-btn {
  min-width: 3rem;
}
</style>
