import type { AxiosResponse } from 'axios';
import type { RequestOptions, Result } from './types';
import type { AxiosTransform, CreateAxiosOptions } from './axiosTransform';

import { VAxios } from './Axios';
import { checkStatus } from './checkStatus';

import { useGlobSetting } from '/@/hooks/setting';
import { useMessage } from '/@/hooks/web/useMessage';

import { RequestEnum, ResultEnum, ContentTypeEnum } from '/@/enums/httpEnum';

import { isString } from '/@/utils/is';
// import { getToken } from '/@/utils/auth';
import { setObjToUrlParams, deepMerge } from '/@/utils';
// import { errorStore } from '/@/store/modules/error';
import { errorResult } from './const';
// import { useI18n } from '/@/hooks/web/useI18n';
import { createNow, formatRequestDate } from './helper';

const globSetting = useGlobSetting();
const prefix = globSetting.urlPrefix;
const { createMessage, createErrorModal } = useMessage();

const transform: AxiosTransform = {
  /**
   * @description: 处理请求数据
   */
  transformRequestHook: (res: AxiosResponse<Result>, options: RequestOptions) => {
    const { isTransformRequestResult } = options;
    // 不进行任何处理，直接返回
    // 用于页面代码可能需要直接获取code，data，message这些信息时开启
    if (!isTransformRequestResult) {
      return res.data;
    }

    // 错误的时候返回
    const { data } = res;
    if (!data) {
      // return '[HTTP] Request has no return value';
      return errorResult;
    }

    //  这里 code，result，message为 后台统一的字段，需要在 types.ts内修改为项目自己的接口返回格式
    const { code, result, message } = data;

    const hasSuccess = data && Reflect.has(data, 'code') && code === ResultEnum.SUCCESS;
    if (!hasSuccess) {
      if (message) {
        // errorMessageMode=‘modal’的时候会显示modal错误弹窗，而不是消息提示，用于一些比较重要的错误
        if (options.errorMessageMode === 'modal') {
          createErrorModal({ title: '错误提示', content: message });
        } else if (options.errorMessageMode === 'message') {
          createMessage.error(message);
        }
      }
      Promise.reject(new Error(message));
      return errorResult;
    }

    // 接口请求成功，直接返回结果
    if (code === ResultEnum.SUCCESS) {
      return result;
    }

    // 接口请求错误，统一提示错误信息
    if (code === ResultEnum.ERROR) {
      if (message) {
        createMessage.error(data.message);
        Promise.reject(new Error(message));
      } else {
        const msg = '操作失败，系统异常!';
        createMessage.error(msg);
        Promise.reject(new Error(msg));
      }
      return errorResult;
    }
    // 登录超时
    if (code === ResultEnum.TIMEOUT) {
      const timeoutMsg = '登录超时，请重新登录!';
      createErrorModal({
        title: '操作失败',
        content: timeoutMsg,
      });
      Promise.reject(new Error(timeoutMsg));
      return errorResult;
    }
    return errorResult;
  },

  /**
   * @description: 请求之前处理config
   */
  beforeRequestHook: (config, options) => {
    const { apiUrl, joinPrefix, joinParamsToUrl, formatDate, joinTime = true } = options;

    if (joinPrefix) {
      config.url = `${prefix}${config.url}`;
    }
    if (apiUrl && isString(apiUrl)) {
      config.url = `${apiUrl}${config.url}`;
    }

    const params = config.params || {};

    if (config.method?.toUpperCase() === RequestEnum.GET) {
      if (!isString(params)) {
        // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
        config.params = Object.assign(params || {}, createNow(joinTime, false));
      } else {
        // 兼容restful风格
        config.url = config.url + params + `${createNow(joinTime, true)}`;
        config.params = undefined;
      }
    } else {
      if (!isString(params)) {
        formatDate && formatRequestDate(params);
        config.data = params;
        config.params = undefined;
        if (joinParamsToUrl) {
          config.url = setObjToUrlParams(config.url as string, config.data);
        }
      } else {
        // 兼容restful风格
        config.url = config.url + params;
        config.params = undefined;
      }
    }
    return config;
  },

  /**
   * @description: 请求拦截器处理
   */
  requestInterceptors: (config) => {
    // 请求之前处理config
    // const token = getToken();
    const token = '';
    if (token) {
      // jwt token
      config.headers.Authorization = token;
    }
    return config;
  },

  /**
   * @description: 响应错误处理
   */
  responseInterceptorsCatch: (error: any) => {
    const { response, code, message } = error || {};
    const msg: string = response?.data?.error?.message ?? '';
    const err: string = error?.toString?.() ?? '';
    try {
      if (code === 'ECONNABORTED' && message.indexOf('timeout') !== -1) {
        createMessage.error('接口请求超时，请刷新页面重试！');
      }
      if (err?.includes('Network Error')) {
        createErrorModal({
          title: '网络异常',
          content: '请检查您的网络连接是否正常!',
        });
      }
    } catch (error) {
      throw new Error(error);
    }
    checkStatus(error?.response?.status, msg);
    return Promise.reject(error);
  },
};

function createAxios(opt?: Partial<CreateAxiosOptions>) {
  return new VAxios(
    deepMerge(
      {
        timeout: 10 * 1000,
        // 基础接口地址
        // baseURL: globSetting.apiUrl,
        // 接口可能会有通用的地址部分，可以统一抽取出来
        prefixUrl: prefix,
        headers: { 'Content-Type': ContentTypeEnum.JSON },
        // 如果是form-data格式
        // headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED },
        // 数据处理方式
        transform,
        // 配置项，下面的选项都可以在独立的接口请求中覆盖
        requestOptions: {
          // 默认将prefix 添加到url
          joinPrefix: true,
          // 需要对返回数据进行处理
          isTransformRequestResult: true,
          // post请求的时候添加参数到url
          joinParamsToUrl: false,
          // 格式化提交参数时间
          formatDate: true,
          // 消息提示类型
          errorMessageMode: 'message',
          // 接口地址
          apiUrl: globSetting.apiUrl,
          //  是否加入时间戳
          joinTime: true,
          // 忽略重复请求
          ignoreCancelToken: true,
        },
      },
      opt || {},
    ),
  );
}
export const defHttp = createAxios();