import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

//Styles
import "./assets/scss/main.scss";

//Bootstrap
import "bootstrap";

//Day.js date formatter start
import dayjs from "dayjs";

// Plugins
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";

// Extend dayjs with the plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);
//Day.js date formatter end

//PrimeVue
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import { definePreset } from "@primeuix/themes";
import Tooltip from "primevue/tooltip";
const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{indigo.50}",
      100: "{indigo.100}",
      200: "{indigo.200}",
      300: "{indigo.300}",
      400: "{indigo.400}",
      500: "{indigo.500}",
      600: "{indigo.600}",
      700: "{indigo.700}",
      800: "{indigo.800}",
      900: "{indigo.900}",
      950: "{indigo.950}",
    },
    colorScheme: {
      light: {
        formField: {
          hoverBorderColor: "{primary.color}",
        },
      },
      dark: {
        formField: {
          hoverBorderColor: "{primary.color}",
        },
      },
    },
  },
});

//Create app
const app = createApp(App);
app.directive("tooltip", Tooltip);
app
  .use(createPinia())
  .use(PrimeVue, {
    theme: {
      preset: MyPreset,
    },
  })
  .use(ConfirmationService)
  .use(ToastService)
  .use(router)
  .mount("#app");
