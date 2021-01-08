import axios from 'axios'

const addErrorLog = errorInfo => {
  const {
    statusText,
    status,
    request: {
      responseURL
    }
  } = errorInfo
  let info = {
    type: 'ajax',
    code: status,
    mes: statusText,
    url: responseURL
  }
  if (!responseURL.includes('save_error_logger')) store.dispatch('addErrorLog', info)
}

class HttpRequest {
  constructor (baseUrl = baseURL) {
    this.baseUrl = baseUrl
    this.queue = {}
  }
  getInsideConfig () {
    const config = {
      baseURL: this.baseUrl,
      // withCredentials: true,
      headers: {}
    }
    return config
  }
  destroy (url) {
    delete this.queue[url]
    if (!Object.keys(this.queue).length) {
      // Spin.hide()
    }
  }
  interceptors (instance, url) {
    // 请求拦截
    instance.interceptors.request.use(config => {
      // 添加全局的loading...
      if (!Object.keys(this.queue).length) {
        // Spin.show() // 不建议开启，因为界面不友好
      }
      this.queue[url] = true
      return config
    }, error => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use(res => {
      this.destroy(url)
      const {
        data,
        status
      } = res
      if (res.data.code === '200') {
        return {
          data,
          status
        }
      }else if(res.data.code === '605'){
        router.replace('/605')
        let msg = res.data.msg
        if (msg) {
          // iView.Message.error(msg)
        }
        return {
          data,
          status
        }
      } else {
        let msg = res.data.msg
        if (msg) {
          let msgConfig = {}
          msgConfig.content = msg
          msgConfig.duration =3
          // iView.Message.error(msg)
        }
        return {
          data,
          status
        }
      }
    }, error => {
      this.destroy(url)
      let errorInfo = error.response

      if (!errorInfo) {
        const {
          request: {
            statusText,
            status
          },
          config
        } = JSON.parse(JSON.stringify(error))
        errorInfo = {
          statusText,
          status,
          request: {
            responseURL: config.url
          }
        }
      }
      addErrorLog(errorInfo)
      return Promise.reject(error)
    })
  }
  request (options) {
    const instance = axios.create()
    options = Object.assign(this.getInsideConfig(), options)
    // console.log('this.baseUrl == ', this.baseUrl)
    // console.log('options == ', options)
    // this.interceptors(instance, options.url)
    return instance(options)
  }
}

export default HttpRequest
