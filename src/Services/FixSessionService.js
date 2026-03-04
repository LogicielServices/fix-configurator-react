import { ApiWithTextResponse, Delete, Get, Put, Post } from "./ApiService";
import { getRemoteDataSource } from "./DatasourceService";

export const getSessionsConnectivityStatus = async () => {
  const response = await Get('/api/fixengines/sessionsconnectivitystatus');
  return response || [];
}

export const getAllEngines = async () => {
  const response = await Get('/api/fixengines');
  return response || [];
}

export const connectToFixEngine = async (data) => {
  const response = await Post(`/api/fixengines/connect`, data);
  return response;
}

export const disconnectFixEngine = async (data) => {
  const response = await Post(`/api/fixengines/disconnect`, data);
  return response;
}

export const saveFixEngine = async (data) => {
  const props = {
    method: 'POST',
    body: data,
    url: `/api/fixengines`,
  }
  const response = await ApiWithTextResponse(props);
  return response;
}

export const deleteFixEngine = async (engineId) => {
  const response = await Delete(`/api/fixengines?engineID=${engineId}`);
  return response;
}

export const getFixMessages = async (engineID, sessionID) => {
  // "fixengines/10.0.10.130:6379::5/fixSessions/FHBLSL-INFIXABC/fixMessages/load?startID=0-0&skip=0&pageSize=8&hasFilterChanged=false&messageTypeFilterMode=INCLUDE"
  const response = getRemoteDataSource({
    key: "streamEntryId",
    url: `/api/fixengines/${engineID}/fixSessions/${sessionID}/fixMessages/load?startID=0-0`,
    paramsInUrl: true,
    isPageSize: true,
  });
  return response || {};
}

export const connectFixSession = async (engineID, sessionID) => {
  const response = await Post(`/api/fixengines/${engineID}/fixSessions/connect/${sessionID}`);
  return response;
}

export const disconnectFixSession = async (engineID, sessionID) => {
  const response = await Post(`/api/fixengines/${engineID}/fixSessions/disconnect/${sessionID}`);
  return response;
}

export const resetSequenceFixSession = async (engineID, sessionID) => {
  const response = await Put(`/api/fixengines/${engineID}/fixSessions/resetSequence/${sessionID}`);
  return response;
}

export const setSequenceFixSession = async (engineID, sessionID, inSeq, outSeq) => {
  const response = await Put(`/api/fixengines/${engineID}/fixSessions/setSequence/${sessionID}/${inSeq}/${outSeq}`);
  return response;
}

export const getConnectedEngines = async () => {
  const response = await Get('/api/fixengines/connectedengines');
  return response;
}
