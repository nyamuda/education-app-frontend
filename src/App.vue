<template>
  <header>
    <NavBarItem />
  </header>

  <RouterView />
</template>

<script setup lang="ts">
import NavBarItem from "./components/layout/NavBarItem.vue";
</script>
