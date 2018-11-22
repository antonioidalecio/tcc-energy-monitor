import React, { Component } from 'react';

import {
  TextField,
  IconButton,
  Avatar,
  Grid,
  Card,
  CardContent,
  Popover,
  withStyles
} from '@material-ui/core';

import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  CalendarToday as CalendarIcon
} from '@material-ui/icons';

import PropTypes from 'prop-types';

import moment from 'moment';

import classNames from 'classnames';

const monthsShortNames = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez'
];

const styles = theme => ({
  avatarMonths: {
    border: `1px solid ${theme.palette.primary.main}`,
    background: theme.palette.common.white,
    color: theme.palette.primary.main,
    width: theme.spacing.unit * 7,
    height: theme.spacing.unit * 7
  },
  selected: {
    border: 0,
    background: theme.palette.primary.main,
    color: theme.palette.common.white,
    width: theme.spacing.unit * 7,
    height: theme.spacing.unit * 7
  },
  gridItemMonth: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  inputDate: {
    fontSize: 20,
    boxSizing: 'border-box'
  },
  textCenter: {
    textAlign: 'center'
  },
  monthIconButton: {
    color: theme.palette.primary.main,
    padding: theme.spacing.unit * 0.5
  },
  card: {
    maxWidth: 300
  },
  gridContainer: {
    minWidth: 220
  },
  inputYear: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 30,
    fontWeight: 'bold'
  },
  cursorPointer: {
    cursor: 'pointer'
  },
  incrementDecrementButtons: {
    width: 60,
    height: 60
  }
});

class MonthYearPicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      anchorEl: null
    };

    this.handleClose = this.handleClose.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.notifyDateChange = this.notifyDateChange.bind(this);
    this.handleYearChange = this.handleYearChange.bind(this);
    this.handleMonthChange = this.handleMonthChange.bind(this);
  }

  handleClose() {
    this.setState({
      anchorEl: null
    });
  }

  handleClick(event) {
    this.setState({
      anchorEl: event.currentTarget
    });
  }

  handleYearChange(operation) {
    return () => {
      switch (operation) {
        case 'increment':
          this.date.year++;
          break;
        case 'decrement':
          this.date.year--;
          break;
        default:
          break;
      }

      this.notifyDateChange();
    };
  }

  notifyDateChange() {
    const { onDateChange } = this.props;
    onDateChange && onDateChange(this.date);
  }

  handleMonthChange(month) {
    return () => {
      this.date.month = month;
      this.notifyDateChange();
    };
  }

  render() {
    const { classes, placeholder, month, year } = this.props;

    const { anchorEl } = this.state;

    const open = Boolean(anchorEl);

    let value = '';

    if (month !== null && year !== null) {
      value = monthsShortNames[month] + ' de ' + year;
    }

    this.date = {
      year: year || moment().year(),
      month
    };

    return (
      <div>
        <TextField
          disabled
          variant="outlined"
          placeholder={placeholder}
          value={value}
          className={classes.inputDate}
          onClick={this.handleClick}
          InputProps={{
            endAdornment: <CalendarIcon />,
            inputProps: {
              className: classNames(classes.textCenter, classes.cursorPointer)
            }
          }}
        />
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center'
          }}
        >
          <Card className={classes.card}>
            <CardContent>
              <Grid
                container
                justify="center"
                className={classes.gridContainer}
              >
                <Grid item xs={12} className={classes.gridItemMonth}>
                  <IconButton
                    onClick={this.handleYearChange('decrement')}
                    className={classes.incrementDecrementButtons}
                  >
                    <KeyboardArrowLeft />
                  </IconButton>
                  <TextField
                    disabled
                    InputProps={{
                      disableUnderline: true,
                      className: classes.inputYear,
                      inputProps: {
                        className: classes.textCenter
                      }
                    }}
                    value={this.date.year}
                  />
                  <IconButton
                    onClick={this.handleYearChange('increment')}
                    className={classes.incrementDecrementButtons}
                  >
                    <KeyboardArrowRight />
                  </IconButton>
                </Grid>
                {monthsShortNames.map((monthName, index) => {
                  return (
                    <Grid
                      item
                      key={index}
                      xs={4}
                      className={classes.gridItemMonth}
                    >
                      <IconButton
                        onClick={this.handleMonthChange(index)}
                        className={classes.monthIconButton}
                      >
                        <Avatar
                          className={
                            this.date.month === index
                              ? classes.selected
                              : classes.avatarMonths
                          }
                        >
                          {monthName}
                        </Avatar>
                      </IconButton>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Popover>
      </div>
    );
  }
}

MonthYearPicker.defaultProps = {
  placeholder: 'Escolha uma data',
  month: null,
  year: null
};

MonthYearPicker.propTypes = {
  year: PropTypes.number,
  month: PropTypes.number,
  onDateChange: PropTypes.func
};

export default withStyles(styles)(MonthYearPicker);
