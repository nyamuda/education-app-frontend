<template>
  <form @submit.prevent="submitForm" class="">
    <h5 class="mb-2">Report qestion</h5>
    <p>
      Thanks for looking out for the community. Please let us know what’s wrong with this question
      so we can review it. Your report helps us maintain a helpful and respectful learning
      environment.
    </p>
    <!-- Flag Type using radio buttons with descriptions -->
    <div class="mb-3">
      <div v-for="option in flagOptions" :key="option.value" class="mb-3">
        <!-- Radio button + label on one row -->
        <div class="d-flex align-items-center gap-2">
          <RadioButton
            v-model="v$.flagType.$model"
            :inputId="option.value"
            name="flagType"
            :value="option.value"
          />
          <label :for="option.value" class="fw-semibold">
            {{ option.label }}
          </label>
        </div>

        <!-- Description on its own row, indented -->
        <div class="text-muted small ms-0">
          {{ option.description }}
        </div>
      </div>

      <div v-if="v$.flagType.$error" class="text-danger small mt-1">Please select a reason.</div>
    </div>

    <!-- Other Reason -->
    <div v-if="formData.flagType === QuestionFlagType.Other" class="mb-3">
      <label class="form-label">Please describe</label>
      <Textarea v-model="formData.otherReason" rows="3" autoResize class="w-100" />
      <div v-if="v$.otherReason.$error" class="text-danger small mt-1">
        Please provide a reason.
      </div>
    </div>

    <!-- Submit -->
    <Button type="submit" label="Submit" class="mt-2" />
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import { QuestionFlagType } from "@/enums/flags/questionFlagType";
import RadioButton from "primevue/radiobutton";

// Options for radio buttons with descriptions
const flagOptions = [
  {
    label: "Spam",
    value: QuestionFlagType.Spam,
    description: "Promotional content, irrelevant links, or advertisements.",
  },
  {
    label: "Offensive",
    value: QuestionFlagType.Offensive,
    description: "Contains abusive, hateful, or inappropriate content.",
  },

  {
    label: "Irrelevant",
    value: QuestionFlagType.Irrelevant,
    description: "Not relevant to the topic or subject of this platform.",
  },
  {
    label: "Other",
    value: QuestionFlagType.Other,
    description: "Doesn't fit any of the above categories.",
  },
];

const formData = ref({
  flagType: "" as QuestionFlagType | "",
  otherReason: "",
});

// Validation rules
const rules = {
  flagType: { required },
  otherReason: () =>
    formData.value.flagType == QuestionFlagType.Other
      ? {
          required: helpers.withMessage("Please provide a reason.", required),
        }
      : {},
};

const v$ = useVuelidate(rules, formData);

async function submitForm() {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  alert("Flag submitted successfully!");
}
</script>

<style scoped>
.form-check .text-muted {
  margin-left: 1.5rem;
}
</style>
