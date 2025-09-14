<template>
  <div class="tag-container">
    <!-- Existing tags -->
    <Chip
      v-for="(tag, index) in tags"
      :key="index"
      class="py-0 px-2 rounded-0"
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
      placeholder="# Enter tags (press Enter after each)"
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
 * - Applies default tags from the query parameters and emits those query parameters.
 */

defineProps({});

import { onMounted, ref, type Ref } from "vue";
import Chip from "primevue/chip";
import InputText from "primevue/inputtext";
import { useRouter } from "vue-router";

onMounted(() => {
  applyDefaultsFromQuery();
});

const tags: Ref<string[]> = ref([]);
const newTag = ref("");
const router = useRouter();
const emit = defineEmits(["tags", "tagsQuery"]);

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

/**
 * Applies and emits the default tags from the query parameters.
 *
 * The `tags` query parameter is expected to be a comma-separated string
 * (e.g. `tags=definition,electricity,ohm`). This method splits that string
 * into an array and assigns it to the parent component.
 *
 * This ensures that when a user lands on a page with tags in
 * the URL (e.g. `&tags=ohm,voltage`), the correct tags are pre-selected
 */
const applyDefaultsFromQuery = () => {
  const query = router.currentRoute.value.query;

  if (query.tags) {
    //preselect the default tags
    tags.value = query.tags
      .toString()
      .split(",")
      .map((t) => t.trim());

    emit("tags", tags.value);
    //emit the query parameters
    emit("tagsQuery", query.tags.toString());
  }
};
</script>

<style scoped lang="scss">
.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.15rem 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  cursor: text;
}

.tag-container .p-chip {
  border-radius: 16px;
  display: flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
}

.tag-container input {
  flex: 1;
  min-width: 120px;
  border: none;
  outline: none;
  padding: 0.25rem 0;
}
</style>
