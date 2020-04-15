"""
@author: qiyubing
@file: main.py
@time: 2020/03/23
@description: 主程序
"""
import logging
from web_api import app
from common.http import JSONEncoder

app.json_encoder = JSONEncoder
logging.basicConfig(level=logging.INFO)

if __name__ == '__main__':
    app.run("localhost", 8765)