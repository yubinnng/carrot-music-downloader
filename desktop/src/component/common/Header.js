/**
 * @author xue chen
 * @since 2020/4/11
 */

import React, {Component} from "react";
import {Column, Row} from "./Flex";

const {ipcRenderer} = window.electron;

class Header extends Component {

  render() {
    const {keyword = "", handleKeyChange = () => {}, _onKeyUp = () => {}, onClickSearchBtn = () => {}} = this.props;
    return (
      <Row
        className='drag home-page-header'
        justify='flex-start'
      >
        <img src={require('../../assets/icon/logo.svg')} alt=''/>
        <input
          className='no-drag'
          type='text'
          placeholder='输入歌名/歌手名/歌单ID'
          value={keyword}
          onChange={handleKeyChange}
          onKeyUp={_onKeyUp}
        />
        <Column
          className='no-drag'
        >
          <img
            onClick={(event) => {
              onClickSearchBtn(event)
            }}
            src={require('../../assets/icon/search.svg')} alt='搜索'/>
        </Column>
        <Column
          className='no-drag'
          onClick={this.onClickMin}
        >
          <img
            className='no-drag'
            src={require('../../assets/icon/min.svg')}
            alt='最小化'
          />
        </Column>
        <Column
          className='no-drag'
          onClick={this.onClickRemove}
        >
          <img
            src={require('../../assets/icon/remove.svg')}
            alt='关闭'
          />
        </Column>
      </Row>
    )
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

export default Header;