import React, { Component } from "react";
import { connect } from 'react-redux';
import { getPeriodStepCount } from '../../../api/googleFitApi'
import GoogleFit, { Scopes } from 'react-native-google-fit'
import WeekProgress from './WeekProgress'

class WeekTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tabStep: null
    }
  }

  componentWillReceiveProps() {
    this.setState({
      tabStep: null
    }, () => this.getInfos())
  }

  componentDidMount() {
    this.getInfos()
  }

  async getInfos() {
    var start = new Date(this.props.selectedDay.getFullYear(), this.props.selectedDay.getMonth(), this.props.selectedDay.getDate(), 0, 0, 0, 0)
    var end = new Date(this.props.selectedDay.getFullYear(), this.props.selectedDay.getMonth(), this.props.selectedDay.getDate(), 0, 0, 0, 0)
    /*var nbDays = start.getDay();
    if(nbDays == 0) nbDays = 7
    start.setDate(start.getDate() - (nbDays-1))*/
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999  )

    var tabStep = await getPeriodStepCount(start, end).catch(err => console.warn(err))
    this.setState({tabStep: tabStep})
  }

  render() {
    return <WeekProgress tabStep={this.state.tabStep} goal={this.props.goal}/>
  }
}

const mapStateToProps = (state) => {
  return {
    goal: state.setUser.userDailyStepGoal
  }
}

export default connect(mapStateToProps)(WeekTab)
