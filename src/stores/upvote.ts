import { defineStore } from "pinia";
import axios from "axios";
import { UrlHelper } from "@/helpers/urlHelper";
import type { Upvote } from "@/models/upvote";

export const useUpvoteStore = defineStore("upvote", () => {
  /**
   * Adds an upvote to a specific question on behalf of the current user.
   *
   * @param questionId - The unique ID of the question to upvote.
   */
  const addQuestionUpvote = (questionId: number) => {
    return new Promise((resolve, reject) => {
      // Add access token to the request for the protected route
      setAuthToken();

      axios
        .post(`${UrlHelper.apiUrl}/questions/${questionId}/upvotes`)
        .then(() => resolve({}))
        .catch((err) => {
          const message = err.response?.data?.message || "Failed to upvote this question.";
          reject(message);
        });
    });
  };

  /**
   * Removes the current user's upvote from a specific question.
   *
   * @param questionId - The unique ID of the question to remove the upvote from.
   */
  const deleteQuestionUpvote = (questionId: number) => {
    return new Promise((resolve, reject) => {
      // Add access token to the request for the protected route
      setAuthToken();

      axios
        .delete(`${UrlHelper.apiUrl}/questions/${questionId}/upvotes`)
        .then(() => resolve({}))
        .catch(() => {
          const message = "Failed to remove your upvote from this question.";
          reject(message);
        });
    });
  };

  /**
   * Retrieves all upvotes for a specific question.
   *
   * @param questionId - The unique ID of the question to get the upvotes for.
   */
  const getQuestionUpvotes = (questionId: number): Promise<Upvote[]> => {
    return new Promise((resolve, reject) => {
      axios
        .get<Upvote[]>(`${UrlHelper.apiUrl}/questions/${questionId}/upvotes`)
        .then((response) => resolve(response.data))
        .catch(() => {
          const message = "Failed to retrieve upvotes for this question.";
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

  return { addQuestionUpvote, deleteQuestionUpvote, getQuestionUpvotes };
});
