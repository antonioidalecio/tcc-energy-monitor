import React from 'react';

import { Grid, Card, CardContent, withStyles } from '@material-ui/core';

import Column2DDiario from './Column2DDiario';
import Overview from './Overview';
import Line from './Line';

const styles = {
  card: {
    height: '100%'
  }
};

function DashBoard(props) {
  const { classes } = props;

  return (
    <Grid container spacing={16}>
      <Grid item xs={12}>
        <Overview />
      </Grid>
      <Grid item xs={12}>
        <Card className={classes.card}>
          <CardContent>
            <Line title="Consumo em Tempo Real" />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card className={classes.card}>
          <CardContent>
            <Column2DDiario title="Consumo de Hoje" />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default withStyles(styles)(DashBoard);
