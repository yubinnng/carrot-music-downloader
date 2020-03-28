"""
@author: qiyubing
@file: qq_client.py
@time: 2020/03/27
@description: 
"""
import json
import logging
import random
import re
from typing import List

import requests
from bs4 import BeautifulSoup

from client.basic_client import BaseClient
from common.model import SearchForm, Song, DownloadHistory
from common.constant import QQ
from common.http import download_and_save_file


class QQClient(BaseClient):
    def __init__(self):
        self.__headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.146 Safari/537.36',
            'referer': 'http://y.qq.com'
        }
        self.__ios_headers = {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
            'referer': 'http://y.qq.com'
        }
        self.__song_url_format = 'https://y.qq.com/n/yqq/song/{songmid}.html'
        self.__search_url = 'https://c.y.qq.com/soso/fcgi-bin/client_search_cp'
        self.__song_list_url_format = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&json=1&utf8=1&onlysong=0&disstid={song_list_id}&format=jsonp&g_tk={song_list_id}&jsonpCallback=playlistinfoCallback&loginUin=12888097&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0'
        self.__mobile_fcg_url = 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg'
        self.__download_url_format = 'http://dl.stream.qqmusic.qq.com/{}?vkey={}&guid={}&uin=3051522991&fromtag=64'
        self.__fcg_url = 'https://u.y.qq.com/cgi-bin/musicu.fcg?data=%7B%22req%22%3A%7B%22module%22%3A%22CDN.SrfCdnDispatchServer%22%2C%22method%22%3A%22GetCdnDispatch%22%2C%22param%22%3A%7B%7D%7D%2C%22req_0%22%3A%7B%22module%22%3A%22vkey.GetVkeyServer%22%2C%22method%22%3A%22CgiGetVkey%22%2C%22param%22%3A%7B%22guid%22%3A%2200%22%2C%22songmid%22%3A%5B%22{}%22%5D%2C%22songtype%22%3A%5B0%5D%2C%22uin%22%3A%2200%22%7D%7D%7D'
        self.__search_results = {}

    def search_song(self, search_form: SearchForm) -> List[Song]:
        params = {
            'w': search_form.keyword,
            'format': 'json',
            'p': 1,
            'n': 15
        }
        res = requests.get(self.__search_url, params=params, headers=self.__headers)
        results = []
        for song in res.json()['data']['song']['list']:
            id = song.get('songmid')
            singers = [s.get('name') for s in song.get('singer')]
            name = song.get('songname')
            album = song.get('albumname')
            song = Song(id, name, singers, album)
            results.append(song)
        return results

    # 参考方法：https://zhuanlan.zhihu.com/p/38184959
    def get_song_list(self, search_form: SearchForm) -> List[Song]:
        resp = requests.get(self.__song_list_url_format.format(song_list_id= search_form.keyword), headers=self.__headers)

        # 标准化返回来的数据
        song_list_json = json.loads(resp.text.strip('playlistinfoCallback()[]'))
        song_list_json = song_list_json['cdlist'][0]['songlist']

        results = []
        for song_item in song_list_json:
            try:
                id = song_item['songmid']
                name = song_item['songname']
                singers = [singer['name'] for singer in song_item['singer']]
                album = song_item['albumname']
                # media_mid = j['strMediaMid']
                song = Song(id, name, singers, album)
                results.append(song)
            except:
                # 处理报错
                print(' wrong')
        return results

    def _get_song_info(self, song_id: str) -> Song:
        song_url = self.__song_url_format.format(songmid=song_id)
        song_page = BeautifulSoup(requests.get(song_url, headers=self.__headers).content, "html.parser")
        singers = song_page.find('div', attrs={'class': 'data__singer'}).get('title').split(' / ')
        name = song_page.find('h1', attrs={'class': 'data__name_txt'}).get('title')
        album = song_page.find('a', attrs={'class': 'js_album'}).get('title')
        song = Song(None, name, singers, album)
        logging.debug('get song info successfully, %s', song)
        return song

    def _download_one_song(self, song_id, save_path: str):
        song = self._get_song_info(song_id)
        guid = str(random.randrange(1000000000, 10000000000))
        params = {"guid": guid,
                  "loginUin": "3051522991",
                  "format": "json",
                  "platform": "yqq",
                  "cid": "205361747",
                  "uin": "3051522991",
                  "songmid": song_id,
                  "needNewCode": 0}
        qualities = [("A000", "ape", 800), ("F000", "flac", 800), ("M800", "mp3", 320), ("C400", "m4a", 128), ("M500", "mp3", 128)]

        success = False
        for quality in qualities:
            file_name = song.file_name(quality[1])
            params['filename'] = '%s%s.%s' % (quality[0], song_id, quality[1])
            res = requests.get(self.__mobile_fcg_url, params=params, headers=self.__ios_headers)
            try:
                vkey = res.json().get('data', {}).get('items', [{}])[0].get('vkey', '')
            except:
                vkey = ''
            if vkey:
                download_url = self.__download_url_format.format('%s%s.%s' % (quality[0], song_id, quality[1]), vkey, guid)
                try:
                    download_and_save_file(file_name, save_path, download_url, headers=self.__headers)
                    success = True
                    break
                except:
                    logging.warning('download failed, retry lower quality, %s, id = %s', file_name, song_id)

        # 所有品质都尝试过
        if not success:
            fcg_res = requests.get(self.__fcg_url.format(song_id), headers=self.__headers)
            fcg_res_json = fcg_res.json()
            download_url = str(fcg_res_json["req"]["data"]["freeflowsip"][0]) + str(
                fcg_res_json["req_0"]["data"]["midurlinfo"][0]["purl"])
            file_name = song.file_name('m4a')
            try:
                download_and_save_file(file_name, save_path, download_url, self.__headers)
                success = True
            except:
                success = False
        if success:
            logging.info('download successfully %s in %s', file_name, save_path)
        else:
            logging.warning('download failed %s, id = %s', file_name, song_id)
        # 记录历史
        DownloadHistory.add(song, success)