import axios from "axios";

const instance = axios.create({
    baseURL: (process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000').replace(/\/$/, "") + "/api",
    withCredentials: true,
});

export default instance;

