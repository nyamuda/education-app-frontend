<template>
  <div class="text-center">
    <i class="pi pi-exclamation-triangle mb-3 text-primary" style="font-size: 4rem"></i>
    <h2 class="text-secondary fw-bold">{{ title }}</h2>
    <p class="text-muted m-auto col-md-5">{{ message }}</p>
    <Button
      class="mt-3"
      label="Go Back"
      icon="pi pi-arrow-left"
      severity="primary"
      variant=""
      size="small"
      @click="goBack"
    />
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import { defineProps } from "vue";
import { useRouter } from "vue-router";

// Define the props for title and message
defineProps({
  title: {
    type: String,
    default: "Item Not Found",
  },
  message: {
    type: String,
    default: "The requested item could not be found.",
  },
});

// Router for navigation
const router = useRouter();

// Go back backward
const goBack = () => router.go(-1);
</script>
