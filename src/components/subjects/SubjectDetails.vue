<template>
  <div class="">
    <SubjectDetailsSkeleton v-if="isGettingSubject" />

    <Card v-else-if="subject">
      <template #title>
        <h6><Chip label="Subject" /></h6>
        <h2 class="mb-2">{{ subject.name }}</h2>
      </template>
      <template #subtitle
        ><h5 class="text-muted mb-3">
          Curriculum: <strong>{{ subject.level?.examBoard?.curriculum?.name }}</strong>
        </h5>
        <h5 class="text-muted mb-3">
          Exam board: <strong>{{ subject.level?.examBoard?.name }}</strong>
        </h5>
        <h5 class="text-muted mb-3">
          Level: <strong>{{ subject.level?.name }}</strong>
        </h5>
      </template>
      <template #content>
        <h5>Topics:</h5>
        <div class="d-flex flex-wrap gap-2">
          <span v-for="topic in subject.topics" :key="topic.id" class="badge bg-primary">
            {{ topic.name }}
          </span>
        </div>
      </template>
      <template #footer>
        <div class="row justify-content-md-end mt-1 g-2">
          <!-- Edit button -->
          <div class="col-6 col-md-3 col-lg-2">
            <router-link :to="'/subjects/' + subject.id + '/edit'">
              <Button
                label="Edit"
                severity="contrast"
                variant="outlined"
                size="small"
                icon="pi pi-pencil"
                class="no-wrap-btn me-2"
                fluid
            /></router-link>
          </div>
          <!-- Delete button -->
          <div class="col-6 col-md-3 col-lg-2">
            <DeletePopup
              :delete-callback="deleteSubject"
              :is-deleting-item="deletingSubject.inProgress"
              title="Are You Sure?"
              message="Deleting this subject is permanent. Proceed?"
            />
          </div>
        </div>
      </template>
    </Card>
    <ItemNotFound
      v-else
      title="Subject Not Found"
      message="The subject you are looking for does not exist or may have been removed."
    />
  </div>
</template>

<script setup lang="ts">
import { Subject } from "@/models/subject";
import { useSubjectStore } from "@/stores/subject";
import { useToast } from "primevue";
import { onMounted, ref, type Ref } from "vue";
import { useRouter } from "vue-router";
import ItemNotFound from "../shared/ItemNotFound.vue";
import Button from "primevue/button";
import DeletePopup from "../shared/DeletePopup.vue";
import Card from "primevue/card";
import { DeletionState } from "@/models/deletionState";
import SubjectDetailsSkeleton from "./skeletons/SubjectDetailsSkeleton.vue";
import Chip from "primevue/chip";

const subjectStore = useSubjectStore();
const toast = useToast();
const router = useRouter();

const subject: Ref<Subject | null> = ref(null);
const subjectId: Ref<number | null> = ref(null);
const deletingSubject = ref(new DeletionState());
const isGettingSubject = ref(false);

onMounted(() => {
  //scroll up to the top of the page
  window.scrollTo(0, 0);

  //get the subject ID from a query parameter
  const id = router.currentRoute.value.params["id"];

  //fetch subject with the given ID from the backend
  if (id) {
    subjectId.value = Number(id);
    getSubjectById(subjectId.value);
  }
});

//fetch a subject with a given ID
const getSubjectById = (id: number) => {
  isGettingSubject.value = true;
  subjectStore
    .getSubjectById(id)
    .then((data) => {
      subject.value = data;
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Fetch Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (isGettingSubject.value = false));
};

//Delete a subject with a given ID
const deleteSubject = () => {
  const id = subjectId.value;
  if (!id) return;
  deletingSubject.value = { id, inProgress: true };
  subjectStore
    .deleteSubject(id)
    .then(() => {
      toast.add({
        severity: "success",
        summary: "Done",
        detail: "The subject was successfully deleted.",
        life: 5000,
      });
      router.push("/subjects");
    })
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Delete Failed",
        detail: message,
        life: 10000,
      });
    })
    .finally(() => (deletingSubject.value.inProgress = false));
};
</script>
