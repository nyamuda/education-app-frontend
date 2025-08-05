import { ref, type Ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import type { CustomJwtPayload } from "@/interfaces/auth/customJwtPayload";
import type { User } from "@/user";
import { OtpSendResult } from "@/enums/auth/otpSendResult";
import { UrlHelper } from "@/helpers/urlHelper";
import { ErrorResponse } from "@/models/errorResponse";
import type { LoginDetails } from "@/interfaces/auth/loginDetails";
import type { RegistrationDetails } from "@/interfaces/auth/registrationDetails";

export const useAuthStore = defineStore("auth", () => {
  const isAuthenticated = ref(false);
  const user: Ref<User | null> = ref(null);
  //the email of a user
  //used for things like email verification, password reset etc
  const userEmail: Ref<string | null> = ref(null);
  const isVerifyingEmailOtp: Ref<boolean> = ref(false);
  //The result of sending an email verification code to user
  //e.g success, failure
  const emailConfirmationOtpSendingResult: Ref<OtpSendResult> = ref(OtpSendResult.NoAttemptMade);

  //attempted url if the user is not logged in
  //and they're redirected to the log in page
  const attemptedUrl = ref("/");
  const isVerifyingPasswordResetOtp: Ref<boolean> = ref(false);
  const apiUrl = ref(UrlHelper.apiUrl);

  const getUserDetails = (): Promise<User> => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      axios
        .get<User>(`${apiUrl.value}/auth/me`)
        .then((response) => {
          user.value = response.data;
          resolve(response.data);
        })
        .catch((error) => {
          const message = error.response.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Login user and get the access token
  const login = (loginDetails: LoginDetails): Promise<{ isVerified: boolean }> => {
    return new Promise((resolve, reject) => {
      axios
        .post(`${apiUrl.value}/auth/login`, loginDetails)
        .then((response) => {
          //get the access token
          const token = response.data?.token;
          if (!token) throw new Error("Login failed.");

          //decode the access token
          const decodedToken = jwtDecode<CustomJwtPayload>(token);
          if (decodedToken.isVerified?.toLocaleLowerCase() == "true") {
            //save the token to local storage
            localStorage.setItem("jwt_token", token);

            //mark the user as authenticated
            authenticateUser();

            resolve({ isVerified: true });
          }
          //if the user is not verified
          //store the email that needs to be verified
          else {
            userEmail.value = loginDetails.email;
            resolve({ isVerified: false });
          }
        })
        .catch((error) => {
          const message = error.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Register a new user
  const register = (registrationDetails: RegistrationDetails) => {
    return new Promise((resolve, reject) => {
      // Step 1: Send registration request to the backend
      axios
        .post(`${apiUrl.value}/auth/register`, registrationDetails)
        .then(() => {
          // Step 2: If registration succeeds, trigger email verification
          //store the email to be verified
          userEmail.value = registrationDetails.email;
          //then request the email to be verified
          requestEmailVerification(registrationDetails.email)
            .then(() => resolve({}))
            .catch((error) => {
              // If sending the verification email fails,
              // show a user-friendly message
              const message =
                error.response?.data?.message ||
                "Registration succeeded, but we couldn’t send the verification email. Check your email address or try again shortly.";
              reject(message);
            });
        })
        .catch((error) => {
          const message = error.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Send an email to let the user verify their email using a one-time password(OTP)
  //The OTP is emailed to the user email
  const requestEmailVerification = (email: string) => {
    return new Promise((resolve, reject) => {
      const url = `${apiUrl.value}/auth/email-verification/request`;
      axios
        .post(url, { email })
        .then(() => {
          emailConfirmationOtpSendingResult.value = OtpSendResult.SentSuccessfully;
          resolve({});
        })
        .catch((error) => {
          emailConfirmationOtpSendingResult.value = OtpSendResult.FailedToSend;
          const message = error.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Verify email using a one-time password (OTP)
  const verifyEmail = (verifyDetails: { email: string; otpCode: string }) => {
    return new Promise((resolve, reject) => {
      isVerifyingEmailOtp.value = true;
      axios
        .post(`${apiUrl.value}/auth/email-verification/verify`, verifyDetails)
        .then(() => resolve({}))
        .catch((error) => {
          const message =
            error.response?.data?.message ||
            "We couldn't verify your account. Double-check your code or request a new one.";
          reject(message);
        })
        .finally(() => (isVerifyingEmailOtp.value = false));
    });
  };

  //Send a request to reset password using a one-time password(OTP)
  //The OTP is emailed to the user email
  const requestPasswordReset = (email: string) => {
    return new Promise((resolve, reject) => {
      axios
        .post(`${apiUrl.value}/auth/password-reset/request`, { email })
        .then(() => resolve({}))
        .catch((error) => {
          const message = error.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Verifies password reset one-time password(OTP)
  //Returns a reset password token if the OTP code is valid
  const verifyPasswordResetOtp = (verifyOtpDetails: {
    email: string;
    otpCode: string;
  }): Promise<{ resetToken: string }> => {
    return new Promise((resolve, reject) => {
      isVerifyingPasswordResetOtp.value = true;
      axios
        .post(`${apiUrl.value}/auth/password-reset/verify-otp`, verifyOtpDetails)
        .then((response) => resolve({ resetToken: response.data.resetToken }))
        .catch((error) => {
          const message = error.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        })
        .finally(() => (isVerifyingPasswordResetOtp.value = false));
    });
  };

  //Reset user password
  const resetPassword = (resetDetails: { resetToken: string; password: string }) => {
    return new Promise((resolve, reject) => {
      const url = `${apiUrl.value}/auth/password-reset/reset`;
      axios
        .patch(url, resetDetails)
        .then(() =>
          resolve("Password reset was successful. You may now use your new password to sign in."),
        )
        .catch((error) => {
          const message = error.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Set authorization header for all request to access protected routes from the API
  const setAuthToken = () => {
    //check if there is a token in local storage
    const localToken = localStorage.getItem("jwt_token");

    //the current token
    const token = localToken ? localToken : null;

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  //check to see if user is authenticated by using the Jwt token
  const authenticateUser = async () => {
    try {
      //check if there is a token in local storage
      const token = localStorage.getItem("jwt_token");

      if (!token) throw new Error();

      //decode the token
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      //check if access token has expired or not
      const exp = decodedToken.exp; // in seconds
      const now = Math.floor(Date.now() / 1000); // current time in seconds

      const hasExpired: boolean = exp ? !(exp > now) : true;

      //if token has expired, then the user is not authenticated
      isAuthenticated.value = hasExpired ? false : true;

      if (isAuthenticated.value) {
        await getUserDetails();
      }
    } catch {
      isAuthenticated.value = false;
    }
  };

  return {
    login,
    register,
    requestPasswordReset,
    requestEmailVerification,
    verifyEmail,
    verifyPasswordResetOtp,
    attemptedUrl,
    isAuthenticated,
    userEmail,
    isVerifyingEmailOtp,
    isVerifyingPasswordResetOtp,
    resetPassword,
    authenticateUser,
    emailConfirmationOtpSendingResult,
  };
});
