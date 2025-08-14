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
          <form class="" @submit.prevent="submitForm">
            <div class="text-start">
              <TitleSection title="Sign into your account" title-size="small" align-items="start" />
            </div>
            <Message
              v-if="loginErrorMessage"
              severity="error"
              icon="pi pi-times-circle"
              class="mb-3"
              >{{ loginErrorMessage }}</Message
            >
            <!-- Email input -->
            <div class="form-group mb-3">
              <FloatLabel variant="on">
                <IconField>
                  <InputIcon class="pi pi-envelope" />
                  <InputText
                    id="loginEmail"
                    class="w-100"
                    v-model="v$.email.$model"
                    :invalid="v$.email.$error"
                    type="email"
                  />
                </IconField>
                <label for="loginEmail">Email</label>
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
                  <Password
                    fluid
                    id="loginPassword"
                    v-model="v$.password.$model"
                    :invalid="v$.password.$error"
                    type="password"
                    toggle-mask
                    :feedback="false"
                  />
                </IconField>
                <label for="loginPassword">Password</label>
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
              :label="isLoggingIn ? 'One moment...' : 'Sign in'"
              :loading="isLoggingIn"
              :disabled="v$.$errors.length > 0 || isLoggingIn"
            />

            <!-- Register button -->
            <div class="text-start">
              <div class="d-flex justify-content-start mb-2">
                <!-- Simple link -->
                <router-link to="/auth/password-reset/request">Forgot password?</router-link>
              </div>
              <p>
                Don't have an account?
                <router-link to="/auth/register">Register here</router-link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from "vue";
import { useAuthStore } from "@/stores/auth";
//import OauthBooking from "./OauthBooking.vue";
import { useVuelidate } from "@vuelidate/core";
import { required, email, helpers } from "@vuelidate/validators";
import { Message, Password } from "primevue";
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";
import TitleSection from "../shared/TitleSection.vue";
import Button from "primevue/button";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
  v$.value.$touch();
});

const isLoggingIn = ref(false);
//Used when login fails due to invalid credentials
const loginErrorMessage: Ref<string | null> = ref(null);

//form validation with Vuelidate start
const loginForm = ref({
  email: "",
  password: "",
});
const passwordRule = helpers.regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/);
const passwordErrorMessage =
  "Password must be at least 8 characters long and contain a mix of letters, numbers, and special characters";
const rules = {
  email: { required, email },
  password: {
    required,
    passwordRule: helpers.withMessage(passwordErrorMessage, passwordRule),
  },
};

const v$ = useVuelidate(rules, loginForm.value);
//form validation with Vuelidate end

const submitForm = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (isFormCorrect) {
    isLoggingIn.value = true;
    authStore
      .login(loginForm.value)
      .then(({ isVerified, email }) => {
        //if user has been verified
        if (isVerified) {
          router.push(authStore.attemptedUrl);
        }
        //else send an email verification request
        else {
          sendEmailVerificationRequest(email);
        }
      })
      .catch((message) => {
        loginErrorMessage.value = message;
      })
      .finally(() => (isLoggingIn.value = false));
  }
};

// Attempts to send an email verification code after successful login
// if the user is not verified.
const sendEmailVerificationRequest = (email: string) => {
  authStore
    .requestEmailVerification(email)
    .then(() => router.push("/auth/email-verification/request"))
    .catch(() => {});
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
