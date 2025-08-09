import { ref, computed } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import type { Curriculum } from "@/models/curriculum";
import { UrlHelper } from "@/helpers/urlHelper";
import { ErrorResponse } from "@/models/errorResponse";

export const useCurriculumStore = defineStore("curriculum", () => {
  const apiUrl = ref(UrlHelper.apiUrl);
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);
  function increment() {
    count.value++;
  }

  const getById = (id: number): Promise<Curriculum> => {
    return new Promise((resolve, reject) => {
      axios
        .get<Curriculum>(`${apiUrl.value}/${id}`)
        .then((response) => {
          resolve(response.data);
        })
        .catch((err) => {
          const message =
            err.response.statusCode == 404
              ? ErrorResponse.NotFound("Curriculum")
              : ErrorResponse.Unexpected();

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

  return { count, doubleCount, increment, getById };
});
