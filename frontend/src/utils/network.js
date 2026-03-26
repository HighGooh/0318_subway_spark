import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_APP_FASTAPI_URL,
  // withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  },
})

export const n8n_api = axios.create({
  baseURL: import.meta.env.VITE_APP_N8N_URL,
  // withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  },
})
