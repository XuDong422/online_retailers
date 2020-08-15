import Vue from 'vue'
// 导入路由
import Router from 'vue-router'

Vue.use(Router)

// 导入login页面地址
const login = () =>
    import ('@/views/login/login.vue');
// 导入home页面地址
const home = () =>
    import ('@/views/home/home.vue');
// 导入子页面页面地址
const welcome = () =>
    import ('@/views/home/children/welcome.vue');
const users = () =>
    import ('@/views/home/children/users/users.vue');
const roles = () =>
    import ('@/views/home/children/roles/roles.vue');
const rights = () =>
    import ('@/views/home/children/roles/rights.vue');
const goods = () =>
    import ('@/views/home/children/goods/goods.vue');
const params = () =>
    import ('@/views/home/children/goods/params.vue');
const categories = () =>
    import ('@/views/home/children/goods/categories.vue');
const orders = () =>
    import ('@/views/home/children/orders/orders.vue');
const reports = () =>
    import ('@/views/home/children/reports/reports.vue');
const router = new Router({
    routes: [{
            path: '',
            //redirect重定向
            redirect: '/home'
        },
        // 确定login页面
        {
            path: '/login',
            name: 'login',
            component: login,
        },
        // 访问home
        {
            path: '/home',
            name: 'home',
            component: home,
            //redirect重定向
            redirect: '/welcome',
            children: [{
                    path: '/welcome',
                    name: 'welcome',
                    component: welcome,
                }, {
                    path: '/users',
                    name: 'users',
                    component: users,
                }, {
                    path: '/roles',
                    name: 'roles',
                    component: roles,
                },
                {
                    path: '/rights',
                    name: 'rights',
                    component: rights,
                },
                {
                    path: '/goods',
                    name: 'goods',
                    component: goods,
                },
                {
                    path: '/params',
                    name: 'params',
                    component: params,
                },
                {
                    path: '/categories',
                    name: 'categories',
                    component: categories,
                },
                {
                    path: '/orders',
                    name: 'orders',
                    component: orders,
                },
                {
                    path: '/reports',
                    name: 'reports',
                    component: reports,
                },
            ]
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
    // console.log(to.path);
    // const tonkenstr = window.localStorage.getItem('token');
    // if (from.path === '') {
    //     if (tonkenstr) return next('/home');
    // } else if (to.path === '/login') {
    //     return next();
    // }

    // 判断是否由login页面来的 true就放行
    if (to.path === '/login') return next();
    // 获取token
    const tonkenstr = window.localStorage.getItem('token');
    // 判断是不是没有token值,没有就去login页面
    if (!tonkenstr) return next('/login');
    // if (tonkenstr) return next('/home');

    next();
})

export default router;