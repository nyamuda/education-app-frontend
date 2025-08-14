<template>
  <div>
    <!--Delete Button-->
    <Button
      severity="danger"
      label="Delete"
      size="small"
      icon="pi pi-trash"
      @click="confirmDelete"
    />
    <ConfirmPopup></ConfirmPopup>
  </div>
</template>

<script setup lang="ts">
import { useConfirm } from "primevue";
import ConfirmPopup from "primevue/confirmpopup";

const props = defineProps({
  title: {
    type: String,
    default: "Confirm Deletion",
  },
  message: {
    type: String,
    default: "Are you sure you want to delete this item?",
  },
  //Method that will be called when the delete action is confirmed
  deleteCallback: {
    type: Function,
    required: true,
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
