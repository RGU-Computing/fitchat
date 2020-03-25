import React, { Component } from 'react';
import {
  Container,
  Text,
  Button
} from 'native-base';
import {
  View,
  Dimensions,
  Slider,
  FlatList,

} from "react-native";
import HeaderBar from '../../components/HeaderBar';
import { connect } from 'react-redux'

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Tts from 'react-native-tts';

import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Slider']);

class Settings extends Component {
  state = {
    voices: []
  }

  async componentDidMount() {
    this.initTts()
  }

  async initTts() {
    const voices = await Tts.voices();
    const availableVoices = voices
      .filter(v => !v.networkConnectionRequired && !v.notInstalled && (v.language == "en-GB" || v.language == "en-US"))
      .map(v => {return { id: v.id, name: v.name, language: v.language }})
      //.filter(v => v.id.match(/language/))
    this.setState({
      voices: availableVoices
    });
  }

  _setSpeechSpeed = async speed => {
    await Tts.setDefaultRate(speed)
    const action = { type: "SET_SPEECH_SPEED", value: speed }
    this.props.dispatch(action)
  }

  _setSpeechPitch = async speed => {
    await Tts.setDefaultPitch(speed)
    const action = { type: "SET_SPEECH_PITCH", value: speed }
    this.props.dispatch(action)
  }

  _resetDefault() {
    this._setSpeechSpeed(0.5)
    this._setSpeechPitch(1)
    this.onVoicePress({id: "en-GB-language", name: "en-GB-language", language: "en-GB"})
  }

  onVoicePress = async voice => {
    await Tts.setDefaultVoice(voice.id);
    const action = { type: "SET_SELECTED_VOICE", value: voice.id }
    this.props.dispatch(action)
  };

  renderVoiceItem = ({ item }) => {
    return (
      <Button
        full
        style={{backgroundColor: this.props.selectedVoice === item.id ? 'rgb(70, 70, 200)' : 'rgb(200, 200, 200)'}}
        onPress={() => this.onVoicePress(item)}
      ><Text>{`${item.language} - ${item.name}`}</Text></Button>
    );
  };

  _speak() {
    Tts.getInitStatus().then(() => {
      Tts.speak("This is a test")
    });
  }

  render() {
    const screenWidth = Dimensions.get('window').width
    const screenHeight = Dimensions.get('window').height
    return (
      <Container>
        <HeaderBar title='Settings' onLeftButton={ () => this.props.navigation.navigate('TabNavigator') } leftIcon="md-arrow-round-back"/>
        <Container style={{flex: 1, alignItems: 'center', justifyContent: 'space-around'}}>
          <View>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{fontSize: 20, fontWeight: 'bold'}}>{"Speed: "}</Text>
              <Text  style={{fontSize: 20}}>{this.props.speechSpeed.toFixed(1)}</Text>
              <Slider
                style={{width: screenWidth/2}}
                thumbTintColor={'rgb(63, 81, 181)'}
                minimumTrackTintColor={'rgb(63, 81, 181)'}
                minimumValue={0.1}
                maximumValue={1}
                value={this.props.speechSpeed}
                onSlidingComplete={this._setSpeechSpeed}
              />
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20}}>
              <Text style={{fontSize: 20, fontWeight: 'bold'}}>{"Pitch: "}</Text>
              <Text style={{fontSize: 20}}>{this.props.speechPitch.toFixed(1)}</Text>
              <Slider
                style={{width: screenWidth/2}}
                thumbTintColor={'rgb(63, 81, 181)'}
                minimumTrackTintColor={'rgb(63, 81, 181)'}
                minimumValue={0.5}
                maximumValue={2}
                value={this.props.speechPitch}
                onSlidingComplete={this._setSpeechPitch}
              />
            </View>
          </View>

          <View>
            <Text style={{fontSize: 20, fontWeight: 'bold', alignSelf: 'center'}}>Voices: </Text>

            <FlatList
              style={{maxHeight: screenHeight/3, marginTop: 20}}
              keyExtractor={item => item.id}
              renderItem={this.renderVoiceItem}
              extraData={this.props.selectedVoice}
              data={this.state.voices}
            />
          </View>

          <View style={{flexDirection: 'row', width: screenWidth, justifyContent: 'space-around'}}>
            <Button  onPress={() => this._resetDefault()}><Text>Reset default</Text></Button>
            <Button transparent onPress={() => this._speak()}><Icon name="voice" size={40} color={'black'} style={{marginBottom: 0}}/></Button>
          </View>

          <Button style={{alignSelf: 'center'}} onPress={() => this.props.navigation.navigate('TabNavigator')} ><Text>OK</Text></Button>
        </Container>
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    speechSpeed: state.setStartEndDayTime.speechSpeed,
    speechPitch: state.setStartEndDayTime.speechPitch,
    selectedVoice: state.setStartEndDayTime.selectedVoice
  }
}

export default connect(mapStateToProps)(Settings)
