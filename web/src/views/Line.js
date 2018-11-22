import React, { Component } from 'react';

import { firebaseDataBase } from '../firebase';

import TitleWithOptions from '../components/TitleWithOptions';
import CircularProgress from '../components/CircularProgress';

import moment from 'moment';

import FusionCharts from '../components/FusionCharts';

const limit = 10;

class Line extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userOptions: {},
      historico: [],
      selectedOption: 'R$',
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
      fetchingData: true
    };

    this.getDataSource = this.getDataSource.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.listenForHistoricoUpdates = this.listenForHistoricoUpdates.bind(this);
    this.listenForUserOptionsUpdate = this.listenForUserOptionsUpdate.bind(
      this
    );
    this.handleHistoricoUpdate = this.handleHistoricoUpdate.bind(this);
    this.handleUserOptionsChange = this.handleUserOptionsChange.bind(this);

    this.acumuladosRef = firebaseDataBase.ref('acumulados');
    this.historicoRef = firebaseDataBase.ref('historico');
    this.userOptionsRef = firebaseDataBase.ref('userOptions');
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
      this.handleUserOptionsChange(dataSnapshot.val());
    });
  }

  fetchConsumoAtual() {
    const mesAtual = moment().format('YYYY/MM');

    this.acumuladosRef.child(mesAtual).once('value', dataSnapshot => {
      const { acumulado, updatedBy } = dataSnapshot.val();

      const dados = {
        potencia: acumulado,
        timestamp: updatedBy
      };

      this.setState(previousState => {
        return {
          historico: [...previousState.historico, dados],
          fetchingData: false
        };
      });

      this.listenForHistoricoUpdates(updatedBy);
    });
  }

  listenForHistoricoUpdates(startAt) {
    this.historicoRef
      .orderByChild('timestamp')
      .startAt(startAt)
      .on('child_added', dataSnapshot => {
        const { timestamp } = dataSnapshot.val();

        if (timestamp === startAt) {
          return;
        } else {
          this.handleHistoricoUpdate(dataSnapshot.val());
        }
      });
  }

  getDataSource() {
    const { historico, userOptions, selectedOption } = this.state;

    const { metaMensal, unidade, tarifa } = userOptions || {};

    const dataSource = {
      chart: {
        caption: ' ',
        xAxisName: 'Data e Hora',
        yAxisValueDecimals: '2',
        palettecolors: '29c3be',
        lineThickness: '2',
        theme: 'candy',
        labelDisplay: 'rotate',
        formatNumberScale: '0',
        plotToolText: 'Consumo: $dataValue <br> Data: $label'
      },
      data: []
    };

    const { chart } = dataSource;

    switch (selectedOption) {
      case 'R$':
        chart.numberPrefix = selectedOption;
        chart.yAxisName = 'Reais';
        break;
      case 'kWh':
        chart.numberSuffix = selectedOption;
        chart.yAxisName = 'Potência Acumulada';
        break;
      default:
        break;
    }

    if (metaMensal) {
      let startValue = 0;

      switch (unidade) {
        case 'kWh':
          if (selectedOption === 'kWh') {
            startValue = metaMensal;
          } else if (selectedOption === 'R$') {
            startValue = metaMensal * tarifa;
          }
          break;

        case 'R$':
          if (selectedOption === 'R$') {
            startValue = metaMensal;
          } else if (selectedOption === 'kWh') {
            startValue = metaMensal / tarifa;
          }
          break;

        default:
          break;
      }

      let formatedText = '';

      switch (selectedOption) {
        case 'R$':
          formatedText = selectedOption + startValue.toFixed(2);
          break;
        case 'kWh':
          formatedText = startValue.toFixed(2) + selectedOption;
          break;
        default:
          break;
      }

      dataSource.trendlines = [
        {
          line: [
            {
              startvalue: startValue,
              color: '#1aaf5d',
              displayvalue: 'Meta Mensal: ' + formatedText,
              valueOnRight: '1',
              thickness: '2',
              dashed: '1'
            }
          ]
        }
      ];
    }

    const { data } = dataSource;

    for (let dataPoint of historico) {
      const { potencia, timestamp } = dataPoint;

      const label = moment(timestamp).format('DD/MM/YYYY HH:mm:ss');
      let value = 0.0;

      switch (selectedOption) {
        case 'kWh':
          value = potencia;
          break;

        case 'R$':
        default:
          if (tarifa) {
            value = potencia * tarifa;
          }
          break;
      }

      data.push({
        label,
        value
      });
    }

    return dataSource;
  }

  handleUserOptionsChange(userOptions) {
    if (userOptions) {
      this.setState({
        userOptions
      });
    }
  }

  handleHistoricoUpdate(dados) {
    if (dados) {
      this.setState(previousState => {
        const historico = [...previousState.historico];

        const dataPointAnterior = historico[historico.length - 1] || {
          potencia: 0.0
        };

        dados.potencia = dados.potencia + dataPointAnterior.potencia;

        historico.push(dados);

        // Caso tenha chegado no limite de dados na tela,
        // remove o primeiro valor do array de forma a manter
        // sempre `limit` valores nele
        if (historico.length > limit) {
          historico.splice(0, 1);
        }

        return {
          historico
        };
      });
    }
  }

  handleOptionChange(selectedOption) {
    this.setState({
      selectedOption
    });
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
          onOptionChange={this.handleOptionChange}
          title={title}
        />
        {fetchingData ? (
          <CircularProgress size={50} />
        ) : (
          <FusionCharts
            type="line"
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

export default Line;
