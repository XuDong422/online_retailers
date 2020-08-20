import Vue from 'vue'
import App from './App.vue'
// 导入路由
import router from './router'
// 导入element-UI
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 这个是全局css文件
import './assets/css/index.css'

// 导入TreeTable
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import QuillEditor from 'vue-quill-editor'
// require styles 导入富文本编辑器的样式文件
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 当如nprogress 包对应的js和css 用于加载进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 导入axios
import axios from 'axios'
// 写入pai接口
axios.defaults.baseURL = 'http://api.zreai.com:606/api/private/v1/';
// axios拦截器
axios.interceptors.request.use(config => {
    // 展示进度条
    NProgress.start();
    config.headers.Authorization = window.sessionStorage.getItem('token');
    return config
}, err => {
    console.log(err);
});

// 在response拦截器中，隐藏进度条
axios.interceptors.response.use(config => {
    NProgress.done()
    return config
})

// 在vue的原型中挂载axios
Vue.prototype.$http = axios;

// 在vue中挂载ElementUI
Vue.use(ElementUI);

Vue.component('tree-table', TreeTable);
// 注册富文本编辑器
Vue.use(QuillEditor);

// 这行代码的意思 是阻止显示生产模式的消息。
Vue.config.productionTip = false;

// 时间格式过滤器
Vue.filter('dateFormat', function(originVal) {
    // 获取时间对象
    const dt = new Date(originVal)

    // 年
    const y = dt.getFullYear()
        // 月 getMonth返回的是从0 开始的，所以需要加1；如果不是两位，在前面补0
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
        // 日
    const d = (dt.getDate() + '').padStart(2, '0')
        // 时
    const hh = (dt.getHours() + '').padStart(2, '0')
        // 分
    const mm = (dt.getMinutes() + '').padStart(2, '0')
        // 时
    const ss = (dt.getSeconds() + '').padStart(2, '0')
        // 'yyyy-mm-dd hh:mm:ss'
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

// new Vue代表新建vue对象
new Vue({
    render: h => h(App),
    router,
}).$mount('#app')