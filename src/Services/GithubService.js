import { Get, Post, Put } from "./ApiService";

export const addAcceptor = async (engineId, fileName, engineName, data) => {
  const response = await Post(
    `/api/GitHub/add_acceptor?engineId=${engineId}&fileName=${fileName}&engineName=${engineName}`,
    data,
  );
  return response;
};

export const addInitiator = async (engineId, fileName, engineName, data) => {
  const response = await Post(
    `/api/GitHub/add_initiator?engineId=${engineId}&fileName=${fileName}&engineName=${engineName}`,
    data,
  );
  return response;
};

export const getBranches = async () => {
  const response = await Get(`/api/GitHub/getBranches`);
  return response;
};

export const getConfigDetails = async (engineId, fileName, engineName) => {
  const response = await Get(`/api/GitHub/GetConfigDetail?engineId=${engineId}&fileName=${fileName}&engineName=${engineName}`);
  return response;
}

export const updateCfgIni = async (engineId, fileName, engineName, fileContents) => {
  const data = { fileContents };
  const response = await Put(`/api/GitHub/UpdateCFG_INI?engineId=${engineId}&fileName=${fileName}&engineName=${engineName}`, data);
  return response;
}

export const getSessionDetail = async (engineId, fileName, engineName, senderCompId, targetCompId) => {
  const response = await Get(`/api/gitHub/getSessionDetail?engineId=${engineId}&fileName=${fileName}&engineName=${engineName}&SenderCompID=${senderCompId}&TargetCompID=${targetCompId}`);
  return response;
}
