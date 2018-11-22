import React from 'react';

import FusionChartsCore from 'fusioncharts';
import Charts from 'fusioncharts/fusioncharts.charts';
import ReactFusionCharts from 'react-fusioncharts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.candy';

import PropTypes from 'prop-types';

ReactFusionCharts.fcRoot(FusionChartsCore, Charts, FusionTheme);

function FusionCharts(props) {
  return <ReactFusionCharts {...props} />;
}

FusionCharts.propTypes = {
  width: PropTypes.string.isRequired,
  height: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  dataFormat: PropTypes.string.isRequired,
  dataEmptyMessage: PropTypes.string,
  dataSource: PropTypes.object.isRequired
};

export default FusionCharts;
