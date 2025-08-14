<template>
  <div>
    <MegaMenu
      :model="items"
      class="py-3"
      breakpoint="1200px"
      :pt="{
        root: { class: 'd-flex align-items-center w-100' },
        start: { class: 'flex-shrink-0' },
        end: { class: 'd-flex align-items-center gap-3 flex-grow-1' },
      }"
    >
      <template #start>
        <svg
          width="35"
          height="40"
          viewBox="0 0 35 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="h-8"
        >
          <path
            d="M25.87 18.05L23.16 17.45L25.27 20.46V29.78L32.49 23.76V13.53L29.18 14.73L25.87 18.04V18.05ZM25.27 35.49L29.18 31.58V27.67L25.27 30.98V35.49ZM20.16 17.14H20.03H20.17H20.16ZM30.1 5.19L34.89 4.81L33.08 12.33L24.1 15.67L30.08 5.2L30.1 5.19ZM5.72 14.74L2.41 13.54V23.77L9.63 29.79V20.47L11.74 17.46L9.03 18.06L5.72 14.75V14.74ZM9.63 30.98L5.72 27.67V31.58L9.63 35.49V30.98ZM4.8 5.2L10.78 15.67L1.81 12.33L0 4.81L4.79 5.19L4.8 5.2ZM24.37 21.05V34.59L22.56 37.29L20.46 39.4H14.44L12.34 37.29L10.53 34.59V21.05L12.42 18.23L17.45 26.8L22.48 18.23L24.37 21.05ZM22.85 0L22.57 0.69L17.45 13.08L12.33 0.69L12.05 0H22.85Z"
            fill="var(--p-primary-color)"
          />
          <path
            d="M30.69 4.21L24.37 4.81L22.57 0.69L22.86 0H26.48L30.69 4.21ZM23.75 5.67L22.66 3.08L18.05 14.24V17.14H19.7H20.03H20.16H20.2L24.1 15.7L30.11 5.19L23.75 5.67ZM4.21002 4.21L10.53 4.81L12.33 0.69L12.05 0H8.43002L4.22002 4.21H4.21002ZM21.9 17.4L20.6 18.2H14.3L13 17.4L12.4 18.2L12.42 18.23L17.45 26.8L22.48 18.23L22.5 18.2L21.9 17.4ZM4.79002 5.19L10.8 15.7L14.7 17.14H14.74H15.2H16.85V14.24L12.24 3.09L11.15 5.68L4.79002 5.2V5.19Z"
            fill="var(--p-text-color)"
          />
        </svg>
      </template>
      <template #item="{ item, props, hasSubmenu }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
          <a v-ripple :href="href" v-bind="props.action" @click="navigate">
            <span :class="item.icon" />
            <span>{{ item.label }}</span>
          </a>
        </router-link>
        <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
          <span :class="item.icon" />
          <span>{{ item.label }}</span>
          <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down" />
        </a>
      </template>

      <template #end>
        <div class="d-flex align-items-center gap-2 w-100">
          <div class="flex-grow-1">
            <AutoCompleteInput />
          </div>
          <div v-if="authStore.isAuthenticated" class="d-flex align-items-center flex-shrink-0">
            <Button
              icon="pi pi-user"
              severity="contrast"
              rounded
              aria-label="User account button"
              variant="text"
              @click="toggleAccountButton"
            />
            <Menu ref="accountMenu" id="overlay_menu" :model="userAccountItems" :popup="true" />
          </div>
          <div v-else class="d-none d-md-flex">
            <router-link to="/auth/login"
              ><Button label="Log in" severity="contrast" variant="text" size="small"
            /></router-link>
            <router-link class="me-0 me-md-2" to="/auth/register"
              ><Button label="Sign up" class="ms-2" severity="primary" size="small"
            /></router-link>
          </div>
        </div>
      </template>
    </MegaMenu>
  </div>
</template>

<script setup lang="ts">
import Menu from "primevue/menu";
import { computed, ref } from "vue";

import Button from "primevue/button";

import MegaMenu from "primevue/megamenu";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import AutoCompleteInput from "../shared/AutoCompleteInput.vue";
import { useToast } from "primevue";
import { UserRole } from "@/enums/auth/userRole";
const router = useRouter();

const authStore = useAuthStore();
const toast = useToast();

//Logout user
const logout = () => {
  authStore
    .logout()
    .then(() => router.push("/"))
    .catch((message) => {
      toast.add({
        severity: "error",
        summary: "Logout Failed",
        detail: message,
        life: 10000,
      });
    });
};

// Controls the account dropdown menu for regular users.
// This button appears on the right side of the navigation bar.
// It allows users to view their profile or log out.
const accountMenu = ref();
const toggleAccountButton = (event: MouseEvent) => {
  accountMenu.value.toggle(event);
};

const userAccountItems = ref([
  {
    label: "Questions",
    items: [
      {
        label: "New",
        icon: "pi pi-plus",
      },

      {
        label: "Asked by me",
        icon: "pi pi-id-card",
      },

      {
        label: "Saves",
        icon: "pi pi-bookmark",
      },
    ],
  },
  {
    label: "Answers",
    items: [
      {
        label: "Answers I gave",
        icon: "pi pi-id-card",
      },
      {
        label: "Saves",
        icon: "pi pi-bookmark",
      },
    ],
  },
  {
    label: "Profile",
    items: [
      {
        label: "Settings",
        icon: "pi pi-cog",
        command: () => {
          router.push("/auth");
        },
      },
      {
        label: "Logout",
        icon: "pi pi-sign-out",
        command: () => {
          logout();
        },
      },
    ],
  },
]);

const items = computed(() => {
  if (authStore.user?.role == UserRole.Admin) {
    return adminMenuItems.value;
  } else {
    return userMenuItems.value;
  }
});

//Menu items seen by normal users
const userMenuItems = ref([
  {
    label: "Home",
    icon: "pi pi-home",
    route: "/",
  },
  {
    label: "Questions",
    icon: "pi pi-question-circle",
    items: [
      [
        {
          label: "By Subject",
          items: [
            { label: "Physics", route: "/subjects/physics" },
            { label: "Math", route: "/subjects/math" },
            { label: "Biology", route: "/subjects/biology" },
          ],
        },
      ],
      [
        {
          label: "By Curriculum",
          items: [
            { label: "CAPS", route: "/curriculums/caps" },
            { label: "Cambridge IGCSE", route: "/curriculums/igcse" },
            { label: "Cambridge AS/A-Level", route: "/curriculums/as-a-level" },
          ],
        },
      ],
      [
        {
          label: "By Exam Board",
          items: [
            { label: "DBE", route: "/exam-boards/dbe" },
            { label: "Cambridge", route: "/exam-boards/cambridge" },
            { label: "IEB", route: "/exam-boards/ieb" },
          ],
        },
      ],
      [
        {
          label: "Other Filters",
          items: [
            { label: "Most Upvoted", route: "/questions/top" },
            { label: "Unanswered", route: "/questions/unanswered" },
            { label: "Recently Answered", route: "/questions/recently-answered" },
          ],
        },
      ],
    ],
  },
  {
    label: "Community",

    icon: "pi pi-users",
    items: [
      [
        {
          label: "Engage",
          items: [
            { label: "Top Contributors", route: "/community/top-contributors" },
            { label: "Community Rules", route: "/community/rules" },
            { label: "Moderator Guidelines", route: "/community/moderators" },
            { label: "Help Center / FAQ", route: "/faq" },
          ],
        },
      ],
      [
        {
          label: "Feedback",
          items: [
            { label: "Missing Something? Tell Us", route: "/feedback/suggestions" },
            { label: "Request a Feature", route: "/feedback/feature-request" },
            { label: "Report a Bug", route: "/feedback/bug-report" },
          ],
        },
      ],
    ],
  },
  {
    label: "Submit a question",
    icon: "pi pi-plus-circle",
    route: "/questions/add",
  },
  {
    label: "Log in",
    icon: "pi pi-sign-in",
    route: "/auth/login",
    class: "d-block d-md-none",
  },
  // {
  //   label: "Tutoring",
  //   icon: "pi pi-star",
  //   items: [
  //     [
  //       {
  //         label: "Learn With Pierce",
  //         items: [
  //           { label: "Math, Physics & Chemistry", route: "/tutoring" },
  //           { label: "Free Practice Questions", route: "/practice" },
  //           { label: "Get in Touch", route: "/contact" },
  //         ],
  //       },
  //     ],
  //     [
  //       {
  //         label: "What Students Say",
  //         items: [
  //           { label: "Testimonials", route: "/tutoring/testimonials" },
  //           { label: "Tutoring Philosophy", route: "/tutoring/philosophy" },
  //           { label: "Tutoring FAQ", route: "/tutoring/faq" },
  //         ],
  //       },
  //     ],
  //   ],
  // },
]);

//Menu items seen by the admin
const adminMenuItems = ref([
  {
    label: "Home",
    icon: "pi pi-home",
    route: "/admin",
  },

  {
    label: "Manage",
    icon: "pi pi-cog",
    items: [
      [
        {
          label: "Academic Structure",
          items: [
            { label: "Curriculums (View / Add)", icon: "pi pi-sitemap", route: "/curriculums" },
            { label: "Exam Boards (View / Add)", icon: "pi pi-list", route: "/exam-boards" },
            { label: "Levels (View / Add)", icon: "pi pi-list", route: "/levels" },
          ],
        },
      ],
      [
        {
          label: "Subject Content",
          items: [
            { label: "Subjects (View / Add)", icon: "pi pi-book", route: "/subjects" },
            { label: "Topics (View / Add)", icon: "pi pi-list", route: "/topics" },
            { label: "Subtopics (View / Add)", icon: "pi pi-list", route: "/subtopics" },
          ],
        },
      ],
    ],
  },

  {
    label: "Moderation",
    icon: "pi pi-shield",
    items: [
      [
        {
          label: "Flags",
          items: [
            { label: "Question Flags", icon: "pi pi-flag", route: "/flags/questions" },
            { label: "Answer Flags", icon: "pi pi-flag", route: "/flags/answers" },
            { label: "Comment Flags", icon: "pi pi-flag", route: "/flags/comments" },
          ],
        },
      ],
    ],
  },
]);
</script>

<style scoped lang="scss"></style>
