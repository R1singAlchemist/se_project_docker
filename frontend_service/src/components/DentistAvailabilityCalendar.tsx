import { useState, useEffect } from "react";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import getDentistNotAvailable from "@/libs/getDentistNotAvailable";
import getDentist from "@/libs/getDentist";

interface TimeSlot {
  start: string;
  end: string;
}

interface AvailabilityDate {
  date: string;
  slots: TimeSlot[];
}

interface DentistAvailabilityCalendarProps {
  dentistId: string;
  selectedDate: Dayjs | null;
  onDateChange: (date: Dayjs) => void;
  onTimeSlotSelect: (timeSlot: TimeSlot) => void;
}

export default function DentistAvailabilityCalendar({
  dentistId,
  selectedDate,
  onDateChange,
  onTimeSlotSelect,
}: DentistAvailabilityCalendarProps) {
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [availabilityDates, setAvailabilityDates] = useState<AvailabilityDate[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const [bookedTimeSlots, setBookedTimeSlots] = useState<{[date: string]: string[]}>({});

  useEffect(() => {
    if (!dentistId) return;
    
    setLoading(true);
    
    const fetchBookedAppointments = async () => {
      try {
        const response = await getDentistNotAvailable(dentistId);
        if (response.success && Array.isArray(response.data)) {
          const fullyBookedDates: string[] = [];
          
          const timeSlotsByDate: {[date: string]: string[]} = {};
          
          response.data.forEach((item: any) => {
            const date = dayjs(item.bookingDate);
            const formattedDate = date.format("YYYY-MM-DD");
            const formattedTime = date.format("HH:mm");
            
            if (!timeSlotsByDate[formattedDate]) {
              timeSlotsByDate[formattedDate] = [];
            }
            
            timeSlotsByDate[formattedDate].push(formattedTime);
          });
          
          setBookedTimeSlots(timeSlotsByDate);
          setBookedDates(fullyBookedDates);
        }
      } catch (error) {
        console.error("Failed to fetch booked appointments:", error);
      }
    };

    const fetchDentistAvailability = async () => {
      try {
        const response = await getDentist(dentistId);
        if (response.success && response.data.availability) {
          setAvailabilityDates(response.data.availability);
        }
      } catch (error) {
        console.error("Failed to fetch dentist availability:", error);
      }
    };

    Promise.all([fetchBookedAppointments(), fetchDentistAvailability()])
      .finally(() => setLoading(false));
  }, [dentistId]);

  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimeSlots([]);
      return;
    }

    const formattedDate = selectedDate.format("YYYY-MM-DD");
    
    const dateAvailability = availabilityDates.find(
      (avail) => dayjs(avail.date).format("YYYY-MM-DD") === formattedDate
    );

    let slots: TimeSlot[];
    if (dateAvailability) {
      slots = dateAvailability.slots;
    } else {
      slots = [
        { start: "09:00", end: "10:00" },
        { start: "10:00", end: "11:00" },
        { start: "11:00", end: "12:00" },
        { start: "13:00", end: "14:00" },
        { start: "14:00", end: "15:00" },
        { start: "15:00", end: "16:00" },
        { start: "16:00", end: "17:00" },
      ];
    }
    
    const bookedTimes = bookedTimeSlots[formattedDate] || [];
    const availableSlots = slots.filter(slot => {
      return !bookedTimes.some(bookedTime => {
        const bookedHour = bookedTime.split(':')[0];
        const slotStartHour = slot.start.split(':')[0];
        return bookedHour === slotStartHour;
      });
    });
    
    setAvailableTimeSlots(availableSlots);
    
    setSelectedTimeSlot(null);
  }, [selectedDate, availabilityDates, bookedTimeSlots]);

  const shouldDisableDate = (date: Dayjs) => {
    const formattedDate = date.format("YYYY-MM-DD");
    
    if (date.isBefore(dayjs(), 'day')) {
      return true;
    }
    
    if (bookedDates.includes(formattedDate)) {
      return true;
    }
    
    const day = date.day();
    if (day === 0 || day === 6) {
      return true;
    }
    
    return false;
  };
  
  const hasAvailableSlots = (date: Dayjs) => {
    const formattedDate = date.format("YYYY-MM-DD");
    
    let allSlots: TimeSlot[];
    const dateAvailability = availabilityDates.find(
      (avail) => dayjs(avail.date).format("YYYY-MM-DD") === formattedDate
    );
    
    if (dateAvailability) {
      allSlots = dateAvailability.slots;
    } else {
      allSlots = [
        { start: "09:00", end: "10:00" },
        { start: "10:00", end: "11:00" },
        { start: "11:00", end: "12:00" },
        { start: "13:00", end: "14:00" },
        { start: "14:00", end: "15:00" },
        { start: "15:00", end: "16:00" },
        { start: "16:00", end: "17:00" },
      ];
    }
    
    const bookedTimes = bookedTimeSlots[formattedDate] || [];
    
    const availableSlots = allSlots.filter(slot => {
      return !bookedTimes.some(bookedTime => {
        const bookedHour = bookedTime.split(':')[0];
        const slotStartHour = slot.start.split(':')[0];
        return bookedHour === slotStartHour;
      });
    });
    
    return availableSlots.length > 0;
  };

  const handleTimeSlotClick = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    onTimeSlotSelect(timeSlot);
  };

  useEffect(() => {
    if (!loading && Object.keys(bookedTimeSlots).length > 0) {
      const fullyBookedDates: string[] = [];
      
      for (let i = 0; i < 30; i++) {
        const date = dayjs().add(i, 'day');
        const formattedDate = date.format("YYYY-MM-DD");
        
        if (date.day() === 0 || date.day() === 6) continue;
        
        if (!hasAvailableSlots(date)) {
          fullyBookedDates.push(formattedDate);
        }
      }
      
      setBookedDates(fullyBookedDates);
    }
  }, [bookedTimeSlots, loading, availabilityDates]);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4AA3BA]"></div>
        </div>
      ) : (
        <>
          <div className="p-4 bg-[#4AA3BA] text-white">
            <h3 className="text-lg font-semibold">Select Appointment Date</h3>
          </div>
          
          <div className="p-4">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={selectedDate}
                onChange={(newDate) => {
                  if (newDate) {
                    onDateChange(newDate);
                  }
                }}
                shouldDisableDate={shouldDisableDate}
                sx={{
                  '& .MuiPickersDay-root.Mui-selected': {
                    backgroundColor: '#4AA3BA',
                  },
                  '& .MuiPickersDay-root:hover': {
                    backgroundColor: '#e6f7fa',
                  },
                }}
              />
            </LocalizationProvider>
          </div>
          
          {selectedDate && (
            <div className="p-4 border-t border-gray-200">
              <h4 className="text-md font-semibold mb-3">Available Time Slots</h4>
              
              {availableTimeSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableTimeSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => handleTimeSlotClick(slot)}
                      className={`py-2 px-3 text-sm font-medium rounded-md transition-colors duration-200 ${
                        selectedTimeSlot === slot
                          ? 'bg-[#4AA3BA] text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {slot.start} - {slot.end}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">No available time slots for this date</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}