import React, {Component} from 'react';
import App from '../App';

import { Provider } from 'react-redux'
import { persistor, store } from '../store/configureStore'
import { PersistGate } from 'redux-persist/integration/react'

export default class Setup extends Component {
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    );
  }
}
