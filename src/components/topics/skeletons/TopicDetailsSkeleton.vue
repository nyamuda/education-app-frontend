<template>
  <div>
    <Card>
      <template #title>
        <!-- Skeleton for chip -->
        <Skeleton width="30%" height="1.7rem" class="mb-2" />
        <!-- Skeleton for title -->
        <Skeleton width="60%" height="2.5rem" class="mb-2" />
      </template>

      <template #subtitle>
        <!-- Skeleton for curriculum, exam board, level etc -->
        <Skeleton width="70%" height="7rem" class="mb-3" />
      </template>

      <template #content>
        <!-- Skeleton heading -->
        <Skeleton width="40%" height="2rem" class="mb-2" />
        <!-- Skeleton badges -->
        <div class="d-flex flex-wrap gap-2">
          <Skeleton v-for="n in 12" :key="n" width="60px" height="28px" class="rounded" />
        </div>
      </template>

      <template #footer>
        <div class="row justify-content-md-end mt-1 g-2">
          <!-- Skeleton buttons -->
          <div class="col-6 col-md-3 col-lg-2">
            <Skeleton width="100%" height="2.5rem" />
          </div>
          <div class="col-6 col-md-3 col-lg-2">
            <Skeleton width="100%" height="2.5rem" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>
<script setup lang="ts">
import Card from "primevue/card";
import Skeleton from "primevue/skeleton";
</script>
