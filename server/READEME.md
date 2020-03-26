# Python Server

## 框架选择

| 类型     | 框架名         |
| -------- | -------------- |
| Web      | Flask          |
| 请求     | requests       |
| 打包工具 | PyInstaller    |
| 爬虫     | beautifulsoup4 |
| 线程池   | threadpool     |
| 加解密   | pycryptodome   |

## 接口

### GET /api/search

#### 功能

搜索歌曲或获取歌单

#### 请求参数（路径参数）

| 请求参数 | 注释     | 取值                                       | 类型 | 示例      |
| -------- | -------- | ------------------------------------------ | ---- | --------- |
| platform | 平台     | netease                                    | str  | netease   |
| keyword  | 搜索值   | 若为全数字，则为歌单ID；否则为歌曲名或歌手 | str  | 988690134 |
| size     | 结果个数 | 默认值30，取决于对应平台是否支持           | int  | 20        |

#### 响应示例

~~~json
{
    "code": 200,
    "data": [
        {
            "album": "分享", // 专辑
            "id": 156524, // 歌曲ID
            "name": "特别的爱给特别的你", // 歌曲名
            "platform": "netease", // 音乐平台
            "singers": [
                "伍思凯" // 歌手列表
            ]
        },
        ...
    ],
    "msg": "操作成功"
}
~~~

#### 注意事项

歌曲列表前端记得判空，部分字段有可能为null



### POST /api/download

#### 功能

下载歌曲（多线程）

#### 请求参数（请求体）

~~~jso
{
	"song_id_list":["19292984", "190778"], // 歌曲列表ID
    "platform": "netease", // 音乐平台
    "save_path" : "./song" // 保存位置
}
~~~

#### 响应示例

~~~json
{
    "code": 200,
    "data": null,
    "msg": "操作成功"
}
~~~