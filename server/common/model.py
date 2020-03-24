"""
@author: qiyubing
@file: model.py
@time: 2020/03/23
@description: 
"""
from flask.json import jsonify
from common.common_class import BaseClass
from typing import List


# 响应结果包装类
class ResultWrapper():
    code: int

    msg: str

    data: object

    def __init__(self, code, msg, data):
        self.code = code
        self.msg = msg
        self.data = data

    @staticmethod
    def success(data=None):
        return jsonify(ResultWrapper(200, "操作成功", data))

    @staticmethod
    def failure(msg, code=500):
        return jsonify(ResultWrapper(code, msg, None))


# 搜索表单
class SearchForm:
    def __init__(self, keyword=None, platform=None, size=30):
        self.keyword = keyword
        self.platform = platform
        self.size = size

    platform: str

    keyword: str

    size: int


# 音乐实体类
class Song(BaseClass):
    platform: str

    id: str

    name: str

    singers: List[str]

    album: str

    def __init__(self, platform=None, id=None, name=None, singers=None, album=None) -> None:
        self.platform = platform
        self.id = id
        self.name = name
        self.singers = singers
        self.album = album