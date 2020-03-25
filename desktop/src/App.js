import React from 'react';
import {Provider} from "mobx-react";
import stores from "./store";
import HomePage from './pages/HomePage';


function App() {
  return (
    <Provider {...stores}>
      <HomePage />
    </Provider>
  );
}

export default App;