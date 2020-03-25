import React, { Component } from "react";
import { processColor } from 'react-native'
import {
  Container
} from "native-base";

import { BarChart } from 'react-native-charts-wrapper';

export default class WeeklyChart extends Component {
  render() {
    const data = {
      dataSets: [{
        values: this.props.tabStep ? this.props.tabStep.map(item => item ? item.value : 0) : [],
        label: 'Number of steps',
        config: {
          color: processColor('rgb(63, 81, 181)')
        }
      }],
      config: {
        barWidth: 0.5
      }
    }
    let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    let dataDays = this.props.tabStep.map(item => days[new Date(item.date).getDay()])
    const xAxis = {
      valueFormatter: dataDays,
      labelRotationAngle: 0,
      granularityEnabled: true,
      granularity : 1,
      drawAxisLine: true,
      drawGridLines: false,
      position: "BOTTOM"
    }
    const yAxis = {
      left: {
        enabled: true,
        spaceBottom: 10,
        limitLines: [{
          limit: this.props.goal,
          label: 'Goal',
          lineWidth: 2,
          lineDashPhase: 0,
          lineDashLengths: [25, 25]
        }]
      },
      right: {
        enabled: false
      }
    }
    const animation = {
      durationY: 500,
      easingY: 'EaseOutCubic'
    }
    const legend = {
      enabled: true
    }

    return (
      <Container>
        <BarChart
          style={{flex: 1}}
          data={data}
          xAxis={xAxis}
          yAxis={yAxis}
          animation={animation}
          legend={legend}
          visibleRange={{x: { min: 7, max: 7 }}}
          chartDescription={{text: ''}}
          touchEnabled={true}
          marker={{enabled: true}}
          highlights={[{x: 6}]}
        />
      </Container>
    )
  }
}
