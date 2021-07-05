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
      title: '这是个测试',
    });

    return () => (
      <ConfigProvider locale={state.locale}>
        {state.title}
        <RouterView />
      </ConfigProvider>
    );
  },
});
