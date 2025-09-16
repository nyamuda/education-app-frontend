import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import type { Upvote } from "@/models/upvote";
import { UrlHelper } from "@/helpers/urlHelper";
import { ErrorResponse } from "@/models/errorResponse";
import type { PageInfo } from "@/models/pageInfo";

export const useUpvoteStore = defineStore("upvote", () => {
  const apiUrl = ref(`${UrlHelper.apiUrl}/upvotes`);

  //Gets a upvote with a given ID
  const getUpvoteById = (id: number): Promise<Upvote> => {
    return new Promise((resolve, reject) => {
      axios
        .get<Upvote>(`${apiUrl.value}/${id}`)
        .then((response) => {
          resolve(response.data);
        })
        .catch((err) => {
          const message =
            err.response.status == 404
              ? ErrorResponse.NotFound("Upvote")
              : "Something went wrong while fetching the upvote.";

          reject(message);
        });
    });
  };


  //Creates a new upvote for a question
  const addQuestionUpvote = (questionId:number) => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      axios
        .post(`${UrlHelper.apiUrl}/questions/${questionId}/upvotes`)
        .then(() => resolve({}))
        .catch((err) => {
          const message = err.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Updates a upvote with a given ID
  const updateUpvote = (id: number, updateDetails: { name: string }) => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      axios
        .put(`${apiUrl.value}/${id}`, updateDetails)
        .then(() => resolve({}))
        .catch((err) => {
          const message =
            err.response?.data?.message ||
            "There was a problem updating the upvote. Please try again.";
          reject(message);
        });
    });
  };

  //Deletes a upvote with a given ID
  const deleteUpvote = (id: number) => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      axios
        .delete(`${apiUrl.value}/${id}`)
        .then(() => resolve({}))
        .catch(() => {
          const message = "Could not delete the upvote. Please try again.";
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

  return { getUpvoteById, getUpvotes, updateUpvote, deleteUpvote, addUpvote };
});
