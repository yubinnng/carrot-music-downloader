"""
@author: qiyubing
@file: netease_client.py
@time: 2020/03/22
@description: 网易云音乐客户端
"""
import requests
import logging
from bs4 import BeautifulSoup

from common.model import SearchForm, Song, DownloadHistory
from common.constant import *
from common.http import download_and_save_file
from client.basic_client import BaseClient
from typing import List
from client.netease.netease_encrypter import encrypt_param


class NeteaseClient(BaseClient):
    def __init__(self):
        self.__headers = {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip,deflate,sdch',
            'Accept-Language': 'zh-CN,zh;q=0.8,gl;q=0.6,zh-TW;q=0.4',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'music.163.com',
            'Origin': 'https://music.163.com',
            'Referer': 'https://music.163.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.32 Safari/537.36'
        }
        self.__song_url_format = 'https://music.163.com/song/{song_id}'
        self.__search_url = 'http://music.163.com/weapi/cloudsearch/get/web?csrf_token='
        self.__song_list_url = 'https://music.163.com/playlist?id='
        self.__player_url = 'http://music.163.com/weapi/song/enhance/player/url?csrf_token='

    def search_song(self, search_form: SearchForm) -> List[Song]:
        params = {
            's': search_form.keyword,
            'type': 1,
        }
        response = self.__requests(self.__search_url, params)
        results = []
        if response is not None:
            if response['result']['songCount'] >= 1:
                songs = response['result']['songs']
                for song in songs:
                    id = song.get('id')
                    singers = [each.get('name') for each in song.get('ar')]
                    album = song.get('al').get('name')
                    name = song.get('name')

                    temp_song = Song(id, name, singers, album)
                    results.append(temp_song)
        return results

    # 参考文章：https://blog.csdn.net/qq_45437557/article/details/100064217
    def get_song_list(self, search_form: SearchForm) -> List[Song]:
        try:
            url = self.__song_list_url + search_form.keyword
            song_list_page = BeautifulSoup(requests.get(url, headers=self.__headers).content, "html.parser")
            # 网易云歌单有防爬加密，只能获取到歌曲ID和歌名
            song_list = song_list_page.find('ul', {'class': 'f-hide'}).find_all('a')
        except:
            song_list = []

        results = []
        for song_item in song_list:
            id = song_item['href'].strip("/song?id=")
            name = song_item.text
            song_item = Song(id, name)
            results.append(song_item)
        return results

    def _get_song_info(self, song_id: str) -> Song:
        song_url = self.__song_url_format.format(song_id=song_id)
        song_page = BeautifulSoup(requests.get(song_url, headers=self.__headers).content, "html.parser")
        singers = song_page.find('meta', attrs={'property': 'og:music:artist'}).get('content').split('/')
        name = song_page.find('meta', attrs={'property': 'og:title'}).get('content')
        album = song_page.find('meta', attrs={'property': 'og:music:album'}).get('content')
        song = Song(song_id, name, singers, album)
        logging.debug('get song info successfully, %s', song)
        return song

    def _download_one_song(self, song_id, save_path: str):
        song = self._get_song_info(song_id)
        # 下载歌曲
        params = {
            'ids': [song_id],
            'br': 320000,
            'csrf_token': ''
        }
        logging.debug('get download url, id = %s', song_id)
        response = self.__requests(self.__player_url, params)
        download_url = response['data'][0]['url']
        suffix = response['data'][0]['encodeType']
        file_name = '{}--{}--{}.{}'.format(song.name, ','.join(song.singers), song.album, suffix)

        try:
            logging.info('start downloading %s', file_name)
            download_and_save_file(file_name, save_path, download_url)
            # 记录历史
            DownloadHistory.add(song, True)
            logging.info('download successfully %s in %s', file_name, save_path)
        except Exception as e:
            # 记录历史
            DownloadHistory.add(song, False)
            logging.warning('download failed %s, id = %s, msg = ', file_name, song_id)
            logging.debug(e.args)

    def __requests(self, url, params):
        """
        请求网易云音乐服务器
        """
        post_data = encrypt_param(params)

        response = requests.post(url, data=post_data, timeout=request_timeout, headers=self.__headers)
        logging.debug('__postRequests response %s', response.text)

        if response.json()['code'] != 200:
            return None
        else:
            return response.json()
