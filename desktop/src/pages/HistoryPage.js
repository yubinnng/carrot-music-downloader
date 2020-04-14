/**
 * @author xue chen
 * @since 2020/4/12
 */

import React, {Component} from "react";
import {Column, Row, Toast} from "../component";
import "../css/history-page.css";
import {del, get} from "../util/requests";

class HistoryPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      listData: [],
      isEmpty: false,
    }
    this.renderList = this.renderList.bind(this);
    this.getListData = this.getListData.bind(this);
    this.clearList = this.clearList.bind(this);
  }

  componentDidMount() {
    this.getListData();
    this.timer = setInterval(this.getListData, 2000)
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    return (
      <Column
        className="wrapper"
      >
        <Column
          className="history-page-content"
        >
          <Row
            className="content-border drag history-page-header"
            justify="space-between"
          >
            <Row
              className="no-drag back-container"
              onClick={() => {
                this.props.changePathname('/home');
              }}
            >
              <img src={require('../assets/icon/back.svg')} alt="返回" title="返回首页"/>
              <p>返回</p>
            </Row>
            <p className="title no-drag">下载历史</p>
            <Row
              className="no-drag delete-container"
              onClick = {this.clearList}
            >
              <p>清空</p>
              <img src={require('../assets/icon/delete.svg')} alt="清空" title="清空历史"/>
            </Row>
          </Row>
          <Column
            className="history-list-container content-border"
            justify="flex-start"
          >
            <Row
              className="content-border header"
              justify="flex-start"
            >
              <p>音乐标题</p>
              <p>歌手</p>
              <p>专辑</p>
            </Row>
            {this.state.listData.length > 0 ?
              <div className="list-content">
                {this.renderList()}
              </div>:
              <div className="list-content img-content">
                <div>
                  {
                    this.state.isEmpty ?
                      <img src = {require("../assets/icon/empty.svg")} alt = ""/>
                      :
                      <img className = "loading-img" src = {require("../assets/icon/loading.svg")} alt = ''/>
                  }

                </div>
              </div>
            }

          </Column>
        </Column>
      </Column>
    );
  }

  renderList() {
    let arr = [];
    if(this.state.listData.length > 0) {
      this.state.listData.forEach((item, index) => {
        arr.push(
          <Row
            key = {`item${index}`}
            className="content-border list-item"
            justify="flex-start"
          >
            <img
              src={item.success ? require('../assets/icon/download-success.svg') : require('../assets/icon/download-fail.svg')}
              title = {item.success ? "下载成功" : "该歌曲暂不支持下载"}
              alt={item.success ? "下载成功" : "该歌曲暂不支持下载"}
            />
            <p title = {item.song.name}>{item.song.name}</p>
            <p title = {item.song.singers.join(" ")}>{item.song.singers.join(" ")}</p>
            <p title = {item.song.album}>{item.song.album}</p>
          </Row>
        )
      })
    }
    return arr;
  }

  /**
   * 获取列表数据
   */
  getListData() {
    get('/api/history')
      .then(res => {
        if(res.code === 200) {
          this.setState(() => (
            {
              listData: res.data
            }
            ))
          if(res.data.length === 0) {
            this.setState(() => (
              {
                isEmpty: true
              }
            ))
          }
        }
      })
  }

  /**
   * 清楚列表
   */
  clearList() {
    del('/api/history')
      .then(res => {
        if(res.code === 200) {
          this.setState({
            listData: []
          });
          Toast.info("清除成功")
        }
      })
  }

}

export default HistoryPage;