import { login, logout, getInfo } from '@/api/api'
import { getToken, setToken, removeToken } from '@/utils/auth' //引用auth里设置Token方法
import { resetRouter } from '@/router' //重置路由
import { setStore, getStore, removeStore} from '@/utils/localStorage' //锁屏密码存储localStorage
const user = { //user模块，token,登录，登出
    state: {
        token: getToken(),// 读取cookie里面作为默认值
        //用户资料
        name: '',
        avatar: '',
        roles: [],
        //锁屏
        isLock: getStore({name: 'isLock'}) || false,
        lockPasswd: getStore({name: 'lockPasswd'}) || '',
    },

    mutations: {     
        // 设置token
        SET_TOKEN: (state, token) => {
            state.token = token  
        },
        SET_NAME: (state, name) => {
            state.name = name
        },
        SET_AVATAR: (state, avatar) => {
            state.avatar = avatar
        },
        SET_ROLES: (state, roles) => {
            state.roles = roles
        },
        //设置锁屏密码
        SET_LOCK_PASSWD: (state, lockPasswd) => {
            state.lockPasswd = lockPasswd
            setStore({
                name: 'lockPasswd',
                content: state.lockPasswd,
                type: 'session'
            })
        },
        //设置锁屏
        SET_LOCK: (state, action) => {
            state.isLock = true
            setStore({
                name: 'isLock',
                content: state.isLock,
                type: 'session'
            })
        },
        //清除锁屏密码
        CLEAR_LOCK: (state, action) => {
            state.isLock = false
            state.lockPasswd = ''
            removeStore({
                name: 'lockPasswd'
            })
            removeStore({
                name: 'isLock'
            })
        }
    },

    actions: {
        // 登录界面调用
        Login({ commit }, userInfo) {
            const username = userInfo.username.trim()
            return new Promise((resolve, reject) => {
                login(username, userInfo.password).then(response => {
                    //const data = response.data
                    const { data } = response
                    setToken(data.token) //将token存入cookie.js
                    commit('SET_TOKEN', data.token)//将token存入user的state
                    resolve()
                }).catch(error => {
                    reject(error)
                })
            })
        },

        // 获取用户信息
        GetInfo({ commit, state }) {
            return new Promise((resolve, reject) => {
                getInfo(state.token).then(response => {
                    //一般写法
                    //const  data = response.data
                    //解构写法
                    const { data } = response
                    if (data.roles && data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
                        commit('SET_ROLES', data.roles)                
                    } else {
                        reject('getInfo: roles must be a non-null array !')
                    }
                    commit('SET_NAME', data.username)
                    commit('SET_AVATAR', data.avatar)
                    resolve(response)
                }).catch(error => {
                    reject(error)
                })
            })
        },

        // 登出
        LogOut({ commit, state }) {
            return new Promise((resolve, reject) => {
                logout(state.token).then(() => {
                    removeToken()
                    resetRouter() //重置路由
                    commit('SET_TOKEN', '')
                    commit('SET_ROLES', [])
                    
                    resolve()
                }).catch(error => {
                    reject(error)
                })
            })
        },

        // 前端 登出
        FedLogOut({ commit }) {
            return new Promise(resolve => {
                commit('SET_TOKEN', '')
                removeToken()
                resolve()
            })
        }
    }
}

export default user
