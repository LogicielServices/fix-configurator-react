import { Delete, Get } from "./ApiService";

export const getFixSessionHistory = async () => {
  const response = await Get('/api/fixsessionhistory');
  return response || [];
}

export const deleteFixSessionsHistory = async () => {
  const response = await Delete('/api/fixsessionhistory');
  return response;
}
