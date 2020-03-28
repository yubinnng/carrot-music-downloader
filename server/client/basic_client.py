"""
@author: qiyubing
@file: basic_client.py
@time: 2020/03/23
@description: 客户端基类
"""
import abc
from typing import List
import threadpool
from common.model import SearchForm, Song


class BaseClient:

    # 下载任务线程池
    __download_pool = threadpool.ThreadPool(20)

    @abc.abstractmethod
    def search_song(self, search_form: SearchForm) -> List[Song]:
        """
        搜索歌曲
        """
        pass

    @abc.abstractmethod
    def get_song_list(self, search_form: SearchForm) -> List[Song]:
        """
        获取歌单
        """
        pass

    @abc.abstractmethod
    def _get_song_info(self, song_id: str) -> Song:
        """
        获取歌曲信息
        """
        pass

    @abc.abstractmethod
    def _download_one_song(self, song_id: str, save_path: str):
        """
        下载一首歌曲
        """
        pass

    def download(self, song_id_list: List[str], save_path: str):
        """
        下载多首歌曲
        """
        # 线程池异步下载
        params = [((song_id, save_path), None) for song_id in song_id_list]
        pool_requests = threadpool.makeRequests(self._download_one_song, params)
        [BaseClient.__download_pool.putRequest(req) for req in pool_requests]
