import { defineStore } from "pinia";
import axios from "axios";
import { UrlHelper } from "@/helpers/urlHelper";

export const useBookmarkStore = defineStore("bookmark", () => {
  /**
   * Adds a bookmark for a specific question on behalf of the current user.
   *
   * @param questionId - The unique ID of the question to bookmark.
   */
  const addQuestionBookmark = (questionId: number) => {
    return new Promise((resolve, reject) => {
      // Add access token to the request for the protected route
      setAuthToken();
      axios
        .post(`${UrlHelper.apiUrl}/questions/${questionId}/bookmarks`)
        .then(() => resolve({}))
        .catch((err) => {
          const message = err.response?.data?.message || "Failed to bookmark this question.";
          reject(message);
        });
    });
  };

  /**
   * Removes the current user's bookmark for a specific question.
   *
   * @param questionId - The unique ID of the question to remove the bookmark for.
   */
  const deleteQuestionBookmark = (questionId: number) => {
    return new Promise((resolve, reject) => {
      // Add access token to the request for the protected route
      setAuthToken();
      axios
        .delete(`${UrlHelper.apiUrl}/questions/${questionId}/bookmarks`)
        .then(() => resolve({}))
        .catch(() => {
          const message = "Failed to remove your bookmark from this question.";
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

  return { addQuestionBookmark, deleteQuestionBookmark };
});
