import { createDrawerNavigator, createStackNavigator, createMaterialTopTabNavigator, createAppContainer } from 'react-navigation';
import React from "react";

import ExerciseCoach from '../screens/ExerciseCoach';
import Traxivity from '../screens/Traxivity';


import NewGoal from '../screens/Traxivity/NewGoal'
import TraxivitySettings from '../screens/Traxivity/Settings'
import ExerciseCoachSettings from '../screens/ExerciseCoach/Settings'
import ExerciseCoachInfo from '../screens/ExerciseCoach/ExerciseCoachInfo'


import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dimensions } from 'react-native'

import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['ViewPagerAndroid']);

const TabNavigator = createMaterialTopTabNavigator(
  {
    ExerciseCoach: {
      screen: ExerciseCoach,
      navigationOptions: {
        tabBarLabel: 'FitChat',
        tabBarIcon: ({ focused, horizontal, tintColor }) => { return <Icon name={'voice'} size={25} color={tintColor} /> }
      }
    },
    Traxivity: {
      screen : Traxivity,
      navigationOptions: {
        tabBarLabel: 'Traxivity',
        tabBarIcon: ({ focused, horizontal, tintColor }) => { return <Icon name={'walk'} size={25} color={tintColor} /> }
      }
    }
  },
  {
    lazy: false,
    bounces: false,
    initialRouteName: "ExerciseCoach",
    tabBarPosition: 'bottom',
    tabBarOptions: {
      activeTintColor: 'rgb(70, 70, 200)', //blue
      inactiveTintColor: '#AAAAAA', //grey
      activeBackgroundColor: '#DDDDDD', //grey
      inactiveBackgroundColor: '#FFFFFF', //white
      upperCaseLabel: false,
      showLabel: true,
      showIcon: true,
      indicatorStyle: {
        backgroundColor: 'rgb(70, 70, 200)',
        height: 3
      },
      style: {
        backgroundColor: 'white',
        height: 65
      },
    },

  }
)

const AppDrawer = createDrawerNavigator(
  {
    TabNavigator: {
      screen: TabNavigator,
      navigationOptions: {
        drawerLabel: "FitChat",
        drawerIcon: (<Icon name={'voice'} size={25} color={"black"} />)
      }
    },
    TraxivitySettings: {
      screen: TraxivitySettings,
      navigationOptions: {
        drawerLabel: "Traxivity settings",
        drawerIcon: (<Icon name={'settings'} size={25} color={"black"} />)
      }
    },
    ExerciseCoachSettings: {
      screen: ExerciseCoachSettings,
      navigationOptions: {
        drawerLabel: "FitChat Bot settings",
        drawerIcon: (<Icon name={'settings'} size={25} color={"black"} />)
      }
    },
    SetNewGoal: {
      screen: NewGoal,
      navigationOptions: {
        drawerLabel: "New Step Goal",
        drawerIcon: (<Icon name={'walk'} size={25} color={"black"} />)
      }
    }
  },
  {
    drawerType: 'slide',
    drawerWidth: (Dimensions.get('window').width)/4 * 3,
    initialRouteName: "TabNavigator",
    contentOptions: {
      activeTintColor: 'rgb(63, 81, 181)',
    }
  }
)

export default createAppContainer(AppDrawer)
