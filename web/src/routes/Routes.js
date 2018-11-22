import React from 'react';

import { Switch, Route } from 'react-router-dom';

import DashBoard from '../views/DashBoard';
import Settings from '../views/Settings';
import SimuladorConsumo from '../views/SimuladorConsumo';
import Historico from '../views/Historico';

function Routes() {
  return (
    <Switch>
      <Route path="/dashboard" component={DashBoard} />
      <Route path="/configuracoes" component={Settings} />
      <Route path="/simulador-consumo" component={SimuladorConsumo} />
      <Route path="/historico" component={Historico} />
      <Route path="/" component={DashBoard} />
    </Switch>
  );
}

export default Routes;
