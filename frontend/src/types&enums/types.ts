export type ReturnResponseType<T> = {
  is_successful: boolean;
  error_msg: string;
  success: string;
  response: T;
};

export type LocalStorageUserDataType = {
  token?: string;
  username?: string;
};

export type MessageFromServer = {
  username: string;
  message: string;
};
