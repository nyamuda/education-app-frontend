import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import type { Question } from "@/models/question";
import { UrlHelper } from "@/helpers/urlHelper";
import { ErrorResponse } from "@/models/errorResponse";
import type { PageInfo } from "@/models/pageInfo";
import type { QuestionSubmission } from "@/interfaces/questions/questionSubmission";
import type { QuestionStatus } from "@/enums/questions/questionStatus";
import type { QuestionQueryParams } from "@/interfaces/questions/questionQueryParams";
import { CurriculumHierarchyFilter } from "@/models/curriculumHierarchyFilter";

export const useQuestionStore = defineStore("question", () => {
  const apiUrl = ref(`${UrlHelper.apiUrl}/questions`);
  const filter = ref(new CurriculumHierarchyFilter());

  //Gets a question with a given ID
  const getQuestionById = (id: number): Promise<Question> => {
    return new Promise((resolve, reject) => {
      axios
        .get<Question>(`${apiUrl.value}/${id}`)
        .then((response) => {
          resolve(response.data);
        })
        .catch((err) => {
          const message =
            err.response?.status == 404
              ? ErrorResponse.NotFound("Question")
              : "Something went wrong while fetching the question.";

          reject(message);
        });
    });
  };

  //Gets a paginated list of questions along with pagination metadata
  const getQuestions = (params: QuestionQueryParams): Promise<PageInfo<Question>> => {
    return new Promise((resolve, reject) => {
      axios
        .get<PageInfo<Question>>(`${apiUrl.value}`, {
          params: {
            ...params,
          },
        })
        .then((response) => {
          //return the questions
          resolve(response.data);
        })
        .catch((err) => {
          const message = err.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Creates a new question
  //Returns the newly created question
  const addQuestion = (submissionData: QuestionSubmission): Promise<Question> => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      axios
        .post(`${apiUrl.value}`, submissionData)
        .then((response) => resolve(response.data))
        .catch((err) => {
          console.log(err);
          const message = err.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Updates a question with a given ID
  const updateQuestion = (id: number, updateDetails: QuestionSubmission) => {
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
            "There was a problem updating the question. Please try again.";
          reject(message);
        });
    });
  };

  // Updates the status of an existing question.
  const updateQuestionStatus = (questionId: number, status: QuestionStatus) => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      axios
        .patch(`${apiUrl.value}/${questionId}/status`, { status })
        .then(() => resolve({}))
        .catch((err) => {
          const message = err.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Deletes a question with a given ID
  const deleteQuestion = (id: number) => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      axios
        .delete(`${apiUrl.value}/${id}`)
        .then(() => resolve({}))
        .catch(() => {
          const message = "Could not delete the question. Please try again.";
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
    getQuestionById,
    getQuestions,
    updateQuestion,
    deleteQuestion,
    addQuestion,
    updateQuestionStatus,
    filter,
  };
});
