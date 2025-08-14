import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginUser from "@/components/auth/LoginUser.vue";
import RegisterUser from "@/components/auth/RegisterUser.vue";
import EmailVerificationRequest from "@/components/auth/EmailVerificationRequest.vue";
import PasswordResetRequest from "@/components/auth/PasswordResetRequest.vue";
import ResetPassword from "@/components/auth/ResetPassword.vue";
import AuthView from "@/views/AuthView.vue";
import UserProfile from "@/components/auth/UserProfile.vue";
import { useAuthStore } from "@/stores/auth";
import CurriculumView from "@/views/CurriculumView.vue";
import CurriculumList from "@/components/curriculums/CurriculumList.vue";
import AddCurriculum from "@/components/curriculums/AddCurriculum.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
    },
    //Auth routes
    {
      path: "/auth",
      name: "Auth",
      component: AuthView,
      children: [
        {
          path: "",
          name: "UserProfile",
          component: UserProfile,
          beforeEnter: (to) => {
            //this is a protected route
            const authStore = useAuthStore();
            if (!authStore.isAuthenticated) {
              //store the attempted URL
              authStore.attemptedUrl = to.fullPath;
              // Redirect to login page
              return { name: "Login" };
            }
            return true;
          },
        },
        {
          path: "login",
          name: "Login",
          component: LoginUser,
        },
        {
          path: "register",
          name: "Register",
          component: RegisterUser,
        },
        {
          path: "email-verification/request",
          component: EmailVerificationRequest,
        },

        {
          path: "password-reset/request",
          component: PasswordResetRequest,
        },

        {
          path: "password-reset/reset",
          component: ResetPassword,
        },
      ],
    },
    //curriculum routes
    {
      path: "/curriculums",
      component: CurriculumView,
      children: [
        {
          path: "",
          component: CurriculumList,
        },
        {
          path: "add",
          component: AddCurriculum,
        },
      ],
    },
    //exam board routes
    {
      path: "/auth",
      name: "Auth",
      component: AuthView,
      children: [],
    },
    //level routes
    {
      path: "/auth",
      name: "Auth",
      component: AuthView,
      children: [],
    },
    //subject routes
    {
      path: "/auth",
      name: "Auth",
      component: AuthView,
      children: [],
    },
    //topic routes
    {
      path: "/auth",
      name: "Auth",
      component: AuthView,
      children: [],
    },
    //subtopic routes
    {
      path: "/auth",
      name: "Auth",
      component: AuthView,
      children: [],
    },
    //question routes
    {
      path: "/auth",
      name: "Auth",
      component: AuthView,
      children: [],
    },
    //answers routes
    {
      path: "/auth",
      name: "Auth",
      component: AuthView,
      children: [],
    },
    //flag routes
    {
      path: "/auth",
      name: "Auth",
      component: AuthView,
      children: [],
    },
  ],
});

export default router;
