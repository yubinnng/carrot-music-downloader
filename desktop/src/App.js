import React,{Component} from 'react';
import {Provider} from "mobx-react";
import stores from "./store";
import HomePage from './pages/HomePage';
import HistoryPage from "./pages/HistoryPage";

class App extends Component{

  constructor(props) {
    super(props);
    this.state = {
      href: "./home"
    }
    this.renderPage = this.renderPage.bind(this);
    this.changeHref = this.changeHref.bind(this);
  }

  render() {
    return (
      <Provider {...stores}>
        {
          this.renderPage()
        }
      </Provider>
    );
  }

  /**
   * 渲染页面
   */
  renderPage() {
    switch (this.state.href) {
      case "./history":
        return (
          <HistoryPage
            changeHref = {this.changeHref}
          />
          )
      case "./home":
        return  (
          <HomePage
            changeHref = {this.changeHref}
          />
        )
      default:
        return  (
          <HomePage
            changeHref = {this.changeHref}
          />
        )
    }
  }

  /**
   * 改变当前路径
   */
  changeHref(href) {
    this.setState(() => (
      {
        href
      }
    ))
  }

}


export default App;