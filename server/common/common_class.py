"""
@author: qiyubing
@file: common_class.py
@time: 2020/03/22
@description: 公共类
"""


# 业务异常
class ServerError(RuntimeError):
    pass


# 实体公共类，重写to_string
class BaseClass:
    def __str__(self) -> str:
        attr_dict = {}
        for item in self.__dict__.items():
            attr_dict[str(item[0])] = str(item[1])
        return str(attr_dict)