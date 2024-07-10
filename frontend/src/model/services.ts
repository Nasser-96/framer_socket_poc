import { makeRequest } from "@/axios/axios";
import { AxiosMethods } from "@/types&enums/enums";

export const loginService = (data: any) => {
  return makeRequest({ url: "auth/login", method: AxiosMethods.POST, data });
};

export const getLiveKitToken = (params: any) => {
  return makeRequest({
    url: "livekit/token",
    method: AxiosMethods.GET,
    params,
  });
};
