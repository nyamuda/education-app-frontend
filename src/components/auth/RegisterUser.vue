<template>
  <!-- Section: Design Block -->
  <section class="background-radial-gradient overflow-hidden">
    <div class="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
      <div class="row gx-lg-5 align-items-center mb-5">
        <div class="d-none d-md-block col-lg-6 mb-5 mb-lg-0" style="z-index: 10">
          <h1 class="my-5 display-5 fw-bold ls-tight" style="color: hsl(218, 81%, 95%)">
            The best offer <br />
            <span style="color: hsl(218, 81%, 75%)">for your business</span>
          </h1>
          <p class="mb-4 opacity-70" style="color: hsl(218, 81%, 85%)">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Temporibus, expedita iusto
            veniam atque, magni tempora mollitia dolorum consequatur nulla, neque debitis eos
            reprehenderit quasi ab ipsum nisi dolorem modi. Quos?
          </p>
        </div>

        <div class="col-lg-6 mb-5 mb-lg-0 position-relative">
          <div id="radius-shape-1" class="position-absolute rounded-circle shadow-5-strong"></div>
          <div id="radius-shape-2" class="position-absolute shadow-5-strong"></div>

          <div class="card bg-glass">
            <div class="card-body px-4 py-5 px-md-5">
              <form @submit.prevent="submitForm" class="">
                <div class="text-start mb-2">
                  <TitleSection title="Create an account" title-size="small" align-items="start" />
                </div>

                <!-- Email input -->
                <div class="form-group mb-3">
                  <FloatLabel variant="in">
                    <IconField>
                      <InputIcon class="pi pi-envelope" />
                      <InputText
                        id="registerEmail"
                        class="w-100"
                        v-model="v$.email.$model"
                        :invalid="v$.email.$error"
                        type="email"
                      />
                    </IconField>
                    <label for="registerEmail">Email</label>
                  </FloatLabel>
                  <Message size="small" severity="error" v-if="v$.email.$error" variant="simple">
                    <div v-for="error of v$.email.$errors" :key="error.$uid">
                      <div>{{ error.$message }}</div>
                    </div>
                  </Message>
                </div>

                <!-- Password input -->
                <div class="form-group mb-3">
                  <FloatLabel variant="in">
                    <IconField>
                      <InputIcon class="pi pi-lock" />
                      <InputText
                        fluid
                        id="registerPassword"
                        v-model="v$.password.$model"
                        :invalid="v$.password.$error"
                        type="password"
                      />
                    </IconField>
                    <label for="registerPassword">Password</label>
                  </FloatLabel>
                  <Message size="small" severity="error" v-if="v$.password.$error" variant="simple">
                    <div v-for="error of v$.password.$errors" :key="error.$uid">
                      <div>{{ error.$message }}</div>
                    </div>
                  </Message>
                </div>

                <!-- Curriculum input -->
                <div class="form-group mb-3">
                  <FloatLabel variant="in">
                    <Select
                      class="w-100"
                      id="userCurriculum"
                      v-model="v$.curriculumId.$model"
                      :options="curriculums"
                      optionLabel="name"
                      optionValue="id"
                      @value-change="updateExamBoardsForCurriculum"
                      :invalid="v$.curriculumId.$error"
                      placeholder="Select your curriculum"
                    />
                    <label for="userCurriculum">Curriculum</label>
                  </FloatLabel>
                  <Message
                    size="small"
                    severity="error"
                    v-if="v$.curriculumId.$error"
                    variant="simple"
                  >
                    <div v-for="error of v$.curriculumId.$errors" :key="error.$uid">
                      <div>{{ error.$message }}</div>
                    </div>
                  </Message>
                </div>

                <!-- Exam board input -->
                <div class="form-group mb-3">
                  <FloatLabel variant="in">
                    <Select
                      class="w-100"
                      id="userExamBoard"
                      v-model="v$.examBoardId.$model"
                      :options="examBoards"
                      optionLabel="name"
                      optionValue="id"
                      :invalid="v$.examBoardId.$error"
                      :value-change="updateLevelsForExamBoard"
                      placeholder="Select your exam board"
                    />
                    <label for="userExamBoard">ExamBoard</label>
                  </FloatLabel>
                  <Message
                    size="small"
                    severity="error"
                    v-if="v$.examBoardId.$error"
                    variant="simple"
                  >
                    <div v-for="error of v$.examBoardId.$errors" :key="error.$uid">
                      <div>{{ error.$message }}</div>
                    </div>
                  </Message>
                </div>

                <!-- Submit button -->
                <Button
                  fluid
                  class="mb-2"
                  size="small"
                  type="submit"
                  severity="primary"
                  :label="isRegistering ? 'Creating account...' : 'Sign up'"
                  :loading="isRegistering"
                  :disabled="v$.$errors.length > 0 || isRegistering"
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <!-- Section: Design Block -->
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useVuelidate } from "@vuelidate/core";
import { required, email, helpers } from "@vuelidate/validators";
import { Message } from "primevue";
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";
import Button from "primevue/button";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import TitleSection from "@/components/shared/TitleSection.vue";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";
import type { Curriculum } from "@/models/curriculum";
import { useCurriculumStore } from "@/stores/curriculum";
import type { ExamBoard } from "@/models/examBoard";
//import type { Level } from "@/models/level";
import Select from "primevue/select";
import type { Level } from "@/models/level";

// Access the store
const authStore = useAuthStore();
const curriculumStore = useCurriculumStore();
const toast = useToast();
const router = useRouter();

onMounted(async () => {
  v$.value.$touch();

  //get a list of curriculums
  curriculums.value = (await curriculumStore.getCurriculums()).items;
});

const isRegistering = ref(false);
const curriculums: Ref<Curriculum[]> = ref([]);
const examBoards: Ref<ExamBoard[]> = ref([]);
//educational levels available for the chosen exam board
const levels: Ref<Level[]> = ref([]);

//form validation start
const registrationForm = ref({
  email: "",
  password: "",
  curriculumId: 0,
  examBoardId: 0,
  levelIds: [],
});
const passwordRule = helpers.regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/);
const passwordErrorMessage =
  "Password must be at least 8 characters long and contain a mix of letters, numbers, and special characters";

const rules = {
  email: { required, email },
  password: {
    required,
    passwordRule: helpers.withMessage(passwordErrorMessage, passwordRule),
  },
  curriculumId: { required },
  examBoardId: { required },
  levelIds: {
    required: helpers.withMessage("You need to include at least one educational level.", required),
  },
};
const v$ = useVuelidate(rules, registrationForm);
//form validation end

const submitForm = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (isFormCorrect) {
    isRegistering.value = true;
    authStore
      .register(registrationForm.value)
      .then(() => {
        router.push("/auth/email-verification/request");
      })
      .catch((message) => {
        toast.add({
          severity: "error",
          summary: "Registration Failed",
          detail: message,
          life: 20000,
        });
      })
      .finally(() => (isRegistering.value = false));
  }
};

// Updates the available exam board options so they match the chosen curriculum.
const updateExamBoardsForCurriculum = (curriculumId: number) => {
  const selectedCurriculum = curriculums.value.find((x) => x.id === curriculumId);
  examBoards.value = selectedCurriculum?.examBoards ?? [];
};

// Updates the available educational level options so they match the chosen exam board.
const updateLevelsForExamBoard = (examBoardId: number) => {
  const selectedExamBoard = examBoards.value.find((x) => x.id === examBoardId);
  levels.value = selectedExamBoard?.levels ?? [];
};
</script>

<style lang="scss" scoped>
.background-radial-gradient {
  background-color: hsl(218, 41%, 15%);
  background-image:
    radial-gradient(
      650px circle at 0% 0%,
      hsl(218, 41%, 35%) 15%,
      hsl(218, 41%, 30%) 35%,
      hsl(218, 41%, 20%) 75%,
      hsl(218, 41%, 19%) 80%,
      transparent 100%
    ),
    radial-gradient(
      1250px circle at 100% 100%,
      hsl(218, 41%, 45%) 15%,
      hsl(218, 41%, 30%) 35%,
      hsl(218, 41%, 20%) 75%,
      hsl(218, 41%, 19%) 80%,
      transparent 100%
    );
}

#radius-shape-1 {
  height: 220px;
  width: 220px;
  top: -60px;
  left: -130px;
  background: radial-gradient(#44006b, #ad1fff);
  overflow: hidden;
}

#radius-shape-2 {
  border-radius: 38% 62% 63% 37% / 70% 33% 67% 30%;
  bottom: -60px;
  right: -110px;
  width: 300px;
  height: 300px;
  background: radial-gradient(#44006b, #ad1fff);
  overflow: hidden;
}

.bg-glass {
  background-color: hsla(0, 0%, 100%, 0.9) !important;
  backdrop-filter: saturate(200%) blur(25px);
}
</style>
