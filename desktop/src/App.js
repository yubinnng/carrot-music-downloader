import React,{Component} from 'react';
import {Provider} from "mobx-react";
import stores from "./store";
import HistoryPage from "./pages/HistoryPage";
import HomePage from "./pages/HomePage";


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pathname: '/home'
    }
    this.changePathname = this.changePathname.bind(this);
  }

  renderPage() {
    switch (this.state.pathname) {
      case "/history":
        return <HistoryPage
          changePathname = {this.changePathname}
        />
      case "/home":
        return  <HomePage
          changePathname = {this.changePathname}
        />
      default:
        return <HomePage
          changePathname = {this.changePathname}
        />
    }
  }

  changePathname(pathname) {
    this.setState({
      pathname
    })
  }

  render() {
    return (
      <Provider {...stores}>
        {this.renderPage()}
      </Provider>
    );
  }



}

export default App;