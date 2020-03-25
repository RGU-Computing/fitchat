import React, { Component } from 'react';
import {
  Container,
  Text
} from 'native-base';
import HeaderBar from '../../components/HeaderBar';

export default class ExerciseCoachInfo extends Component {
  render() {
    return (
      <Container>
        <HeaderBar title='Help' onLeftButton={ () => this.props.navigation.navigate('TabNavigator') } leftIcon="md-arrow-round-back"/>
      </Container>
    );
  }
}
