import { Delete, Get, Post, Put } from "./ApiService"

export const upsertJenkinsConfig = async (data) => {
  const response = await Put('/api/JenkinsConfiguration/Upsert', data)
  return response;
}

export const deleteJenkinsConfig = async (engineID) => {
  const response = await Delete(`/api/jenkinsConfiguration/delete?engineID=${engineID}`);
  return response;
}

export const getJenkinsAgents = async () => {
  const response = await Get('/api/JenkinsConfiguration/GetJenkinsSlaveNodes');
  return response || {};
}

export const getJobStatus = async (agentName) => {
  const response = await Get(`/api/JenkinsConfiguration/JobStatus?agentName=${agentName}`);
  return response || {};
}

export const getJenkinsConfig = async (engineID) => {
  const response = await Get(`/api/JenkinsConfiguration/GetById?engineID=${engineID}`);
  return response || {};
}

export const triggerJenkins = async (branchName, environment, engineID) => {
  const response = await Post(`/api/JenkinsConfiguration/JenkinsTrigger?branchName=${branchName}&environment=${environment}&engineID=${engineID}`);
  return response || {};
}

export const startFixEngine = async (engineID) => {
  const response = await Post(`/api/jenkinsConfiguration/startFixEngine?engineID=${engineID}`);
  return response || {};
}

export const stopFixEngine = async (engineID) => {
  const response = await Post(`/api/jenkinsConfiguration/stopFixEngine?engineID=${engineID}`);
  return response || {};
}
