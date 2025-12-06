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
