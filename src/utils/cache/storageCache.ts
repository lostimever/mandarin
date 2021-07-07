import type { EncryptionParams } from './../cipher';

import { cacheCipher } from '/@/settings/encryptionSetting';
import { AesEncryption } from './../cipher';
import { isNullOrUnDef } from '../is';

export interface CreateStorageParams extends EncryptionParams {
  prefixKey: string;
  storage: Storage;
  hasEncrypt: boolean;
  timeout?: Nullable<number>;
}

export const createStorage = ({
  prefixKey = '',
  storage = sessionStorage,
  key = cacheCipher.key,
  iv = cacheCipher.iv,
  timeout = null,
  hasEncrypt = true,
}: Partial<CreateStorageParams> = {}) => {
  if (hasEncrypt && [key.length, iv.length].some((item) => item != 16)) {
    throw new Error('When hasEncrypt is true, the key or iv must be 16 bits!');
  }

  const encryption = new AesEncryption({ key, iv });

  /**
   * @name Cache class
   * @description Construction parameters can be passed into sessionStorage, localStorage,
   * @class Cache
   * @example
   */
  const WebStorage = class WebStorage {
    private storage: Storage;
    private prefixKey?: string;
    private encryption: AesEncryption;
    private hasEncrypt: boolean;

    constructor() {
      this.storage = storage;
      this.prefixKey = prefixKey;
      this.encryption = encryption;
      this.hasEncrypt = hasEncrypt;
    }

    private getKey(key: string) {
      return `${this.prefixKey}${key}`.toUpperCase();
    }

    /**
     *
     * @description set cache
     * @param {string} key
     * @param {*} value
     * @param {(number | null)} [expire=timeout]
     */
    set(key: string, value: any, expire: number | null = timeout) {
      const stringData = JSON.stringify({
        value,
        time: Date.now(),
        expire: !isNullOrUnDef(expire) ? new Date().getTime() + expire * 1000 : null,
      });

      const stringifyValue = this.hasEncrypt
        ? this.encryption.encryptByAES(stringData)
        : stringData;

      this.storage.setItem(this.getKey(key), stringifyValue);
    }

    /**
     *
     * @description read cache
     * @param {string} key
     * @param {*} [def=null]
     * @return {*}  {*}
     */
    get(key: string, def: any = null): any {
      const val = this.storage.getItem(this.getKey(key));
      if (!val) return def;

      try {
        const decVal = this.hasEncrypt ? this.encryption.decryptByAES(val) : val;
        const data = JSON.parse(decVal);
        const { value, expire } = data;
        if (isNullOrUnDef(expire) || expire >= new Date().getTime()) {
          return value;
        }
      } catch (e) {
        return def;
      }
    }

    /**
     *
     * @description Delete cache based on key
     * @param {string} key
     */
    remove(key: string) {
      this.storage.removeItem(this.getKey(key));
    }

    /**
     * @description Delete all caches of this instance
     *
     */
    clear(): void {
      this.storage.clear();
    }
  };

  return new WebStorage();
};
