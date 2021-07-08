import type { AppRouteRecordRaw } from '/@/routers/types';

export const LoginRoute: AppRouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: () => import('/@/views/sys/login/Login'),
  meta: {
    title: '登录',
  },
};

export const basicRoutes = [LoginRoute];
