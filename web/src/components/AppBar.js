import React from 'react';

import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  withStyles,
  Icon
} from '@material-ui/core';

import { TOOLBAR_SIZE } from '../dimensions';

import Logo from '../images/energy-monitor-logo.svg';

const styles = theme => ({
  toolbar: {
    minHeight: TOOLBAR_SIZE,
    maxHeight: TOOLBAR_SIZE
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 10
  },
  logo: {
    margin: '0 10px',
    fontSize: 40
  },
  title: {
    fontSize: 25,
    fontWeight: 100
  }
});

function AppBar(props) {
  const { classes, menuButton, title } = props;

  return (
    <MuiAppBar position="fixed" className={classes.appBar}>
      <Toolbar variant="dense" className={classes.toolbar}>
        <span>{menuButton}</span>
        <Icon className={classes.logo}>
          <img height="100%" alt="Logo" src={Logo} />
        </Icon>
        <Typography
          variant="h1"
          className={classes.title}
          component="h1"
          color="inherit"
        >
          {title}
        </Typography>
      </Toolbar>
    </MuiAppBar>
  );
}

AppBar.defaultProps = {
  menuButton: null,
  title: ''
};

export default withStyles(styles)(AppBar);
