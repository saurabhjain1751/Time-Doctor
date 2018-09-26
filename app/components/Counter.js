import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { storeTime, incrementTimer } from '../actions/counter.js';

const { remote, ipcRenderer } = require('electron');
// const ipcdemo = electron.ipcMain;

class StopWatch extends React.Component {
  constructor() {
    super();
    this.state = {};
    // holds the actuall time
    this.time = null;
    // will be used to clear the interval
    this.intervalId = null;
    // used to switch from play to pause and viceversa
    this.state.toggle = false;
    // holds the formatted current time in HH:mm:ss
    this.state.currentTime = null;

    this.state.startTime = null;

    this.state.endTime = null;
  }

  componentDidMount() {
    this.initializeTime();
    ipcRenderer.on('play-pause-timer', () => {
      // console.log("Hello i am in counter.js parent PLAY/PAUSE",argument);
      this.playTime();
    });
    ipcRenderer.on('reset-timer', () => {
      // console.log("Hello i am in counter.js parent RESET TIMER",argument);
      this.resetTime();
    });
  }

  initializeTime = () => {
    this.time = 0;
    this.setState({
      currentTime: this.formatTime(this.getTime())
    });
    // console.log("this.state.currentTime", this.formatTime(this.getTime()))
  };

  playTime = () => {
    if (!this.state.toggle) {
      this.startTime();
      if (this.state.startTime === null) {
        this.setState({
          startTime: moment().format('MMMM Do YYYY, h:mm:ss a')
        });
        // console.log("moment().format('MMMM Do YYYY, h:mm:ss a');", moment().format('MMMM Do YYYY, h:mm:ss a'))
      }
    } else {
      this.pauseTime();
    }
  };

  startTime() {
    this.createInterval();
    this.toggle();
  }

  pauseTime = () => {
    this.clearInterval();
    this.toggle();
  };

  resetTime = () => {
    const endTime = moment().format('MMMM Do YYYY, h:mm:ss a');
    const newData = this.props.data;
    const currentData = {};
    currentData.startTime = this.state.startTime;
    currentData.endTime = endTime;
    currentData.timeWorked = this.state.currentTime;
    newData.push(currentData);
    this.props.storeWorkHistoryFunction(newData);

    this.initializeTime();
    this.clearInterval();
    this.setState({ toggle: false });
  };

  toggle = () => {
    this.setState({
      toggle: !this.state.toggle
    });
  };

  createInterval() {
    this.intervalId = setInterval(this.updateTime, 100);
  }

  clearInterval() {
    clearInterval(this.intervalId);
  }

  updateTime = () => {
    this.time += 100;
    const newTime = this.getTime();
    const formattedTime = this.formatTime(newTime);
    // console.log("having current time is [[[[[[[[",this.state.currentTime);
    this.setState({ currentTime: formattedTime });
    this.props.incrementTimerOnStore(formattedTime);
  };

  formatTime = momentJsObject => momentJsObject.format('HH:mm:ss');

  getTime = () => moment.utc(this.time);

  render() {
    const toggleText = !this.state.toggle ? 'Play' : 'Stop';
    let icn = null;
    let dynamic_class = null;
    if (toggleText == 'Play') {
      icn = <i className="fas fa-play" />;
      dynamic_class = 'paused';
    } else if (toggleText == 'Stop') {
      icn = <i className="fas fa-stop" />;
      dynamic_class = 'played';
    }

    const window2 = remote.getGlobal('child');
    if (this.props.timer) {
      // console.log('sending timer sync ');
      // synchronise widget with main by sending the call to widget
      if (window2)
        window2.webContents.send('message', this.state.currentTime, toggleText);
    }
    // code to divide time string in each character to display below
    const m = moment(
      this.state.currentTime ? this.state.currentTime : '00:00:00'
    );
    m.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    m.toISOString();
    m.format();
    const arry = m._i.replace(/:/g, '').split('');

    return (
      <div className={`mdl-cell mdl-cell--12-col panel_box ${dynamic_class}`}>
        <div className="headSec_main">
          <i className="far fa-check-circle mr-5" /> Time Doctor
        </div>
        <div className="bodysec_main">
          <div className="mdl-card__title-expand">
            <div ref="time" id="time">
              <span className="timerBox">{arry[0]}</span>
              <span className="timerBox">{arry[1]}</span>
              <span className="seprator">:</span>
              <span className="timerBox">{arry[2]}</span>
              <span className="timerBox">{arry[3]}</span>
              <span className="seprator">:</span>
              <span className="timerBox">{arry[4]}</span>
              <span className="timerBox">{arry[5]}</span>
            </div>
          </div>

          <div className="mdl-card__actions">
            <button
              className="mdl-button mdl-js-button mdl-button--raised mdl-button--primary"
              onClick={this.playTime}
            >
              {/* toggleText */}
              {icn}
            </button>

            <button
              className="mdl-button mdl-js-button mdl-button--raised mdl-button--primary float--right"
              onClick={this.resetTime}
            >
              R
            </button>
          </div>
        </div>
        <div className="fotterSec">
          <div className="footName">
            <strong>
              Worked today:{' '}
              {moment(this.state.currentTime, 'hh:mm:ss').minute()}m
            </strong>
          </div>
          <div className="footName">
            Company time: {moment().hour()}:{moment().minute()}:
            {moment().second()}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  // console.log("state", state)
  return {
    data: state.counter.trakerHistory ? state.counter.trakerHistory : [],
    timer: state.counter.timer
  };
}

function mapDispatchToProps(dispatch) {
  return {
    storeWorkHistoryFunction: value => dispatch(storeTime(value)),
    incrementTimerOnStore: value => dispatch(incrementTimer(value))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StopWatch);
