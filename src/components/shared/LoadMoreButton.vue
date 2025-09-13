<template>
  <Button
    @click="onClick()"
    type="button"
    :label="isLoading ? loadingLabel : !hasMore ? endLabel : label"
    :icon="!hasMore ? '' : 'fas fa-chevron-down'"
    :loading="isLoading"
    :disabled="isLoading || !hasMore || isDisabled"
    :severity="severity"
    :size="size"
    :variant="!hasMore ? endVariant : variant"
  />
</template>

<script setup lang="ts">
import Button from "primevue/button";
defineProps({
  // The default label shown on the button when not loading or when there are no more items to load
  label: {
    type: String,
    default: "Load more",
  },

  // The label to show while the loading state is active
  loadingLabel: {
    type: String,
    default: "Loading...",
  },

  // The label to show when there are no more items to load
  endLabel: {
    type: String,
    default: "You’ve reached the end of the list",
  },
  // Indicates whether a loading operation is in progress
  isLoading: {
    type: Boolean,
    default: false,
    required: true,
  },
  // Indicates whether there are more items to load
  hasMore: {
    type: Boolean,
    default: true,
    required: true,
  },
  // Callback function to be triggered when the button is clicked
  onClick: {
    type: Function,
    required: true,
  },
  // Optional severity/style of the button (e.g., "primary", "contrast")
  severity: {
    type: String,
    default: "contrast",
  },
  // Size of the button (e.g., "small", "medium", "large")
  size: {
    type: String,
    default: "small",
  },

  // The button style variant when more items are available (e.g., "filled")
  variant: {
    type: String,
    default: "filled",
  },
  // The button style variant to use when no more items can be loaded
  endVariant: {
    type: String,
    default: "outlined",
  },
  // Explicitly disable the button regardless of other state
  isDisabled: {
    type: Boolean,
  },
});
</script>
