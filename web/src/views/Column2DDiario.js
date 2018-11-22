import React, { Component } from 'react';
import moment from 'moment';

import { deepCopy, padWithZeros } from '../utils';

import { firebaseDataBase } from '../firebase';

import TitleWithOptions from '../components/TitleWithOptions';
import CircularProgress from '../components/CircularProgress';
import FusionCharts from '../components/FusionCharts';

class Column2DDiario extends Component {
  constructor(props) {
    super(props);

    this.state = {
      historico: {},
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

    this.handleHistoricoUpdate = this.handleHistoricoUpdate.bind(this);
    this.handleUserOptionsUpdate = this.handleUserOptionsUpdate.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.getDataSource = this.getDataSource.bind(this);

    this.historicoRef = firebaseDataBase.ref('historico');
    this.acumuladosRef = firebaseDataBase.ref('acumulados');
    this.userOptionsRef = firebaseDataBase.ref('userOptions');
  }

  listenForHistoricoUpdate(startAt) {
    this.historicoRef
      .orderByChild('timestamp')
      .startAt(startAt)
      .on('child_added', dataSnapshot => {
        const consumo = dataSnapshot.val();

        if (consumo.timestamp !== startAt)
          this.handleHistoricoUpdate(dataSnapshot.val());
      });
  }

  fetchConsumoInicial() {
    const hoje = moment().format('YYYY/MM/DD');

    this.acumuladosRef.child(hoje).once('value', dataSnapshot => {
      const acumuladosDoDia = dataSnapshot.val();

      if (acumuladosDoDia !== null) {
        const historico = {};

        const { updatedBy } = acumuladosDoDia;

        for (let i = 0; i < 24; i++) {
          const path = padWithZeros(i, 2);
          const hora = path + ':00';

          const consumo = dataSnapshot.child(path).val();

          if (consumo) {
            historico[hora] = consumo.acumulado;
          }
        }

        this.setState({
          historico,
          fetchingData: false
        });

        this.listenForHistoricoUpdate(updatedBy);
      }
    });
  }

  listenForUserOptionsUpdate() {
    this.userOptionsRef.on('value', dataSnapshot => {
      this.handleUserOptionsUpdate(dataSnapshot.val());
    });
  }

  componentDidMount() {
    this.fetchConsumoInicial();
    this.listenForUserOptionsUpdate();
  }

  componentWillUnmount() {
    this.historicoRef.off('child_added');
    this.userOptionsRef.off('value');
    this.acumuladosRef.off('value');
  }

  handleUserOptionsUpdate(userOptions) {
    this.setState({
      userOptions
    });
  }

  handleHistoricoUpdate(dados) {
    if (dados) {
      this.setState(previousState => {
        const { potencia, timestamp } = dados;

        const hourAsString = moment(timestamp).format('HH:00');

        const historico = deepCopy(this.state.historico);

        if (!historico[hourAsString]) {
          historico[hourAsString] = 0.0;
        }

        historico[hourAsString] += potencia;

        return {
          historico
        };
      });
    }
  }

  getDataSource() {
    const { selectedOption, userOptions } = this.state;

    const dataSource = {
      chart: {
        caption: ' ',
        xAxisName: 'Hora do Dia',
        lineThickness: '2',
        theme: 'candy',
        palettecolors: '29c3be',
        labelDisplay: 'rotate',
        slantLabel: '1',
        plotToolText: 'Consumo: $dataValue <br> Hora: $label'
      },
      data: []
    };

    const { chart } = dataSource;

    switch (selectedOption) {
      case 'kWh':
        chart.yAxisName = 'Potência';
        chart.numberSuffix = selectedOption;
        break;
      case 'R$':
      default:
        chart.yAxisName = 'Reais';
        chart.numberPrefix = selectedOption;
        break;
    }

    const entries = Object.entries(this.state.historico);

    const { data } = dataSource;

    for (let [hora, potencia] of entries) {
      let value = 0.0;

      switch (selectedOption) {
        case 'R$':
          const { tarifa } = userOptions || { tarifa: 0.0 };
          value = potencia * tarifa;
          break;

        case 'kWh':
        default:
          value = potencia;
          break;
      }

      data.push({
        label: hora,
        value: value
      });
    }

    return dataSource;
  }

  handleOptionChange(option) {
    if (option) {
      this.setState({
        selectedOption: option
      });
    }
  }

  render() {
    const dataSource = this.getDataSource();

    const { options, selectedOption, fetchingData } = this.state;
    const { title } = this.props;

    return (
      <React.Fragment>
        <TitleWithOptions
          options={options}
          defaultOption={selectedOption}
          title={title}
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

export default Column2DDiario;
