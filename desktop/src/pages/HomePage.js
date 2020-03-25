/**
 * @author xue chen
 * @since 2020/3/24
 */

import React from "react";
import {Row, Column} from "../component";
import '../css/home-page.css';

const {ipcRenderer}= window.electron;

class HomePage extends React.Component {

  renderPlatformList() {
    let arr = [];
    for(let i = 0; i < 10; i++) {
      arr.push(
        <Row
          className = 'platform-item content-border platform-active'
        >
          <p>某音乐平台</p>
        </Row>
      )
    }
    return arr;
  }

  renderMusicList() {
    let arr = [];
    for(let i = 0; i < 10; i++) {
      arr.push(
        <Row
          justify = 'flex-start'
        >
          <img src = {require('../assets/icon/radio.svg')} alt = '' />
          <p>歌名歌名歌名歌名歌名歌名歌名歌名歌名</p>
          <p>歌手歌手</p>
          <p>专辑名专辑名专辑名专辑名</p>
        </Row>
      )
    }
    return arr;
  }

  onClickRemove(event) {
    event.stopPropagation();
    ipcRenderer.send('remove', 200);
  }

  onClickMin(event) {
    event.stopPropagation();
    ipcRenderer.send('min', 200);
  }

  render() {
    return (
      <Column
        className = 'wrapper'
      >
        <Row
          className = 'home-page-header'
          justify = 'flex-start'
        >
          <img src = {require('../assets/icon/logo.svg')} alt = '' />
          <input type = 'text' placeholder = '输入歌名或歌手名' />
          <img src = {require('../assets/icon/search.svg')} alt = '' />
          <img
            src = {require('../assets/icon/min.svg')}
            alt = ''
            onClick = {this.onClickMin}
          />
          <img
            src = {require('../assets/icon/remove.svg')}
            alt = ''
            onClick = {this.onClickRemove}
          />
        </Row>
        <Row
          className = 'home-page-content content-border'
          align = 'flex-start'
        >
          <Column className = 'platform-content-container'>
            <div className = 'platform-content'>
              <Row
                className = 'platform-item content-border'
              >
                <p>某音乐平台</p>
              </Row>
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
              justify = 'space-around'
            >
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

}

export default HomePage;