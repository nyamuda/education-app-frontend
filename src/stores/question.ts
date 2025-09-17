import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import type { Question } from "@/models/question";
import { UrlHelper } from "@/helpers/urlHelper";
import { ErrorResponse } from "@/models/errorResponse";
import { PageInfo } from "@/models/pageInfo";
import type { QuestionSubmission } from "@/interfaces/questions/questionSubmission";
import type { QuestionStatus } from "@/enums/questions/questionStatus";
import type { QuestionQueryParams } from "@/interfaces/questions/questionQueryParams";
import { CurriculumHierarchyFilter } from "@/models/curriculumHierarchyQuestionFilter";
import type { Ref } from "vue";

export const useQuestionStore = defineStore("question", () => {
  const apiUrl = ref(`${UrlHelper.apiUrl}/questions`);
  // Keep track of the currently applied filters
  const filter: Ref<CurriculumHierarchyFilter> = ref(new CurriculumHierarchyFilter());
  const questions = ref(new PageInfo<Question>());
  const isGettingQuestions = ref(false);

  //Gets a question with a given ID
  const getQuestionById = (id: number): Promise<Question> => {
    return new Promise((resolve, reject) => {
      // If the user is logged in, add access token to the request (optional since this is not a protected route).
      // The token can be used in the backend to determine if the logged in user has
      // bookmarked or upvoted this question.
      setAuthToken();
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
      isGettingQuestions.value = true;
      axios
        .get<PageInfo<Question>>(`${apiUrl.value}`, {
          params: {
            ...params,
          },
        })
        .then((response) => {
          questions.value = response.data;
          //return the questions
          resolve(response.data);
        })
        .catch((err) => {
          const message = err.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        })
        .finally(() => (isGettingQuestions.value = false));
    });
  };
  //Loads the next batch of questions and appends them to the current list.
  const loadMoreQuestions = (params: QuestionQueryParams) => {
    return new Promise((resolve, reject) => {
      axios
        .get<PageInfo<Question>>(`${apiUrl.value}`, {
          params: {
            ...params,
          },
        })
        .then((response) => {
          //new data
          const { page, pageSize, hasMore, totalItems, items } = response.data;
          //update the questions metadata
          questions.value = {
            page,
            pageSize,
            hasMore,
            totalItems,
            items: [...questions.value.items, ...items],
          };
          resolve({});
        })
        .catch((err) => {
          const message = err.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  /**
   * Fetches questions that match the provided search term.
   * This method is intended for lightweight search suggestions (e.g. autocomplete),
   * and does NOT apply other filters such as subject, topic, or level.
   *
   * @param search The search term to match against question content or title.
   * @param page Optional page number (default is 1).
   * @param pageSize Optional page size (default is 10).
   * @returns A paginated list of matching questions.
   */
  const searchQuestions = (
    search: string,
    page = 1,
    pageSize = 10,
  ): Promise<PageInfo<Question>> => {
    return new Promise((resolve, reject) => {
      axios
        .get<PageInfo<Question>>(`${apiUrl.value}`, {
          params: {
            search,
            page,
            pageSize,
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
    searchQuestions,
    updateQuestion,
    deleteQuestion,
    addQuestion,
    updateQuestionStatus,
    filter,
    questions,
    isGettingQuestions,
    loadMoreQuestions,
  };
});
