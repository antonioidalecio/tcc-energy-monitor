import React, { Component } from 'react';

import moment from 'moment';

import { deepCopy, getMonthAsString, padWithZeros } from '../utils';

import { firebaseDataBase } from '../firebase';

import TitleWithOptions from '../components/TitleWithOptions';
import CircularProgress from '../components/CircularProgress';
import FusionCharts from '../components/FusionCharts';

class Column2DMensal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userOptions: {},
      historico: {},
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

    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.handleHistoricoUpdate = this.handleHistoricoUpdate.bind(this);
    this.handleUserOptionsChange = this.handleUserOptionsChange.bind(this);

    this.historicoRef = firebaseDataBase.ref('historico');
    this.acumuladosRef = firebaseDataBase.ref('acumulados');
    this.userOptionsRef = firebaseDataBase.ref('userOptions');
  }

  listenForHistoricoUpdates(startAt) {
    // Obtém os dados apenas do mês atual
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

  listenForUserOptionsUpdates() {
    this.userOptionsRef.on('value', dataSnapshot => {
      this.handleUserOptionsChange(dataSnapshot.val());
    });
  }

  fetchConsumoInicial() {
    const path = moment().format('YYYY/MM');

    // Obtém os dados apenas do mês atual
    this.acumuladosRef.child(path).once('value', dataSnapshot => {
      const historico = {};

      const { updatedBy } = dataSnapshot.val();

      for (let dia = 1; dia <= 31; dia++) {
        const path = padWithZeros(dia, 2);

        const consumos = dataSnapshot.child(path);

        if (consumos.val() !== null) {
          const { acumulado, updatedBy } = consumos.val();

          const diaAsString = moment(updatedBy).format('DD/MM/YYYY');

          if (!historico[diaAsString]) historico[diaAsString] = 0.0;

          historico[diaAsString] += acumulado;
        }
      }

      this.setState({
        fetchingData: false,
        historico
      });

      this.listenForHistoricoUpdates(updatedBy);
    });
  }

  componentDidMount() {
    this.listenForUserOptionsUpdates();
    this.fetchConsumoInicial();
  }

  componentWillUnmount() {
    this.historicoRef.off('child_added');
    this.acumuladosRef.off('value');
    this.userOptionsRef.off('value');
  }

  handleUserOptionsChange(userOptions) {
    if (userOptions) {
      this.setState({
        userOptions
      });
    }
  }

  getDataSource() {
    const dataSource = {
      chart: {
        caption: ' ',
        xAxisName: 'Dia do Mês',
        lineThickness: '2',
        theme: 'candy',
        palettecolors: '29c3be',
        labelDisplay: 'rotate',
        slantLabel: '1',
        plotToolText: 'Consumo: $dataValue <br> Data: $label'
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

    const entries = Object.entries(this.state.historico);

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

  handleHistoricoUpdate(dados) {
    if (dados) {
      const { potencia, timestamp } = dados;

      const dateAsString = moment(timestamp).format('DD/MM/YYYY');

      const historico = deepCopy(this.state.historico);

      if (!historico[dateAsString]) {
        historico[dateAsString] = 0.0;
      }

      historico[dateAsString] += potencia;

      this.setState({
        historico
      });
    }
  }

  handleOptionChange(option) {
    if (option) {
      this.setState({
        selectedOption: option
      });
    }
  }

  render() {
    const { options, selectedOption, fetchingData } = this.state;
    const { title } = this.props;

    const dataSource = this.getDataSource();

    return (
      <React.Fragment>
        <TitleWithOptions
          options={options}
          title={title}
          defaultOption={selectedOption}
          onOptionChange={this.handleOptionChange}
        />
        {fetchingData ? (
          <CircularProgress size={50} />
        ) : (
          <FusionCharts
            type="column2d"
            width="100%"
            height="50%"
            dataFormat="json"
            dataEmptyMessage="Não existem dados para mostrar no momento!"
            dataSource={dataSource}
          />
        )}
      </React.Fragment>
    );
  }
}

export default Column2DMensal;
