import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { storeTime, incrementTimer } from '../actions/counter.js';

const electron = require('electron');

const ipc = electron.ipcMain;
const { remote, ipcRenderer } = require('electron');

class widgetStopWatch extends React.Component {
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

    this.state.endTime = null;
  }

  componentDidMount() {
    this.initializeTime();
    ipcRenderer.on('message', (event, argument, btntext) => {
      // console.log("Hello i am in widget.js child ",btntext);
      let toggleText;
      if (btntext == 'Play') {
        toggleText = false;
      } else if (btntext == 'Stop') {
        toggleText = true;
      }
      this.setState({
        currentTime: moment(argument, 'hh:mm:ss'),
        toggle: toggleText
      });
    });
  }

  initializeTime = () => {
    this.time = 0;
    this.setState({
      currentTime: this.formatTime(this.getTime())
    });
    // console.log("this.state.currentTime", this.getTime())
  };

  playTime = () => {
    const window1 = remote.getGlobal('mainWindow');
    if (window1) window1.webContents.send('play-pause-timer', 'toggle timer');
  };

  resetTime = () => {
    const window1 = remote.getGlobal('mainWindow');
    if (window1) window1.webContents.send('reset-timer', 'toggle timer');
  };

  toggle = () => {
    this.setState({
      toggle: !this.state.toggle
    });
  };

  formatTime = momentJsObject => momentJsObject.format('HH:mm:ss');

  getTime = () => moment.utc(this.time);

  render() {
    const toggleText = !this.state.toggle ? 'Play' : 'Stop';

    let icn = null;
    let dynamic_class = null;
    if (toggleText == 'Play') {
      icn = <i className="fas fa-play" />;
      dynamic_class = 'paused_widget';
    } else if (toggleText == 'Stop') {
      icn = <i className="fas fa-stop" />;
      dynamic_class = 'played_widget';
    }

    return (
      <div
        className={`mdl-cell mdl-cell--12-col timer_widget draggable ${dynamic_class}`}
      >
        <div className="mdl_card_drag">
          <i className="fas fa-grip-vertical" />
        </div>

        <div className="mdl-card__actions">
          <button className="play-circle" onClick={this.playTime}>
            {/* toggleText */}
            {icn}
          </button>

          {/* <button className="mdl-button mdl-js-button mdl-button--raised mdl-button--primary float--right" onClick={this.resetTime}>
            Reset
          </button> */}
        </div>

        <div className="mdl_card_status" />

        <div className="mdl-card__title-expand mr-5">
          <div ref="time" id="time">
            <span className="timerBox">
              {moment(this.state.currentTime, 'hh:mm:ss').hour()}
            </span>
            <span className="seprator">:</span>
            <span className="timerBox">
              {moment(this.state.currentTime, 'hh:mm:ss').minute()}
            </span>
            <span className="seprator">:</span>
            <span className="timerBox">
              {moment(this.state.currentTime, 'hh:mm:ss').second()}
            </span>
          </div>
        </div>
        <button className="mdl_card_close">
          <i className="fas fa-times" />
        </button>
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
)(widgetStopWatch);
