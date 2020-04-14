import React,{Component} from 'react';
import {Provider} from "mobx-react";
import stores from "./store";
import AppRouter from "./router";


class App extends Component {
  render() {
    return (
      <Provider {...stores}>
        <AppRouter />
      </Provider>
    );
  }

}

export default App;