<template>
  <div class="text-center">
    <h5>{{ title }}</h5>
    <div>
      <span v-html="message"></span>
      <!-- Inline editor for the email the OTP is sent to -->
      <Inplace>
        <template #display>
          <span class="text-center">
            {{ authStore.userEmail || "Your email" }}
            <i class="ms-1 text-primary pi pi-pencil"></i>
          </span>
        </template>
        <template #content="{ closeCallback }">
          <!-- Email input start -->
          <span class="d-flex justify-content-center align-items-start gap-1 my-2">
            <span class="d-flex flex-column">
              <FloatLabel variant="on">
                <IconField>
                  <InputIcon class="pi pi-envelope" />
                  <InputText
                    id="otpEmail"
                    class="w-100"
                    v-model="v$.email.$model"
                    :invalid="v$.email.$error"
                    type="email"
                    @change="onEmailChange"
                  />
                </IconField>
                <label for="otpEmail">Email</label>
              </FloatLabel>
              <Message size="small" severity="error" v-if="v$.email.$error" variant="simple">
                <div v-for="error of v$.email.$errors" :key="error.$uid">
                  <div>{{ error.$message }}</div>
                </div>
              </Message>
            </span>
            <Button icon="pi pi-times" text severity="danger" @click="closeCallback" />
          </span>
          <!-- Email input end -->
        </template>
      </Inplace>
    </div>
    <!-- OTP input start -->
    <div class="d-flex justify-content-center my-2">
      <InputOtp @change="onOtpChange" v-model="otpCode" :length="6" integerOnly />
    </div>
    <!-- OTP input end -->
    <div v-if="isVerifyingOtp" class="d-flex justify-content-center">
      <ProgressSpinner style="width: 70px; height: 70px" aria-label="Loading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import InputOtp from "primevue/inputotp";
import { useAuthStore } from "@/stores/auth";
import Inplace from "primevue/inplace";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import { email, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import InputIcon from "primevue/inputicon";
import { Message } from "primevue";
import FloatLabel from "primevue/floatlabel";
import IconField from "primevue/iconfield";

const props = defineProps({
  //title for the otp section
  title: {
    type: String,
    default: "We just sent an email",
  },
  //message for the otp section
  message: {
    type: String,
    default: "Enter the security code we sent to",
  },
  //callback method to call to verify OTP
  callbackToVerify: {
    type: Function,
    required: true,
  },
  //whether or not an OTP is being verified
  //this is used to show the loader
  isVerifyingOtp: {
    type: Boolean,
    required: true,
  },
});

const authStore = useAuthStore();
const otpCode = ref("");

const emailTextfield = ref({ email: authStore.userEmail ?? "" });

//Verify the OTP code once 6 digits are entered
const onOtpChange = async () => {
  if (otpCode.value.length == 6) {
    //verify OTP
    await props.callbackToVerify(otpCode.value);
  }
};

//email input validation start
const rules = {
  email: { required, email },
};
const v$ = useVuelidate(rules, emailTextfield);

//if the entered email is valid, save it to the store
const onEmailChange = async () => {
  const isEmailValid = await v$.value.$validate();
  //clear the the store
  authStore.userEmail = "";
  //save email to store if valid
  if (isEmailValid) {
    authStore.userEmail = emailTextfield.value.email;
  }
};
//email input validation end
</script>
