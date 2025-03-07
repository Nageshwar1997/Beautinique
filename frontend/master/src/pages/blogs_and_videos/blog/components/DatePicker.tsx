import { FC, useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CalendarIcon } from "../../../../components/sidebar/icons";
import { InfoIcon } from "../../../../icons";

interface DatePickerProps {
  label: string;
  placeholder?: string;
  errorText: string;
  selectedDate?: Date | null;
  onDateChange: (date: Date | null) => void;
}

const DatePicker: FC<DatePickerProps> = ({
  label,
  placeholder,
  errorText,
  selectedDate,
  onDateChange,
}) => {
  const [dateValue, setDateValue] = useState<Date | null>(selectedDate ?? null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    setDateValue(selectedDate ?? null);
  }, [selectedDate]);

  const toggleCalendar = () => {
    setIsOpen(!isOpen);
  };

  const handleDateChange = (date: Date) => {
    setDateValue(date);
    setIsOpen(false);
    onDateChange?.(date);
  };

  return (
    <div className={`relative flex flex-col gap-2`}>
      {label && (
        <span className={`text-xs leading-3 text-primary cursor-pointer `}>
          {label}
        </span>
      )}
      <div className="relative">
        <div
          onClick={toggleCalendar}
          className={`border border-secondary ${
            !dateValue && "text-secondary"
          } hover:bg-gray-100 px-3 py-2 rounded-md focus:outline-none w-full cursor-pointer flex items-center gap-2 text-xs leading-3`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>
            {dateValue
              ? dateValue.toDateString()
              : placeholder ?? "Pick a date"}
          </span>
        </div>
        {isOpen && (
          <div className="absolute z-10 mt-1 rounded-lg shadow-lg">
            <Calendar
              onChange={(date) => {
                if (date instanceof Date) handleDateChange(date);
              }}
              value={dateValue || new Date()}
              className="!border-none !outline-none rounded-lg p-2 !bg-white"
              tileClassName={({ date, view }: { date: Date; view: string }) =>
                view === "month" && date.getDay() === 0 ? "!text-red-500" : null
              }
            />
          </div>
        )}
      </div>
      {errorText && (
        <span className="flex gap-1 items-center text-red-600 text-xs font-normal">
          <InfoIcon className="min-w-4 h-4 fill-red-600" />
          {errorText}
        </span>
      )}
    </div>
  );
};

export default DatePicker;
