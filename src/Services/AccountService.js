import { Get, Post } from "./ApiService";

export const getAllUserRoles = async () => {
  const response = await Get('/api/userRole/getAll');
  return response;
}

export const registerUser = async (data) => {
  const response = await Post("/api/users/create", data);
  return response;
}
