import React, { Component } from 'react';

import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  withStyles
} from '@material-ui/core';

const styles = theme => ({
  listItem: {
    backgroundColor: theme.palette.primary.main,
    '& $listText, & $listIcon': {
      color: theme.palette.common.white
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.main
    }
  },
  listText: {},
  listIcon: {}
});

class NavItems extends Component {
  handleOptionClick(option, index) {
    const { onOptionSelected } = this.props;

    return () => {
      onOptionSelected && onOptionSelected(index);
    };
  }

  render() {
    const { classes, options, selectedItem } = this.props;

    return (
      <div>
        <List>
          {options.map((option, index) => (
            <ListItem
              button
              className={index === selectedItem ? classes.listItem : ''}
              key={index}
              onClick={this.handleOptionClick(option, index)}
            >
              <ListItemIcon className={classes.listIcon}>
                <option.icon />
              </ListItemIcon>
              <ListItemText
                classes={{
                  primary: classes.listText
                }}
              >
                {option.title}
              </ListItemText>
            </ListItem>
          ))}
        </List>
      </div>
    );
  }
}

export default withStyles(styles)(NavItems);
