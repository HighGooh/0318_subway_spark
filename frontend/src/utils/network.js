import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_APP_FASTAPI_URL || "http://localhost:8002",
  // withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  },
})

export const n8n_api = axios.create({
  baseURL: import.meta.env.VITE_APP_FASTAPI_URL || "http://aiedu.tplinkdns.com:7240",
  // withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  },
})
