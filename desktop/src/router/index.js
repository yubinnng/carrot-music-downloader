/**
 * @author xue chen
 * @since 2020/4/14
 */

import React,{Component} from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch
} from "react-router-dom";
import HomePage from "../pages/HomePage";
import HistoryPage from "../pages/HistoryPage";

class AppRouter extends Component {

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path = '/' component = {HomePage} />
          <Route exact  path = "/home" component = {HomePage} />
          <Route exact  path = "/history" component = {HistoryPage} />
        </Switch>
      </Router>
    );
  }

}

export default AppRouter;