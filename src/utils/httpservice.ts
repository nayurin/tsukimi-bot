import axios, { AxiosHeaders, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import * as https from 'node:https'

export class Httpservice {
  http: AxiosInstance
  maxRetries: number
  constructor ({
    options,
    maxRetries = 3
  }: {
    options?: AxiosRequestConfig<any>
    maxRetries?: number
  }) {
    this.http = axios.create(
      Object.assign({
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      }, options)
    )
    this.maxRetries = maxRetries
  }

  configure (config: { [key: string]: AxiosHeaders }): AxiosInstance {
    this.http.defaults = {...this.http.defaults, ...config}
    return this.http
  }

  get (url: string, data?: object, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(data ?? {})) {
      searchParams.append(key, value)
    }
    url = data && Object.keys(data).length ? `${url}?${searchParams.toString()}` : url

    let retries = 0

    try {
      return config ? this.http.get(url, config) : this.http.get(url)
    } catch (err) {
      if (retries < this.maxRetries - 1) {
        retries += 1
        return config ? this.http.get(url, config) : this.http.get(url)
      } else {
        throw err
      }
    }
  }

  post (url: string, data?: object, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    data = data ?? {}
    let retries = 0

    try {
      return config ? this.http.post(url, data, config) : this.http.post(url, data)
    } catch (err) {
      if (retries < this.maxRetries - 1) {
        retries += 1
        return config ? this.http.post(url, data, config) : this.http.post(url, data)
      } else {
        throw err
      }
    }
  }

  request (config: AxiosRequestConfig): Promise<AxiosResponse> {
    let retries = 0

    try {
      return this.http.request(config)
    } catch (err) {
      if (retries < this.maxRetries - 1) {
        retries += 1
        return this.http.request(config)
      } else {
        throw err
      }
    }
  }
}

export const $http = new Httpservice({})

