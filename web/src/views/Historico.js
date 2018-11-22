import React, { Component } from 'react';

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
import FusionCharts from '../components/FusionCharts';
import TitleWithOptions from '../components/TitleWithOptions';

import { meses, padWithZeros, diasDaSemana } from '../utils';

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
      historicoAnual: {},
      historicoMensal: {},
      historicoSemanal: {},
      userOptions: {},
      options: [
        {
          value: 'R$',
          description: 'R$'
        },
        {
          value: 'kWh',
          description: 'kWh'
        }
      ],
      selectedOption: 'R$',
      fetchingData: true
    };

    this.handleUserOptionsUpdate = this.handleUserOptionsUpdate.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);

    this.acumuladosRef = firebaseDataBase.ref('acumulados');
    this.userOptionsRef = firebaseDataBase.ref('userOptions');
  }

  componentDidMount() {
    this.fetchUserOptions();
    this.fetchHistorico();
  }

  componentWillUnmount() {
    this.userOptionsRef.off('value');
    this.acumuladosRef.off('value');
  }

  fetchUserOptions() {
    this.userOptionsRef.on('value', dataSnapshot => {
      this.handleUserOptionsUpdate(dataSnapshot.val());
    });
  }

  getConsumoAcumuladoSemanas(mes) {}

  getConsumoAcumuladoDias(mes) {}

  getConsumoAcumuladoMeses(ano) {}

  fetchHistorico() {
    const path = moment().format('YYYY');

    this.acumuladosRef.child(path).once(
      'value',
      dataSnapshotAnual => {
        const historicoAnual = {};
        const historicoMensal = {};
        const historicoSemanal = {};

        for (let mes = 0; mes < 12; mes++) {
          const monthAsString = meses[mes];

          const path = padWithZeros(mes + 1, 2);

          const dataSnapshotMensal = dataSnapshotAnual.child(path);

          const dadosDoMes = dataSnapshotMensal.val();

          if (dadosDoMes != null) {
            const consumoAcumuladoMes = dadosDoMes.acumulado;

            for (let dia = 1; dia <= 31; dia++) {
              const pathDia = padWithZeros(dia, 2);
              const dadosDia = dataSnapshotMensal.child(pathDia).val();

              if (dadosDia != null) {
                const { updatedBy, acumulado } = dadosDia;

                const data = moment(updatedBy);
                const dataAsString = data.format('DD/MM/YYYY');
                const diaSemanaAsString = diasDaSemana[data.day()];

                historicoMensal[dataAsString] = acumulado;

                if (!historicoSemanal[diaSemanaAsString]) {
                  historicoSemanal[diaSemanaAsString] = 0.0;
                }

                historicoSemanal[diaSemanaAsString] += acumulado;
              }
            }

            historicoAnual[monthAsString] = consumoAcumuladoMes;
          }
        }

        this.setState({
          historicoAnual,
          historicoMensal,
          historicoSemanal,
          fetchingData: false
        });
      },
      () => {
        this.setState({
          fetchingData: false
        });
      }
    );
  }

  handleUserOptionsUpdate(userOptions) {
    if (userOptions) {
      this.setState({
        userOptions
      });
    }
  }

  plotHistoricoConsumo(historico) {
    if (historico) {
      console.log(historico);
    }
  }

  getHistoricoAnualDataSource() {
    const dataSource = {
      chart: {
        caption: ' ',
        xAxisName: 'Mês',
        lineThickness: '2',
        theme: 'candy',
        palettecolors: '29c3be',
        labelDisplay: 'rotate',
        slantLabel: '1',
        decimals: '2',
        plotToolText: 'Mês: $label <br> Consumo: $dataValue'
      },
      data: []
    };

    const { selectedOption, userOptions } = this.state;

    const { tarifa } = userOptions || { tarifa: 0.0 };

    const { chart, data } = dataSource;

    if (selectedOption === 'R$') {
      chart.numberPrefix = selectedOption;
      chart.yAxisName = 'Reais';
    } else if (selectedOption === 'kWh') {
      chart.numberSuffix = selectedOption;
      chart.yAxisName = 'Potência';
    }

    const entries = Object.entries(this.state.historicoAnual);

    for (let [dateAsString, potencia] of entries) {
      let value = 0.0;

      if (selectedOption === 'R$') {
        value = potencia * tarifa;
      } else if (selectedOption === 'kWh') {
        value = potencia;
      }

      data.push({
        label: dateAsString,
        value
      });
    }

    return dataSource;
  }

  getHistoricoSemanalDataSource() {
    const dataSource = {
      chart: {
        caption: ' ',
        xAxisName: 'Dia da Semana',
        lineThickness: '2',
        theme: 'candy',
        palettecolors: '29c3be',
        labelDisplay: 'rotate',
        slantLabel: '1',
        decimals: '2',
        plotToolText: 'Dia da Semana: $label <br> Consumo: $dataValue'
      },
      data: []
    };

    const { selectedOption, userOptions } = this.state;

    const { tarifa } = userOptions || { tarifa: 0.0 };

    const { chart, data } = dataSource;

    if (selectedOption === 'R$') {
      chart.numberPrefix = selectedOption;
      chart.yAxisName = 'Reais';
    } else if (selectedOption === 'kWh') {
      chart.numberSuffix = selectedOption;
      chart.yAxisName = 'Potência';
    }

    const entries = Object.entries(this.state.historicoSemanal);

    for (let [dateAsString, potencia] of entries) {
      let value = 0.0;

      if (selectedOption === 'R$') {
        value = potencia * tarifa;
      } else if (selectedOption === 'kWh') {
        value = potencia;
      }

      data.push({
        label: dateAsString,
        value
      });
    }

    return dataSource;
  }

  getHistoricoMensalDataSource() {
    const dataSource = {
      chart: {
        caption: ' ',
        xAxisName: 'Data',
        lineThickness: '2',
        theme: 'candy',
        palettecolors: '29c3be',
        labelDisplay: 'rotate',
        slantLabel: '1',
        decimals: '2',
        plotToolText: 'Data: $label <br> Consumo: $dataValue'
      },
      data: []
    };

    const { selectedOption, userOptions } = this.state;

    const { tarifa } = userOptions || { tarifa: 0.0 };

    const { chart, data } = dataSource;

    if (selectedOption === 'R$') {
      chart.numberPrefix = selectedOption;
      chart.yAxisName = 'Reais';
    } else if (selectedOption === 'kWh') {
      chart.numberSuffix = selectedOption;
      chart.yAxisName = 'Potência';
    }

    const entries = Object.entries(this.state.historicoMensal);

    for (let [dateAsString, potencia] of entries) {
      let value = 0.0;

      if (selectedOption === 'R$') {
        value = potencia * tarifa;
      } else if (selectedOption === 'kWh') {
        value = potencia;
      }

      data.push({
        label: dateAsString,
        value
      });
    }

    return dataSource;
  }

  handleOptionChange(selectedOption) {
    if (selectedOption) {
      this.setState({
        selectedOption
      });
    }
  }

  render() {
    const { fetchingData, options, selectedOption } = this.state;
    const { classes } = this.props;

    const historicoAnualDataSource = this.getHistoricoAnualDataSource();
    const historicoMensalDataSource = this.getHistoricoMensalDataSource();
    const historicoSemanalDataSource = this.getHistoricoSemanalDataSource();

    return (
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Card className={classes.noOverflow}>
            <CardContent>
              <Typography variant="h2" align="center">
                Histórico de Consumo
              </Typography>
            </CardContent>
            {fetchingData ? (
              <CardContent>
                <CircularProgress size={50} />
              </CardContent>
            ) : (
              <div>
                <CardContent>
                  <TitleWithOptions
                    options={options}
                    defaultOption={selectedOption}
                    title="Histórico Semanal"
                    onOptionChange={this.handleOptionChange}
                  />
                  <FusionCharts
                    type="column2d"
                    width="100%"
                    height="60%"
                    dataFormat="json"
                    dataSource={historicoSemanalDataSource}
                  />
                </CardContent>
                <CardContent>
                  <TitleWithOptions
                    options={options}
                    defaultOption={selectedOption}
                    title="Histórico Mensal"
                    onOptionChange={this.handleOptionChange}
                  />
                  <FusionCharts
                    type="column2d"
                    width="100%"
                    height="60%"
                    dataFormat="json"
                    dataSource={historicoMensalDataSource}
                  />
                </CardContent>
                <CardContent>
                  <TitleWithOptions
                    options={options}
                    defaultOption={selectedOption}
                    title="Histórico Anual"
                    onOptionChange={this.handleOptionChange}
                  />
                  <FusionCharts
                    type="column2d"
                    width="100%"
                    height="60%"
                    dataFormat="json"
                    dataSource={historicoAnualDataSource}
                  />
                </CardContent>
              </div>
            )}
          </Card>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(SimuladorConsumo);
