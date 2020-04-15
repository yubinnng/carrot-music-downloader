/**
 * @author xue chen
 * @since 2020/3/24
 */

import React from "react";
import {observer} from 'mobx-react';
import {Row, Column, Toast, Header} from "../component";
import stores from "../store";
import {get, post} from "../util/requests";
import '../css/home-page.css';
import {action} from "mobx";
import {KEYWORD, PATH_KEY} from "../config/variable";

const {ipcRenderer, remote} = window.electron;
const {dialog} = remote;
const {songStore, storage} = stores;

let last_keyword = '';

@observer
class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      platform: songStore.platformList[0].platform,
      platformIndex: 0,
      keyword: !!storage.session.get(KEYWORD) ? storage.session.get(KEYWORD) : "",
      save_path: storage.get(PATH_KEY) || "",
    };
    this.renderPlatformList = this.renderPlatformList.bind(this);
    this.onClickPlatformItem = this.onClickPlatformItem.bind(this);
    this.renderMusicList = this.renderMusicList.bind(this);
    this.handleKeyChange = this.handleKeyChange.bind(this);
    this.onClickSearchBtn = this.onClickSearchBtn.bind(this);
    this.onClickDirSelBtn = this.onClickDirSelBtn.bind(this);
    this.getMusicData = this.getMusicData.bind(this);
    this.onClickDownloadBtn = this.onClickDownloadBtn.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
  }

  componentDidMount() {
    if(storage.session.get(KEYWORD)) {
      if(storage.session.get(KEYWORD) !== last_keyword) {
        this.onClickSearchBtn();
      }
    }
  }

  render() {
    return (
      <Column
        className='wrapper'
      >
        <Header
          keyword = {this.state.keyword}
          handleKeyChange = {this.handleKeyChange}
          _onKeyUp = {this._onKeyUp}
          onClickSearchBtn = {this.onClickSearchBtn}
        />
        <Row
          className='home-page-content content-border'
          align='flex-start'
        >
          <Column className='platform-content-container'>
            <div className='platform-content'>
              {this.renderPlatformList()}
            </div>
            <Row
              className='app-msg-content'
            >
              <Column
                justify='space-around'
              >
                <p className='text'>
                  本软件完全开源仅用于代码学习不得用于商业用途
                </p>
                <Row
                  onClick={() => {
                    ipcRenderer.send('open-url', 'https://github.com/Carrot-Software/carrot-music-downloader');
                  }}
                  style={{cursor: "pointer"}}
                >
                  <p>项目GitHub地址</p>
                  <img src={require('../assets/icon/share.svg')} alt=''/>
                </Row>
                <Row>
                  <p>您的反馈对我们至关重要</p>
                </Row>
              </Column>
            </Row>
          </Column>
          <Column className='content-split'/>
          <Column
            className='music-content content-border'
            justify='flex-start'
          >
            <Row
              className='music-menu content-border'
              justify='flex-start'
            >
              <img
                onClick={() => {
                  this.onClickAllSelected()
                }}
                src={songStore.allSelected ? require('../assets/icon/radio.selected.svg') : require('../assets/icon/radio.svg')}
                alt=''/>
              <p
                onClick={() => {
                  this.onClickAllSelected()
                }}
              >全选</p>
              <p>下载位置</p>
              <input
                type='text'
                onChange={(event) => {
                  this.setState({
                    save_path: event.target.value
                  })
                }}
                value={this.state.save_path}/>
              <img
                onClick={this.onClickDirSelBtn}
                src={require('../assets/icon/file.svg')} title='选择文件夹' alt='选择文件夹'/>
              <img
                onClick={this.onClickDownloadBtn}
                src={require('../assets/icon/download.svg')} title='下载' alt='下载'/>
              <img
                onClick={() => {
                  this.props.changePathname("/history")
                }}
                src={require('../assets/icon/history.svg')} title='历史记录' alt="历史记录"/>
            </Row>
            <Row
              className = 'content-border music-item-content-header'
              justify = "flex-start"
            >
              <p>音乐标题</p>
              <p>歌手</p>
              <p>专辑</p>
            </Row>

            <div
              className = 'music-item-content'
            >
              {this.renderMusicList()}
            </div>
          </Column>
        </Row>
      </Column>
    )
  }

  /**
   * 监听回车事件
   */
  _onKeyUp(event) {
    if(event.keyCode === 13) {
      this.onClickSearchBtn();
    }
  }

  /**
   * 点击下载按钮
   */
  onClickDownloadBtn() {
    const {save_path, platform} = this.state;
    let song_id_list = [];
    songStore.resultList.forEach(item => {
      if (item.platform === platform) {
        item.songList.forEach(_item => {
          if (_item.selected) {
            song_id_list.push(_item.id);
          }
        });
      }
    });
    save_path.split("\\").join("\\\\");
    if(song_id_list.length === 0) {
      Toast.info("请选择歌曲");
      return;
    }
    if(!save_path) {
      Toast.info("下载位置为空");
      return;
    }
    if (!!save_path && song_id_list.length > 0) {
      post('/api/download', {
        platform,
        song_id_list,
        save_path
      })
        .then((resp) => {
          if (resp.code === 200) {
            Toast.info("开始下载")
          }
        })
    }
  }

  /**
   * 改变全选状态
   */
  @action
  changeAllSelected() {
    songStore.resultList.forEach(item => {
      if (item.platform === this.state.platform) {
        songStore.allSelected = item.songList.every(_item => _item.selected === true);
      }
    })
  }

  /**
   * 点击全选按钮
   */
  @action
  onClickAllSelected() {
    songStore.allSelected = !songStore.allSelected;
    songStore.resultList.forEach(item => {
      if (item.platform === this.state.platform) {
        item.songList.map(_item => (
          _item.selected = songStore.allSelected
        ))
      }
    })
  }

  /**
   * 点击选择文件按钮
   */
  async onClickDirSelBtn() {
    const result = await dialog.showOpenDialog({
      title: '选择下载位置',
      properties: ['openDirectory']
    });
    if(result.filePaths.length > 0) {
      // 保存文件
      storage.set(PATH_KEY, result.filePaths[0]);
      this.setState({
        save_path: result.filePaths[0]
      });
    }

  }

  /**
   * 搜索
   */
  onClickSearchBtn(event) {
    !!event && event.stopPropagation();
    if (this.state.keyword) {
      this.getMusicData();
    } else {
      Toast.info("搜索内容为空")
    }
  }

  /**
   * 获取音乐数据
   */
  @action
  getMusicData() {
    const {platform, keyword} = this.state;
    songStore.resultList.forEach(item => {
      if(item.platform ===  platform) {
        item.songList = []
      }
    })
    get('/api/search', {
      platform,
      keyword,
    })
      .then(resp => {
        if (resp.code === 200) {
          songStore.addResultList(platform, keyword, resp.data);
          last_keyword = keyword;
          storage.session.set(KEYWORD, keyword);
        }
      })
  }

  /**
   * 处理keyword改变
   * @param event
   */
  handleKeyChange(event) {
    this.setState({
      keyword: event.target.value
    })
  }

  /**
   * 点击平台
   * @param platformIndex
   */
  @action
  onClickPlatformItem(event, platform, platformIndex) {
    this.setState(() => (
      {
        platform,
        platformIndex
      }
    ), () => {
      songStore.allSelected = false;
      let isFull = false;
      songStore.resultList.forEach(item => {
        if (item.platform === platform) {
          if (item.songList.length > 0) {
            item.songList.map(_item => (
              _item.selected = false
            ))
          }

          if (item.keyword !== last_keyword || item.songList.length === 0) {
            item.songList = [];
            isFull = true;
          }

          if(item.songList.length === 0) {
            this.setState(() => (
              {
                isEmpty: true
              }
            ))
          }
        }
      });
      if (isFull) {
        if(this.state.keyword) {
          this.getMusicData();
        }
      } 
    })
  }

  /**
   * 渲染平台列表
   * @returns {[]}
   */
  renderPlatformList() {
    let arr = [];
    songStore.platformList.forEach((item, index) => {
      arr.push(
        <Row
          key={item.id}
          onClick={(event) => {
            this.onClickPlatformItem(event, item.platform, index);
          }}
          className={`platform-item content-border ${this.state.platformIndex === index ? 'platform-active' : ''}`}
        >
          <p>{item.value}</p>
        </Row>
      )
    });
    return arr;
  }

  /**
   * 渲染搜索音乐结果
   * @returns {[]}
   */
  renderMusicList() {
    let arr = [];
    songStore.resultList.forEach(item => {
      if (item.platform === this.state.platform) {
        item.songList.forEach(_item => {
          arr.push(
            <Row
              justify='flex-start'
              key={_item.id}
            >
              <img
                onClick={() => {
                  this.onClickMusicItem(_item)
                }}
                src={_item.selected ? require('../assets/icon/radio.selected.svg') : require('../assets/icon/radio.svg')}
                alt=''/>
              <p title = {_item.name}>{_item.name}</p>
              <p title = {_item.singers.join(" ")}>{_item.singers.join(' ')}</p>
              <p title = {_item.album}>{_item.album}</p>
            </Row>
          )
        })
      }
    });
    return arr;
  }

  /**
   * 点击单个选择项
   * @param item
   */
  @action
  onClickMusicItem(item) {
    item.selected = !item.selected;
    this.changeAllSelected();
  }

}

export default HomePage;