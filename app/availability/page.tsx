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

const formatTimeForDisplay = (time24: string) => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const isTimeInRange = (time: string, start: string, end: string) => {
  return time >= start && time <= end;
};

const hasOverlap = (newSlot: TimeSlot, existingSlots: TimeSlot[]) => {
  return existingSlots.some(slot => 
    (isTimeInRange(newSlot.start, slot.start, slot.end) || 
     isTimeInRange(newSlot.end, slot.start, slot.end) ||
     (newSlot.start <= slot.start && newSlot.end >= slot.end))
  );
};

// Helper to add 30 minutes to a time string
function addThirtyMinutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  let minutes = h * 60 + m + 30;
  if (minutes >= 24 * 60) minutes = 24 * 60 - 1; // Clamp to 23:59
  const newH = Math.floor(minutes / 60).toString().padStart(2, '0');
  const newM = (minutes % 60).toString().padStart(2, '0');
  return `${newH}:${newM}`;
}

// Helper to convert time string to minutes since midnight
function timeToMinutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

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
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isSettingWakeUp, setIsSettingWakeUp] = useState(false);

  const generateTimeOptions = (minTime?: string, day?: string, currentSlotIndex?: number, isStart?: boolean) => {
    const options = [];
    const existingSlots = day ? weeklyAvailability[day].filter((_, index) => index !== currentSlotIndex) : [];
    // Get the wake-up time (end time of the first slot) if it exists
    const wakeUpTime = day && weeklyAvailability[day].length > 0 ? weeklyAvailability[day][0].end : null;

    // For start time, enforce 30 min after previous slot's end
    let slotMinTime = minTime;
    if (isStart && day && typeof currentSlotIndex === 'number' && currentSlotIndex > 0) {
      const prevEnd = weeklyAvailability[day][currentSlotIndex - 1]?.end;
      if (prevEnd) {
        slotMinTime = addThirtyMinutes(prevEnd);
      }
    } else if (isStart && day && currentSlotIndex === 1 && wakeUpTime) {
      // For the second slot, min start is 30 min after wake up
      slotMinTime = addThirtyMinutes(wakeUpTime);
    }

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        // Skip times before or equal to wake-up time for subsequent slots
        if (wakeUpTime && time <= wakeUpTime && currentSlotIndex !== 0) {
          continue;
        }
        // Enforce 30 min after previous slot's end for start time
        if (slotMinTime && time < slotMinTime) {
          continue;
        }
        if (!minTime || time > minTime) {
          if (minTime) {
            const wouldOverlap = existingSlots.some(slot => 
              isTimeInRange(time, slot.start, slot.end)
            );
            if (!wouldOverlap) {
              options.push(time);
            }
          } else {
            options.push(time);
          }
        }
      }
    }
    return options;
  };

  const addWeeklyTimeSlot = (day: string) => {
    // If first slot, prompt for wake up
    if (weeklyAvailability[day].length === 0) {
      setIsSettingWakeUp(true);
      return;
    }
    // Get previous slot's end
    const prevEnd = weeklyAvailability[day][weeklyAvailability[day].length - 1]?.end || '00:00';
    const start = addThirtyMinutes(prevEnd);
    const end = addThirtyMinutes(start);
    setWeeklyAvailability(prev => ({
      ...prev,
      [day]: [...prev[day], { start, end }]
    }));
  };

  const handleWakeUpTime = (day: string, wakeUpTime: string) => {
    const newSlot = { start: '00:00', end: wakeUpTime };
    
    setWeeklyAvailability(prev => ({
      ...prev,
      [day]: [...prev[day], newSlot]
    }));
    
    setIsSettingWakeUp(false);
  };

  const removeWeeklyTimeSlot = (day: string, index: number) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  };

  const updateWeeklyTimeSlot = (day: string, index: number, field: 'start' | 'end', value: string) => {
    const currentSlot = weeklyAvailability[day][index];
    const updatedSlot = {
      ...currentSlot,
      [field]: value
    };

    if (field === 'end') {
      const otherSlots = weeklyAvailability[day].filter((_, i) => i !== index);
      if (hasOverlap(updatedSlot, otherSlots)) {
        alert('This time slot would overlap with existing slots. Please choose a different time.');
        return;
      }
    }

    setWeeklyAvailability(prev => ({
      ...prev,
      [day]: prev[day].map((slot, i) => 
        i === index ? updatedSlot : slot
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
    <div 
      className="bg-[#D8FFDD] rounded-lg shadow-lg p-4 cursor-pointer hover:opacity-90 transition-opacity"
      onClick={() => setSelectedDay(day)}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[#464E47]">{day}</h2>
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
        {/* Transparent colored blocks for time slots */}
        <div className="absolute left-16 right-0 pl-2 h-full pointer-events-none">
          {weeklyAvailability[day].map((slot, index) => {
            const startMin = timeToMinutes(slot.start);
            const endMin = timeToMinutes(slot.end);
            const top = (startMin / 60) * 40;
            const height = ((endMin - startMin) / 60) * 40;
            return (
              <div
                key={index}
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  background: 'rgba(235, 72, 77, 0.35)', // red with opacity
                  borderRadius: '0.5rem',
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  zIndex: 1,
                }}
              />
            );
          })}
        </div>
        {/* Time slots text, positioned at the start of each block and centered */}
        <div className="absolute left-16 right-0 pl-2 pointer-events-none">
          {weeklyAvailability[day].map((slot, index) => {
            const startMin = timeToMinutes(slot.start);
            const top = (startMin / 60) * 40;
            return (
              <div
                key={index}
                className="flex items-center justify-center p-1 rounded shadow-sm"
                style={{
                  position: 'absolute',
                  top: `${top}px`,
                  left: 0,
                  right: 0,
                  zIndex: 2,
                  margin: '0 auto',
                  width: 'fit-content',
                  background: 'rgba(235, 72, 77, 0.85)', // red, more opaque
                  color: 'white',
                  borderRadius: '0.5rem',
                  border: '1px solid #EB484D',
                  fontSize: '0.85rem',
                }}
              >
                {formatTimeForDisplay(slot.start)} - {formatTimeForDisplay(slot.end)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const TimeSlotModal = () => {
    if (!selectedDay) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#464E47]">{selectedDay} Time Slots</h2>
            <button
              onClick={() => {
                setSelectedDay(null);
                setIsSettingWakeUp(false);
              }}
              className="text-[#464E47] hover:opacity-80"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            {weeklyAvailability[selectedDay].map((slot, index) => (
              <div key={index} className="flex items-center gap-2 bg-[#D8FFDD] p-3 rounded">
                <select
                  value={slot.start}
                  onChange={(e) => updateWeeklyTimeSlot(selectedDay, index, 'start', e.target.value)}
                  className="text-sm border border-[#464E47] rounded p-2"
                >
                  {generateTimeOptions(undefined, selectedDay, index, true).map(time => (
                    <option key={time} value={time}>{formatTimeForDisplay(time)}</option>
                  ))}
                </select>
                <span className="text-[#464E47]">to</span>
                <select
                  value={slot.end}
                  onChange={(e) => updateWeeklyTimeSlot(selectedDay, index, 'end', e.target.value)}
                  className="text-sm border border-[#464E47] rounded p-2"
                >
                  {generateTimeOptions(slot.start, selectedDay, index, false).map(time => (
                    <option key={time} value={time}>{formatTimeForDisplay(time)}</option>
                  ))}
                </select>
                <button
                  onClick={() => removeWeeklyTimeSlot(selectedDay, index)}
                  className="text-[#EB9486] hover:opacity-80 ml-2"
                >
                  Remove
                </button>
              </div>
            ))}
            
            {isSettingWakeUp ? (
              <div className="bg-[#D8FFDD] p-4 rounded">
                <h3 className="text-lg font-semibold text-[#464E47] mb-2">When do you wake up?</h3>
                <div className="flex items-center gap-2">
                  <select
                    onChange={(e) => handleWakeUpTime(selectedDay, e.target.value)}
                    className="text-sm border border-[#464E47] rounded p-2"
                    defaultValue=""
                  >
                    <option value="" disabled>Select wake-up time</option>
                    {generateTimeOptions().map(time => (
                      <option key={time} value={time}>{formatTimeForDisplay(time)}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <button
                onClick={() => addWeeklyTimeSlot(selectedDay)}
                className="w-full bg-[#EB9486] text-white py-2 rounded hover:opacity-90 transition-opacity"
              >
                Add Time Slot
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#464E47]">Block Out Your Schedule!</h1>
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

        <TimeSlotModal />
      </div>
    </div>
  );
} 