<template>
  <div class="">
    <Select
      id="subtopicSubtopic"
      :placeholder="isLoadingSubtopics ? 'Loading subtopics...' : placeholder"
      checkmark
      :options="subtopics"
      option-label="name"
      option-value="id"
      v-model="v$.subtopicId.$model"
      :invalid="v$.subtopicId.$error"
      class="w-100"
      :loading="isLoadingSubtopics"
      :disabled="isLoadingSubtopics"
      @change="onSelect"
      :size="size"
      :show-clear="showClear"
    />

    <Message size="small" severity="error" v-if="v$.subtopicId.$error" variant="simple">
      <div v-for="error of v$.subtopicId.$errors" :key="error.$uid">
        <div>{{ error.$message }}</div>
      </div>
    </Message>
  </div>
</template>

<script setup lang="ts">
import Select, { type SelectChangeEvent } from "primevue/select";
import { Subtopic } from "@/models/subtopic";
import { computed, onMounted, ref, type PropType, type Ref } from "vue";
import { helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { Message } from "primevue";

const props = defineProps({
  //placeholder text of the select input
  placeholder: {
    type: String,
    default: "Subtopic",
  },
  //size of the select input
  size: {
    type: String,
    default: "small",
  },
  //whether or not to show a clear icon that resets the select input
  showClear: {
    type: Boolean,
    default: true,
  },

  //whether the input value is required or not
  //controls whether to show error messages or not
  isRequired: {
    type: Boolean,
    default: false,
  },

  //Subtopics to use as options
  subtopics: {
    type: Array as PropType<Subtopic[]>,
    required: false,
    default: new Array<Subtopic>(),
  },

  isLoadingSubtopics: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["change", "isLoading"]);

onMounted(() => {
  v$.value.$touch();
});

//select input validation start
const formData: Ref<{ subtopicId: number | null }> = ref({
  subtopicId: null,
});

const rules = computed(() => {
  if (props.isLoadingSubtopics || !props.isRequired) return { subtopicId: {} };
  return { subtopicId: { required: helpers.withMessage("Select subtopic", required) } };
});

const v$ = useVuelidate(rules, formData);
//select input validation end

const onSelect = async (event: SelectChangeEvent) => {
  //get and emit the selected subtopic
  const subtopic = props.subtopics.find((x) => x.id == event.value);

  emit("change", subtopic);
};

const resetSelectedValue = () => {
  formData.value.subtopicId = null;
};

/**
 * Applies the default value for subtopic if it was provided via query params.
 * This method is called once the list of subtopics is loaded.
 * This makes sure the correct option shows up in the select input instead of staying empty.
 */
const applyDefaultValue = (defaultSubtopicId: number | null) => {
  try {
    formData.value.subtopicId = defaultSubtopicId;
  } catch {}
};

//expose methods to call in parent components
defineExpose({ resetSelectedValue, applyDefaultValue });
</script>
