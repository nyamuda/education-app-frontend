<template>
  <div class="">
    <form class="curriculum-form m-auto" @submit.prevent="submitForm">
      <TitleSection title="Add new curriculum" title-size="small" />

      <!-- Name input -->
      <div class="form-group mb-3">
        <FloatLabel variant="on">
          <InputText
            class="w-100"
            id="curriculumName"
            v-model="v$.name.$model"
            :invalid="v$.name.$error"
          />
          <label for="curriculumName">Curriculum name</label>
        </FloatLabel>
        <Message size="small" severity="error" v-if="v$.name.$error" variant="simple">
          <div v-for="error of v$.name.$errors" :key="error.$uid">
            <div>{{ error.$message }}</div>
          </div>
        </Message>
      </div>

      <!-- Submit button -->
      <Button
        fluid
        type="submit"
        :label="isCreatingCurriculum ? 'Please wait...' : 'Add curriculum'"
        icon="fas fa-plus"
        :loading="isCreatingCurriculum"
        :disabled="v$.$errors.length > 0 || isCreatingCurriculum"
        size="small"
        severity="primary"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";
import Button from "primevue/button";
import { Message } from "primevue";
//Vuelidate for login form validation
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";
import TitleSection from "../shared/TitleSection.vue";
import { useCurriculumStore } from "@/stores/curriculum";

// Access the store
const curriculumStore = useCurriculumStore();
const toast = useToast();
const router = useRouter();

onMounted(() => {
  v$.value.$touch();
});
const isCreatingCurriculum = ref(false);

//form validation with Vuelidate start
const formData = ref({
  name: "",
});

const rules = {
  name: { required },
};

const v$ = useVuelidate(rules, formData.value);
//form validation with Vuelidate end

const submitForm = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (isFormCorrect) {
    isCreatingCurriculum.value = true;
    curriculumStore
      .addCurriculum(formData.value)
      .then((message) => {
        toast.add({
          severity: "success",
          summary: "Success",
          detail: message,
          life: 5000,
        });
        router.push("/curriculums");
      })
      .catch((message) => {
        toast.add({
          severity: "error",
          summary: "Adding Curriculum Failed",
          detail: message,
          life: 10000,
        });
      })
      .finally(() => (isCreatingCurriculum.value = false));
  }
};
</script>

<style scoped>
a {
  text-decoration: none;
}
@media (min-width: 768px) {
  .curriculum-form {
    max-width: 30rem;
  }
}
</style>
