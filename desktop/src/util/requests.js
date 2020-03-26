/**
 * get post
 *
 * @author xue chen
 * @since 2020/3/26
 */

import Axios from "axios";

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
    body = {},
    params = {}
  } = options;

  // request.data
  let data = JSON.stringify(body);

  // url
  let  url = `${Url}`;

  return new Promise(((resolve, reject) => {
    Axios({
      method,
      url,
      data,
      headers,
      params
    })
      .then(resp => {
        if(resp.data.code === 200) {
          resolve(resp.data);
        }
      })
      .catch(err => {
        reject(err);
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
    data
  })
};

export {get, post}