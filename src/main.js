import Vue from 'vue'
import App from './App.vue'
// 导入路由
import router from './router'
// 导入element-UI
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 这个是全局css文件
import './assets/css/index.css'

// 导入axios
import axios from 'axios'
// 写入pai接口
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/';
// axios拦截器
axios.interceptors.request.use(config => {
    config.headers.Authorization = window.localStorage.getItem('token');
    return config
}, err => {
    console.log(err);
});
// 在vue的原型中挂载axios
Vue.prototype.$http = axios;

// 在vue中挂载ElementUI
Vue.use(ElementUI);

// 这行代码的意思 是阻止显示生产模式的消息。
Vue.config.productionTip = false

// new Vue代表新建vue对象
new Vue({
    render: h => h(App),
    router,
}).$mount('#app')