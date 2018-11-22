import React, { Component } from 'react'

import {
  Grid,
  Card,
  CardContent,
  Typography,
  withStyles
} from '@material-ui/core';

import moment from 'moment';

import { firebaseDataBase } from '../firebase';

import CircularProgress from '../components/CircularProgress';

const styles = {
  card: {
    height: '100%'
  }
}

class Overview extends Component {

  constructor(props) {

    super(props);

    this.state = {}

    this.acumuladosRef = firebaseDataBase.ref('acumulados');
    this.historicoRef = firebaseDataBase.ref('historico');
    this.userOptionsRef = firebaseDataBase.ref('userOptions');

    this.handleHistoricoUpdate = this.handleHistoricoUpdate.bind(this);
    this.handleUserOptionsUpdate = this.handleUserOptionsUpdate.bind(this);

  }

  componentDidMount() {

    this.listenForUserOptionsUpdate();
    this.fetchConsumoAtual();

  }

  componentWillUnmount() {

    this.historicoRef.off('child_added');
    this.acumuladosRef.off('value');
    this.userOptionsRef.off('value');

  }

  listenForUserOptionsUpdate() {
    this.userOptionsRef.on('value', dataSnapshot => {
      this.handleUserOptionsUpdate(dataSnapshot.val());
    });
  }

  listenForHistoricoUpdates(startAt) {

    this.historicoRef
      .orderByChild('timestamp')
      .startAt(startAt)
      .on('child_added', dataSnapshot => {

        const consumo = dataSnapshot.val();

        if (consumo.timestamp !== startAt) {
          this.handleHistoricoUpdate(consumo);
        }

      });

  }

  fetchConsumoAtual() {

    const path = moment(Date.now()).format('YYYY/MM');

    this.acumuladosRef
      .child(path)
      .once('value', dataSnapshot => {

        const { acumulado, updatedBy } = dataSnapshot.val();

        this.setState({
          consumo: acumulado
        });

        this.listenForHistoricoUpdates(updatedBy);

      });

  }

  handleHistoricoUpdate({ potencia }) {
    this.setState(previousState => {

      const consumoAnterior = previousState.consumo || 0.0;

      return {
        consumo: consumoAnterior + potencia
      };

    });
  }

  handleUserOptionsUpdate(userOptions) {
    this.setState({
      userOptions
    });
  }

  calcularParametrosDeConsumo() {

    const { userOptions, consumo = 0.0 } = this.state;

    const resultado = {};

    const { unidade, tarifa = 0.0, metaMensal } = userOptions || {};

    switch (unidade) {
      case 'kWh':
        resultado.consumoTotal = consumo;
        break;
      case 'R$':
      default:
        resultado.consumoTotal = consumo * tarifa;
        break;
    }

    resultado.metaMensal = metaMensal;

    if (resultado.metaMensal && resultado.consumoTotal) {
      resultado.porcentagemConsumo = resultado.metaMensal > 0.0 ? 100 * resultado.consumoTotal / resultado.metaMensal : 0.0;
    }

    return resultado;

  }

  formatarParametrosDeConsumo(parametrosDeConsumo) {

    let {
      consumoTotal,
      metaMensal,
      porcentagemConsumo
    } = parametrosDeConsumo;

    const { userOptions } = this.state;

    const resultado = {};

    const { unidade } = userOptions || {};

    consumoTotal = consumoTotal || 0.0;
    metaMensal = metaMensal || 0.0;
    porcentagemConsumo = porcentagemConsumo || 0.0;

    switch (unidade) {
      case 'kWh':
        resultado.consumoTotalFormatado = consumoTotal.toFixed(1) + 'kWh';
        resultado.metaMensalFormatada = metaMensal.toFixed(1) + 'kWh';
        break;
      case 'R$':
      default:
        resultado.consumoTotalFormatado = 'R$' + consumoTotal.toFixed(2);
        resultado.metaMensalFormatada = 'R$' + metaMensal.toFixed(2);
        break;

    }

    resultado.porcentagemConsumoFormatada = porcentagemConsumo.toFixed(2) + '%';

    return resultado;

  }

  render() {

    const parametrosDeConsumo = this.calcularParametrosDeConsumo();

    const {
      consumoTotalFormatado,
      metaMensalFormatada,
      porcentagemConsumoFormatada
    } = this.formatarParametrosDeConsumo(parametrosDeConsumo);

    const fetchingData = !consumoTotalFormatado;

    const { classes } = this.props;

    const MetaMensal = (
      <React.Fragment>
        <Typography variant="caption" align="center" color="inherit">
          Meta Mensal
        </Typography>
        <Typography variant="h3" align="center" color="inherit">
          {metaMensalFormatada}
        </Typography>
      </React.Fragment>
    );

    const PorcentagemConsumo = (
      <React.Fragment>
        <Typography variant="caption" align="center" color="inherit">
          Porcentagem de Consumo
        </Typography>
        <Typography variant="h3" align="center" color="inherit">
          {porcentagemConsumoFormatada}
        </Typography>
      </React.Fragment>
    );

    const Consumo = (
      <React.Fragment>
        <Typography variant="caption" align="center" color="inherit">
          Total Consumido este Mês
        </Typography>
        <Typography variant="h3" align="center" color="inherit">
          {consumoTotalFormatado}
        </Typography>
      </React.Fragment>
    );

    return (
      <Grid container spacing={16} direction="row" alignItems="stretch">
        <Grid item xs={12} md={6} lg={4}>
          <Card className={classes.card}>
            <CardContent>
              {
                fetchingData ? <CircularProgress size={30} /> : Consumo
              }
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card className={classes.card}>
            <CardContent>
              {
                fetchingData ? <CircularProgress size={30} /> : MetaMensal
              }
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card className={classes.card}>
            <CardContent>
              {
                fetchingData ? <CircularProgress size={30} /> : PorcentagemConsumo
              }
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(Overview);
