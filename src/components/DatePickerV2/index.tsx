import React from 'react';
import { Calendar, useStaticState } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import './index.scss';
import images from '../../common/images';

type DataPickerV2Props = {
  selectedDate: MaterialUiPickersDate;
  handleDateChange: (date: MaterialUiPickersDate) => void;
  onClear: () => void;
};

const DatePickerV2 = ({
  handleDateChange,
  selectedDate,
  onClear,
}: DataPickerV2Props) => {
  const { pickerProps } = useStaticState({
    value: selectedDate,
    onChange: handleDateChange,
  });
  return (
    <div className="date-picker-container">
      <Calendar
        {...pickerProps}
        leftArrowButtonProps={{ style: { padding: 8 } }}
        rightArrowButtonProps={{ style: { padding: 8 } }}
      />
      <div
        className="action-button normal-button"
        onClick={() => {
          handleDateChange(new Date());
        }}
      >
        <img
          src={images.icCalendarToday}
          alt=""
          style={{ backgroundColor: 'white', borderRadius: '50%' }}
        />
        <span style={{ marginLeft: 15 }}>Today</span>
      </div>
      <div
        className="action-button normal-button"
        onClick={() => {
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          handleDateChange(tomorrow);
        }}
      >
        <img
          src={images.icCalendarTomorrow}
          alt=""
          style={{ backgroundColor: 'white', borderRadius: '50%' }}
        />
        <span style={{ marginLeft: 15 }}>Tomorrow</span>
      </div>
      <div className="action-button normal-button" onClick={onClear}>
        <img src={images.icCalendarClear} alt="" />
        <span style={{ marginLeft: 15 }}>No due date</span>
      </div>
    </div>
  );
};

export default DatePickerV2;
