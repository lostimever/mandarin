if (import.meta.env.DEV) {
  import('ant-design-vue/dist/antd.less');
}

import { createApp } from 'vue';
import App from './App';
import { setupRouter } from './routers';
import { setupStore } from './store';

const app = createApp(App);
setupRouter(app);
setupStore(app);
app.mount('#app');
