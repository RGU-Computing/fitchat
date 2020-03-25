import React, {Component} from 'react';
import AppContainer from './navigation/AppContainer'
import AppIntroSlider from 'react-native-app-intro-slider';
import { connect } from 'react-redux'

import firebase from 'react-native-firebase';
import { GoogleSignin } from 'react-native-google-signin';

const chatbot_icon = require("./assets/bot.png")
const traxivity_icon = require("./assets/foot.png")
const slides = [
  {
    key: '1',
    title: 'FitChat Bot',
    text: 'I will help you to set goals, report back on achievements and exercise.',
    image: chatbot_icon,
    backgroundColor: '#243665',
  },
  {
    key: '2',
    title: 'Traxivity',
    text: 'I will keep track of your step count and show you how you did with your steps during the week.',
    image: traxivity_icon,
    backgroundColor: '#52a8a0',
  }
];

const config = {
  credential: '',
  webClientId: 'PROJECT.apps.googleusercontent.com'
}

class App extends Component {
  async componentDidMount() {
    const isSignedIn = await GoogleSignin.isSignedIn()
    if(!this.props.isFirstLaunch && !isSignedIn) {
      this._onDone()
    }
  }

  async _onDone() {
    await GoogleSignin.configure({
      scopes: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/fitness.location.read",
        "https://www.googleapis.com/auth/fitness.activity.read",
        "https://www.googleapis.com/auth/fitness.body.read"
      ],
      webClientId: config.webClientId
    })

    const user = await GoogleSignin.signIn()
    const credential = firebase.auth.GoogleAuthProvider.credential(user.idToken, config.credential)
    const firebaseUserCredential = await firebase.auth().signInWithCredential(credential)

    this.props.dispatch({ type: "SET_IS_FIRST_LAUNCH", value: false })
    this.props.dispatch({ type: "SET_NEW_USER", value: user.user })
  }

  render() {
    if(!this.props.isFirstLaunch) {
      return <AppContainer />
    } else {
      return <AppIntroSlider slides={slides} onDone={() => this._onDone()}/>;
    }
  }
}

const mapStateToProps = (state) => {
  return {
    isFirstLaunch: state.setIsFirstLaunch.isFirstLaunch,
    user: state.setUser.user
  }
}

export default connect(mapStateToProps)(App)
