import React, { Component } from 'react'
import './App.css'
import { Provider as ReduxProvider } from 'react-redux'
import configureStore from './modules/store'
import OptimizelyReduxProvider from './OptimizelyReduxProvider'
import * as OptimizelyReactSDK from '@optimizely/react-sdk'
import Homepage from './pages/homepage'

const reduxStore = configureStore(window.REDUX_INITIAL_DATA)

OptimizelyReactSDK.setLogLevel('debug')

const optimizely = OptimizelyReactSDK.createInstance({
  sdkKey: 'BsSyVRsUbE3ExgGCJ9w1to',
})

optimizely.setUser({
  id: 'myuser-123',
  attributes: {
    plan_type: 'gold'
  }
})

class App extends Component {
  constructor(props) {
    super(props)

    setTimeout(() => {
      reduxStore.dispatch({
        type: 'SET_USER',
        payload: {
          id: 'jordan',
        },
      })
    }, 3000)
  }

  render() {
    return (
      <ReduxProvider store={reduxStore}>
        <OptimizelyReduxProvider optimizely={optimizely} timeout={200}>
          <div className="App">
            <Homepage />
          </div>
        </OptimizelyReduxProvider>
      </ReduxProvider>
    )
  }
}

export default App
