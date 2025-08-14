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
import ExamBoardView from "@/views/ExamBoardView.vue";
import LevelView from "@/views/LevelView.vue";
import SubjectView from "@/views/SubjectView.vue";
import TopicView from "@/views/TopicView.vue";
import SubtopicView from "@/views/SubtopicView.vue";
import QuestionView from "@/views/QuestionView.vue";
import { UserRole } from "@/enums/auth/userRole";

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
          //This is a protected route
          beforeEnter: async (to) => {
            const authStore = useAuthStore();
            // Make sure the user is logged in and their details are loaded
            // This prevents false redirects if user data is not yet populated in the store.
            await authStore.authenticateUser();

            // If the user is not logged in or is not an admin
            if (!authStore.isAuthenticated || authStore.user?.role != UserRole.Admin) {
              //store the attempted URL
              authStore.attemptedUrl = to.fullPath;
              // Redirect to login page
              return { name: "Login" };
            }
            return true;
          },
        },
      ],
    },
    //exam board routes
    {
      path: "/exam-boards",
      component: ExamBoardView,
      children: [],
    },
    //level routes
    {
      path: "/levels",
      component: LevelView,
      children: [],
    },
    //subject routes
    {
      path: "/subjects",
      component: SubjectView,
      children: [],
    },
    //topic routes
    {
      path: "/topics",
      component: TopicView,
      children: [],
    },
    //subtopic routes
    {
      path: "/subtopics",
      component: SubtopicView,
      children: [],
    },
    //question routes
    {
      path: "/questions",
      component: QuestionView,
      children: [],
    },
    //flag routes
    {
      path: "/flags",
      component: AuthView,
      children: [],
    },
  ],
});

export default router;
