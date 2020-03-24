"""
@author: qiyubing
@file: http.py
@time: 2020/03/23
@description: 网络工具
"""
import json
from flask.json import JSONEncoder as _JSONEncoder
import os
import requests
import logging
from contextlib import closing
from common.common_class import ServerError


# 自定义JSON序列化器
class JSONEncoder(_JSONEncoder):
    def default(self, o):
        return {k: v for k, v in o.__dict__.items() if not k.startswith("__")}


def download_and_save_file(file_name, save_path, download_url, headers=None, stream=True, verify=False):
    """
    下载并保存文件
    """
    if not os.path.exists(save_path):
        os.mkdir(save_path)
    logging.info('start downloading %s', file_name)

    with closing(requests.get(download_url, stream=True, verify=False)) as response:
        if response.status_code == 200:
            with open(os.path.join(save_path, file_name), "wb") as f:
                for chunk in response.iter_content(chunk_size=1024):
                    if chunk:
                        f.write(chunk)
        else:
            raise ServerError('download request error')
    logging.info('download successfully %s in %s', file_name, save_path)


def bind_param(request, _class):
    """
    装饰器，将请求路径参数自动转换为自定义对象
    :param request: 请求对象
    :param _class: 自定义对象类型
    :return: 填充好数据的自定义对象
    """

    def wrap(f):
        def decorator(*args):
            obj = _class()
            attr_dict = obj.__dict__
            for attr_name in attr_dict.keys():
                if not attr_name.startswith("__") and attr_dict[attr_name] == None:
                    value = request.args.get(attr_name, None)
                    attr_dict[attr_name] = value
            return f(obj)

        return decorator

    return wrap


def bind_json(request, _class):
    """
    装饰器，将请求JSON自动转换为自定义对象
    :param request: 请求对象
    :param _class: 自定义对象类型
    :return: 填充好数据的自定义对象
    """

    def wrap(f):
        def decorator(*args):
            data_json = json.loads(request.get_data())
            obj = _class()
            attr_dict = obj.__dict__
            for attr_name in attr_dict.keys():
                if not attr_name.startswith("__") and attr_dict[attr_name] == None:
                    value = data_json.get(attr_name, None)
                    attr_dict[attr_name] = value
            return f(obj)

        return decorator

    return wrap
