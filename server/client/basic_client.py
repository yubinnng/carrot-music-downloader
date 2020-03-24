"""
@author: qiyubing
@file: basic_client.py
@time: 2020/03/23
@description: 
"""
import abc
from typing import List
from common.model import SearchForm, Song


class BaseClient:
    @abc.abstractmethod
    def search(self, search_form: SearchForm) -> List[Song]:
        pass

    @abc.abstractmethod
    def download(self, song: Song, save_path: str):
        pass