<template>
  <div class="d-flex flex-column min-vh-100">
    <header>
      <NavBarItem />
    </header>
    <main class="flex-grow-1">
      <RouterView />
      <Toast position="top-center" />
    </main>
    <FooterItem />
  </div>
</template>

<script setup lang="ts">
import FooterItem from "./components/layout/FooterItem.vue";
import NavBarItem from "./components/layout/NavBarItem.vue";
import Toast from "primevue/toast";
</script>
