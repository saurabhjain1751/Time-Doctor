/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import CounterPage from './containers/CounterPage';
import CounterWidgetPage from './containers/CounterWidgetPage';

export default reduxStore => (
  <App>
    <Switch>
      <Route
        path={routes.COUNTER}
        component={CounterPage}
        reduxStore={reduxStore}
      />
      <Route path={routes.WIDGET} exact component={CounterWidgetPage} />
      <Route path={routes.HOME} component={HomePage} />
    </Switch>
  </App>
);
