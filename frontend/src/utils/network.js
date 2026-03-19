import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_APP_N8N_URL || "http://aiedu.tplinkdns.com:7240",
  // withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "test":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.jxxayIKLpqc83JGdNXSEamD5hLIzptjDD_TdvOYCGGs"
  },
})
