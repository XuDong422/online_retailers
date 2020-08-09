import Vue from 'vue'
// 导入路由
import Router from 'vue-router'

Vue.use(Router)

// 导入login地址
const login = () =>
    import ('@/views/login/login.vue');
// 导入home地址
const home = () =>
    import ('@/views/home/home.vue');
const router = new Router({
    routes: [{
            path: '',
            //redirect重定向
            redirect: '/login'
        },
        // 确定login页面
        {
            path: '/login',
            name: 'login',
            component: login,
        },
        {
            path: '/home',
            name: 'home',
            component: home,
        },
    ],
    mode: 'history',
});

// 挂载路由守卫
router.beforeEach((to, from, next) => {
    // to将要访问的路径
    // from代表从哪个路径跳转而来
    // next是一个函数，表示放行
    // next()放行 
    // next('/login')强制跳转

    // 判断是否由login页面来的 true就放行
    if (to.path === '/login') return next();
    // 获取token
    const tonkenstr = window.sessionStorage.getItem('token');
    // 判断是不是没有token值,没有就去login页面
    if (!tonkenstr) return next('/login');
    next();
})

export default router;