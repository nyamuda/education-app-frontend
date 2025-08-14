import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import type { Curriculum } from "@/models/curriculum";
import { UrlHelper } from "@/helpers/urlHelper";
import { ErrorResponse } from "@/models/errorResponse";
import type { PageInfo } from "@/models/pageInfo";

export const useCurriculumStore = defineStore("curriculum", () => {
  const apiUrl = ref(`${UrlHelper.apiUrl}/curriculums`);

  //Gets a curriculum with a given ID
  const getCurriculumById = (id: number): Promise<Curriculum> => {
    return new Promise((resolve, reject) => {
      axios
        .get<Curriculum>(`${apiUrl.value}/${id}`)
        .then((response) => {
          resolve(response.data);
        })
        .catch((err) => {
          const message =
            err.response.status == 404
              ? ErrorResponse.NotFound("Curriculum")
              : ErrorResponse.Unexpected();

          reject(message);
        });
    });
  };

  //Gets a paginated list of curriculums along with pagination metadata
  const getCurriculums = (
    page: number = 1,
    pageSize: number = 100,
  ): Promise<PageInfo<Curriculum>> => {
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
          console.log(response.data.items);
        })
        .catch((err) => {
          console.log(err);
          const message = err.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Creates a new curriculum
  const addCurriculum = (details: { name: string }) => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      axios
        .post(`${apiUrl.value}`, details)
        .then(() => resolve("Curriculum added successfully."))
        .catch((err) => {
          const message = err.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Updates a curriculum with a given ID
  const updateCurriculum = (id: number, updateDetails: { name: string }) => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      axios
        .put(`${apiUrl.value}/${id}`, updateDetails)
        .then(() => resolve({}))
        .catch((err) => {
          const message = err.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Deletes a curriculum with a given ID
  const deleteCurriculum = (id: number) => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      axios
        .delete(`${apiUrl.value}/${id}`)
        .then(() => resolve({}))
        .catch((err) => {
          const message = err.response?.data?.message || ErrorResponse.Unexpected();
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

  return { getCurriculumById, getCurriculums, updateCurriculum, deleteCurriculum, addCurriculum };
});
