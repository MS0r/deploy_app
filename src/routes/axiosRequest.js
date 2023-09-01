import axios from "axios"
import dotenv from "dotenv"

dotenv.config();

const request = axios.create({
    baseURL: process.env.APP_DEV_SERVER,
    withCredentials: true
})


export default request