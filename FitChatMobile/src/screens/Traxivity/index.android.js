import React, {Component} from 'react';
import HeaderBar from '../../components/HeaderBar';
import { DatePickerAndroid, AppState } from 'react-native';
import {
  Container,
  Tabs,
  Tab,
  TabHeading,
  Text
} from 'native-base';

import SideBar from './SideBar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DayTab from './DayTab';
import WeekTab from './WeekTab';

export default class Traxivity extends Component {
  state = {
    selectedDay: new Date(),
    appState: AppState.currentState,
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if(this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      this.setState({selectedDay: new Date()});
    }
    this.setState({appState: nextAppState});
  };

  async datePicker() {
    try {
      const {action, year, month, day} = await DatePickerAndroid.open({
        date: this.state.selectedDay,
        maxDate: new Date()
      });

      if (action === DatePickerAndroid.dateSetAction) {
        this.setState({selectedDay: new Date(year, month, day, 0, 0, 0, 0)})
      }

    } catch ({code, message}) {
      console.warn('Cannot open date picker', message);
    }
  }

  render() {
    return (
      <Container>
        <HeaderBar
          title='Traxivity'
          onLeftButton={ () => this.props.navigation.openDrawer() }
          leftIcon="md-menu"
          onRightButton={ () => this.datePicker()}
          rightLabel={this.state.selectedDay.toDateString()}
          rightIcon="md-calendar"/>
        <Tabs>
          <Tab heading={ <TabHeading><Icon name="calendar-today" size={25} color={"white"}/><Text>Day</Text></TabHeading>}>
            <DayTab selectedDay={this.state.selectedDay}/>
          </Tab>
          <Tab heading={ <TabHeading><Icon name="calendar-week" size={25} color={"white"}/><Text>Week</Text></TabHeading>}>
            <WeekTab selectedDay={this.state.selectedDay}/>
          </Tab>
        </Tabs>
      </Container>
    );
  }
}
