import React, { Component } from 'react';

import {
  IconButton,
  Drawer,
  MuiThemeProvider,
  withStyles
} from '@material-ui/core';

import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  Menu as MenuIcon
} from '@material-ui/icons';

import NavItems from './NavItems';

import AppBar from '../components/AppBar';

import Routes from '../routes/Routes';

import { TOOLBAR_SIZE, DRAWER_WIDTH } from '../dimensions';

import { DefaultTheme } from '../styles/themes';

const styles = theme => {
  return {
    root: {
      backgroundColor: theme.palette.background.default
    },
    drawer: {
      width: DRAWER_WIDTH,
      [theme.breakpoints.down('sm')]: {
        display: 'none'
      }
    },
    drawerPaper: {
      width: 'inherit',
      paddingTop: TOOLBAR_SIZE
    },
    appContent: {
      padding: 20
    },
    main: {
      boxSizing: 'border-box',
      width: '100%',
      paddingTop: TOOLBAR_SIZE,
      paddingLeft: DRAWER_WIDTH,
      [theme.breakpoints.down('sm')]: {
        paddingLeft: 0
      }
    },
    leftDrawerModal: {
      zIndex: theme.zIndex.appBar - 10,
      [theme.breakpoints.up('md')]: {
        display: 'none'
      }
    },
    leftDrawer: {
      width: DRAWER_WIDTH,
      paddingTop: TOOLBAR_SIZE
    },
    menuButton: {
      display: 'inherit',
      [theme.breakpoints.up('md')]: {
        display: 'none'
      }
    }
  };
};

const options = [
  {
    title: 'Dashboard',
    icon: DashboardIcon,
    path: '/dashboard'
  },
  {
    title: 'Histórico',
    icon: BarChartIcon,
    path: '/historico'
  },
  {
    title: 'Simulador de Consumo',
    icon: LineChartIcon,
    path: '/simulador-consumo'
  },
  {
    title: 'Configurações',
    icon: SettingsIcon,
    path: '/configuracoes'
  }
];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      selectedItem: null
    };

    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.handleCloseDrawer = this.handleCloseDrawer.bind(this);
    this.handleOptionSelected = this.handleOptionSelected.bind(this);
  }

  toggleDrawer() {
    this.setState({ open: !this.state.open });
  }

  handleCloseDrawer() {
    this.setState({ open: false });
  }

  handleOptionSelected(optionIndex) {
    const { history } = this.props;

    const option = options[optionIndex] || { path: '/' };

    this.setState(
      {
        selectedItem: optionIndex,
        open: false
      },
      () => {
        history.replace(option.path);
      }
    );
  }

  render() {
    const { classes } = this.props;
    const { open, selectedItem } = this.state;

    return (
      <MuiThemeProvider theme={DefaultTheme}>
        <div className={classes.root}>
          <AppBar
            menuButton={
              <IconButton
                color="inherit"
                onClick={this.toggleDrawer}
                className={classes.menuButton}
              >
                <MenuIcon />
              </IconButton>
            }
            title="TCC - Energy Monitor"
          />
          <Drawer
            variant="permanent"
            classes={{ paper: classes.drawerPaper }}
            className={classes.drawer}
          >
            <NavItems
              options={options}
              selectedItem={selectedItem}
              onOptionSelected={this.handleOptionSelected}
            />
          </Drawer>
          <Drawer
            keepMounted
            ModalProps={{
              className: classes.leftDrawerModal
            }}
            variant="temporary"
            anchor="left"
            open={open}
            onClose={this.handleCloseDrawer}
            classes={{
              paper: classes.leftDrawer
            }}
          >
            <NavItems
              options={options}
              selectedItem={selectedItem}
              onOptionSelected={this.handleOptionSelected}
            />
          </Drawer>
          <main className={classes.main}>
            <div className={classes.appContent}>
              <Routes />
            </div>
          </main>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(App);
