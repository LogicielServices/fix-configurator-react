import { Get } from "./ApiService";

export const fixSessionHistory = async () => {
  const response = await Get('/api/fixsessionhistory');
  return response || [];
}
