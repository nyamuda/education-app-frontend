<template>
  <div class="mt-5 container">
    <div class="py-4 m-auto">
      <div class="text-center card-body">
        <div>
          <i class="fas fa-envelope-open-text fa-5x text-secondary"></i>
        </div>

        <TitleSection
          title="Email Verification Required to Proceed"
          title-size="small"
          align-items="center"
          style="margin-bottom: -1rem"
        />
        <!-- Section to show if the OTP is being sent -->
        <div v-if="isSendingEmailVerificationCode" class="card-text mb-3">
          <div class="d-flex flex-column align-items-center">
            <ProgressSpinner />
            <span> We're sending a verification code to your email address.</span>
            <span>This should only take a few seconds.</span>
          </div>
        </div>
        <!-- Section to show if the OTP was sent -->
        <div v-else class="card-text d-flex flex-column align-items-center">
          <!-- Otp input section -->
          <!-- Displayed if OTP was successfully sent or hasn't been sent yet -->
          <OtpSection
            v-if="
              authStore.emailConfirmationOtpSendingResult == OtpSendResult.SentSuccessfully ||
              authStore.emailConfirmationOtpSendingResult == OtpSendResult.NoAttemptMade
            "
            :callback-to-verify="verifyEmail"
            :is-verifying-otp="authStore.isVerifyingEmailOtp"
            :title="otpSectionTitleAndMessage.title"
            :message="otpSectionTitleAndMessage.message"
          />
          <!-- Displayed if an attempt to resend OTP was a failure -->
          <div
            v-else-if="authStore.emailConfirmationOtpSendingResult == OtpSendResult.FailedToSend"
            class="d-flex flex-column align-items-center text-danger"
          >
            <i class="pi pi-times-circle mb-2" style="font-size: 2rem"></i>
            <span>We couldn't resend the verification code.</span>
            <span>Please try again soon.</span>
          </div>
        </div>
        <!-- Button to request a new OTP -->
        <SendOtpButton
          v-if="authStore.userEmail"
          button-label="Resend Code"
          :auto-send="false"
          :is-sending-code="isSendingEmailVerificationCode"
          :action-callback="requestEmailVerificationCode"
          :is-button-disabled="authStore.isVerifyingEmailOtp"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type Ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import ProgressSpinner from "primevue/progressspinner";
import { useToast } from "primevue/usetoast";
import OtpSection from "../shared/OtpSection.vue";
import TitleSection from "../shared/TitleSection.vue";
import { useRouter } from "vue-router";
import SendOtpButton from "../shared/SendOtpButton.vue";
import { OtpSendResult } from "@/enums/auth/otpSendResult";

const authStore = useAuthStore();
const toast = useToast();
const router = useRouter();
const isSendingEmailVerificationCode = ref(false);

//title and message for the OTP section
//based on whether an OTP was sent or not
const otpSectionTitleAndMessage: Ref<{ title: string; message: string }> = computed(() => {
  return {
    title:
      authStore.emailConfirmationOtpSendingResult === OtpSendResult.SentSuccessfully
        ? "Verification Code Sent"
        : "Request a Verification Code",
    message:
      authStore.emailConfirmationOtpSendingResult === OtpSendResult.SentSuccessfully
        ? "Please enter the verification code we sent to your email. <br/> If you don’t see it in your inbox, be sure to check your spam or junk folder."
        : authStore.userEmail
          ? "We'll send an email verification code to"
          : "Please enter your email address to receive a verification code.",
  };
});

//Make a request for email verification
const requestEmailVerificationCode = async () => {
  try {
    if (authStore.userEmail) {
      isSendingEmailVerificationCode.value = true;
      await authStore.requestEmailVerification(authStore.userEmail);
      toast.add({
        severity: "success",
        summary: "Code sent",
        detail: "The security code was sent to your email address.",
        life: 10000,
      });
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Sending Failed",
      detail: error,
      life: 15000,
    });
  } finally {
    isSendingEmailVerificationCode.value = false;
  }
};

//Verify email using OTP code
const verifyEmail = async (otpCode: string) => {
  try {
    const email = authStore.userEmail;
    if (email) {
      await authStore.verifyEmail({ otpCode, email });
      toast.add({
        severity: "success",
        summary: "Account Verified",
        detail: "Your account has been successfully verified. You can now log in.",
        life: 10000,
      });
      //direct the user to the login page
      router.push("/auth/login");
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Verification Failed",
      detail: error,
      life: 10000,
    });
  }
};
</script>
