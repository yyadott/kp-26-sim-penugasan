import { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays
} from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarWidgetProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export const CalendarWidget = ({ selectedDate, onSelectDate }: CalendarWidgetProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-bold text-slate-800">
          {format(currentMonth, 'MMMM yyyy', { locale: id })}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = 'EEEEEE';
    const days = [];
    const startDate = startOfWeek(currentMonth, { weekStartsOn: 1 });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-xs font-semibold text-slate-400 py-1">
          {format(addDays(startDate, i), dateFormat, { locale: id })}
        </div>
      );
    }

    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = day;
        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            key={day.toISOString()}
            onClick={() => onSelectDate(cloneDay)}
            className={`flex justify-center items-center p-1 cursor-pointer`}
          >
            <span
              className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium transition-all
                ${!isCurrentMonth ? 'text-slate-300' : ''}
                ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : ''}
                ${!isSelected && isToday ? 'bg-blue-50 text-blue-700 font-bold' : ''}
                ${!isSelected && !isToday && isCurrentMonth ? 'text-slate-700 hover:bg-slate-100' : ''}
              `}
            >
              {formattedDate}
            </span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day.toISOString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm h-full flex flex-col">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};
