<template>
  <div>
    <Button
      label="124"
      :icon="isUpvoted ? 'pi pi-sort-up-fill' : 'pi pi-sort-up'"
      @click="() => (isUpvoted = !isUpvoted)"
      :severity="isUpvoted ? 'primary' : 'secondary'"
      size="small"
      variant="text"
      class="action-btn"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Button from "primevue/button";

const isUpvoted = ref(true);
</script>

<style scoped lang="scss"></style>
