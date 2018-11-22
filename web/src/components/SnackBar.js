import React from 'react';

import PropTypes from 'prop-types';

import {
  IconButton,
  Snackbar as MuiSnackBar,
  SnackbarContent as MuiSnackbarContent,
  withStyles,
} from '@material-ui/core';

import {
  Close as CloseIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon
} from '@material-ui/icons';

import {
  green
} from '@material-ui/core/colors';

import classNames from 'classnames';

const styles = (theme) => ({
  snackBar: {
    display: 'flex',
    flexWrap: 'nowrap'
  },
  message: {
    display: 'flex',
  },
  messageContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    color: 'white',
  },
  icon: {
    margin: 20
  },
  error: {
    backgroundColor: theme.palette.error.dark
  },
  success: {
    backgroundColor: green[500]
  }
});

const variants = {
  error: ErrorIcon,
  success: CheckCircleIcon
}

let SnackBar = (props) => {

  const {
    open,
    classes,
    variant,
    onClose,
    message,
    anchorOrigin
  } = props;

  const Icon = variants[variant];

  return (
    <MuiSnackBar
      anchorOrigin={{
        vertical: anchorOrigin.vertical,
        horizontal: anchorOrigin.horizontal
      }}
      open={open}
      onClose={onClose}>
      <MuiSnackbarContent
        className={classNames(classes.snackBar, classes[variant])}
        message={
          <div className={classes.messageContainer}>
            <Icon className={classes.icon} />
            <span className={classes.message}>
              {message}
            </span>
          </div>
        }
        action={
          <IconButton color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        } />
    </MuiSnackBar>
  );
}

SnackBar.propTypes = {
  variant: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
}

SnackBar.defaultProps = {
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'center'
  }
}

SnackBar = withStyles(styles)(SnackBar);

export default SnackBar;