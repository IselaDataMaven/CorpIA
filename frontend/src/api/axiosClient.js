import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


axiosClient.interceptors.request.use(
  (config) => {

    const session =
      localStorage.getItem("corpia_session") ||
      sessionStorage.getItem("corpia_session");


    if (session) {
      const { token } = JSON.parse(session);

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }
    }


    return config;
  },

  (error) => Promise.reject(error)
);


axiosClient.interceptors.response.use(

  (response) => response,

  (error) => {

    if (error.response?.status === 401) {
      console.warn("Token expirado");
    }

    return Promise.reject(error);
  }

);


export default axiosClient;