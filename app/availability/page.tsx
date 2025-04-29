'use client';

import { useState } from 'react';

interface TimeSlot {
  start: string;
  end: string;
}

interface WeeklyAvailability {
  [key: string]: TimeSlot[];
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const WEEKEND = ['Friday', 'Saturday', 'Sunday'];

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 || 12;
  const ampm = i < 12 ? 'AM' : 'PM';
  if (i === 12) return 'Noon';
  return `${hour} ${ampm}`;
});

export default function AvailabilityPage() {
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(time);
      }
    }
    return options;
  };

  const addWeeklyTimeSlot = (day: string) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [day]: [...prev[day], { start: '09:00', end: '17:00' }]
    }));
  };

  const removeWeeklyTimeSlot = (day: string, index: number) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  };

  const updateWeeklyTimeSlot = (day: string, index: number, field: 'start' | 'end', value: string) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [day]: prev[day].map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Weekly Availability:', weeklyAvailability);
    } catch (error) {
      console.error('Error saving availability:', error);
    }
  };

  const DayCalendar = ({ day }: { day: string }) => (
    <div className="bg-[#D8FFDD] rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[#464E47]">{day}</h2>
        <button
          onClick={() => addWeeklyTimeSlot(day)}
          className="bg-[#EB9486] text-white w-6 h-6 rounded-full text-sm hover:opacity-90 flex items-center justify-center"
        >
          +
        </button>
      </div>
      <div className="relative h-[300px] overflow-y-auto">
        {/* Time markers and lines */}
        <div className="absolute top-0 left-0 w-16 h-full">
          {HOURS.map((hour, i) => (
            <div key={i} className="absolute text-xs text-[#464E47] font-medium" style={{ top: `${i * 40}px` }}>
              {hour}
            </div>
          ))}
        </div>
        {/* Horizontal lines */}
        <div className="absolute left-16 right-0 h-full">
          {HOURS.map((_, i) => (
            <div
              key={i}
              className="absolute w-full border-t border-[#464E47] opacity-20"
              style={{ top: `${i * 40}px` }}
            />
          ))}
        </div>
        {/* Time slots */}
        <div className="absolute left-16 right-0 pl-2">
          {weeklyAvailability[day].map((slot, index) => (
            <div key={index} className="mb-2">
              <div className="flex items-center gap-1 bg-white p-1 rounded border border-[#464E47] shadow-sm">
                <select
                  value={slot.start}
                  onChange={(e) => updateWeeklyTimeSlot(day, index, 'start', e.target.value)}
                  className="text-xs border border-[#464E47] rounded p-1 w-20"
                >
                  {generateTimeOptions().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                <span className="text-xs text-[#464E47]">to</span>
                <select
                  value={slot.end}
                  onChange={(e) => updateWeeklyTimeSlot(day, index, 'end', e.target.value)}
                  className="text-xs border border-[#464E47] rounded p-1 w-20"
                >
                  {generateTimeOptions().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                <button
                  onClick={() => removeWeeklyTimeSlot(day, index)}
                  className="text-[#EB9486] hover:opacity-80 text-xs"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#464E47]">Set Your Unavailability</h1>
          <button
            onClick={handleSubmit}
            className="bg-[#464E47] text-white px-5 py-2 rounded-md hover:opacity-90 transition-opacity text-sm"
          >
            Save Availability
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          {WEEKDAYS.map(day => (
            <DayCalendar key={day} day={day} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {WEEKEND.map(day => (
            <DayCalendar key={day} day={day} />
          ))}
        </div>
      </div>
    </div>
  );
} 