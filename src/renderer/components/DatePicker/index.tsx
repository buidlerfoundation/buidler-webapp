import React from 'react';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import './index.scss';

type DataPickerProps = {
  selectedDate: MaterialUiPickersDate;
  handleDateChange: (date: MaterialUiPickersDate) => void;
  activeKey: string;
  open: boolean;
  onClose: () => void;
};

const DatePicker = ({
  handleDateChange,
  selectedDate,
  activeKey,
  open,
  onClose,
}: DataPickerProps) => {
  return (
    <KeyboardDatePicker
      open={open}
      className="task__due-date-picker"
      disableToolbar
      variant="inline"
      format="MM/dd/yyyy"
      margin="normal"
      id="date-picker-inline"
      value={selectedDate}
      onChange={handleDateChange}
      KeyboardButtonProps={{
        'aria-label': activeKey,
      }}
      onClose={onClose}
    />
  );
};

export default DatePicker;
