import Vue from 'vue'
// 导入路由
import Router from 'vue-router'
// 注册路由
Vue.use(Router)

// 导入login页面地址
const login = () =>
    import ('@/views/login/login.vue');
// 导入home页面地址
const home = () =>
    import ('@/views/home/home.vue');
// 导入home子页面页面地址
const welcome = () =>
    import ('@/views/home/children/welcome.vue'); // 欢迎页面
const users = () =>
    import ('@/views/home/children/users/users.vue'); // 用户列表
const roles = () =>
    import ('@/views/home/children/roles/roles.vue'); // 角色列表
const rights = () =>
    import ('@/views/home/children/roles/rights.vue'); // 权限列表
const goods = () =>
    import ('@/views/home/children/goods/goods.vue'); // 商品列表
const add = () =>
    import ('@/views/home/children/goods/goods/add.vue'); // 商品列表子页 添加商品
const params = () =>
    import ('@/views/home/children/goods/params.vue'); // 分类参数
const categories = () =>
    import ('@/views/home/children/goods/categories.vue'); // 商品分类
const orders = () =>
    import ('@/views/home/children/orders/orders.vue'); // 订单页面
const reports = () =>
    import ('@/views/home/children/reports/reports.vue'); // 数据统计
const router = new Router({
    routes: [{
            path: '',
            //redirect重定向 /home为默认页 使用路由守卫将有token码的用户定向为默认home页面,没有token的前往login页
            redirect: '/home'
        },
        // login登录页面
        {
            path: '/login',
            name: 'login',
            component: login,
        },
        // 访问home 这个项目的home就是导航栏
        {
            path: '/home',
            name: 'home',
            component: home,
            //redirect重定向 
            redirect: '/welcome',
            // children定义子路由
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
                {
                    path: '/goods/add',
                    name: 'add',
                    component: add,
                },
            ]
        },
    ],
    // History 模式需要后台支持
    // mode:'history',
});

// 挂载路由守卫
router.beforeEach((to, from, next) => {
    // to将要访问的路径
    // from代表从哪个路径跳转而来
    // next是一个函数，表示放行
    // next()放行 
    // next('/login')强制跳转到login

    // console.log(to.path);
    // const tonkenstr = window.sessionStorage.getItem('token');
    // if (from.path === '') {
    //     if (tonkenstr) return next('/home');
    // } else if (to.path === '/login') {
    //     return next();
    // }

    // 判断是否由login页面来的 为true就放行
    if (to.path === '/login') return next();
    // 获取token
    const tonkenstr = window.sessionStorage.getItem('token');
    // 判断是不是没有token值,没有就去login页面
    if (!tonkenstr) return next('/login');
    // if (tonkenstr) return next('/home');

    next();
})

// 导出路由
export default router;