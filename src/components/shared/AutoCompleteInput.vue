<template>
  <IconField>
    <InputIcon class="pi pi-search" />
    <AutoComplete
      id="navbar-search"
      v-model="questionStore.filter.search"
      placeholder="Search questions..."
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
            @click="viewAllResults"
          />
        </div>
      </template>
    </AutoComplete>
  </IconField>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AutoComplete from "primevue/autocomplete";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import { useQuestionStore } from "@/stores/question";
import type { Question } from "@/models/question";
import Button from "primevue/button";
import { useRouter } from "vue-router";

const items = ref<Question[]>([]);
const questionStore = useQuestionStore();
const router = useRouter();

const search = async (event: { query: string }) => {
  try {
    console.log(event.query);
    const questions = await questionStore.getQuestions(questionStore.filter.toQueryParams());
    items.value = questions.items;
  } catch {}
};

const viewAllResults = () => {
  //update the browser URL with the search input as a query param
  questionStore.filter.applyFilterToBrowserUrl();
};
</script>
<style lang="scss" scoped>
.text-truncate {
  display: -webkit-box;
  -webkit-line-clamp: 3; /* limit to 3 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
