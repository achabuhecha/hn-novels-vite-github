import axios from 'axios'

// 从环境变量获取后端API基础URL，如果未设置则使用相对路径
const getBaseURL = () => {
  // 如果 VITE_API_BASE_URL 环境变量存在且不为空，则使用该值
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // 默认情况下使用相对路径，适用于后端在同一域名下部署的情况
  return '/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000
})

api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default api