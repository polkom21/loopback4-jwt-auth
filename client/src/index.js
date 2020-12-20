import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import App from './App';
import './index.css';
import Reducers from './reducers/index';
import * as serviceWorker from './serviceWorker';

const middleares = []

if (process.env.NODE_ENV === 'development') {
  middleares.push(createLogger())
}

const store = createStore(Reducers, applyMiddleware(...middleares))

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
