<template>
  <FloatLabel variant="on">
    <IconField>
      <InputIcon class="pi pi-search" />
      <AutoComplete
        id="navbar-search"
        class="rounded-pill"
        v-model="questionStore.filter.search"
        :suggestions="items"
        option-label="contentText"
        @complete="search"
        fluid
      >
        <template #option="slotProps">
          <div class="d-flex flex-column">
            <!-- Question text -->
            <div class="fw-semibold small text-truncate">
              {{ slotProps.option.contentText }}
            </div>

            <!-- Meta details row -->
            <div class="text-muted small d-flex flex-wrap">
              <span class="me-1">{{
                slotProps.option.subject?.level?.examBoard?.curriculum?.name
              }}</span>
              <span class="me-1">•</span>
              <span class="me-1">{{ slotProps.option.subject?.level?.examBoard?.name }}</span>
              <span class="me-1">•</span>
              <span class="me-1">{{ slotProps.option.subject?.level?.name }}</span>
              <span class="me-1">•</span>
              <span>{{ slotProps.option.subject?.name }}</span>
            </div>
          </div>
        </template>
        <template #footer>
          <div class="d-flex justify-content-center py-2">
            <Button
              label="View all results"
              severity="secondary"
              variant="link"
              size=""
              icon="pi pi-arrow-right"
              iconPos="right"
            />
          </div>
        </template>
      </AutoComplete>
    </IconField>
    <label for="navbar-search">Search questions...</label>
  </FloatLabel>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AutoComplete from "primevue/autocomplete";
import FloatLabel from "primevue/floatlabel";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import { useQuestionStore } from "@/stores/question";
import type { Question } from "@/models/question";
import Button from "primevue/button";

const items = ref<Question[]>([]);
const questionStore = useQuestionStore();

const search = async (event: { query: string }) => {
  try {
    console.log(event.query);
    const questions = await questionStore.getQuestions(questionStore.filter.toQueryParams());
    items.value = questions.items;
  } catch {}
};
</script>
<style lang="scss" scoped></style>
