//
//
// const AUTH_URL = 'http://localhost:8000/api/accounts/'
//
// const authApi = axios.create({
//     baseURL: AUTH_URL,
//     withCredentials: true,
// })
//
// // CSRFInterceptor(authApi)
// // RefreshInterceptors(authApi)
//
//
// export async function statusUser(){
//     try {
//         const response = await authApi.get('userstatus')
//     return response.data
//     }catch (error){
//         throw error
//     }
// }