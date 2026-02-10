import { Get } from "./ApiService";

export const checkConnectivity = async (data) => {
  const response = await Get(`/api/tcp/${data?.ip}/${data?.port}`);
  return response
};
