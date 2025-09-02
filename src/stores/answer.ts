import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import type { Answer } from "@/models/answer";
import { UrlHelper } from "@/helpers/urlHelper";
import { ErrorResponse } from "@/models/errorResponse";
import type { PageInfo } from "@/models/pageInfo";
import type { AnswerQueryParams } from "@/interfaces/answers/answerQueryParams";
import type { AnswerSubmission } from "@/interfaces/answers/answerSubmission";

export const useAnswerStore = defineStore("answer", () => {
  const apiUrl = ref(`${UrlHelper.apiUrl}/answers`);

  //Gets a answer with a given ID
  const getAnswerById = (id: number): Promise<Answer> => {
    return new Promise((resolve, reject) => {
      axios
        .get<Answer>(`${apiUrl.value}/${id}`)
        .then((response) => {
          resolve(response.data);
        })
        .catch((err) => {
          const message =
            err.response.status == 404
              ? ErrorResponse.NotFound("Answer")
              : ErrorResponse.Unexpected();

          reject(message);
        });
    });
  };

  /**
   * Retrieves a paginated list of answers along with pagination metadata.
   * Note: Each answer includes its related question, exam board, and curriculum.
   *
   * @param params Query parameters for filtering, sorting, and pagination.
   */
  const getAnswers = (params: AnswerQueryParams): Promise<PageInfo<Answer>> => {
    return new Promise((resolve, reject) => {
      axios
        .get<PageInfo<Answer>>(`${apiUrl.value}`, {
          params: params,
        })
        .then((response) => {
          //return the answers
          resolve(response.data);
        })
        .catch((err) => {
          const message = err.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };
  /**
   * Retrieves a paginated list of answers for a given educational question along with pagination metadata.
   * Note: Each answer includes its related topics and subtopics.
   *
   * @param params Query parameters for filtering, sorting, and pagination.
   */
  const getAnswersForQuestion = (params: AnswerQueryParams): Promise<PageInfo<Answer>> => {
    return new Promise((resolve, reject) => {
      axios
        .get<PageInfo<Answer>>(`${UrlHelper.apiUrl}/questions/${params.questionId}/answers`, {
          params: params,
        })
        .then((response) => {
          //return the answers
          resolve(response.data);
        })
        .catch((err) => {
          const message = err.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Creates a new answer
  const addAnswer = (payload: AnswerSubmission) => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      const { contentHtml, contentText, questionId } = payload;
      axios
        .post(`${UrlHelper.apiUrl}/questions/${questionId}`, { contentHtml, contentText })
        .then(() => resolve("Answer added successfully."))
        .catch((err) => {
          const message = err.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Updates a answer with a given ID
  const updateAnswer = (answerId: number, payload: AnswerSubmission) => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      const { contentHtml, contentText } = payload;
      axios
        .put(`${apiUrl.value}/${answerId}`, { contentHtml, contentText })
        .then(() => resolve({}))
        .catch((err) => {
          const message = err.response.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Deletes a answer with a given ID
  const deleteAnswer = (id: number) => {
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

  return {
    getAnswerById,
    getAnswers,
    updateAnswer,
    deleteAnswer,
    addAnswer,
    getAnswersForQuestion,
  };
});
