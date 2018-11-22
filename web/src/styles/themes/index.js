import { createMuiTheme } from '@material-ui/core';

import { PRIMARY_COLOR } from '../colors';

const DefaultTheme = createMuiTheme({
  palette: {
    primary: {
      main: PRIMARY_COLOR
    }
  }
});

export { DefaultTheme };
