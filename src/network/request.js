// // 导入axios
// import axios from 'axios'

// export function request(config, ) {
//     //创建axios实例 baseURL是api地址 timeout是超时时长
//     const instance = axios.create({
//         baseURL: 'http://timemeetyou.com:8889/api/private/v1/',
//         timeout: 5000
//     })

//     // 2.axios的拦截器
//     //2.1请求拦截的作用
//     instance.interceptors.request.use(config => {
//             return config
//         }, err => {
//             console.log(err);
//         })
//         // 2.2相应拦截
//     instance.interceptors.response.use(res => {
//         return res.data
//     }, err => {
//         console.log(err);
//     })

//     // 3.发送真正的网络请求
//     return instance(config)
// }