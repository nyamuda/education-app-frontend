<template>
  <div class="">
    <Select
      id="levelLevel"
      :placeholder="isGettingLevels ? 'Loading levels...' : placeholder"
      checkmark
      :options="levels"
      option-label="name"
      option-value="id"
      v-model="v$.levelId.$model"
      :invalid="v$.levelId.$error"
      class="w-100"
      :loading="isGettingLevels"
      :disabled="isGettingLevels"
      @change="onSelect"
      :size="size"
      :show-clear="showClear"
    />

    <Message size="small" severity="error" v-if="v$.levelId.$error" variant="simple">
      <div v-for="error of v$.levelId.$errors" :key="error.$uid">
        <div>{{ error.$message }}</div>
      </div>
    </Message>
  </div>
</template>

<script setup lang="ts">
import Select, { type SelectChangeEvent } from "primevue/select";
import { Level } from "@/models/level";
import { computed, onMounted, ref, type PropType, type Ref } from "vue";
import { helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { Message } from "primevue";

const props = defineProps({
  //placeholder text of the select input
  placeholder: {
    type: String,
    default: "Level",
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

  //Levels to use as options
  levels: {
    type: [] as PropType<Level[]>,
    required: false,
    default: [],
  },
  isGettingLevels: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["change", "isLoading"]);

onMounted(() => {
  v$.value.$touch();
});


//select input validation start
const formData: Ref<{ levelId: number | null }> = ref({
  levelId: null,
});

const rules = computed(() => {
  if (props.isGettingLevels || !props.isRequired) return { levelId: {} };
  return { levelId: { required: helpers.withMessage("Select level", required) } };
});

const v$ = useVuelidate(rules, formData);
//select input validation end

const onSelect = async (event: SelectChangeEvent) => {
  //get and emit the selected level
  const level = props.levels.find((x) => x.id == event.value);

  emit("change", level);
};

const resetSelectedValue = () => {
  formData.value.levelId = null;
};
//expose the `resetSelectedValue` method to call it in parent components
defineExpose({ resetSelectedValue });


</script>
