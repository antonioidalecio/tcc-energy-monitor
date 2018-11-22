import React, { Component } from 'react';

import { Typography, withStyles } from '@material-ui/core';

import { ToggleButtonGroup, ToggleButton } from '@material-ui/lab';

import PropTypes from 'prop-types';

const styles = {
  toggleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0'
  },
  selected: {
    fontWeight: 'bold',
    color: 'black'
  },
  toggleGroup: {
    display: 'flex',
    overflow: 'unset'
  }
};

class TitleWithOptions extends Component {
  constructor(props) {
    super(props);

    const { defaultOption } = props;

    this.state = {
      selectedOption: defaultOption || null
    };

    this.handleOptionChange = this.handleOptionChange.bind(this);
  }

  handleOptionChange(event, selectedOption) {
    if (selectedOption) {
      const { onOptionChange } = this.props;

      this.setState({
        selectedOption
      });

      onOptionChange && onOptionChange(selectedOption);
    }
  }

  render() {
    const { classes, title, options } = this.props;
    const { selectedOption } = this.state;

    return (
      <div className={classes.toggleContainer}>
        <Typography variant="h5" component="h3">
          {title}
        </Typography>
        <ToggleButtonGroup
          exclusive
          className={classes.toggleGroup}
          value={selectedOption}
          onChange={this.handleOptionChange}
        >
          {options.map((option, key) => (
            <ToggleButton
              key={key}
              className={classes.toggleButton}
              classes={{
                selected: classes.selected
              }}
              value={option.value}
            >
              {option.description}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>
    );
  }
}

TitleWithOptions.propTypes = {
  title: PropTypes.string.isRequired
};

export default withStyles(styles)(TitleWithOptions);
