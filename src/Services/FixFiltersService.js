import { Get, Post } from "./ApiService";

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

