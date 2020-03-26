"""
@author: qiyubing
@file: web_api.py
@time: 2020/03/23
@description: HTTP RESTFUL API
"""
import json
import logging
from flask import request, Flask
from client import NeteaseClient
from common.http import bind_json, bind_param
from common.common_class import ServerError
from common.model import *

app = Flask(__name__)

client_dict = {
    "netease": NeteaseClient()
}


@app.route('/api/search', endpoint="search")
@bind_param(request, SearchForm)
def search(search_form: SearchForm):
    # 策略模式，获取对应平台的客户端
    client = client_dict.get(search_form.platform)
    if search_form.keyword.isalnum():
        result = client.get_song_list(search_form)
    else:
        result = client.search_song(search_form)
    return ResultWrapper.success(result)


@app.route('/api/download',  methods=['POST'], endpoint="download")
def download():
    data = json.loads(request.get_data())
    song_id_list = data.get('song_id_list')
    platform = data.get('platform')
    save_path = data.get('save_path')
    # 策略模式，获取对应平台的客户端
    client_dict.get(platform).download(song_id_list, save_path)
    return ResultWrapper.success()


@app.errorhandler(404)
def page_not_found(e):
    return ResultWrapper.failure("请求路径有误", 404)


@app.errorhandler(500)
def server_error(e):
    logging.warning("请求发生错误：%s", e.original_exception.args)
    # 业务异常
    if isinstance(e.original_exception, ServerError):
        return ResultWrapper.failure(e.original_exception.args)
    else:
        return ResultWrapper.failure("未知错误")

