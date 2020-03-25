import React, { Component } from "react";
import { FlatList, ScrollView } from 'react-native';
import {
  Container,
  Text,
  ListItem,
  Spinner
} from "native-base";

import WeeklyChart from './WeeklyChart'

export default class WeekProgress extends Component {
  render() {
    const arrSum = arr => arr.reduce((a,b) => a + b, 0)
    const arrAvg = arr => (arr.reduce((a,b) => a + b, 0) / arr.length).toFixed(0)
    var day = []
    var months = []

    if(this.props.tabStep == null) {
      return <Container style={{justifyContent: 'center'}}><Spinner color='blue'/></Container>
    } else {
      var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      var day = this.props.tabStep.map(item => days[new Date(item.date).getDay()])
      var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    }

    return (
      <Container>
        <Container style={{flex: 4, marginLeft: 5}}>
          <WeeklyChart tabStep={this.props.tabStep} goal={this.props.goal}/>
        </Container>

        <Container style={{flex: 5}}>
          <FlatList
            data={this.props.tabStep}
            inverted={true}
            initialScrollIndex={this.props.tabStep.length - 1}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => {
              return (
                <ListItem style={{flexDirection: 'column'}}>
                  <Text style={{ fontSize: 14, color: 'grey', alignSelf:'flex-start' }}> {day[index] + ", " + (item.date).split('-')[2] + " " + months[Number((item.date).split('-')[1]) - 1] + (index == 6 ? " (today)" : "")} </Text>
                  <Text style={{ fontSize: 15, fontWeight: 'bold', alignSelf:'flex-start' }}> {item.value + " steps"} </Text>
                </ListItem>
              );
            }}
          />
        </Container>
      </Container>
    );
  }
}
