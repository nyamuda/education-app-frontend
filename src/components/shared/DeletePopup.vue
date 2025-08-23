<template>
  <div>
    <!--Delete Button-->
    <Button
      class="no-wrap-btn"
      severity="danger"
      :label="isDeletingItem ? 'Deleting...' : buttonLabel"
      size="small"
      icon="pi pi-trash"
      @click="confirmDelete"
      :loading="isDeletingItem"
      :variant="buttonVariant"
      fluid
    />
    <ConfirmPopup></ConfirmPopup>
  </div>
</template>

<script setup lang="ts">
import { useConfirm } from "primevue";
import ConfirmPopup from "primevue/confirmpopup";
import Button from "primevue/button";

const props = defineProps({
  title: {
    type: String,
    default: "Confirm Deletion",
  },
  message: {
    type: String,
    default: "Are you sure you want to delete this item?",
  },
  buttonLabel: {
    type: String,
    default: "Delete",
  },
  buttonVariant: {
    type: String,
    default: "",
  },
  //Method that will be called when the delete action is confirmed
  deleteCallback: {
    type: Function,
    required: true,
  },
  //Whether the delete process is in progress or not.
  //Used to show the button loader
  isDeletingItem: {
    type: Boolean,
    default: false,
  },
});

const confirm = useConfirm();
const confirmDelete = () => {
  confirm.require({
    message: props.message,
    header: props.title,
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      icon: "pi pi-times",
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      icon: "pi pi-trash",
      label: "Delete",
      severity: "danger",
    },
    accept: () => {
      props.deleteCallback();
    },
    reject: () => {},
  });
};
</script>
