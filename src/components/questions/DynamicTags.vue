<template>
  <div class="d-flex flex-wrap align-items-center gap-2">
    <!-- Existing tags -->
    <Chip
      v-for="(tag, index) in tags"
      :key="index"
      class="py-1 px-2 rounded-0"
      @remove="removeTag(index)"
      removable
    >
      <i class="pi pi-hashtag"></i>
      <span style="margin-left: -0.4rem">{{ tag }}</span>
    </Chip>

    <!-- Input for adding new tags -->
    <InputText
      @keyup.enter.prevent="addTag"
      v-model="newTag"
      size="small"
      placeholder="# Add a tag"
      autofocus
    />
  </div>
</template>

<script setup lang="ts">
/**
 * DynamicTags Component
 * ---------------------
 * A reusable component that allows users to add and remove tags dynamically.
 * Uses PrimeVue's Chip and InputText components.
 * Emits the updated list of tags whenever tags are added or removed.
 *
 * Features:
 * - Tags are displayed as PrimeVue Chips.
 * - New tags are added by typing and pressing Enter.
 * - Emits the updated list of tags on each change.
 */

import { ref } from "vue";
import Chip from "primevue/chip";
import InputText from "primevue/inputtext";

const tags = ref<string[]>([]);
const newTag = ref("");

// Emit the updated list of tags to the parent component
const emit = defineEmits(["tags"]);

/**
 * Adds a new tag from the input field.
 * - Ignores empty or duplicate values.
 * - Clears the input after adding.
 * - Emits the updated tags list.
 */
const addTag = () => {
  const trimmed = newTag.value.trim();
  if (trimmed && !tags.value.includes(trimmed)) {
    tags.value.push(trimmed);
  }
  newTag.value = "";

  emit("tags", tags.value);
};

/**
 * Removes a tag by its index.
 * - Updates the tags array.
 * - Emits the updated tags list.
 *
 * @param index - Index of the tag to remove
 */
const removeTag = (index: number) => {
  tags.value.splice(index, 1);

  emit("tags", tags.value);
};
</script>

<style scoped>
/* Optional: align chips nicely inside border */
.p-chip {
  border-radius: 20px;
}
</style>
