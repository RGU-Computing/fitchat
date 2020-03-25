import React, { Component } from 'react';
import {
  Text,
} from 'react-native';

import {Content, Button} from 'native-base';

export default class Sidebar extends Component {
  render() {
    return (
      <Content style={{backgroundColor:'#FFFFFF'}}>
        <Button
          onPress= {this.props.closeDrawer}>
          <Text>Goto Page 1</Text>
       </Button>
       <Button
         onPress= {this.props.closeDrawer}>
         <Text>Goto Page 2</Text>
      </Button>
      <Button
        onPress= {this.props.closeDrawer}>
        <Text>Goto Page 3</Text>
     </Button>
      </Content>
    );
  }
}
