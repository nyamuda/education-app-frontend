import { ref, type Ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import type { Curriculum } from "@/models/curriculum";
import { UrlHelper } from "@/helpers/urlHelper";
import { ErrorResponse } from "@/models/errorResponse";
import type { PageInfo } from "@/models/pageInfo";

export const useCurriculumStore = defineStore("curriculum", () => {
  const apiUrl = ref(`${UrlHelper.apiUrl}/curriculums`);

  //Gets a curriculum with a given ID
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

  //Gets a paginated list of curriculums along with pagination metadata
  const get = (page: number, pageSize: number): Promise<PageInfo<Curriculum>> => {
    return new Promise((resolve, reject) => {
      axios
        .get<PageInfo<Curriculum>>(`${apiUrl.value}`, {
          params: {
            page: page,
            pageSize: pageSize,
          },
        })
        .then((response) => {
          //return the curriculums
          resolve(response.data);
        })
        .catch((er) => {
          const message = er.response.data?.message || ErrorResponse.Unexpected();
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

  return { getById, get };
});
