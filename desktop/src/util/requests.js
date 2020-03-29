/**
 * get post
 *
 * @author xue chen
 * @since 2020/3/26
 */

import Axios from "axios";
import {Toast} from "../component";

/**
 * 公共请求
 * @param Url
 * @param options
 * @returns {Promise<unknown>}
 */
const requests = (Url, options) => {

  // 默认头信息
  const defaultHeaders = {
    "Content-type": "application/json",
    "Accept": "application/json"
  };

  const {
    method = "GET",
    headers = defaultHeaders,
    data = {},
    params = {}
  } = options;

  // request.data
  let body = JSON.stringify(data);

  // url
  let  url = `${Url}`;

  return new Promise(((resolve, reject) => {
    Axios({
      method,
      url,
      headers,
      data: body,
      params
    })
      .then(resp => {
        if(resp.data.code === 200) {
          resolve(resp.data);
        } else {
          reject(resp.data);
          Toast.error(resp.data.msg);
        }
      })
      .catch(err => {
        reject(err);
        Toast.error("系统繁忙")
      })
  }))

};

/**
 * get
 * @param Url
 * @param params
 * @returns {Promise<unknown>}
 */
const get = (Url, params) => {
  return requests(Url, {
    params
  })
};

/**
 * post
 * @param Url
 * @param data
 * @returns {Promise<unknown>}
 */
const post = (Url, data) => {
  return requests(Url, {
    method: "POST",
    data
  })
};

export {get, post}