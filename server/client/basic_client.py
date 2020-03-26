"""
@author: qiyubing
@file: basic_client.py
@time: 2020/03/23
@description: 客户端基类
"""
import abc
from typing import List
from common.model import SearchForm, Song


class BaseClient:

    # 搜索歌曲
    @abc.abstractmethod
    def search_song(self, search_form: SearchForm) -> List[Song]:
        pass

    # 获取歌单
    def get_song_list(self, search_form: SearchForm) -> List[Song]:
        pass

    # 下载歌曲
    @abc.abstractmethod
    def download(self, song_id_list: List[str], save_path: str):
        pass
