<template>
  <div class="">
    <Select
      id="topicTopic"
      :placeholder="isLoadingTopics ? 'Loading topics...' : placeholder"
      checkmark
      :options="topics"
      option-label="name"
      option-value="id"
      v-model="v$.topicId.$model"
      :invalid="v$.topicId.$error"
      class="w-100"
      :loading="isLoadingTopics"
      :disabled="isLoadingTopics"
      @change="onSelect"
      :size="size"
      :show-clear="showClear"
    />

    <Message size="small" severity="error" v-if="v$.topicId.$error" variant="simple">
      <div v-for="error of v$.topicId.$errors" :key="error.$uid">
        <div>{{ error.$message }}</div>
      </div>
    </Message>
  </div>
</template>

<script setup lang="ts">
import Select, { type SelectChangeEvent } from "primevue/select";
import { Topic } from "@/models/topic";
import { computed, onMounted, ref, toRef, watch, type PropType, type Ref } from "vue";
import { helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { Message } from "primevue";
import { useRouter } from "vue-router";

const props = defineProps({
  //placeholder text of the select input
  placeholder: {
    type: String,
    default: "Topic",
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

  //Topics to use as options
  topics: {
    type: Array as PropType<Topic[]>,
    required: false,
    default: new Array<Topic>(),
  },

  isLoadingTopics: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["change", "isLoading"]);
const router = useRouter();
// make topics reactive
const topics = toRef(props, "topics");

onMounted(() => {
  v$.value.$touch();
});

//select input validation start
const formData: Ref<{ topicId: number | null }> = ref({
  topicId: null,
});

const rules = computed(() => {
  if (props.isLoadingTopics || !props.isRequired) return { topicId: {} };
  return { topicId: { required: helpers.withMessage("Select topic", required) } };
});

const v$ = useVuelidate(rules, formData);
//select input validation end

const onSelect = async (event: SelectChangeEvent) => {
  //get and emit the selected topic
  const topic = props.topics.find((x) => x.id == event.value);

  emit("change", topic);
};

const resetSelectedValue = () => {
  formData.value.topicId = null;
};
//expose the `resetSelectedValue` method to call it in parent components
defineExpose({ resetSelectedValue });

/**
 * Applies the default value for topic if it was provided via query params.
 * This method is called once the list of topics is loaded.
 * This makes sure the correct option shows up in the select input instead of staying empty.
 */
const applyDefaultValue = () => {
  try {
    const query = router.currentRoute.value.query;
    const defaultTopicId = query.topicId ? Number(query.topicId) : null;
    if (defaultTopicId) {
      formData.value.topicId = defaultTopicId;

      //get and emit the default topic
      const topic = props.topics.find((x) => x.id == defaultTopicId);

      emit("change", topic);
    }
  } catch {}
};

/**
 * Watches the `topics` prop for changes.
 * Once the list of topics is populated (length > 0),
 * it triggers `applyDefaultValue()` to check if a default
 * topic ID was provided via query params and apply it.
 *
 * This ensures that when the topics are loaded asynchronously,
 * the select input correctly reflects the user’s previously selected
 * topic (from URL query params) instead of remaining empty.
 */
watch(
  topics,
  (val) => {
    if (val.length > 0) {
      applyDefaultValue();
    }
  },
  { deep: true },
);
</script>
