<template>
  <Button
    @click="confirmDelete"
    severity="danger"
    :label="isDeleting ? 'Deleting...' : buttonLabel"
    size="small"
    icon="pi pi-trash"
    :loading="isDeleting"
    :disabled="isDeleting || isDisabled"
  />
  <ConfirmDialog group="deleteItem"></ConfirmDialog>
</template>

<script setup lang="ts">
import { useConfirm } from "primevue";
import Button from "primevue/button";
import ConfirmDialog from "primevue/confirmdialog";

const confirm = useConfirm();

const props = defineProps({
  title: {
    type: String,
    default: "Delete",
  },
  message: {
    type: String,
    default: "Do you want to delete this item?",
  },
  //label of the delete button
  buttonLabel: {
    type: String,
    default: "Delete",
  },
  //label of the confirm delete button in the confirmation modal
  buttonAcceptLabel: {
    type: String,
    default: "Delete",
  },
  buttonRejectLabel: {
    type: String,
    default: "Cancel",
  },
  //used to show the loader
  isDeleting: {
    type: Boolean,
    default: false,
  },

  isDisabled: {
    type: Boolean,
    default: false,
  },
  //callback to call if the delete is confirmed
  deleteCallback: {
    type: Function,
    required: true,
  },
});

const confirmDelete = () => {
  confirm.require({
    group: "deleteItem",
    message: props.message,
    header: props.title,
    icon: "pi pi-info-circle",
    position: "right",
    rejectProps: {
      label: props.buttonRejectLabel,
      severity: "secondary",
      icon: "pi pi-times",
      outlined: true,
      size: "small",
    },
    acceptProps: {
      label: props.buttonAcceptLabel,
      icon: "pi pi-trash",
      severity: "danger",
      size: "small",
    },
    accept: () => {
      props.deleteCallback();
    },
    reject: () => {},
  });
};
</script>
