import React, { Component } from 'react';

import moment from 'moment';
import 'moment/locale/pt-br';

import classnames from 'classnames';

import {
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  withStyles,
  Collapse
} from '@material-ui/core';

import { Check as CheckIcon, Close as CloseIcon } from '@material-ui/icons';

import { firebaseDataBase } from '../firebase';

import CircularProgress from '../components/CircularProgress';
import FusionCharts from '../components/FusionCharts';
import MonthYearPicker from '../components/MonthYearPicker';

import { horasDoDia, diasDaSemana, padWithZeros } from '../utils';

import Consumo from '../models/Consumo';

const RED = '#c0392b';
const GREEN = '#29c3a0';
const YELLOW = '#f1c40f';

const PostosTarifarios = {
  FORA_PONTA: 'FORA_PONTA',
  INTERMEDIARIO: 'INTERMEDIARIO',
  PONTA: 'PONTA'
};

function getPostoTarifarioByHora(hora) {
  hora = moment(hora, 'HH:mm');

  const inicioPeriodoPonta = moment('18:00', 'HH:mm');
  const fimPeriodoPonta = moment('21:00', 'HH:mm');

  const inicioPeriodoIntermediario1 = moment('17:00', 'HH:mm');
  const fimPeriodoIntermediario1 = moment('18:00', 'HH:mm');

  const inicioPeriodoIntermediario2 = moment('21:00', 'HH:mm');
  const fimPeriodoIntermediario2 = moment('22:00', 'HH:mm');

  let postoTarifario = PostosTarifarios.FORA_PONTA;

  if (hora.isBetween(inicioPeriodoPonta, fimPeriodoPonta, null, '[)')) {
    postoTarifario = PostosTarifarios.PONTA;
  } else if (
    hora.isBetween(
      inicioPeriodoIntermediario1,
      fimPeriodoIntermediario1,
      null,
      '[)'
    ) ||
    hora.isBetween(
      inicioPeriodoIntermediario2,
      fimPeriodoIntermediario2,
      null,
      '[)'
    )
  ) {
    postoTarifario = PostosTarifarios.INTERMEDIARIO;
  }

  return postoTarifario;
}

const styles = {
  textBold: {
    fontWeight: 'bold'
  },
  textAlignCenter: {
    textAlign: 'center'
  },
  noOverflow: {
    overflow: 'unset'
  },
  capitalize: {
    textTransform: 'capitalize'
  },
  fab: {
    marginLeft: 15
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
};

class SimuladorConsumo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      horarios: horasDoDia,
      consumoDiasUteis: {},
      consumoSabados: {},
      consumoDomingos: {},
      userOptions: {},
      tarifasTarifaBranca: {},
      tarifaBranca: 0.0,
      tarifaConvencional: 0.0,
      inputFocused: null,
      selectedDate: {},
      fetchingData: true,
      showResultadosSimulacao: false
    };

    this.handleClearDates = this.handleClearDates.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleSimularConsumo = this.handleSimularConsumo.bind(this);
    this.plotHistoricoConsumo = this.plotHistoricoConsumo.bind(this);
    this.handleUserOptionsUpdate = this.handleUserOptionsUpdate.bind(this);

    this.acumuladosRef = firebaseDataBase.ref('acumulados');
    this.userOptionsRef = firebaseDataBase.ref('userOptions');
    this.tarifaBrancaRef = firebaseDataBase.ref('tarifaBranca');
  }

  componentDidMount() {
    this.userOptionsRef.on('value', dataSnapshot => {
      this.handleUserOptionsUpdate(dataSnapshot.val());
    });

    this.tarifaBrancaRef.on('value', dataSnapshot => {
      this.handleTarifaBrancaChange(dataSnapshot.val());
    });
  }

  handleTarifaBrancaChange(tarifasTarifaBranca) {
    if (tarifasTarifaBranca) {
      this.setState({
        tarifasTarifaBranca
      });
    }
  }

  componentWillUnmount() {
    this.userOptionsRef.off('value');
    this.acumuladosRef.off('value');
    this.tarifaBrancaRef.off('value');
  }

  handleUserOptionsUpdate(userOptions) {
    if (userOptions) {
      this.setState({
        userOptions,
        fetchingData: false
      });
    }
  }

  plotHistoricoConsumo(historico) {
    if (historico) {
      const consumoDiasUteis = {};
      const consumoSabados = {};
      const consumoDomingos = {};

      for (let dataPoint of historico) {
        const { timestamp, acumulado } = dataPoint;

        const data = new Date(timestamp);

        const diaSemana = data.getDay();

        const horaAsString = moment(data).format('HH:00');

        if (diasDaSemana[diaSemana] === 'Sábado') {
          if (!consumoSabados[horaAsString]) {
            consumoSabados[horaAsString] = 0.0;
          }

          consumoSabados[horaAsString] += acumulado;
        } else if (diasDaSemana[diaSemana] === 'Domingo') {
          if (!consumoDomingos[horaAsString]) {
            consumoDomingos[horaAsString] = 0.0;
          }

          consumoDomingos[horaAsString] += acumulado;
        } else {
          if (!consumoDiasUteis[horaAsString]) {
            consumoDiasUteis[horaAsString] = 0.0;
          }

          consumoDiasUteis[horaAsString] += acumulado;
        }
      }

      this.setState({
        consumoDiasUteis,
        consumoDomingos,
        consumoSabados,
        fetchingData: false,
        showResultadosSimulacao: true
      });
    }
  }

  getConsumoDiasUteis() {
    const dataSource = {
      chart: {
        theme: 'candy',
        caption: 'Dias Úteis',
        xAxisName: 'Hora',
        pYAxisName: 'Valor da Tarifa',
        sYAxisName: 'Potência Consumida',
        sYAxisMinValue: '0',
        sNumberSuffix: 'kWh',
        labelDisplay: 'rotate',
        slantLabel: '1',
        numberPrefix: 'R$',
        drawCrossLine: '0'
      },
      categories: [
        {
          category: []
        }
      ],
      dataset: [
        {
          renderAs: 'column2d',
          color: '#2980b9',
          parentYAxis: 'p',
          data: [],
          plotToolText: 'Tarifa: $dataValue'
        },
        {
          renderAs: 'area',
          color: '#2980b9',
          parentYAxis: 's',
          data: [],
          plotToolText: 'Consumo de $dataValue'
        }
      ]
    };

    const [firstDataSet, secondDataSet] = dataSource.dataset;
    const [categories] = dataSource.categories;

    const { tarifa } = this.state.userOptions;
    const {
      tarifaPonta,
      tarifaForaPonta,
      tarifaIntermediaria
    } = this.state.tarifasTarifaBranca;

    let consumoTarifaBranca = 0.0;
    let consumoTarifaConvencional = 0.0;

    const potencias = this.state.consumoDiasUteis;

    for (let horario of this.state.horarios) {
      const hora = moment(horario, 'HH:00');

      const postoTarifario = getPostoTarifarioByHora(hora);

      let color = GREEN;
      let valorTarifaBranca = tarifaForaPonta;

      if (postoTarifario === PostosTarifarios.PONTA) {
        color = RED;
        valorTarifaBranca = tarifaPonta;
      } else if (postoTarifario === PostosTarifarios.INTERMEDIARIO) {
        valorTarifaBranca = tarifaIntermediaria;
        color = YELLOW;
      }

      categories.category.push({
        label: horario
      });

      firstDataSet.data.push({
        value: valorTarifaBranca,
        color: color
      });

      const potencia = potencias[horario] || 0.0;

      secondDataSet.data.push({
        value: potencia
      });

      if (tarifa && valorTarifaBranca) {
        consumoTarifaBranca += potencia * valorTarifaBranca;
        consumoTarifaConvencional += potencia * tarifa;
      }
    }

    if (tarifa) {
      dataSource.trendlines = [
        {
          line: [
            {
              parentYAxis: 'p',
              startvalue: tarifa,
              color: '#8e44ad',
              displayvalue: `Tarifa convencional - R$${tarifa}`,
              valueOnRight: '0',
              thickness: '3',
              showOnTop: '1'
            }
          ]
        }
      ];
    }

    return new Consumo(
      dataSource,
      consumoTarifaBranca,
      consumoTarifaConvencional
    );
  }

  getConsumoSabados() {
    const dataSource = {
      chart: {
        theme: 'candy',
        caption: 'Sábados',
        xAxisName: 'Hora',
        pYAxisName: 'Valor da Tarifa',
        sYAxisName: 'Potência Consumida',
        sYAxisMinValue: '0',
        sNumberSuffix: 'kWh',
        labelDisplay: 'rotate',
        slantLabel: '1',
        numberPrefix: 'R$',
        drawCrossLine: '0'
      },
      categories: [
        {
          category: []
        }
      ],
      dataset: [
        {
          renderAs: 'column2d',
          color: '#2980b9',
          parentYAxis: 'p',
          plotToolText: 'Tarifa: $dataValue',
          data: []
        },
        {
          renderAs: 'area',
          color: '#2980b9',
          parentYAxis: 's',
          plotToolText: 'Consumo de $dataValue',
          data: []
        }
      ]
    };

    const [firstDataSet, secondDataSet] = dataSource.dataset;
    const [categories] = dataSource.categories;

    const potencias = this.state.consumoSabados;

    let consumoTarifaConvencional = 0.0;
    let consumoTarifaBranca = 0.0;

    const { tarifa } = this.state.userOptions;
    const { tarifaForaPonta } = this.state.tarifasTarifaBranca;

    for (let horario of this.state.horarios) {
      let color = GREEN;

      categories.category.push({
        label: horario
      });

      firstDataSet.data.push({
        value: tarifaForaPonta,
        color: color
      });

      const potencia = potencias[horario] || 0.0;

      secondDataSet.data.push({
        value: potencia
      });

      if (tarifa && tarifaForaPonta) {
        consumoTarifaBranca += potencia * tarifaForaPonta;
        consumoTarifaConvencional += potencia * tarifa;
      }
    }

    if (tarifa) {
      dataSource.trendlines = [
        {
          line: [
            {
              parentYAxis: 'p',
              startvalue: tarifa,
              color: '#8e44ad',
              displayvalue: `Tarifa convencional - R$${tarifa}`,
              valueOnRight: '0',
              thickness: '3',
              showOnTop: '1'
            }
          ]
        }
      ];
    }

    return new Consumo(
      dataSource,
      consumoTarifaBranca,
      consumoTarifaConvencional
    );
  }

  getConsumoDomingos() {
    const dataSource = {
      chart: {
        theme: 'candy',
        caption: 'Domingos',
        xAxisName: 'Hora',
        pYAxisName: 'Valor da Tarifa',
        sYAxisName: 'Potência Consumida',
        sYAxisMinValue: '0',
        sNumberSuffix: 'kWh',
        labelDisplay: 'rotate',
        slantLabel: '1',
        numberPrefix: 'R$',
        drawCrossLine: '0'
      },
      categories: [
        {
          category: []
        }
      ],
      dataset: [
        {
          renderAs: 'column2d',
          color: '#2980b9',
          parentYAxis: 'p',
          plotToolText: 'Tarifa: $dataValue',
          data: []
        },
        {
          renderAs: 'area',
          color: '#2980b9',
          parentYAxis: 's',
          plotToolText: 'Consumo de $dataValue',
          data: []
        }
      ]
    };

    const [firstDataSet, secondDataSet] = dataSource.dataset;
    const [categories] = dataSource.categories;

    const potencias = this.state.consumoDomingos;

    const { tarifa } = this.state.userOptions;
    const { tarifaForaPonta } = this.state.tarifasTarifaBranca;

    let consumoTarifaBranca = 0.0;
    let consumoTarifaConvencional = 0.0;

    for (let horario of this.state.horarios) {
      let color = GREEN;

      categories.category.push({
        label: horario
      });

      firstDataSet.data.push({
        value: tarifaForaPonta,
        color: color
      });

      const potencia = potencias[horario] || 0;

      secondDataSet.data.push({
        value: potencia
      });

      if (tarifa && tarifaForaPonta) {
        consumoTarifaBranca += potencia * tarifaForaPonta;
        consumoTarifaConvencional += potencia * tarifa;
      }
    }

    if (tarifa) {
      dataSource.trendlines = [
        {
          line: [
            {
              parentYAxis: 'p',
              startvalue: tarifa,
              color: '#8e44ad',
              displayvalue: `Tarifa convencional - R$${tarifa}`,
              valueOnRight: '0',
              thickness: '3',
              showOnTop: '1'
            }
          ]
        }
      ];
    }

    return new Consumo(
      dataSource,
      consumoTarifaBranca,
      consumoTarifaConvencional
    );
  }

  handleDateChange(selectedDate) {
    this.setState({
      selectedDate
    });
  }

  handleSimularConsumo() {
    const { year, month } = this.state.selectedDate;

    if (year != null && month != null) {
      const path = moment({ year, month }).format('YYYY/MM');

      this.setState({
        fetchingData: true,
        showResultadosSimulacao: false
      });

      this.acumuladosRef.child(path).once('value', dataSnapshot => {
        const historico = [];

        dataSnapshot.forEach(snapshotDia => {
          for (let hora = 0; hora < 24; hora++) {
            const path = padWithZeros(hora, 2);

            const horaRef = snapshotDia.child(path);

            const consumo = horaRef.val();

            if (consumo !== null) {
              const dataPoint = {
                acumulado: consumo.acumulado,
                timestamp: consumo.updatedBy
              };

              historico.push(dataPoint);
            }
          }
        });

        this.plotHistoricoConsumo(historico);

        this.acumuladosRef.off('value');
      });
    }
  }

  handleClearDates() {
    this.setState({
      selectedDate: {}
    });
  }

  render() {
    const { fetchingData, showResultadosSimulacao, selectedDate } = this.state;
    const { classes } = this.props;

    const diasUteis = this.getConsumoDiasUteis();
    const sabados = this.getConsumoSabados();
    const domingos = this.getConsumoDomingos();

    const consumoTotalTarifaBranca =
      diasUteis.tarifaBranca + sabados.tarifaBranca + domingos.tarifaBranca;
    const consumoTotalTarifaConvencional =
      diasUteis.tarifaConvencional +
      sabados.tarifaConvencional +
      domingos.tarifaConvencional;

    const tarifaBrancaStyle = {};
    const tarifaConvencionalStyle = {};

    let melhorOpcao = '';

    if (consumoTotalTarifaBranca > consumoTotalTarifaConvencional) {
      tarifaBrancaStyle.color = RED;
      tarifaConvencionalStyle.color = GREEN;
      melhorOpcao = 'Tarifa Convencional';
    } else if (consumoTotalTarifaBranca < consumoTotalTarifaConvencional) {
      tarifaBrancaStyle.color = GREEN;
      tarifaConvencionalStyle.color = RED;
      melhorOpcao = 'Tarifa Branca';
    } else {
      tarifaBrancaStyle.color = GREEN;
      tarifaConvencionalStyle.color = GREEN;
      melhorOpcao = 'Ambas possuem o mesmo valor!';
    }

    const hasDate =
      selectedDate && selectedDate.year != null && selectedDate.month != null;

    return (
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Card className={classes.noOverflow}>
            <CardContent>
              <Typography variant="h2" align="center">
                Simulador de Consumo - Tarifa Branca
              </Typography>
            </CardContent>
            <CardContent className={classes.textAlignCenter}>
              <div>
                Selecione o mês e o ano desejado para comparar o seu consumo
                utilizando a
                <span
                  className={classnames(classes.textBold, classes.capitalize)}
                >
                  {' '}
                  tarifa branca
                </span>{' '}
                e a
                <span
                  className={classnames(classes.textBold, classes.capitalize)}
                >
                  {' '}
                  tarifa convencional
                </span>
              </div>
            </CardContent>
            <CardContent className={classes.flexRow}>
              <Grid container justify="center">
                <Grid
                  item
                  xs={12}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <MonthYearPicker
                    month={selectedDate.month}
                    year={selectedDate.year}
                    onDateChange={this.handleDateChange}
                  />
                  <Button
                    mini
                    variant="fab"
                    color="primary"
                    disabled={!hasDate}
                    className={classes.fab}
                    onClick={this.handleSimularConsumo}
                  >
                    <CheckIcon />
                  </Button>
                  <Button
                    mini
                    variant="fab"
                    color="secondary"
                    disabled={!hasDate}
                    onClick={this.handleClearDates}
                    className={classes.fab}
                  >
                    <CloseIcon />
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
            <Collapse unmountOnExit in={showResultadosSimulacao}>
              <CardContent>
                <Grid container spacing={16} justify="center">
                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent style={tarifaBrancaStyle}>
                        <Typography
                          variant="caption"
                          align="center"
                          color="inherit"
                        >
                          Tarifa Branca
                        </Typography>
                        <Typography variant="h3" align="center" color="inherit">
                          R${consumoTotalTarifaBranca.toFixed(2)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent style={tarifaConvencionalStyle}>
                        <Typography
                          variant="caption"
                          align="center"
                          color="inherit"
                        >
                          Tarifa Convencional
                        </Typography>
                        <Typography variant="h3" align="center" color="inherit">
                          R${consumoTotalTarifaConvencional.toFixed(2)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
              <CardContent>
                <Typography variant="h5" align="center" color="inherit">
                  Melhor Opção:{' '}
                  <span className={classes.textBold}>{melhorOpcao}</span>
                </Typography>
              </CardContent>
            </Collapse>
            {fetchingData && (
              <CardContent>
                <CircularProgress size={50} />
              </CardContent>
            )}
            <CardContent>
              <FusionCharts
                type="mscombidy2d"
                width="100%"
                height="60%"
                dataFormat="json"
                dataSource={diasUteis.dataSource}
              />
            </CardContent>
            <CardContent>
              <FusionCharts
                type="mscombidy2d"
                width="100%"
                height="50%"
                dataFormat="json"
                dataSource={sabados.dataSource}
              />
            </CardContent>
            <CardContent>
              <FusionCharts
                type="mscombidy2d"
                width="100%"
                height="50%"
                dataFormat="json"
                dataSource={domingos.dataSource}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(SimuladorConsumo);
