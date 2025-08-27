import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import type { Level } from "@/models/level";
import { UrlHelper } from "@/helpers/urlHelper";
import { ErrorResponse } from "@/models/errorResponse";
import type { PageInfo } from "@/models/pageInfo";
import { LevelSortOption } from "@/enums/levels/levelSortOption";
export const useLevelStore = defineStore("level", () => {
  const apiUrl = ref(`${UrlHelper.apiUrl}/levels`);

  //Gets an educational level with a given ID
  const getLevelById = (id: number): Promise<Level> => {
    return new Promise((resolve, reject) => {
      axios
        .get<Level>(`${apiUrl.value}/${id}`)
        .then((response) => {
          resolve(response.data);
        })
        .catch((err) => {
          const message =
            err.response?.status == 404
              ? ErrorResponse.NotFound("Level")
              : ErrorResponse.Unexpected();

          reject(message);
        });
    });
  };

  //Gets a paginated list of educational levels for a particular exam board along with pagination metadata
  const getLevels = (
    page: number,
    pageSize: number,
    sortBy: LevelSortOption | null = null,
    curriculumId: number | null = null,
    examBoardId: number | null = null,
  ): Promise<PageInfo<Level>> => {
    return new Promise((resolve, reject) => {
      axios
        .get<PageInfo<Level>>(`${apiUrl.value}`, {
          params: {
            page: page,
            pageSize: pageSize,
            sortBy,
            curriculumId,
            examBoardId,
          },
        })
        .then((response) => {
          //return the levels
          resolve(response.data);
        })
        .catch((err) => {
          const message = err.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Creates a new educational level for a specific exam board
  const addLevel = (details: { examBoardId: number; name: string }) => {
    return new Promise((resolve, reject) => {
      const { examBoardId, name } = details;
      //add access token to the request
      //to access the protected route
      setAuthToken();
      axios
        .post(`${UrlHelper.apiUrl}/exam-boards/${examBoardId}/levels`, { name })
        .then(() => resolve("Educational level added successfully."))
        .catch((err) => {
          const message = err.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Updates an educational level with a given ID for a specific exam board
  const updateLevel = (id: number, details: { examBoardId: number; name: string }) => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      const { examBoardId, name } = details;
      axios
        .put(`${UrlHelper.apiUrl}/exam-boards/${examBoardId}/levels/${id}`, { name })
        .then(() => resolve({}))
        .catch((err) => {
          const message = err.response.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Deletes an educational level with a given ID
  const deleteLevel = (id: number) => {
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

  return { getLevelById, getLevels, updateLevel, deleteLevel, addLevel };
});
