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
            @change="() => onChange(option.value)"
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
    </div>

    <!-- Other Reason -->
    <div v-if="formData.flagType === QuestionFlagType.Other" class="mb-3">
      <FloatLabel variant="on">
        <Textarea
          v-model="v$.otherReason.$model"
          :invalid="v$.otherReason.$error"
          rows="3"
          autoResize
          class="w-100"
          id="otherReasonQuestionFlag"
        />
        <label for="otherReasonQuestionFlag">Describe the issue</label>
      </FloatLabel>
      <Message size="small" severity="error" v-if="v$.otherReason.$error" variant="simple">
        <div v-for="error of v$.otherReason.$errors" :key="error.$uid">
          <div>{{ error.$message }}</div>
        </div>
      </Message>
    </div>

    <!-- Submit -->
    <Button type="submit" label="Submit" size="small" />
  </form>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers, requiredIf } from "@vuelidate/validators";
import Button from "primevue/button";
import { QuestionFlagType } from "@/enums/flags/questionFlagType";
import RadioButton from "primevue/radiobutton";
import Message from "primevue/message";
import Textarea from "primevue/textarea";
import FloatLabel from "primevue/floatlabel";

onMounted(() => {
  v$.value.$touch();
});

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

const formData: Ref<{ flagType: QuestionFlagType | null; otherReason: string | null }> = ref({
  flagType: null,
  otherReason: null,
});

// Validation rules

const rules = computed(() => ({
  flagType: { required },
  otherReason: {
    required: helpers.withMessage(
      "Please enter a short explanation of the problem.",
      requiredIf(() => formData.value.flagType === QuestionFlagType.Other),
    ),
  },
}));

const v$ = useVuelidate(rules, formData);

async function submitForm() {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  alert("Flag submitted successfully!");
}

const onChange = (flagType: QuestionFlagType) => {
  if (flagType == QuestionFlagType.Other) v$.value.$touch();
  return;
};
</script>

<style scoped>
.form-check .text-muted {
  margin-left: 1.5rem;
}
</style>
