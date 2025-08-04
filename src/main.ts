import "./assets/main.scss";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

// Bootstrap
import "bootstrap";

/* PrimeVue */
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
/* PrimeVue end */

const app = createApp(App);

app.use(createPinia());
app.use(router).use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});

app.mount("#app");
