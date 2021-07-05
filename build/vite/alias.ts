import { resolve } from 'path';
import type { Alias } from 'vite';

function pathResolve(dir: string, dirname: string) {
  return resolve(dirname, '.', dir);
}

export function createAlias(alias: [string, string, string][]): Alias[] {
  return alias.map((item) => {
    const [alia, src, dirname] = item;
    return {
      find: new RegExp(alia),
      replacement: pathResolve(src, dirname) + '/',
    };
  });
}
