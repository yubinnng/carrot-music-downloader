"""
@author: qiyubing
@file: __init__.py.py
@time: 2020/03/23
@description: 
"""
from client.netease.netease_client import NeteaseClient
from client.qq.qq_client import QQClient
from common.constant import *

client_dict = {
    NETEASE: NeteaseClient(),
    QQ: QQClient()
}