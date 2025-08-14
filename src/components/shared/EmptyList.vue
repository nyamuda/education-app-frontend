<template>
  <div class="text-center mt-4">
    <i :class="[iconType]" style="font-size: 4rem"></i>
    <h5 class="mt-2 fs-2">{{ title }}</h5>
    <p class="mt-3 text-muted">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: { type: String, default: "Nothing here yet" },
  message: { type: String, default: "No items found." },
  iconType: { type: String, default: "pi pi-inbox" },
});
</script>
