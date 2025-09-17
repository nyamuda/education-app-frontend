<template>
  <div class="">
    <Button icon="pi pi-sliders-h" @click="toggle" variant="text" severity="contrast" />
    <Popover ref="op">
      <slot name="content"></slot>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import Popover from "primevue/popover";

import Button from "primevue/button";

import { ref } from "vue";

const op = ref();

const toggle = (event: MouseEvent) => {
  op.value.toggle(event);
};

defineExpose({ toggle });
</script>
