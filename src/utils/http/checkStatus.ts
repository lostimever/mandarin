import { useMessage } from '/@/hooks/web/useMessage';

const { createMessage } = useMessage();
const error = createMessage.error!;

export function checkStatus(status: number, msg: string): void {
  switch (status) {
    case 400:
      error(msg);
      break;

    case 401:
      console.log(msg);
      break;
    case 403:
      console.log(msg);
      break;
    case 404:
      console.log(msg);
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
}
