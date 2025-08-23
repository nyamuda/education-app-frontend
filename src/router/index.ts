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
import EditCurriculum from "@/components/curriculums/EditCurriculum.vue";
import ExamBoardList from "@/components/examBoards/ExamBoardList.vue";
import AddExamBoard from "@/components/examBoards/AddExamBoard.vue";
import ExamBoardDetails from "@/components/examBoards/ExamBoardDetails.vue";
import EditExamBoard from "@/components/examBoards/EditExamBoard.vue";
import LevelList from "@/components/levels/LevelList.vue";
import AddLevel from "@/components/levels/AddLevel.vue";
import EditLevel from "@/components/levels/EditLevel.vue";
import LevelDetails from "@/components/levels/LevelDetails.vue";
import SubjectList from "@/components/subjects/SubjectList.vue";
import AddSubject from "@/components/subjects/AddSubject.vue";
import SubjectDetails from "@/components/subjects/SubjectDetails.vue";
import EditSubject from "@/components/subjects/EditSubject.vue";
import TopicList from "@/components/topics/TopicList.vue";
import AddTopic from "@/components/topics/AddTopic.vue";
import TopicDetails from "@/components/topics/TopicDetails.vue";
import EditTopic from "@/components/topics/EditTopic.vue";
import UploadTopics from "@/components/topics/UploadTopics.vue";

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
      // This is a protected route: only authenticated admins can access it
      beforeEnter: async (to) => {
        const authStore = useAuthStore();

        // If the user is not logged in or is not an admin
        if (!authStore.isAuthenticated || authStore.userRole != UserRole.Admin) {
          //store the attempted URL
          authStore.attemptedUrl = to.fullPath;
          // Redirect to login page
          return { name: "Login" };
        }
        return true;
      },
      children: [
        {
          path: "",
          component: CurriculumList,
        },
        {
          path: "add",
          component: AddCurriculum,
        },
        {
          path: ":id/edit",
          component: EditCurriculum,
        },
      ],
    },
    //exam board routes
    {
      path: "/exam-boards",
      component: ExamBoardView,
      // This is a protected route: only authenticated admins can access it
      beforeEnter: async (to) => {
        const authStore = useAuthStore();

        // If the user is not logged in or is not an admin
        if (!authStore.isAuthenticated || authStore.userRole != UserRole.Admin) {
          //store the attempted URL
          authStore.attemptedUrl = to.fullPath;
          // Redirect to login page
          return { name: "Login" };
        }
        return true;
      },
      children: [
        {
          path: "",
          component: ExamBoardList,
        },
        {
          path: "add",
          component: AddExamBoard,
        },
        {
          path: ":id/details",
          component: ExamBoardDetails,
        },
        {
          path: ":id/edit",
          component: EditExamBoard,
        },
      ],
    },
    //level routes
    {
      path: "/levels",
      component: LevelView,
      // This is a protected route: only authenticated admins can access it
      beforeEnter: async (to) => {
        const authStore = useAuthStore();

        // If the user is not logged in or is not an admin
        if (!authStore.isAuthenticated || authStore.userRole != UserRole.Admin) {
          //store the attempted URL
          authStore.attemptedUrl = to.fullPath;
          // Redirect to login page
          return { name: "Login" };
        }
        return true;
      },
      children: [
        {
          path: "",
          component: LevelList,
        },
        {
          path: "add",
          component: AddLevel,
        },
        {
          path: ":id/details",
          component: LevelDetails,
        },
        {
          path: ":id/edit",
          component: EditLevel,
        },
      ],
    },
    //subject routes
    {
      path: "/subjects",
      component: SubjectView,
      // This is a protected route: only authenticated admins can access it
      beforeEnter: async (to) => {
        const authStore = useAuthStore();

        // If the user is not logged in or is not an admin
        if (!authStore.isAuthenticated || authStore.userRole != UserRole.Admin) {
          //store the attempted URL
          authStore.attemptedUrl = to.fullPath;
          // Redirect to login page
          return { name: "Login" };
        }
        return true;
      },
      children: [
        {
          path: "",
          component: SubjectList,
        },
        {
          path: "add",
          component: AddSubject,
        },
        {
          path: ":id/details",
          component: SubjectDetails,
        },
        {
          path: ":id/edit",
          component: EditSubject,
        },
      ],
    },
    //topic routes
    {
      path: "/topics",
      component: TopicView,
      // This is a protected route: only authenticated admins can access it
      beforeEnter: async (to) => {
        const authStore = useAuthStore();

        // If the user is not logged in or is not an admin
        if (!authStore.isAuthenticated || authStore.userRole != UserRole.Admin) {
          //store the attempted URL
          authStore.attemptedUrl = to.fullPath;
          // Redirect to login page
          return { name: "Login" };
        }
        return true;
      },
      children: [
        {
          path: "",
          component: TopicList,
        },
        {
          path: "add",
          component: AddTopic,
        },
        {
          path: "upload",
          component: UploadTopics,
        },
        {
          path: ":id/details",
          component: TopicDetails,
        },
        {
          path: ":id/edit",
          component: EditTopic,
        },
      ],
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
