import React from 'react';

import MuiTextField from '@material-ui/core/TextField';
import ErrorHelperText from './ErrorHelperText';

import PropTypes from 'prop-types';

function TextField(props) {

  const { error, errorMessage, ...rest } = props;

  return (
    <React.Fragment>
      <MuiTextField error={Boolean(error)} {...rest} />
      <ErrorHelperText
        error={Boolean(error)}
        errorMessage={errorMessage} />
    </React.Fragment>
  )
}

TextField.propTypes = {
  errorMessage: PropTypes.string,
  error: PropTypes.any
}

export default TextField;