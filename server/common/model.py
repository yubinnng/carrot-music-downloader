"""
@author: qiyubing
@file: model.py
@time: 2020/03/23
@description: 
"""
import json
import os

from flask.json import jsonify
from common.common_class import BaseClass
from common.http import JSONEncoder
from typing import List


# 响应结果包装类
class ResultWrapper():

    # 状态码
    code: int

    # 消息
    msg: str

    # 数据
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

    # 音乐平台
    platform: str

    # 搜索值
    keyword: str

    # 结果个数
    size: int

    def __init__(self, keyword=None, platform=None, size=30):
        self.keyword = keyword
        self.platform = platform
        self.size = size


# 歌曲实体类
class Song(BaseClass):

    # 歌曲ID
    id: str

    # 歌曲名
    name: str

    # 歌手
    singers: List[str]

    # 专辑
    album: str

    def __init__(self, id=None, name=None, singers=None, album=None) -> None:
        self.id = id
        self.name = name
        self.singers = singers
        self.album = album

    def file_name(self, suffix):
        return '{}--{}--{}.{}'.format(self.name, ','.join(self.singers), self.album, suffix)


# 下载记录
class DownloadHistory:
    # 下载记录文件保存位置
    _file_path = './download_history.json'

    @staticmethod
    def add(song: Song, success: bool):
        """
        增加下载记录
        """
        history = {
            'song': song,
            'success': success
        }

        # 若文件不存在则创建
        if not os.path.exists(DownloadHistory._file_path):
            with open(DownloadHistory._file_path, 'w', encoding='utf-8'):
                pass

        with open(DownloadHistory._file_path, 'r+', encoding='utf-8') as json_file:
            empty = os.path.getsize(DownloadHistory._file_path) == 0
            if empty:
                history_json = []
            else:
                history_json = json.load(json_file)
            history_json.append(history)
            # 将文件指针移到开头
            json_file.seek(0)
            json.dump(history_json, json_file, ensure_ascii=False, cls=JSONEncoder)

    @staticmethod
    def get_all() -> list:
        """
        查看所有下载记录
        """
        with open(DownloadHistory._file_path, 'r', encoding='utf-8') as json_file:
            exist = os.path.exists(DownloadHistory._file_path)
            if exist:
                return json.load(json_file)
            else:
                return []
