<template>
  <Button
    :label="localCount.toString()"
    :icon="localIsUpvoted ? 'pi pi-sort-up-fill' : 'pi pi-sort-up'"
    @click="handleClick"
    :severity="localIsUpvoted ? 'primary' : 'secondary'"
    size="small"
    variant="text"
    class="action-btn"
    :disabled="loading"
  />
</template>

<script setup lang="ts">
/**
 * Reusable UpvoteButton component.
 *
 * Displays the current upvote count and allows the user to toggle
 * between upvoted and not-upvoted states.
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
});

const toast = useToast();
const localCount: Ref<number> = ref(props.count);
const localIsUpvoted = ref(props.isUpvoted);
const loading = ref(false);

// Keep local state in sync if parent props change
watch([() => props.count, () => props.isUpvoted], ([newCount, newIsUpvoted]) => {
  localCount.value = newCount;
  localIsUpvoted.value = newIsUpvoted;
});

/**
 * Handles the click event on the button.
 * Performs optimistic UI updates while awaiting the actual API call.
 * On error, reverts the local state to the original props.
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
.action-btn {
  min-width: 3rem;
}
</style>
