<template>
  <Button
    :label="localCount.toString()"
    :icon="localIsUpvoted ? 'pi pi-thumbs-up-fill' : 'pi pi-thumbs-up'"
    @click="handleClick"
    :severity="localIsUpvoted ? 'primary' : 'secondary'"
    size="small"
    :variant="localIsUpvoted ? 'text' : 'text'"
    class="action-btn"
    v-tooltip="localIsUpvoted ? upvotedTooltipText : notUpvotedTooltipTextque"
  />
</template>

<script setup lang="ts">
/**
 * Reusable UpvoteButton component.
 *
 * Shows how many upvotes an item has and lets
 * the user upvote or remove their upvote.
 */

import { ref, watch, type PropType, type Ref } from "vue";
import Button from "primevue/button";
import { useToast } from "primevue";

const props = defineProps({
  /** Current number of upvotes */
  count: {
    type: Number,
    required: true,
  },

  /** Whether the current user has upvoted this item */
  isUpvoted: {
    type: Boolean,
    required: true,
  },

  /** Callback to call when adding an upvote */
  onUpvote: {
    type: Function as PropType<() => Promise<void>>,
    required: true,
  },

  /** Callback to call when removing an upvote */
  onRemoveUpvote: {
    type: Function as PropType<() => Promise<void>>,
    required: true,
  },

  /**Tooltip text to show when a user hovers over
   * the button and the item is upvoted.
   */
  upvotedTooltipText: {
    type: String,
    required: true,
  },

  /**Tooltip text to show when a user hovers over
   * the button and the item is not upvoted.
   */
  notUpvotedTooltipText: {
    type: String,
    required: true,
  },
});

const toast = useToast();
const localCount: Ref<number> = ref(props.count);
const localIsUpvoted = ref(props.isUpvoted);
const loading = ref(false);

/**
 * WATCHERS
 * --------
 * If the parent component sends new values for count or isUpvoted,
 * update our local copies so the button stays in sync.
 */
watch([() => props.count, () => props.isUpvoted], ([newCount, newIsUpvoted]) => {
  localCount.value = newCount;
  localIsUpvoted.value = newIsUpvoted;
});

/**
 * Handles the click event on the button.
 * - Called when the button is clicked.
 * - If already upvoted → remove the upvote.
 * - If not yet upvoted → add an upvote.
 * - Updates the UI immediately (optimistic) then calls the backend.
 * - If the backend call fails, it resets the UI and shows an error.
 */
const handleClick = async () => {
  if (loading.value) return;

  loading.value = true;

  try {
    if (localIsUpvoted.value) {
      // Optimistically update UI
      localIsUpvoted.value = false;
      localCount.value--;
      await props.onRemoveUpvote();
    } else {
      localIsUpvoted.value = true;
      localCount.value++;
      await props.onUpvote();
    }
  } catch (message) {
    // Revert optimistic update on failure
    localIsUpvoted.value = props.isUpvoted;
    localCount.value = props.count;

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
