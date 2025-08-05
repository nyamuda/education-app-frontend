<template>
  <div :class="alignItemsClass + ' d-flex flex-column'" style="margin-bottom: -0.5rem">
    <p class="fs-4 text-capitalize mb-0 text-primary">{{ subtitle }}</p>
    <h2 :class="classObject">{{ title }}</h2>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps({
  title: {
    type: String,
  },
  subtitle: {
    type: String,
  },
  alignItems: {
    type: String,
    default: "start",
  },
  titleSize: {
    type: String,
    default: "medium",
  },
});

const classObject = computed(() => {
  return {
    "h2 fw-bold mb-4 text-secondary": props.titleSize == "small",
    "h1 fw-bold mb-4 text-secondary": props.titleSize == "normal" || props.titleSize == "medium",
    "display-5 fw-bold mb-4 text-secondary": props.titleSize == "large",
  };
});

//Class to use to align the items
const alignItemsClass = computed(() => {
  if (props.alignItems == "center") {
    return "align-items-center";
  } else if (props.alignItems == "end") {
    return "align-items-end";
  } else {
    return "align-items-start";
  }
});
</script>
