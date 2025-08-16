import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import { UrlHelper } from "@/helpers/urlHelper";
import { ErrorResponse } from "@/models/errorResponse";
import type { PageInfo } from "@/models/pageInfo";
import type { ExamBoard } from "@/models/examBoard";
import { ExamBoardSortOption } from "@/enums/examBoards/examBoardSortOption";

export const useExamBoardStore = defineStore("examBoard", () => {
  const apiUrl = ref(`${UrlHelper.apiUrl}/exam-boards`);

  //Gets a exam board with a given ID
  const getExamBoardById = (id: number): Promise<ExamBoard> => {
    return new Promise((resolve, reject) => {
      axios
        .get<ExamBoard>(`${apiUrl.value}/${id}`)
        .then((response) => {
          resolve(response.data);
        })
        .catch((err) => {
          const message =
            err.response?.status == 404
              ? ErrorResponse.NotFound("Exam board")
              : "Something went wrong while fetching the exam board.";

          reject(message);
        });
    });
  };

  //Gets a paginated list of exam boards along with pagination metadata
  const getExamBoards = (
    page: number = 1,
    pageSize: number = 10,
    sortBy: ExamBoardSortOption = ExamBoardSortOption.DateCreated,
    curriculumId: number | null,
  ): Promise<PageInfo<ExamBoard>> => {
    return new Promise((resolve, reject) => {
      axios
        .get<PageInfo<ExamBoard>>(`${apiUrl.value}`, {
          params: {
            page,
            pageSize,
            sortBy,
            curriculumId,
          },
        })
        .then((response) => {
          //return the exam boards
          resolve(response.data);
        })
        .catch((err) => {
          const message = err.response?.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Creates a new exam board
  const addExamBoard = (details: { name: string; curriculumId: number }) => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      axios
        .post(`${apiUrl.value}`, details)
        .then(() => resolve("Exam board added successfully."))
        .catch((err) => {
          const message = err.response.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Updates an exam board with a given ID
  const updateExamBoard = (id: number, updateDetails: { name: string; curriculumId: number }) => {
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

  //Deletes an exam board with a given ID
  const deleteExamBoard = (id: number) => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      axios
        .delete(`${apiUrl.value}/${id}`)
        .then(() => resolve({}))
        .catch(() => {
          const message = "Could not delete the exam board. Please try again.";
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

  return { getExamBoardById, getExamBoards, updateExamBoard, deleteExamBoard, addExamBoard };
});
