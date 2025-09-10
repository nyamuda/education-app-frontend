<template>
  <div class="">
    <Select
      editable
      id="subjectSubject"
      :placeholder="isLoadingSubjects ? 'Loading subjects...' : placeholder"
      checkmark
      :options="subjects"
      option-label="name"
      option-value="id"
      v-model="v$.subjectId.$model"
      :invalid="v$.subjectId.$error"
      class="w-100"
      :loading="isLoadingSubjects"
      :disabled="isLoadingSubjects"
      @change="onSelect"
      :size="size"
      :show-clear="showClear"
    />

    <Message size="small" severity="error" v-if="v$.subjectId.$error" variant="simple">
      <div v-for="error of v$.subjectId.$errors" :key="error.$uid">
        <div>{{ error.$message }}</div>
      </div>
    </Message>
  </div>
</template>

<script setup lang="ts">
import Select, { type SelectChangeEvent } from "primevue/select";
import { Subject } from "@/models/subject";
import { computed, onMounted, ref, type PropType, type Ref } from "vue";
import { helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { Message } from "primevue";

const props = defineProps({
  //placeholder text of the select input
  placeholder: {
    type: String,
    default: "Subject",
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

  //Subjects to use as options
  subjects: {
    type: Array as PropType<Subject[]>,
    required: false,
    default: new Array<Subject>(),
  },
  //ID of the default subject(if any)
  defaultSubjectId: {
    type: Number,
    required: false,
  },

  isLoadingSubjects: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["change", "isLoading"]);

onMounted(() => {
  v$.value.$touch();
});

//select input validation start
const formData: Ref<{ subjectId: number | null }> = ref({
  subjectId: null,
});

const rules = computed(() => {
  if (props.isLoadingSubjects || !props.isRequired) return { subjectId: {} };
  return { subjectId: { required: helpers.withMessage("Select subject", required) } };
});

const v$ = useVuelidate(rules, formData);
//select input validation end

const onSelect = async (event: SelectChangeEvent) => {
  //get and emit the selected subject
  const subject = props.subjects.find((x) => x.id == event.value);

  emit("change", subject);
};

const resetSelectedValue = () => {
  formData.value.subjectId = null;
};
//expose the `resetSelectedValue` method to call it in parent componentsrea
defineExpose({ resetSelectedValue });
</script>
