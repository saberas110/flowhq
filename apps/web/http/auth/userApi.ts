import {TLoginDto, TLogOutResponse, TRegisterDto, TRegisterResponse} from "@flowhq/shared";

import { api } from "@/http/axiosConfig";

export const registerUser = async (
  data: TRegisterDto,
): Promise<TRegisterResponse> => {
  const res = await api.post("register", data);
  return res.data
};

export const loginUser = async (
  data: TLoginDto,
): Promise<TRegisterResponse> => {
  const res = await api.post("login", data);
  return res.data
};




export const logOutUser = async ():Promise<TLogOutResponse>=>{
  const res = await api.get("logout")
  return res.data
}