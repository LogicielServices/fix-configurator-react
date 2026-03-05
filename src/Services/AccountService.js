import { Get, Post } from "./ApiService";

export const getAllUserRoles = async () => {
  const response = await Get('/api/userRole/getAll');
  return response;
}

export const registerUser = async (data) => {
  const response = await Post("/api/users/create", data);
  return response;
}

export const reValidateSignedInUser = async (username, password) => {
  const response = await Post("/api/account/reValidateSignedInUser", {
    username,
    password,
  });
  return response;
}
