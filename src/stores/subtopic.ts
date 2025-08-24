import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import type { Subtopic } from "@/models/subtopic";
import { UrlHelper } from "@/helpers/urlHelper";
import { ErrorResponse } from "@/models/errorResponse";
import type { PageInfo } from "@/models/pageInfo";
import type { SubtopicQueryParams } from "@/interfaces/subtopics/subtopicQueryParams";

export const useSubtopicStore = defineStore("subtopic", () => {
  const apiUrl = ref(`${UrlHelper.apiUrl}/subtopics`);

  //Gets a subtopic with a given ID
  const getSubtopicById = (id: number): Promise<Subtopic> => {
    return new Promise((resolve, reject) => {
      axios
        .get<Subtopic>(`${apiUrl.value}/${id}`)
        .then((response) => {
          resolve(response.data);
        })
        .catch((err) => {
          const message =
            err.response.status == 404
              ? ErrorResponse.NotFound("Subtopic")
              : ErrorResponse.Unexpected();

          reject(message);
        });
    });
  };

  //Gets a paginated list of subtopics along with pagination metadata
  const getSubtopics = (params: SubtopicQueryParams): Promise<PageInfo<Subtopic>> => {
    return new Promise((resolve, reject) => {
      axios
        .get<PageInfo<Subtopic>>(`${apiUrl.value}`, {
          params: params,
        })
        .then((response) => {
          //return the subtopics
          resolve(response.data);
        })
        .catch((err) => {
          const message = err.response.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Creates a new subtopic
  const addSubtopic = (details: { name: string; topicId: number }) => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      axios
        .post(`${apiUrl.value}`, details)
        .then(() => resolve({}))
        .catch((err) => {
          const message = err.response.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Updates a subtopic with a given ID
  const updateSubtopic = (id: number, updateDetails: { name: string; topicId: number }) => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      axios
        .put(`${apiUrl.value}/${id}`, updateDetails)
        .then(() => resolve({}))
        .catch((err) => {
          const message = err.response.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Deletes a subtopic with a given ID
  const deleteSubtopic = (id: number) => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      axios
        .delete(`${apiUrl.value}/${id}`)
        .then(() => resolve({}))
        .catch((err) => {
          const message = err.response.data?.message || ErrorResponse.Unexpected();
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

  return { getSubtopicById, getSubtopics, updateSubtopic, deleteSubtopic, addSubtopic };
});
