import { ReturnResponseType } from 'src/types&enums/types';

export default function ReturnResponse({
  error_msg,
  response,
  is_successful,
  success,
}: ReturnResponseType<any>) {
  return {
    is_successful: error_msg || !is_successful ? false : true,
    response: response,
    error_msg: error_msg ? error_msg : '',
    success: success ? success : '',
  };
}
