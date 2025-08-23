import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import type { Topic } from "@/models/topic";
import { UrlHelper } from "@/helpers/urlHelper";
import { ErrorResponse } from "@/models/errorResponse";
import type { PageInfo } from "@/models/pageInfo";
import type { TopicQueryParams } from "@/interfaces/topics/topicQueryParams";

export const useTopicStore = defineStore("topic", () => {
  const apiUrl = ref(`${UrlHelper.apiUrl}/topics`);

  //Gets a topic with a given ID
  const getTopicById = (id: number): Promise<Topic> => {
    return new Promise((resolve, reject) => {
      axios
        .get<Topic>(`${apiUrl.value}/${id}`)
        .then((response) => {
          resolve(response.data);
        })
        .catch((err) => {
          const message =
            err.response.status == 404
              ? ErrorResponse.NotFound("Topic")
              : ErrorResponse.Unexpected();

          reject(message);
        });
    });
  };

  //Gets a paginated list of topics along with pagination metadata
  const getTopics = (params: TopicQueryParams): Promise<PageInfo<Topic>> => {
    return new Promise((resolve, reject) => {
      axios
        .get<PageInfo<Topic>>(`${apiUrl.value}`, {
          params,
        })
        .then((response) => {
          //return the topics
          resolve(response.data);
        })
        .catch((err) => {
          const message = err.response.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Creates a new topic
  const addTopic = (details: { name: string; subjectId: number }) => {
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

  const uploadTopics = (subjectId: number, details: FormData) => {
    return new Promise((resolve, reject) => {
      //add access token to the request
      //to access the protected route
      setAuthToken();
      axios
        .post(`${UrlHelper.apiUrl}/subjects/${subjectId}/upload-topics`, details)
        .then(() => resolve({}))
        .catch((err) => {
          const message = err.response.data?.message || ErrorResponse.Unexpected();
          reject(message);
        });
    });
  };

  //Updates a topic with a given ID
  const updateTopic = (id: number, updateDetails: { name: string; subjectIds: number[] }) => {
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

  //Deletes a topic with a given ID
  const deleteTopic = (id: number) => {
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

  return { getTopicById, getTopics, updateTopic, deleteTopic, addTopic };
});
