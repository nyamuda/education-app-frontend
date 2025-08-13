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
  const apiUrl = ref(`${UrlHelper.apiUrl}/auth`);

  const getUserDetails = (): Promise<User> => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      axios
        .get<User>(`${apiUrl.value}/me`)
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
  const login = (loginDetails: LoginDetails): Promise<{ isVerified: boolean; email: string }> => {
    return new Promise((resolve, reject) => {
      axios
        .post(`${apiUrl.value}/login`, loginDetails)
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

            resolve({ isVerified: true, email: loginDetails.email });
          }
          //if the user is not verified
          //store the email that needs to be verified
          else {
            userEmail.value = loginDetails.email;
            resolve({ isVerified: false, email: loginDetails.email });
          }
        })
        .catch((error) => {
          const message = error.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Register a new user
  const register = (registrationDetails: RegistrationDetails): Promise<{ email: string }> => {
    return new Promise((resolve, reject) => {
      // Send registration request to the backend
      axios
        .post(`${apiUrl.value}/register`, registrationDetails)
        .then(() => {
          //store the email to be verified
          userEmail.value = registrationDetails.email;
          resolve({ email: registrationDetails.email });
        })
        .catch((error) => {
          console.log(error);
          const message = error.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Send an email to let the user verify their email using a one-time password(OTP)
  //The OTP is emailed to the user email
  const requestEmailVerification = (email: string) => {
    return new Promise((resolve, reject) => {
      const url = `${apiUrl.value}/email-verification/request`;
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
  const verifyEmail = (verifyDetails: { email: string; otp: string }) => {
    return new Promise((resolve, reject) => {
      isVerifyingEmailOtp.value = true;
      axios
        .post(`${apiUrl.value}/email-verification/verify`, verifyDetails)
        .then(() => resolve({}))
        .catch((error) => {
          console.log(error);
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
        .post(`${apiUrl.value}/password-reset/request`, { email })
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
    otp: string;
  }): Promise<{ resetToken: string }> => {
    return new Promise((resolve, reject) => {
      isVerifyingPasswordResetOtp.value = true;
      axios
        .post(`${apiUrl.value}/password-reset/verify-otp`, verifyOtpDetails)
        .then((response) => resolve({ resetToken: response.data.resetToken }))
        .catch((error) => {
          console.log(error);
          const message = error.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        })
        .finally(() => (isVerifyingPasswordResetOtp.value = false));
    });
  };

  //Reset user password
  const resetPassword = (resetDetails: { resetToken: string; password: string }) => {
    return new Promise((resolve, reject) => {
      const url = `${apiUrl.value}/password-reset/reset`;
      axios
        .post(url, resetDetails)
        .then(() =>
          resolve("Password reset was successful. You may now use your new password to sign in."),
        )
        .catch((error) => {
          console.log(error);
          const message = error.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Set authorization header for all requests to access protected routes from the API
  const setAuthToken = () => {
    //get the access token from local storage
    const token = localStorage.getItem("jwt_token");

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

      //if token has not expired, then the user is authenticated
      isAuthenticated.value = exp > now ? true : false;

      if (isAuthenticated.value) {
        await getUserDetails();
      }
    } catch {
      isAuthenticated.value = false;
    }
  };

  //Logs out a user
  const logout = async () => {
    return new Promise((resolve, reject) => {
      axios
        .post(`${apiUrl.value}/logout`)
        .then(() => {
          //remove the JWT token from local storage
          localStorage.removeItem("jwt_token");
          authenticateUser();
          resolve({});
        })
        .catch((err) => {
          const message = err.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
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
    logout,
  };
});
