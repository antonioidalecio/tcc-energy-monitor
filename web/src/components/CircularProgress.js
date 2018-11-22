import React from 'react'

import {
  CircularProgress as MuiCircularProgress,
  withStyles
} from '@material-ui/core';

const styles = {
  circularProgress: {
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100%'
  }
};

function CircularProgress(props) {

  const { classes, size } = props;

  return (
    <div className={classes.circularProgress}>
      <MuiCircularProgress size={size} />
    </div>
  );

}

CircularProgress.defaultProps = {
  size: 10
}

export default withStyles(styles)(CircularProgress);