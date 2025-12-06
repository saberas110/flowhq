import axios from "axios";


export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
     headers: {
    'Content-Type': 'application/json',
  }
});



















// api.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     console.log('🍪 withCredentials:', config.withCredentials);
// console.log('headers', config.)
//     // ✅ Ensure withCredentials is always true
//     config.withCredentials = true;
//
//     return config;
//   },
//   (error: AxiosError) => {
//     console.error('❌ Request error:', error);
//     return Promise.reject(error);
//   }
// );
//
// // Response interceptor
// api.interceptors.response.use(
//   (response) => {
//     console.log('✅ Response:', response.status, response.config.url);
//     return response;
//   },
//   (error: AxiosError) => {
//     console.error('❌ Response error:', error.response?.status, error.config?.url);
//
//     if (error.response?.status === 401) {
//       console.log('↪️ 401 - Redirecting to login');
//       if (typeof window !== 'undefined') {
//         window.location.href = '/login';
//       }
//     }
//
//     return Promise.reject(error);
//   }
// );




























// import { getCookie } from "@/lib/cookies";
//
// let BASE_URL = "";
//
// export async function getCSRFToken(instance): Promice<string | null> {
//   try {
//     const response = await instace.get("accounts/csrf");
//     return response.data?.cstfToken || getCookie("csrftoken");
//   } catch (error) {
//     console.log("Error while getting CSRT");
//     return null;
//   }
// }
//
// export function CSRFInterceptor(instance) {
//   instance.interceptors.request.use(async (config) => {
//     if (config.url?.includes("csrf")) {
//       return config;
//     }
//     let csrfToken = getCookie("csrftoken");
//     if (!csrfToken) {
//       csrfToken = await getCSRFToken(instance);
//     }
//     if (csrfToken) {
//       config.headers["X-CSRFToken"] = csrfToken;
//     }
//     return config;
//   });
// }
//
// export default function RefreshInterceptors(instance) {
//   instance.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//       const originRequest = error.config;
//       if (originRequest.url.includes("") || window.location.href === BASE_URL) {
//         return Promise.reject(error);
//       }
//
//       if (error.response.status === 401) {
//         originRequest._retry = True;
//         try {
//                     await axios.post('',{},{withCredentials:true})
//                     return instance(originRequest)
//                 }catch (refreshError){
//                     console.log('Refresh token expired. redirecting to login')
//                     window.location.href = '/'
//                 }
//       }
//       return Promise.reject(error)
//
//     },
//   );
// }


