import React, { Component } from "react";
import { Dimensions, Animated, Easing, FlatList } from 'react-native'
import {
  Container,
  Text,
  Spinner,
  ListItem
} from "native-base";

import HourlyChart from './HourlyChart'

import * as Progress from 'react-native-progress';

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

export default class DayProgress extends Component {
  constructor(props) {
    super(props)
    this.animatedValue = new Animated.Value(0)
    this.state = {
      circleProgressValue: 0,
      stepsProgressValue: 0,
      calProgressValue: 0,
      kmProgressValue: 0
    }
    this.isAnimationStart = false
    this.isAnimationEnd = false
  }

  componentDidUpdate() {
    if(this.isAnimationEnd) {
      this.isAnimationEnd = false
      this.animate()
    }
  }

  animate() {
    this.animatedValue.setValue(0)
    Animated.timing(
      this.animatedValue,
      {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.cubic)
      }
    ).start(() => this.isAnimationEnd = true)
    this.animatedValue.addListener((res) => {
      this.setState({
        circleProgressValue: res.value*((this.props.nbSteps/this.props.goal) >= 1 ? 1 : (this.props.nbSteps/this.props.goal)),
        stepsProgressValue: (res.value*this.props.nbSteps).toFixed(0),
        calProgressValue: (res.value*this.props.nbCal).toFixed(0),
        kmProgressValue: (res.value*this.props.km).toFixed(2)
      })
    })
  }

  render() {
    if(this.props.nbSteps != null && !this.isAnimationStart) {
      this.isAnimationStart = true
      this.animate()
    }

    if(this.props.nbSteps == null) {
      return <Container style={{justifyContent: 'center'}}><Spinner color='blue'/></Container>
    }

    return (
      <Container style={{marginTop: 10, alignItems: 'center'}}>
        <Progress.Circle
          style={{height: screenHeight/3}}
          size={screenHeight/3}
          progress={this.state.circleProgressValue}
          animated={false}
          thickness={10}
          borderColor={"rgb(63, 81, 181)"}
          color={"rgb(63, 81, 181)"}
          showsText={true}
        />

        <Text style={{ fontSize: 18, color: 'grey' }}>{"Daily goal: " + this.props.goal}</Text>

        <Container style={{flex: 1, flexDirection: 'row'}}>
          <Container style={{alignItems: 'flex-end'}}>
            <Text style={{ fontSize: 25 }}>{this.state.stepsProgressValue}</Text>
            <Text style={{ fontSize: 18, color: 'grey' }}>steps</Text>
          </Container>
          <Container style={{alignItems: 'center'}}>
            <Text style={{ fontSize: 25 }}>{this.state.calProgressValue}</Text>
            <Text style={{ fontSize: 18, color: 'grey' }}>cal</Text>
          </Container>
          <Container style={{alignItems: 'flex-start'}}>
            <Text style={{ fontSize: 25 }}>{this.state.kmProgressValue}</Text>
            <Text style={{ fontSize: 18, color: 'grey' }}>km</Text>
          </Container>
        </Container>

        <Container style={{flex: 3, width: screenWidth, paddingLeft: 10}}>
          <HourlyChart tabStep={this.props.tabStep}/>
        </Container>
      </Container>
    );
  }
}
