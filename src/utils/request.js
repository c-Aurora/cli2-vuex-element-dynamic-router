//axios二次封装
import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/auth'

// 创建axios实例
const http = axios.create({
    // baseURL: process.env.BASE_API, // api的base_url,也可以配置在config里面，dev.env.js和pro.env.js
    baseURL: 'https://mock.mengxuegu.com/mock/642f916f32affa39a121ce38/routing',//east Mock接口
  timeout: 15000 // 请求超时时间
})

// request拦截器
http.interceptors.request.use(config => {
  if (store.getters.token) { //store -> getters.js -> user.js -> state.token
    config.headers['token'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  return config
}, error => {
  // Do something with request error
  console.log(error) // for debug
  Promise.reject(error)
})

// respone拦截器
http.interceptors.response.use(response => {
/**
* code为非200是抛错 可结合自己业务进行修改
*/
  const res = response.data
  if (res.code !== 200) {
    Message({
      message: res.data,
      type: 'error',
      duration: 3 * 1000
    })
    // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
    if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
      MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        store.dispatch('FedLogOut').then(() => {
          location.reload()// 为了重新实例化vue-router对象 避免bug
        })
      })
    }
    return Promise.reject('error')
  } else {
    return response.data
  }
},
error => {
  console.log('err' + error)// for debug
  Message({
    message: error.message,
    type: 'error',
    duration: 3 * 1000
  })
  return Promise.reject(error)
})

export default http
