import { ConfigProvider } from 'ant-design-vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { defineComponent, reactive } from 'vue';
import { RouterView } from 'vue-router';

export default defineComponent({
  name: 'App',
  components: {
    ConfigProvider,
  },
  setup() {
    const state = reactive({
      locale: zhCN,
    });

    return () => (
      <ConfigProvider locale={state.locale}>
        <RouterView />
      </ConfigProvider>
    );
  },
});
