"""
@author: qiyubing
@file: netease_client.py
@time: 2020/03/22
@description: 网易云音乐客户端
"""
import requests
import logging
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
            'cookie': '_iuqxldmzr_=32; _ntes_nnid=0e6e1606eb78758c48c3fc823c6c57dd,1527314455632; '
                      '_ntes_nuid=0e6e1606eb78758c48c3fc823c6c57dd; __utmc=94650624; __utmz=94650624.1527314456.1.1.'
                      'utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); WM_TID=blBrSVohtue8%2B6VgDkxOkJ2G0VyAgyOY;'
                      ' JSESSIONID-WYYY=Du06y%5Csx0ddxxx8n6G6Dwk97Dhy2vuMzYDhQY8D%2BmW3vlbshKsMRxS%2BJYEnvCCh%5CKY'
                      'x2hJ5xhmAy8W%5CT%2BKqwjWnTDaOzhlQj19AuJwMttOIh5T%5C05uByqO%2FWM%2F1ZS9sqjslE2AC8YD7h7Tt0Shufi'
                      '2d077U9tlBepCx048eEImRkXDkr%3A1527321477141; __utma=94650624.1687343966.1527314456.1527314456'
                      '.1527319890.2; __utmb=94650624.3.10.1527319890',
            'Origin': 'https://music.163.com',
            'Referer': 'https://music.163.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.32 Safari/537.36'
        }
        self.__search_url = 'http://music.163.com/weapi/cloudsearch/get/web?csrf_token='
        self.__player_url = 'http://music.163.com/weapi/song/enhance/player/url?csrf_token='
        self.__session = requests.Session()
        self.__session.headers.update(self.__headers)

    def search(self, search_form: SearchForm) -> List[Song]:
        """
        搜索音乐
        :return: 音乐列表
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

    '''post请求函数'''

    def download(self, song: Song, save_path: str):
        """
        下载音乐
        """
        params = {
            'ids': [song.id],
            'br': 320000,
            'csrf_token': ''
        }

        response = self.__requests(self.__player_url, params)
        download_url = response['data'][0]['url']
        suffix = response['data'][0]['encodeType']
        file_name = '{}--{}--{}.{}'.format(song.name, ','.join(song.singers), song.album, suffix)

        try:
            download_and_save_file(file_name, save_path, download_url)
        except Exception:
            logging.warning('download failed %s', file_name)

    def __requests(self, url, params):
        post_data = encrypt_param(params)

        response = self.__session.post(url, data=post_data, timeout=request_timeout, headers=self.__headers)
        logging.debug('__postRequests response %s', response.text)

        if response.json()['code'] != 200:
            return None
        else:
            return response.json()