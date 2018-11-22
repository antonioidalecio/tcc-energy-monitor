import React from 'react';

import { FormHelperText } from '@material-ui/core';

/**
 * Renderiza uma mensagem de erro caso `error` seja true, caso contrário
 * nada é renderizado
 */
const ErrorHelperText = ({ error, errorMessage, ...rest }) => {

	error = Boolean(error);

	return (
		error ?
			<FormHelperText error {...rest}>
				{errorMessage}
			</FormHelperText>
			:
			null
	);

}

export default ErrorHelperText;