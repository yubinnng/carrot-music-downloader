/**
 * @author xue chen
 * @since 2020/3/24
 */

import React from "react";
import {observer} from 'mobx-react';
import {Row, Column} from "../component";
import stores from "../store";
import {get, post} from "../util/requests";
import '../css/home-page.css';
import {action} from "mobx";

const {ipcRenderer, remote}= window.electron;
const {dialog} = remote;
const {songStore} = stores;

let last_keyword = '';

@observer
class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      platform: songStore.platformList[0].platform,
      platformIndex: 0,
      keyword: '',
      save_path: '',
      historyList: []
    };
    this.renderPlatformList = this.renderPlatformList.bind(this);
    this.onClickPlatformItem = this.onClickPlatformItem.bind(this);
    this.renderMusicList = this.renderMusicList.bind(this);
    this.handleKeyChange = this.handleKeyChange.bind(this);
    this.onClickSearchBtn = this.onClickSearchBtn.bind(this);
    this.renderHistoryList = this.renderHistoryList.bind(this);
    this.onClickDirSelBtn = this.onClickDirSelBtn.bind(this);
    this.getMusicData = this.getMusicData.bind(this);
    this.onClickDownloadBtn = this.onClickDownloadBtn.bind(this);
    this.getHistoryList = this.getHistoryList.bind(this);
  }

  render() {
    return (
      <Column
        className = 'wrapper'
      >
        <Row
          className = 'drag home-page-header'
          justify = 'flex-start'
        >
          <img src = {require('../assets/icon/logo.svg')} alt = '' />
          <input
            className = 'no-drag'
            type = 'text'
            placeholder = '输入歌名/歌手名/歌单ID'
            value = {this.state.keyword}
            onChange = {this.handleKeyChange}
          />
          <Column
            className = 'no-drag'
          >
            <img
              onClick = {(event) => {this.onClickSearchBtn(event)}}
              src = {require('../assets/icon/search.svg')} alt = '搜索' />
          </Column>
          <Column
            className = 'no-drag'
            onClick = {this.onClickMin}
          >
            <img
              className = 'no-drag'
              src = {require('../assets/icon/min.svg')}
              alt = '最小化'
            />
          </Column>
          <Column
            className = 'no-drag'
            onClick = {this.onClickRemove}
          >
            <img
              src = {require('../assets/icon/remove.svg')}
              alt = '关闭'
            />
          </Column>
        </Row>
        <Row
          className = 'home-page-content content-border'
          align = 'flex-start'
        >
          <Column className = 'platform-content-container'>
            <div className = 'platform-content'>
              {this.renderPlatformList()}
            </div>
            <Row
              className = 'app-msg-content'
            >
              <Column
                justify = 'space-around'
              >
                <p className = 'text'>
                  本软件完全开源仅用于代码学习不得用于商业用途
                </p>
                <Row>
                  <p>联系我</p>
                  <img src = {require('../assets/icon/chat.svg')} alt = '' />
                </Row>
                <Row>
                  <p>改进建议</p>
                  <img src = {require('../assets/icon/mail.svg')} alt = '' />
                </Row>
                <Row>
                  <p>项目GitHub地址</p>
                  <img src = {require('../assets/icon/share.svg')} alt = '' />
                </Row>
              </Column>
            </Row>
          </Column>
          <Column className = 'content-split'/>
          <Column
            className = 'music-content content-border'
            justify = 'flex-start'
          >
            <Row
              className = 'music-menu content-border'
              justify = 'flex-start'
            >
              <img
                onClick = {() => {
                  this.onClickAllSelected()
                }}
                src = {songStore.allSelected ? require('../assets/icon/radio.selected.svg'):require('../assets/icon/radio.svg')} alt = '' />
              <p
                onClick = {() => {
                this.onClickAllSelected()
                }}
              >全选</p>
              <p>下载位置</p>
              <input type = 'text' readOnly = 'readOnly' value = {this.state.save_path}/>
              <img
                onClick = {this.onClickDirSelBtn}
                src = {require('../assets/icon/file.svg')} title = '选择文件夹' alt = '选择文件夹' />
              <img
                onClick = {this.onClickDownloadBtn}
                src = {require('../assets/icon/download.svg')} title = '下载' alt = '下载' />
              <img
                onClick = {() => {
                  this.setState(() => (
                    {
                      platformIndex: -1

                    }), () => {
                    this.getHistoryList();
                  })
                }}
                src = {require('../assets/icon/history.svg')} title = '历史记录' alt = "历史记录"/>
            </Row>
            <div
              className = 'music-item-content'
            >
              {this.state.platformIndex === -1 ? this.renderHistoryList() : this.renderMusicList()}
            </div>
          </Column>
        </Row>
      </Column>
    )
  }

  /**
   * 获取下载历史列表
   */
  getHistoryList() {
    get('/api/history')
      .then((response) => {
        if(response.code === 200) {
          this.setState(() => (
            {
              historyList: response.data
            }
          ))
        }
      })
  }

  /**
   * 渲染列表
   */
  renderHistoryList() {
    let arr = [];
    if(this.state.historyList.length > 0) {
      this.state.historyList.forEach((item,index) => {
        arr.push(
          <Row
            justify = 'flex-start'
            key = {`history${index}`}
          >
            {
              item.success ?
                <img src = {require('../assets/icon/download-success.svg')} title = '下载成功' alt = '下载成功' />
                :
                <img src = {require('../assets/icon/download-fail.svg')} title = '该歌曲不支持下载' alt = '下载失败' />
            }
            <p>{item.song.name}</p>
            <p>{item.song.singers.join(' ')}</p>
            <p>{item.song.album}</p>
          </Row>
        )
      })
    }
    return arr;
  }

  /**
   * 点击下载按钮
   */
  onClickDownloadBtn() {
    const {save_path,platform} = this.state;
    let song_id_list = [];
    songStore.resultList.forEach(item => {
      if(item.platform === platform) {
        item.songList.forEach(_item => {
          if(_item.selected) {
            song_id_list.push(_item.id);
          }
        });
      }
    });
    save_path.split("\\").join("\\\\");
    post('/api/download', {
      platform,
      song_id_list,
      save_path
    })
      .then((resp) => {
        if(resp.code === 200) {
          console.log("下载成功")
        }
      })
  }

  /**
   * 改变全选状态
   */
  @action
  changeAllSelected() {
    songStore.resultList.forEach(item => {
      if(item.platform === this.state.platform) {
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
      if(item.platform === this.state.platform) {
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
    this.setState({
      save_path: result.filePaths[0]
    })
  }

  /**
   * 搜索
   */
  onClickSearchBtn(event) {
    event.stopPropagation();
    if(this.state.keyword) {
      this.getMusicData();
    }
  }

  /**
   * 获取音乐数据
   */
  getMusicData() {
    const {platform, keyword} = this.state;
    get('/api/search', {
      platform,
      keyword,
    })
      .then(resp => {
        if(resp.code === 200) {
          songStore.addResultList(platform, keyword, resp.data);
          last_keyword = keyword;
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
        platformIndex,
      }
    ), () => {
      songStore.allSelected = false;
      let isFull = false;
      songStore.resultList.forEach(item => {
        if(item.platform === platform) {
          if(item.songList.length > 0) {
            item.songList.map(_item => (
              _item.selected = false
            ))
          }
          if(item.keyword !== last_keyword || item.songList.length === 0) {
            item.songList = [];
            isFull = true;
          }
        }
      });
      if(isFull) {
        this.getMusicData();
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
          key = {item.id}
          onClick={(event) => {
            this.onClickPlatformItem(event, item.platform, index);
          }}
          className = {`platform-item content-border ${this.state.platformIndex === index ? 'platform-active':''}`}
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
      if(item.platform === this.state.platform) {
        item.songList.forEach(_item => {
          arr.push(
            <Row
              justify = 'flex-start'
              key = {_item.id}
            >
              <img
                onClick = {() => {
                  this.onClickMusicItem(_item)
                }}
                src = {_item.selected ?require('../assets/icon/radio.selected.svg'): require('../assets/icon/radio.svg')}
                alt = '' />
              <p>{_item.name}</p>
              <p>{_item.singers.join(' ')}</p>
              <p>{_item.album}</p>
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

  /**
   * 点击关闭
   * @param event
   */
  onClickRemove(event) {
    event.stopPropagation();
    ipcRenderer.send('remove', 200);
  }

  /**
   * 点击最小化
   * @param event
   */
  onClickMin(event) {
    event.stopPropagation();
    ipcRenderer.send('min', 200);
  }

}

export default HomePage;