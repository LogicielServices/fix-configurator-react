import { Get, Post, Put } from "./ApiService";

export const getAllUserRoles = async () => {
  const response = await Get('/api/userRole/getAll');
  return response;
}

export const registerUser = async (data) => {
  const response = await Post("/api/users/create", data);
  return response;
}

export const updateUser = async (data) => {
  const response = await Post("/api/users/update", data);
  return response;
}

export const getUserById = async (id) => {
  const response = await Get(`/api/users/getById/${id}`);
  return response;
}

export const reValidateSignedInUser = async (username, password) => {
  const response = await Post(`/api/account/reValidateSignedInUser?username=${username}&password=${password}`);
  return response;
}

export const getAllUsersAgainstClient = async () => {
  const response = await Get('/api/users/getAllUsersAgainstClient');
  return response;
}

export const getAllUsersAgainstClientById = async (id) => {
  const response = await Get(`/api/users/getAllUsersAgainstClientRole/${id}`);
  return response;
}

export const createRole = async (data) => {
  const response = await Post('/api/UserRole/create', data);
  return response;
}

export const updateRole = async (data) => {
  const response = await Put('/api/UserRole/update', data);
  return response;
}
