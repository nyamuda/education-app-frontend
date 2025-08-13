<template>
  <FloatLabel variant="on">
    <IconField>
      <InputIcon class="pi pi-search" />
      <AutoComplete
        id="navbar-search"
        class="rounded-pill"
        v-model="value"
        :suggestions="items"
        @complete="search"
        fluid
    /></IconField>
    <label for="navbar-search">Search questions...</label>
  </FloatLabel>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AutoComplete from "primevue/autocomplete";
import FloatLabel from "primevue/floatlabel";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";

const value = ref<string | null>(null);
const items = ref<string[]>([]);

const search = (event: { query: string }) => {
  items.value = Array.from({ length: 10 }, (_, i) => `${event.query}-${i}`);
};
</script>
<style lang="scss" scoped></style>
