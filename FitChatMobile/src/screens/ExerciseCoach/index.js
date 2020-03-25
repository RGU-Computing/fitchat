import React, { Component } from 'react';
import {
  Container,
  Text,
  Button,
  Toast,
  Root
} from 'native-base';
import { View, TouchableOpacity, Dimensions } from 'react-native'
import HeaderBar from '../../components/HeaderBar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { GiftedChat, Bubble, utils } from 'react-native-gifted-chat';
const { isSameUser } = utils;
import { Dialogflow_V2 } from 'react-native-dialogflow';
import auth from './auth.json';

import Voice from 'react-native-voice';
import Tts from 'react-native-tts';

import { connect } from 'react-redux';
import { resetFSUser } from '../../api/firestoreUtils'

import VolumeControl, {
  VolumeControlEvents
} from "react-native-volume-control";


const icon = require("../../assets/chaticon.png")
const COACH = {
  _id: 2,
  name: "Exercise Coach",
  avatar: icon
}
//"https://placeimg.com/140/140/any"

Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}

const screenWidth = Dimensions.get('window').width

class ExerciseCoach extends Component {
  constructor(props) {
    super(props)
    this.state = {
      messages: [],
      isMicOn: false,
      isSpeaking: false,
      volume: 0
    };
    this.isStateActive = true
  }

  async componentDidMount() {
    Tts.addEventListener('tts-finish', this._handleTtsListener);

    await Dialogflow_V2.setConfiguration( //V2 configuration
      auth.client_email,
      auth.private_key,
      Dialogflow_V2.LANG_ENGLISH,
      auth.project_id
    )

    resetFSUser(this.props.user) //update firestore

    Dialogflow_V2.requestQuery( //sending the current user id to the bot
      "set " + this.props.user.id,
      result => this._sendBotMessage(result.queryResult.fulfillmentMessages[0].text.text),
      error => console.log(error)
    );

    this.setState({
      volume: await VolumeControl.getVolume()
    });

    this.volEvent = VolumeControlEvents.addListener(
      "VolumeChanged",
      this.volumeEvent
    );
  }

  _handleTtsListener = (event) => {
    if(this.isStateActive) {
      this.setState({isSpeaking: false})
      this._startListening()
    }
  };


  volumeEvent = event => {
    this.setState({ volume: event.volume });
  };

  componentWillUnmount() {
    resetFSUser(this.props.user) //update firestore
  }

  _sendBotMessage(text) { //send a bot response
    let msg = {
      _id: this.state.messages.length + 1,
      text,
      createdAt: new Date(),
      user: COACH
    };

    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg])
    }));
  }

  _sendUserMessage(text) { //send a user message (when "Listening")
    let msg = {
      _id: this.state.messages.length + 1,
      text,
      createdAt: new Date(),
      user: { _id: 1, name: this.props.user.givenName, avatar: this.props.user.photo }
    };

    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg])
    }));
  }

  _speak(text) { //speak using tts
    if(!this.state.isMicOn) {
      Tts.getInitStatus().then(() => {
        this._stopListening()
        this.setState({isSpeaking: true, isMicOn: false})
        Tts.speak(text);
      });
    }
  }


  _startListening() { //start the "Listening" action
    Voice.onSpeechStart = () => this.setState({isMicOn: true})
    Voice.onSpeechEnd = () => this.setState({isMicOn: false})
    Voice.onSpeechError = (err) => {
      this.setState({isMicOn: false})
      switch(err.error.message.split('/')[0]){ // 6 > No speech input, 7 > No match
        case '6':
          Toast.show({
            text: "Listening canceled, no speech input",
            duration: 2000,
            position: 'top',
            buttonText: "Ok",
            buttonStyle: { backgroundColor: "#5cb85c" }
          })
          break
        case '7':
          Toast.show({
            text: "No match, try to speak more clearly",
            duration: 4000,
            position: 'top',
            buttonText: "Ok",
            buttonStyle: { backgroundColor: "#5cb85c" }
          })
          break
      }
    }

    Voice.start('en-US')

    Voice.onSpeechResults = (res) => {
      const words = ['louder']
      let speech = res.value[0]
      this._sendUserMessage(speech)
      if(words.indexOf(speech) != -1) { // if speech match with one of the words in []
        VolumeControl.change(this.state.volume + 0.2);
        this._speak(this.state.messages[1].text + ".")
      } else {
        Dialogflow_V2.requestQuery(
          speech,
          async result => {
            let results = result.queryResult.fulfillmentMessages.map(item => item.text.text[0])
            this._speak(results.join('.'))
            for(i = 0; i < results.length; i++) {
              this._sendBotMessage(results[i])
              await new Promise((resolve) => setTimeout(() => resolve(), 1500))
            }
          },
          error => console.log(error)
        );
      }
    }
  }

  _stopListening() { //cancel a started listening
    Voice.stop((res)=> console.log(res))
  }

  _renderInputToolbar(props) { //mic button render
    return (
      <Button
        style={{alignSelf: 'center', justifyContent: 'center', backgroundColor: 'rgb(63, 81, 181)', borderRadius: 25, height: 50, width: 50}}
        onPress={() => {
          if(!props.context.state.isMicOn && !props.context.state.isSpeaking) { //if isMicOn, stfu
            props.context._startListening()
          } else {
            props.context._stopListening()
          }
        }}
        transparent>
        <Icon name="microphone" size={50} color={props.context.state.isMicOn ? 'red' : 'white'}/>
      </Button>
    )
  }

  renderBubble(props) {
    let time = props.currentMessage.createdAt.getHours().pad(2) + ":" + props.currentMessage.createdAt.getMinutes().pad(2)
    const msgHeader = isSameUser(props.currentMessage, props.previousMessage) ? null : (
      <Text
        style={{
          fontSize: 15,
          color: 'grey',
          marginLeft: props.currentMessage.user._id == 2 ? 10 : 0,
          marginRight: props.currentMessage.user._id == 2 ? 0 : 10,
          alignSelf: props.currentMessage.user._id == 2 ? 'flex-start' : 'flex-end'}}
      >
        {props.currentMessage.user._id == 2 ? '' : time + " - "}
        {props.currentMessage.user.name}
        {props.currentMessage.user._id == 2 ? " - " + time : ''}
      </Text>
    )

    return (
      <View>
        {msgHeader}
        <Bubble {...props} textStyle={{left: {fontSize: 18}, right: {fontSize: 18}}}/>
      </View>
    );
  }

  render() { //add logout button
    this.isStateActive = true
    return (
      <Container>
        <HeaderBar
          title='FitChat'
          onLeftButton={() => {
            this.isStateActive = false
            this.props.navigation.openDrawer()
          }}
          leftIcon="md-menu"
          onRightButton={() => this.props.navigation.navigate('ExerciseCoachInfo')}
          rightIcon="md-information-circle-outline"/>
        <Root>
          <GiftedChat
            messages={this.state.messages}
            onSend={messages => this._onSend(messages)}
            user={{ _id: 1, name: this.props.user.givenName, avatar: this.props.user.photo }}
            context={this}
            renderTime={() => null}
            renderInputToolbar={this._renderInputToolbar}
            renderBubble={this.renderBubble}
            minInputToolbarHeight={60}
          />
        </Root>
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.setUser.user
  }
}

export default connect(mapStateToProps)(ExerciseCoach)
