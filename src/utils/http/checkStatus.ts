import type { ErrorMessageMode } from '/#/axios';

import { useMessage } from '/@/hooks/web/useMessage';
import projectSetting from '/@/settings/projectSetting';
import { SessionTimeoutProcessingEnum } from '/@/enums/appEnum';

const { createMessage, createErrorModal } = useMessage();
const error = createMessage.error!;
const stp = projectSetting.sessionTimeoutProcessing;

export function checkStatus(
  status: number,
  msg: string,
  errorMessageMode: ErrorMessageMode = 'message',
): void {
  let errMessage = '';
  switch (status) {
    case 400:
      errMessage = `${msg}`;
      break;

    case 401:
      errMessage = '用户没有权限（令牌、用户名、密码错误）!';
      if (stp === SessionTimeoutProcessingEnum.PAGE_COVERAGE) {
        // userStore.setToken(undefined);
        // userStore.setSessionTimeout(true);
      } else {
        // userStore.logout(true);
      }
      break;
    case 403:
      console.log(msg);
      break;
    case 404:
      errMessage = '网络请求错误,未找到该资源!';
      break;
    case 405:
      console.log(msg);
      break;
    case 408:
      console.log(msg);
      break;
    case 500:
      console.log(msg);
      break;
    case 501:
      console.log(msg);
      break;
    case 502:
      console.log(msg);
      break;
    case 503:
      console.log(msg);
      break;
    case 504:
      console.log(msg);
      break;
    case 505:
      console.log(msg);
      break;

    default:
      break;
  }

  if (errMessage) {
    if (errorMessageMode === 'modal') {
      createErrorModal({ title: '错误提示', content: errMessage });
    } else if (errorMessageMode === 'message') {
      error({ content: errMessage, key: `global_error_message_status_${status}` });
    }
  }
}
