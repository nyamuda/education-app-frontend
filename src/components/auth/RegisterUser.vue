<template>
  <div style="margin-top: 5rem">
    <div class="container h-100">
      <div class="row d-flex align-items-center justify-content-center h-100">
        <div class="col-md-8 col-lg-7 col-xl-6">
          <img
            src="https://plus.unsplash.com/premium_vector-1683121997647-bcc424b7ecd6?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            class="img-fluid"
            alt="Phone image"
          />
        </div>
        <div class="col-md-7 col-lg-5 col-xl-5 offset-xl-1">
          <form @submit.prevent="submitForm" class="">
            <div class="text-start mb-2">
              <TitleSection title="Create an account" title-size="small" align-items="start" />
            </div>
            <!-- Name input -->
            <div class="form-group mb-3">
              <FloatLabel variant="on">
                <IconField>
                  <InputIcon class="pi pi-user" />
                  <InputText
                    fluid
                    id="registerName"
                    v-model="v$.name.$model"
                    :invalid="v$.name.$error"
                  />
                </IconField>
                <label for="registerName">Name</label>
              </FloatLabel>
              <Message size="small" severity="error" v-if="v$.name.$error" variant="simple">
                <div v-for="error of v$.name.$errors" :key="error.$uid">
                  <div>{{ error.$message }}</div>
                </div>
              </Message>
            </div>

            <!-- Email input -->
            <div class="form-group mb-3">
              <FloatLabel variant="on">
                <IconField>
                  <InputIcon class="pi pi-envelope" />
                  <InputText
                    id="registerEmail"
                    class="w-100"
                    v-model="v$.email.$model"
                    :invalid="v$.email.$error"
                    type="email"
                  />
                </IconField>
                <label for="registerEmail">Email</label>
              </FloatLabel>
              <Message size="small" severity="error" v-if="v$.email.$error" variant="simple">
                <div v-for="error of v$.email.$errors" :key="error.$uid">
                  <div>{{ error.$message }}</div>
                </div>
              </Message>
            </div>

            <!-- Password input -->
            <div class="form-group mb-3">
              <FloatLabel variant="on">
                <IconField>
                  <InputIcon class="pi pi-lock" />
                  <InputText
                    fluid
                    id="registerPassword"
                    v-model="v$.password.$model"
                    :invalid="v$.password.$error"
                    type="password"
                  />
                </IconField>
                <label for="registerPassword">Password</label>
              </FloatLabel>
              <Message size="small" severity="error" v-if="v$.password.$error" variant="simple">
                <div v-for="error of v$.password.$errors" :key="error.$uid">
                  <div>{{ error.$message }}</div>
                </div>
              </Message>
            </div>

            <!-- Submit button -->
            <Button
              fluid
              class="mb-2"
              size="small"
              type="submit"
              severity="primary"
              :label="isRegistering ? 'Creating account...' : 'Sign up'"
              :loading="isRegistering"
              :disabled="v$.$errors.length > 0 || isRegistering"
            />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useVuelidate } from "@vuelidate/core";
import { required, email, helpers, minLength } from "@vuelidate/validators";
import { Message } from "primevue";
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";
import Button from "primevue/button";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import TitleSection from "@/components/shared/TitleSection.vue";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";

// Access the store
const authStore = useAuthStore();
const toast = useToast();
const router = useRouter();

onMounted(() => {
  v$.value.$touch();
});

const isRegistering = ref(false);

//form validation start
const registrationForm = ref({
  name: "",
  email: "",
  password: "",
  curriculumId: 0,
  examBoardId: 0,
});
const passwordRule = helpers.regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/);
const passwordErrorMessage =
  "Password must be at least 8 characters long and contain a mix of letters, numbers, and special characters";

const rules = {
  name: { required, minLengthValue: minLength(3) },
  email: { required, email },
  password: {
    required,
    passwordRule: helpers.withMessage(passwordErrorMessage, passwordRule),
  },
};
const v$ = useVuelidate(rules, registrationForm);
//form validation end

const submitForm = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (isFormCorrect) {
    isRegistering.value = true;
    authStore
      .register(registrationForm.value)
      .then(() => {
        router.push("/auth/email-verification/request");
      })
      .catch((message) => {
        toast.add({
          severity: "error",
          summary: "Registration Failed",
          detail: message,
          life: 20000,
        });
      })
      .finally(() => (isRegistering.value = false));
  }
};
</script>

<style scoped lang="scss">
a {
  text-decoration: none;
}
@media (min-width: 768px) {
  .login-form {
    max-width: 30rem;
  }
}
</style>
