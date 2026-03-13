import { Delete, Get, Post } from "./ApiService";

export const getTagvaluepairfilters = async () => {
  const response = await Get("/api/fixfilters/tagvaluepairfilters");
  return response;
};

export const saveFixMessageDescription = async (data) => {
  const response = await Post(`/api/FixTagValuesConfiguration/Upsert`, data);
  return response;
}

export const getConfiguredFixMessagesStreams = async (sessionId) => {
  const response = await Get(`/api/FixTagValuesConfiguration/GetConfiguredFixMessagesStreams?sessionId=${sessionId}`);
  return response;
};

export const getAllMessageEmailConfigurations = async () => {
  const response = await Get(`/api/FixTagValuesConfiguration/GetAll`);
  return response;
};

export const deleteMessageEmailConfiguration = async (id) => {
  const response = await Delete(`/api/FixTagValuesConfiguration/Delete?id=${id}`);
  return response;
};

