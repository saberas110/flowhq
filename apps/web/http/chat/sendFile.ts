import { TSendMessageParams, TFileUploadResponse } from "@flowhq/shared"
import { apichat } from "../axiosConfig"



export const sendFile = async (
    data: FormData
): Promise<TFileUploadResponse> =>{

    const res = await apichat.post<TFileUploadResponse>('upload', {data}, {
        headers: {'Content-Type': 'multipart/form-data'}
    })
    return res.data

}