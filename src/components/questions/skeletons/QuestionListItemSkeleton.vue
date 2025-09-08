<template>
  <div class="card mb-3 border-1 rounded-3 question-card">
    <div class="card-body">
      <!-- Stats (large screens) -->
      <div
        class="d-none d-lg-flex flex-row flex-lg-column align-items-center align-items-lg-start justify-content-start mb-3 mb-lg-0 stats-panel"
      >
        <div class="me-4 me-lg-0 text-center mb-0 mb-lg-2">
          <Skeleton width="3rem" height="1.2rem" class="mb-1" />
          <Skeleton width="4rem" height="0.8rem" />
        </div>
        <div class="text-center">
          <Skeleton width="3rem" height="1.2rem" class="mb-1" />
          <Skeleton width="4rem" height="0.8rem" />
        </div>
      </div>

      <!-- Stats (small screens) -->
      <div class="d-flex justify-content-start align-items-center d-lg-none gap-3 mb-2">
        <div>
          <Skeleton width="6rem" height="1.2rem" />
        </div>
        <div>
          <Skeleton width="6rem" height="1.2rem" />
        </div>
      </div>

      <!-- Main content -->
      <div>
        <!-- Title + Marks badge -->
        <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center mb-2">
          <Skeleton width="70%" height="1.5rem" class="mb-2 mb-md-0 flex-fill" />
          <Skeleton width="4rem" height="1.2rem" class="ms-md-2 mt-1 mt-md-0" />
        </div>

        <!-- Question content -->
        <div class="mb-3">
          <Skeleton width="100%" height="4rem" class="mb-1" />
          <!-- <Skeleton width="95%" height="1rem" class="mb-1" />
          <Skeleton width="90%" height="1rem" /> -->
        </div>

        <!-- Tags -->
        <div class="d-flex flex-wrap mb-3 gap-2">
          <Skeleton width="4rem" height="1.5rem" class="rounded-pill" />
          <Skeleton width="3.5rem" height="1.5rem" class="rounded-pill" />
          <Skeleton width="5rem" height="1.5rem" class="rounded-pill" />
          <Skeleton width="4rem" height="1.5rem" class="rounded-pill" />
        </div>

        <!-- Meta info -->
        <div class="d-flex flex-column justify-content-between small text-muted meta-info">
          <!-- Subject / Topic -->
          <div class="mb-2 d-flex align-items-center">
            <Skeleton width="20rem" height="1rem" />
          </div>

          <!-- Curriculum / Exam Board / Level -->
          <div class="mb-2 d-flex align-items-center">
            <Skeleton width="12rem" height="1rem" />
          </div>

          <!-- Updated / Author -->
          <div class="d-flex flex-column flex-md-row text-md-end">
            <Skeleton width="8rem" height="1rem" class="mb-2 mb-md-0" />
            <Skeleton width="6rem" height="1rem" class="ms-md-3" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Skeleton from "primevue/skeleton";
</script>
<style scoped lang="scss">
.text-primary {
  color: #1a73e8 !important;
}
.question-card {
  font-size: 0.95rem;
  line-height: 1.5;
}

.question-title {
  font-size: 1.05rem;
  line-height: 1.4;
}

.content-truncate {
  display: -webkit-box;
  -webkit-line-clamp: 3; /* limit to 3 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stats-panel {
  gap: 1rem;
}

@media (min-width: 992px) {
  .stats-panel {
    position: absolute;
    left: 1rem;
    top: 1rem;
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0.25rem;
  }

  .card-body {
    padding-left: 6rem; /* space for stats on desktop */
    position: relative;
  }
}
</style>
