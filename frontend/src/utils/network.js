import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_APP_FASTAPI_URL || "http://aiedu.tplinkdns.com:6011",
  // withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  },
})

export const n8n_api = axios.create({
  baseURL: import.meta.env.VITE_APP_N8N_URL || "http://aiedu.tplinkdns.com:7242",
  // withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  },
})
