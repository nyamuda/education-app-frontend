<template>
  <!-- Label & helper message -->
  <div class="mb-2">
    <label v-if="label" class="editor-label">
      {{ label }}
    </label>
    <Message v-if="helperMessage" size="small" severity="secondary" variant="simple">{{
      helperMessage
    }}</Message>
  </div>
  <!-- Editor -->
  <Editor
    @text-change="(event: EditorTextChangeEvent) => onEditorTextChange(event)"
    v-model="v$.contentHtml.$model"
    :invalid="v$.contentHtml.$error"
    :placeholder="placeholder"
    editorStyle="height: 200px"
  >
    <template v-slot:toolbar>
      <span class="ql-formats">
        <select class="ql-header">
          <option selected></option>
          <option value="1"></option>
          <option value="2"></option>
          <option value="3"></option>
        </select>
      </span>

      <span class="ql-formats">
        <button v-tooltip.bottom="'Bold'" class="ql-bold"></button>
        <button v-tooltip.bottom="'Italic'" class="ql-italic"></button>
        <button v-tooltip.bottom="'Underline'" class="ql-underline"></button>
      </span>

      <span class="ql-formats">
        <select class="ql-color"></select>
        <select class="ql-background"></select>
      </span>

      <span class="ql-formats">
        <button class="ql-list" value="ordered" v-tooltip.bottom="'Numbered List'"></button>
        <button class="ql-list" value="bullet" v-tooltip.bottom="'Bulleted List'"></button>
      </span>
    </template>
  </Editor>

  <Message size="small" severity="error" v-if="v$.contentHtml.$error" variant="simple">
    <div v-for="error of v$.contentHtml.$errors" :key="error.$uid">
      <div>{{ error.$message }}</div>
    </div>
  </Message>
</template>

<script setup lang="ts">
import useVuelidate from "@vuelidate/core";
import { helpers, required } from "@vuelidate/validators";
import Editor, { type EditorTextChangeEvent } from "primevue/editor";
import { Message } from "primevue";
import { ref, type Ref } from "vue";

const props = defineProps({
  isContentRequired: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: "Enter content",
  },
  label: {
    type: String,
    default: "Editor",
  },
  helperMessage: {
    type: String,
    required: false,
  },
});

const emit = defineEmits(["contentHtml", "contentText"]);

//form validation start
const formData: Ref<{ contentHtml: string | undefined; contentText: string | undefined }> = ref({
  contentHtml: undefined,
  contentText: undefined,
});
const rules = {
  contentHtml: props.isContentRequired
    ? { required: helpers.withMessage("Content is required.", required) }
    : {},
  contentText: props.isContentRequired
    ? { required: helpers.withMessage("Content is required.", required) }
    : {},
};
const v$ = useVuelidate(rules, formData);
//form validation end

//Save the answer as plain text and HTML
const onEditorTextChange = (event: EditorTextChangeEvent) => {
  formData.value.contentHtml = event.htmlValue;
  formData.value.contentText = event.textValue;

  //Emit changes
  emit("contentHtml", event.htmlValue);
  emit("contentText", event.textValue);
};

const loadDefaultContent = (defaultContent: string | null | undefined) => {
  if (defaultContent) {
    formData.value.contentHtml = defaultContent;
  }
};
defineExpose({ loadDefaultContent });
</script>

<style scoped lang="scss">
.editor-label {
  font-weight: 500;
}
</style>
