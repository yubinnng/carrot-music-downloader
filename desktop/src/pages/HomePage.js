/**
 * @author xue chen
 * @since 2020/3/24
 */

import React from "react";
import {observer} from 'mobx-react';
import {Row, Column} from "../component";
import stores from "../store";
import {get} from "../util/requests";
import '../css/home-page.css';

const {ipcRenderer}= window.electron;
const {songStore} = stores;

@observer
class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      platform: songStore.platformList[0].platform,
      platformIndex: 0,
      keyword: ''
    };
    this.renderPlatformList = this.renderPlatformList.bind(this);
    this.onClickPlatformItem = this.onClickPlatformItem.bind(this);
    this.renderMusicList = this.renderMusicList.bind(this);
    this.handleKeyChange = this.handleKeyChange.bind(this);
    this.onClickSearchBtn = this.onClickSearchBtn.bind(this);
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
              onClick = {this.onClickSearchBtn}
              src = {require('../assets/icon/search.svg')} alt = '' />
          </Column>
          <Column
            className = 'no-drag'
            onClick = {this.onClickMin}
          >
            <img
              className = 'no-drag'
              src = {require('../assets/icon/min.svg')}
              alt = ''
            />
          </Column>
          <Column
            className = 'no-drag'
            onClick = {this.onClickRemove}
          >
            <img
              src = {require('../assets/icon/remove.svg')}
              alt = ''
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
              <img src = {require('../assets/icon/radio.svg')} alt = '' />
              <p>全选</p>
              <p>下载位置</p>
              <input type = 'text' />
              <img src = {require('../assets/icon/file.svg')} alt = '' />
              <img src = {require('../assets/icon/download.svg')} alt = '' />
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
   * 搜索
   */
  onClickSearchBtn(event) {
    event.stopPropagation();
    const {platform, keyword} = this.state;
    get('/api/search', {
      platform,
      keyword,
    })
      .then(resp => {

        if(resp.code === 200) {
          songStore.addResultList(platform, resp.data);
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
  onClickPlatformItem(platform, platformIndex) {
    this.setState(() => (
      {
        platform,
        platformIndex,
      }
    ))
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
          onClick={() => {
            this.onClickPlatformItem(item.platform, index);
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
            >
              <img
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