import React, { Component } from "react";
import {
  Container,
  Header,
  Left,
  Button,
  Icon,
  Body,
  Title,
  Text
} from "native-base";
import { connect } from 'react-redux'
import { TimePickerAndroid, ToastAndroid } from 'react-native'

import HeaderBar from '../../../components/HeaderBar';

Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}

class Settings extends Component {
  async _showTimePicker(startOrEnd) {
    try {
      const {action, hour, minute} = await TimePickerAndroid.open({
        hour: startOrEnd == 'start' ? this.props.startDayHour : this.props.endDayHour,
        minute: startOrEnd == 'start' ? this.props.startDayMinute : this.props.endDayMinute,
        is24Hour: true,
        mode: 'default'
      });
      if (action === TimePickerAndroid.timeSetAction) {
        var t = new Date('2019-01-01T' + hour.pad(2) + ':' + minute.pad(2) + ':00')
        const act = {
          type: startOrEnd == 'start' ? "SET_START_DAY_TIME" : "SET_END_DAY_TIME",
          value: {
            hour: hour,
            minute: minute
          }
        }
        switch(startOrEnd) {
          case 'start':
            var o = new Date('2019-01-01T' + this.props.endDayHour.pad(2) + ':' + this.props.endDayMinute.pad(2) + ':00')
            if(t >= o) {
              ToastAndroid.show('The start time must preceed the end time !', ToastAndroid.LONG);
            } else {
              this.props.dispatch(act)
            }
            break
          case 'end':
            var o = new Date('2019-01-01T' + this.props.startDayHour.pad(2) + ':' + this.props.startDayMinute.pad(2) + ':00')
            if(t <= o) {
              ToastAndroid.show('The start time must preceed the end time !', ToastAndroid.LONG);
            } else {
              this.props.dispatch(act)
            }
            break
        }
      }
    } catch ({code, message}) {
      console.warn('Cannot open time picker', message);
    }
  }
  render() {
    return (
      <Container>
        <HeaderBar title='Settings' onLeftButton={ () => this.props.navigation.navigate('TabNavigator') } leftIcon="md-arrow-round-back"/>
        <Container style={{justifyContent: 'space-evenly', margin: 20}}>
          <Text style={{textAlign: 'center', fontSize: 15}}>Select time below for the start and end of your day for sending you messages. Messages will not be sent outside of these hours.</Text>
          <Button full onPress={ () => this._showTimePicker('start') }>
            <Icon name="time" />
            <Text>Start of day:   {this.props.startDayHour.pad(2)}:{this.props.startDayMinute.pad(2)}</Text>
          </Button>
          <Button full onPress={ () => this._showTimePicker('end') }>
            <Icon name="time" />
            <Text>End of day:   {this.props.endDayHour.pad(2)}:{this.props.endDayMinute.pad(2)}</Text>
          </Button>
          <Button onPress={ () => this.props.navigation.navigate('Traxivity')} style={{alignSelf: 'center'}}>
            <Text>OK</Text>
          </Button>
        </Container>
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    startDayHour: state.setStartEndDayTime.startDayHour,
    startDayMinute: state.setStartEndDayTime.startDayMinute,
    endDayHour: state.setStartEndDayTime.endDayHour,
    endDayMinute: state.setStartEndDayTime.endDayMinute,
  }
}

export default connect(mapStateToProps)(Settings)
