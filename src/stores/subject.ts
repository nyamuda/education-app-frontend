import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import type { Subject } from "@/models/subject";
import { UrlHelper } from "@/helpers/urlHelper";
import { ErrorResponse } from "@/models/errorResponse";
import type { PageInfo } from "@/models/pageInfo";
import type { SubjectQueryParams } from "@/interfaces/subjects/subjectQueryParams";

export const useSubjectStore = defineStore("subject", () => {
  const apiUrl = ref(`${UrlHelper.apiUrl}/subjects`);

  //Gets a subject with a given ID
  const getSubjectById = (id: number): Promise<Subject> => {
    return new Promise((resolve, reject) => {
      axios
        .get<Subject>(`${apiUrl.value}/${id}`)
        .then((response) => {
          resolve(response.data);
        })
        .catch((err) => {
          const message =
            err.response.status == 404
              ? ErrorResponse.NotFound("Subject")
              : ErrorResponse.Unexpected();

          reject(message);
        });
    });
  };

  //Gets a paginated list of subjects along with pagination metadata
  const getSubjects = (params: SubjectQueryParams): Promise<PageInfo<Subject>> => {
    return new Promise((resolve, reject) => {
      axios
        .get<PageInfo<Subject>>(`${apiUrl.value}`, {
          params: params,
        })
        .then((response) => {
          //return the subjects
          resolve(response.data);
        })
        .catch((err) => {
          const message = err.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Creates a new subject
  const addSubject = (details: { name: string; levelId: number }) => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      axios
        .post(`${apiUrl.value}`, details)
        .then(() => resolve("Subject added successfully."))
        .catch((err) => {
          const message = err.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Updates a subject with a given ID
  const updateSubject = (id: number, updateDetails: { name: string; examBoardIds: number[] }) => {
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

  //Deletes a subject with a given ID
  const deleteSubject = (id: number) => {
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

  return { getSubjectById, getSubjects, updateSubject, deleteSubject, addSubject };
});
