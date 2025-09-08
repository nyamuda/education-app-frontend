<template>
  <div class="card mb-3 border-1 rounded-3 question-card">
    <div class="card-body">
      <!-- Stats (for large screens) -->
      <div
        class="d-none d-lg-flex flex-row flex-lg-column align-items-center align-items-lg-start justify-content-start mb-3 mb-lg-0 stats-panel"
      >
        <div class="me-4 me-lg-0 text-center mb-0 mb-lg-2">
          <span class="fw-bold fs-6">{{ answers }}</span>
          <div class="small text-muted">{{ answers == 1 ? "Answer" : "Answers" }}</div>
        </div>
        <div class="text-center">
          <span class="fw-bold fs-6">{{ upvotes }}</span>
          <div class="small text-muted">{{ answers == 1 ? "Upvote" : "Upvotes" }}</div>
        </div>
      </div>
      <!-- Stats (for small screens) -->
      <div class="d-flex justify-content-start align-items-center d-lg-none gap-3 mb-1">
        <div class="d-flex align-items-center gap-1">
          <span class="fs-6">{{ answers }}</span>
          <div class="small text-muted">{{ answers == 1 ? "Answer" : "Answers" }}</div>
        </div>
        <div class="d-flex align-items-center gap-1">
          <span class="fs-6">{{ upvotes }}</span>
          <div class="small text-muted">{{ answers == 1 ? "Upvote" : "Upvotes" }}</div>
        </div>
      </div>

      <!-- Main content -->
      <div>
        <!-- Title -->
        <!-- <h5 class="mb-2 fw-semibold text-primary cursor-pointer question-title">
          {{ title }}
        </h5> -->
        <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center mb-2">
          <!-- Title -->
          <h5 class="fw-semibold text-primary cursor-pointer mb-1 mb-md-0 flex-fill">
            {{ title }}
          </h5>

          <!-- Marks badge -->
          <Badge
            class="ms-md-2 mt-1 mt-md-0"
            :value="marks + marks == 1 ? ' mark' : ' marks'"
            severity="secondary"
            size=""
          />
        </div>

        <!-- Question content with marks badge -->
        <div class="mb-3">
          <p class="text-muted content-truncate">
            {{ content }}
          </p>
        </div>

        <!-- Tags -->
        <div class="mb-3">
          <a
            v-for="(tag, index) in tags?.slice(0, 5)"
            :key="index"
            href="#"
            class="badge rounded-pill bg-light text-dark border me-1 mb-1 text-decoration-none px-3 py-2"
          >
            #{{ tag }}
          </a>
        </div>

        <!-- Meta info -->
        <div class="d-flex flex-column justify-content-between small text-muted meta-info">
          <!-- Subject / Topic / Subtopic -->
          <div class="mb-2 d-flex align-items-center">
            <i class="pi pi-book me-2 text-muted"></i>
            <div>
              <span class="fw-semibold">{{ subject }}</span>

              <span v-if="topic"> › {{ topic }}</span>
              <span v-if="subtopic"> › {{ subtopic }}</span>
            </div>
          </div>

          <!-- Curriculum / Exam Board / Level -->
          <div class="mb-2 d-flex align-items-center">
            <i class="pi pi-graduation-cap me-2 text-muted"></i>
            <div>
              <span class="fw-semibold">{{ curriculum }}</span>
              <span v-if="examBoard"> ({{ examBoard }})</span>
              <span class="mx-2">•</span>
              <span>{{ level }}</span>
            </div>
          </div>

          <!-- Updated / Author (stacked on mobile) -->
          <div class="d-flex flex-column flex-md-row text-md-end text-muted">
            <!-- Updated -->
            <span class="mb-2 mb-md-0 d-flex align-items-center">
              <i class="pi pi-clock me-2"></i>
              <span>Updated {{ modified }}</span>
            </span>

            <span class="mx-md-2 d-none d-md-inline">•</span>

            <!-- Author -->
            <span class="d-flex align-items-center">
              <i class="pi pi-user me-1"></i>
              <span>
                <a href="#" class="fw-semibold text-primary text-decoration-none ms-1">
                  {{ username }}
                </a>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Tag } from "@/models/Tag";
import Badge from "primevue/badge";
import type { PropType } from "vue";
defineProps({
  curriculum: { type: String, required: true },
  examBoard: { type: String, required: false },
  level: { type: String, required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: false },
  subtopic: { type: String, required: false },
  title: { type: String, required: true },
  content: { type: String, required: true },
  marks: { type: Number, required: true },
  answers: { type: Number, required: true },
  upvotes: { type: Number, required: true },
  modified: { type: String, required: true },
  username: { type: String, required: true },
  tags: { type: Array as PropType<Tag[]>, required: false },
});
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
