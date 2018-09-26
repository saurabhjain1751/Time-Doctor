// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Home.css';
import StopWatch from './Counter.js';

type Props = {};

export default class Home extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container} data-tid="container">
        <StopWatch />
      </div>
    );
  }
}

// <Link to={routes.COUNTER}>to Counter</Link>
