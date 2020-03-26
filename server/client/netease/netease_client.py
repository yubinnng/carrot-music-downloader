"""
@author: qiyubing
@file: netease_client.py
@time: 2020/03/22
@description: 网易云音乐客户端
"""
import requests
import logging
import threadpool
from bs4 import BeautifulSoup
from common.model import SearchForm, Song
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
        self.__song_url = 'https://music.163.com/song/'
        self.__search_url = 'http://music.163.com/weapi/cloudsearch/get/web?csrf_token='
        self.__song_list_url = 'https://music.163.com/playlist?id='
        self.__player_url = 'http://music.163.com/weapi/song/enhance/player/url?csrf_token='
        self.__session = requests.Session()
        self.__session.headers.update(self.__headers)
        self.__download_pool = threadpool.ThreadPool(20)

    def search_song(self, search_form: SearchForm) -> List[Song]:
        """
        搜索歌曲
        :return: 歌曲列表
        """
        params = {
            's': search_form.keyword,
            'type': 1,
            'limit': search_form.size
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

                    temp_song = Song(NETEASE, id, name, singers, album)
                    results.append(temp_song)
        return results

    def get_song_list(self, search_form: SearchForm) -> List[Song]:
        url = self.__song_list_url + search_form.keyword
        song_list_page = BeautifulSoup(self.__session.get(url, headers=self.__headers).content, "html.parser")
        # 网易云歌单有防爬加密，只能获取到歌曲ID和歌名
        song_list_page = song_list_page.find('ul', {'class': 'f-hide'}).find_all('a')

        results = []
        for song_page in song_list_page:
            id = song_page['href'].strip("/song?id=")
            name = song_page.text
            song_page = Song(NETEASE, id, name)
            results.append(song_page)
        return results

    def __download_one_song(self, song_id, save_path: str):
        """
        下载单个歌曲
        """
        logging.debug('get song info, id = %s', song_id)
        # 查找歌曲信息
        song_page = BeautifulSoup(requests.get(self.__song_url + song_id, headers=self.__headers).content,"html.parser")
        singers = song_page.find('meta', attrs={'property': 'og:music:artist'}).get('content').split('/')
        name = song_page.find('meta', attrs={'property': 'og:title'}).get('content')
        album = song_page.find('meta', attrs={'property': 'og:music:album'}).get('content')
        song = Song('netease', song_id, name, singers, album)

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
            logging.info('download successfully %s in %s', file_name, save_path)
        except Exception as e:
            logging.warning('download failed %s, id = %s, msg = ', file_name, song_id)
            logging.debug(e.args)

    def download(self, song_id_list: List[str], save_path: str):
        """
        下载歌曲
        """
        # 线程池异步下载
        logging.debug('open thread pool to download')
        params = [((song_id, save_path), None) for song_id in song_id_list]
        # func_var = [(None, song_id_list), (None, save_path)]
        pool_requests = threadpool.makeRequests(self.__download_one_song, params)
        [self.__download_pool.putRequest(req) for req in pool_requests]

    def __requests(self, url, params):
        """
        请求网易云音乐服务器
        """
        post_data = encrypt_param(params)

        response = self.__session.post(url, data=post_data, timeout=request_timeout, headers=self.__headers)
        logging.debug('__postRequests response %s', response.text)

        if response.json()['code'] != 200:
            return None
        else:
            return response.json()
