<template>
  <div class="mt-5 py-4">
    <!--If the reset link has expired-->
    <div v-if="hasTokenExpiredOrIsInvalid" class="d-flex justify-content-center align-items-center">
      <div class="d-flex align-items-center gap-3">
        <i class="pi pi-exclamation-triangle text-danger" style="font-size: 6rem"></i>
        <div class="d-flex flex-column align-items=start">
          <h4 class="text-danger">Your Reset Link Has Expired</h4>
          <p class="text-muted">The password reset link has expired or is no longer valid.</p>
          <p class="text-muted">
            Please request a new security code to start the reset process again.
          </p>
          <router-link to="/auth/password-reset/request">
            <Button
              size="small"
              severity="contrast"
              label=" Request new code"
              icon="fas fa-sync-alt"
              variant="outlined"
            />
          </router-link>
        </div>
      </div>
    </div>
    <!--Password reset form-->
    <form v-else class="reset-password-form m-auto" @submit.prevent="submitForm">
      <TitleSection title="New Password" title-size="small" align-items="start" />
      <p class="mb-3">Enter and confirm your new password to continue.</p>
      <!-- Password input -->
      <div class="form-group mb-3">
        <FloatLabel variant="on">
          <IconField>
            <InputIcon class="pi pi-lock" />
            <Password
              fluid
              id="resetPassword"
              v-model="v$.password.$model"
              :invalid="v$.password.$error"
              type="password"
              :feedback="false"
              toggle-mask
            />
          </IconField>
          <label for="resetPassword">Password</label>
        </FloatLabel>
        <Message size="small" severity="error" v-if="v$.password.$error" variant="simple">
          <div v-for="error of v$.password.$errors" :key="error.$uid">
            <div>{{ error.$message }}</div>
          </div>
        </Message>
      </div>

      <!-- Password confirm input -->
      <div class="form-group mb-3">
        <FloatLabel variant="on">
          <IconField>
            <InputIcon class="pi pi-lock" />
            <Password
              fluid
              id="resetPasswordConfirm"
              v-model="v$.passwordConfirm.$model"
              :invalid="v$.passwordConfirm.$error"
              type="password"
              toggle-mask
              :feedback="false"
            />
          </IconField>
          <label for="resetPasswordConfirm">Confirm Password</label>
        </FloatLabel>
        <Message size="small" severity="error" v-if="v$.passwordConfirm.$error" variant="simple">
          <div v-for="error of v$.passwordConfirm.$errors" :key="error.$uid">
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
        :label="isResettingPassword ? 'Resetting password...' : 'Submit new password'"
        :loading="isResettingPassword"
        :disabled="v$.$errors.length > 0 || isResettingPassword"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
//Vuelidate for login form validation
import { useVuelidate } from "@vuelidate/core";
import { required, helpers, sameAs } from "@vuelidate/validators";
import { Message, Password } from "primevue";
import FloatLabel from "primevue/floatlabel";
import Button from "primevue/button";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import { useToast } from "primevue/usetoast";
import TitleSection from "../shared/TitleSection.vue";
import { jwtDecode } from "jwt-decode";

const router = useRouter();
const toast = useToast();
// Access the store
const authStore = useAuthStore();

//provided token from the URL
const providedToken = ref("");

//check if the reset token has expired or not
const hasTokenExpiredOrIsInvalid = ref(true);

//form validation with Vuelidate start
const resetPasswordForm = ref({
  password: "",
  passwordConfirm: "",
});
const passwordRule = helpers.regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/);
const passwordErrorMessage =
  "Password must be at least 8 characters long and contain a mix of letters, numbers, and special characters";
const passwordNotMatching = "The passwords you entered do not match";
const rules = computed(() => ({
  password: {
    required,
    passwordRule: helpers.withMessage(passwordErrorMessage, passwordRule),
  },
  passwordConfirm: {
    required,
    sameAsPassword: helpers.withMessage(
      passwordNotMatching,
      sameAs(computed(() => resetPasswordForm.value.password)),
    ),
  },
}));
const v$ = useVuelidate(rules, resetPasswordForm, { $autoDirty: true });
//form validation with Vuelidate end

onMounted(() => {
  try {
    //validate the password reset form
    v$.value.$touch();
    //get the token provided in the URL
    providedToken.value = router.currentRoute.value.query.token?.toString() ?? "";
    //check if the token has expired or not
    //check if access token has expired or not
    const exp = jwtDecode(providedToken.value).exp; // in seconds
    const now = Math.floor(Date.now() / 1000); // current time in seconds

    hasTokenExpiredOrIsInvalid.value = exp ? !(exp > now) : true;
    //throw an exception if the token has expired
    if (hasTokenExpiredOrIsInvalid.value) throw new Error();
  } catch {
    hasTokenExpiredOrIsInvalid.value = true;
  }
});

const isResettingPassword = ref(false);

const submitForm = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (isFormCorrect && providedToken.value) {
    const resetDetails = {
      password: resetPasswordForm.value.password,
      resetToken: providedToken.value,
    };
    isResettingPassword.value = true;
    authStore
      .resetPassword(resetDetails)
      .then((message) => {
        toast.add({
          severity: "success",
          summary: "Password Reset",
          detail: message,
          life: 10000,
        });
        router.push("/auth/login");
      })
      .catch((message) => {
        toast.add({
          severity: "error",
          summary: "Reset Failed",
          detail: message,
          life: 10000,
        });
      })
      .finally(() => (isResettingPassword.value = false));
  }
};
</script>

<style scoped>
@media (min-width: 512px) {
  .reset-password-form {
    max-width: 28rem;
  }
}
</style>
