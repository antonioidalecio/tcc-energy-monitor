import React, { Component } from 'react';

import {
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  withStyles,
  Tooltip
} from '@material-ui/core';

import { Check as CheckIcon } from '@material-ui/icons';

import { isEmpty, isFinite } from 'lodash';

import UserOptions from '../models/UserOptions';

import TextField from '../components/TextField';
import SnackBar from '../components/SnackBar';

import { firebaseDataBase } from '../firebase';

const styles = {
  cardTitle: {
    marginTop: 20,
    textTransform: 'capitalize'
  },
  cardSubtitle: {
    marginBottom: 10
  },
  input: {
    margin: '10px 0'
  },
  unidadeSelect: {
    padding: '0 10px'
  },
  horizontalCenter: {
    display: 'flex',
    justifyContent: 'center'
  }
};

class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      camposInvalidos: {},
      selectOpen: false,
      formData: this.getDefaultFormData(),
      showErrorSnackBar: false,
      showSuccessSnackBar: false,
      fetchingData: true
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleOpenSelect = this.handleOpenSelect.bind(this);
    this.handleCloseSelect = this.handleCloseSelect.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.getDefaultFormData = this.getDefaultFormData.bind(this);
    this.handleUserOptionsChange = this.handleUserOptionsChange.bind(this);
    this.handleErrorSnackBarClose = this.handleErrorSnackBarClose.bind(this);
    this.handleSuccessSnackBarClose = this.handleSuccessSnackBarClose.bind(
      this
    );

    this.userOptionsRef = firebaseDataBase.ref('userOptions');
    this.tarifaBrancaRef = firebaseDataBase.ref('tarifaBranca');
  }

  componentDidMount() {
    this.userOptionsRef.on('value', dataSnapshot => {
      this.handleUserOptionsChange(dataSnapshot.val());
    });
    this.tarifaBrancaRef.on('value', dataSnapshot => {
      this.handleTarifaBrancaChange(dataSnapshot.val());
    });
  }

  componentWillUnmount() {
    this.userOptionsRef.off('value');
    this.tarifaBrancaRef.off('value');
  }

  handleTarifaBrancaChange(tarifaBranca) {
    if (tarifaBranca !== null) {
      this.setState({
        formData: {
          ...this.state.formData,
          ...tarifaBranca
        }
      });
    }
  }

  handleSuccessSnackBarClose() {
    this.setState({
      showSuccessSnackBar: false
    });
  }

  handleErrorSnackBarClose() {
    this.setState({
      showErrorSnackBar: false
    });
  }

  handleUserOptionsChange(userOptions) {
    if (userOptions) {
      this.setState({
        formData: {
          ...this.state.formData,
          ...userOptions
        },
        fetchingData: false
      });
    }
  }

  getDefaultFormData() {
    return {
      tarifa: '',
      metaMensal: '',
      unidade: 'kWh',
      tarifaForaPonta: '',
      tarifaPonta: '',
      tarifaIntermediaria: ''
    };
  }

  handleOpenSelect() {
    this.setState({ selectOpen: true });
  }

  handleCloseSelect() {
    this.setState({ selectOpen: false });
  }

  handleSubmit(event) {
    event.preventDefault();

    const {
      tarifa,
      metaMensal,
      unidade,
      tarifaPonta,
      tarifaIntermediaria,
      tarifaForaPonta
    } = this.state.formData;

    const camposInvalidos = {};

    const tarifaAsNumber = parseFloat(tarifa);
    const metaMensalAsNumber = isNaN(parseFloat(metaMensal))
      ? null
      : parseFloat(metaMensal);
    const tarifaPontaAsNumber = parseFloat(tarifaPonta);
    const tarifaForaPontaAsNumber = parseFloat(tarifaForaPonta);
    const tarifaIntermediariaAsNumber = parseFloat(tarifaIntermediaria);

    if (!isFinite(tarifaAsNumber) || tarifaAsNumber <= 0) {
      camposInvalidos['tarifa'] = 'O valor de tarifa informado é inválido!';
    }

    if (!isFinite(tarifaPontaAsNumber) || tarifaPontaAsNumber <= 0) {
      camposInvalidos['tarifaPonta'] =
        'O valor de tarifa informado é inválido!';
    }

    if (
      !isFinite(tarifaIntermediariaAsNumber) ||
      tarifaIntermediariaAsNumber <= 0
    ) {
      camposInvalidos['tarifaIntermediaria'] =
        'O valor de tarifa informado é inválido!';
    }

    if (!isFinite(tarifaForaPontaAsNumber) || tarifaForaPontaAsNumber <= 0) {
      camposInvalidos['tarifaForaPonta'] =
        'O valor de tarifa informado é inválido!';
    }

    if (metaMensal) {
      if (!isFinite(metaMensalAsNumber) || metaMensalAsNumber <= 0) {
        camposInvalidos['metaMensal'] =
          'O valor especificado para a meta mensal é inválido!';
      }
    }

    if (!isEmpty(camposInvalidos)) {
      this.setState({
        camposInvalidos
      });
    } else {
      const userOptions = new UserOptions(
        tarifaAsNumber,
        metaMensalAsNumber,
        unidade
      );

      this.userOptionsRef.set(userOptions, error => {
        if (error) {
          this.setState({
            showErrorSnackBar: true
          });
        } else {
          this.setState({
            showSuccessSnackBar: true
          });
        }
      });

      this.tarifaBrancaRef.set(
        {
          tarifaForaPonta: tarifaForaPontaAsNumber,
          tarifaIntermediaria: tarifaIntermediariaAsNumber,
          tarifaPonta: tarifaPontaAsNumber
        },
        error => {
          if (error) {
            this.setState({
              showErrorSnackBar: true
            });
          } else {
            this.setState({
              showSuccessSnackBar: true
            });
          }
        }
      );
    }
  }

  handleInputChange(event) {
    const { name, value } = event.target;

    this.setState({
      formData: {
        ...this.state.formData,
        [name]: value
      },
      camposInvalidos: {
        [name]: ''
      }
    });
  }

  render() {
    const { classes } = this.props;

    const {
      selectOpen,
      camposInvalidos,
      showSuccessSnackBar,
      showErrorSnackBar,
      fetchingData
    } = this.state;
    const {
      tarifa,
      metaMensal,
      unidade,
      tarifaPonta,
      tarifaForaPonta,
      tarifaIntermediaria
    } = this.state.formData;

    return (
      <Card>
        <CardContent>
          <Typography variant="h2" align="center">
            Configurações
          </Typography>
        </CardContent>
        <CardContent>
          <form onSubmit={this.handleSubmit}>
            <Typography variant="h4" className={classes.cardTitle}>
              Opções do Consumidor
            </Typography>
            <Typography variant="caption" className={classes.cardSubtitle}>
              Abaixo é possível alterar o valor da tarifa existente e definir
              uma meta mensal de consumo!
            </Typography>
            <TextField
              required
              fullWidth
              value={tarifa}
              disabled={fetchingData}
              className={classes.input}
              onChange={this.handleInputChange}
              error={camposInvalidos['tarifa']}
              errorMessage={camposInvalidos['tarifa']}
              label="Valor da Tarifa por kWh"
              name="tarifa"
            />
            <TextField
              fullWidth
              value={metaMensal || ''}
              disabled={fetchingData}
              className={classes.input}
              onChange={this.handleInputChange}
              error={camposInvalidos['metaMensal']}
              errorMessage={camposInvalidos['metaMensal']}
              label="Meta de Consumo Mensal"
              name="metaMensal"
              InputProps={{
                endAdornment: (
                  <Select
                    className={classes.unidadeSelect}
                    open={selectOpen}
                    onClose={this.handleCloseSelect}
                    onOpen={this.handleOpenSelect}
                    value={unidade}
                    disabled={fetchingData}
                    onChange={this.handleInputChange}
                    inputProps={{
                      name: 'unidade'
                    }}
                    disableUnderline
                  >
                    <MenuItem value={'kWh'}>kWh</MenuItem>
                    <MenuItem value={'R$'}>R$</MenuItem>
                  </Select>
                )
              }}
            />
            <Typography variant="h4" className={classes.cardTitle}>
              Tarifa Branca
            </Typography>
            <Typography variant="caption" className={classes.cardSubtitle}>
              Valores das tarifas dos Postos Tarifários da Tarifa Branca
            </Typography>
            <TextField
              required
              fullWidth
              value={tarifaForaPonta}
              disabled={fetchingData}
              className={classes.input}
              onChange={this.handleInputChange}
              error={camposInvalidos['tarifaForaPonta']}
              errorMessage={camposInvalidos['tarifaForaPonta']}
              label="Tarifa Fora Ponta"
              name="tarifaForaPonta"
            />
            <TextField
              required
              fullWidth
              value={tarifaIntermediaria}
              disabled={fetchingData}
              className={classes.input}
              onChange={this.handleInputChange}
              error={camposInvalidos['tarifaIntermediaria']}
              errorMessage={camposInvalidos['tarifaIntermediaria']}
              label="Tarifa Intermediária"
              name="tarifaIntermediaria"
            />
            <TextField
              required
              fullWidth
              value={tarifaPonta}
              disabled={fetchingData}
              className={classes.input}
              onChange={this.handleInputChange}
              error={camposInvalidos['tarifaPonta']}
              errorMessage={camposInvalidos['tarifaPonta']}
              label="Tarifa Ponta"
              name="tarifaPonta"
            />
            <Grid container justify="center">
              <Tooltip title="Salvar Configurações">
                <span>
                  <Button
                    variant="fab"
                    color="primary"
                    type="submit"
                    disabled={fetchingData}
                  >
                    <CheckIcon />
                  </Button>
                </span>
              </Tooltip>
            </Grid>
          </form>
          <SnackBar
            variant="success"
            message="Atualizações salvas com sucesso!"
            onClose={this.handleSuccessSnackBarClose}
            open={showSuccessSnackBar}
          />
          <SnackBar
            variant="error"
            message="Erro ao atualizar as informações! Por favor tente mais tarde!"
            onClose={this.handleSuccessSnackBarClose}
            open={showErrorSnackBar}
          />
        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles)(Settings);
