import { defineComponent, reactive } from 'vue';

export default defineComponent({
  name: 'Login',
  components: {},
  setup() {
    const state = reactive({
      title: '这是个登录',
    });

    return () => <>{state.title}</>;
  },
});
