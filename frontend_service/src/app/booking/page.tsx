'use client';
import { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import createBooking from "@/libs/createBooking";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import getUserProfile from "@/libs/getUserProfile";
import { Select, MenuItem, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DateTimePicker } from "@mui/x-date-pickers";
import getDentistNotAvailable from "@/libs/getDentistNotAvailable";
import getDentist from "@/libs/getDentist";

interface TimeSlot {
  start: string;
  end: string;
  isBooked?: boolean;
}

export default function Reservations() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const didFromParams = searchParams.get("did");
  
  const [dentist, setDentist] = useState<string>(didFromParams || '');
  const [dentistName, setDentistName] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<{[date: string]: string[]}>({});
  const [currentMonth, setCurrentMonth] = useState<string>(dayjs().format("MMMM YYYY"));
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  
  const dentistNames: Record<string, string> = {
    "67fde0a05a0148bd6061706c": "Dr. John Carter",
    "67fde18e5a0148bd6061706f": "Dr. Emily Richardson",
    "67fde1ee5a0148bd60617072": "Dr. Michael Tanaka",
    "67fde2225a0148bd60617075": "Dr. Sophia Patel",
    "67fde24d5a0148bd60617078": "Dr. David Lee", 
    "67fde2885a0148bd6061707b": "Dr. Jessica Wong",
    "67fde2b75a0148bd6061707e": "Dr. Robert Sanchez",
    "67fde2de5a0148bd60617081": "Dr. Anna Müller",
    "67fde3085a0148bd60617084": "Dr. Benjamin Cooper"
  };
  
  useEffect(() => {
    if (didFromParams) {
      setDentist(didFromParams);
      
      if (didFromParams in dentistNames) {
        setDentistName(dentistNames[didFromParams]);
      } else {
        setDentistName("");
      }
      
      fetchDentistAvailability(didFromParams);
    }
  }, [didFromParams]);

const fetchDentistAvailability = async (dentistId: string) => {
  try {
    setLoading(true);
    
    const timestamp = new Date().getTime();
    
    const [regularResponse, blockedResponse] = await Promise.all([
      getDentistNotAvailable(dentistId + `?_t=${timestamp}`),
      
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/bookings?status=blocked&dentistId=${dentistId}&_t=${timestamp}`, {
        headers: {
          "Content-Type": "application/json",
          ...(session?.user?.token ? { "Authorization": `Bearer ${session.user.token}` } : {})
        }
      }).then(res => res.json()).catch(() => ({ success: false, data: [] }))
    ]);
    
    const timeSlotsByDate: {[date: string]: string[]} = {};
    
    if (regularResponse.success && Array.isArray(regularResponse.data)) {
      regularResponse.data.forEach((item: any) => {
        const date = dayjs(item.bookingDate);
        const formattedDate = date.format("YYYY-MM-DD");
        const formattedTime = date.format("HH:mm");
        
        if (!timeSlotsByDate[formattedDate]) {
          timeSlotsByDate[formattedDate] = [];
        }
        
        timeSlotsByDate[formattedDate].push(formattedTime);
      });
    }
    
    if (blockedResponse.success && Array.isArray(blockedResponse.data)) {
      blockedResponse.data.forEach((item: any) => {
        const date = dayjs(item.bookingDate);
        const formattedDate = date.format("YYYY-MM-DD");
        const formattedTime = date.format("HH:mm");
        
        if (!timeSlotsByDate[formattedDate]) {
          timeSlotsByDate[formattedDate] = [];
        }
        
        if (!timeSlotsByDate[formattedDate].includes(formattedTime)) {
          timeSlotsByDate[formattedDate].push(formattedTime);
        }
      });
    }
    
    console.log("Booked and blocked time slots:", timeSlotsByDate);
    setBookedTimeSlots(timeSlotsByDate);
  } catch (error) {
    console.error("Failed to fetch dentist availability:", error);
  } finally {
    setLoading(false);
  }
};
  
  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimeSlots([]);
      return;
    }

    const formattedDate = selectedDate.format("YYYY-MM-DD");
    
    const allTimeSlots = [
      { start: "09:00", end: "10:00" },
      { start: "10:00", end: "11:00" },
      { start: "11:00", end: "12:00" },
      { start: "13:00", end: "14:00" },
      { start: "14:00", end: "15:00" },
      { start: "15:00", end: "16:00" },
      { start: "16:00", end: "17:00" },
    ];
    
    const bookedTimes = bookedTimeSlots[formattedDate] || [];
    
    const slotsWithAvailability = allTimeSlots.map(slot => {
      const isBooked = bookedTimes.some(bookedTime => {
        const bookedHour = bookedTime.split(':')[0];
        const slotStartHour = slot.start.split(':')[0];
        return bookedHour === slotStartHour;
      });
      
      return {
        ...slot,
        isBooked
      };
    });
    
    setAvailableTimeSlots(slotsWithAvailability);
    setSelectedTimeSlot(null);
  }, [selectedDate, bookedTimeSlots]);
  
  const handleBooking = async () => {
    if (!dentist || !selectedDate || !selectedTimeSlot) {
      setError("Please select a dentist, date, and time slot for your appointment.");
      return;
    }
    
    if (!session?.user?.token) {
      setError("You must be logged in to make a booking.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const appointmentDate = selectedDate.hour(parseInt(selectedTimeSlot.start.split(':')[0]))
                                          .minute(parseInt(selectedTimeSlot.start.split(':')[1] || '0'))
                                          .second(0);
      
      const formattedDate = appointmentDate.toISOString();
      await createBooking(dentist, session.user.token, formattedDate);
      
      setSuccess("Booking successful!");
      setSelectedDate(null);
      setSelectedTimeSlot(null);
    } catch (err) {
      const userProfile = await getUserProfile(session.user.token);
      if(userProfile.data.role === "banned") {
        setError("Failed to create booking. You got banned");
      } else {
        setError("Failed to create booking. You already have a booking!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDentistChange = (value: string) => {
    setDentist(value);
    
    if (value in dentistNames) {
      setDentistName(dentistNames[value]);
    } else {
      setDentistName("");
    }
    
    fetchDentistAvailability(value);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
  };

  const shouldDisableDate = (date: Dayjs) => {
    if (date.isBefore(dayjs(), 'day')) {
      return true;
    }
    
    return false;
  };
  
  const handleTimeSlotClick = (timeSlot: TimeSlot) => {
    if (timeSlot.isBooked) return;
    setSelectedTimeSlot(timeSlot);
  };
  
  const handleMonthChange = (date: Dayjs) => {
    setCurrentMonth(date.format("MMMM YYYY"));
  };
  
  const getDayClass = (date: Dayjs) => {
    const formattedDate = date.format("YYYY-MM-DD");
    const bookedTimes = bookedTimeSlots[formattedDate] || [];
    
    if (bookedTimes.length >= 7) {
      return "opacity-50 cursor-not-allowed bg-gray-200";
    }
    
    if (bookedTimes.length > 0) {
      return "bg-blue-100";
    }
    
    return "";
  };

  return (
    <main className="w-full flex flex-col items-center bg-white min-h-screen">
      <div className="w-full bg-gray-100 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Booking</h1>
        <div className="mt-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-white">Home</Link> / <span>Booking</span>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">
            Schedule your <span className="text-[#4AA3BA]">Dental Booking</span>
          </h2>
          <p className="mt-2 text-gray-500 max-w-2xl mx-auto">
            Select your preferred dentist, date, and time for your appointment.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 md:w-1/2 border border-gray-100">
            <div className="mb-8">
              <label htmlFor="dentist" className="block text-sm font-medium text-gray-700 mb-2">Select Dentist</label>
              <Select
                fullWidth
                variant="outlined"
                name="dentist"
                id="dentist"
                value={dentist}
                onChange={(e) => handleDentistChange(e.target.value)}
                className="h-12"
                sx={{
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E5E7EB',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4AA3BA',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4AA3BA',
                  },
                }}
              >
                <MenuItem value="67fde0a05a0148bd6061706c">Dr. John Carter</MenuItem>
                <MenuItem value="67fde18e5a0148bd6061706f">Dr. Emily Richardson</MenuItem>
                <MenuItem value="67fde1ee5a0148bd60617072">Dr. Michael Tanaka</MenuItem>
                <MenuItem value="67fde2225a0148bd60617075">Dr. Sophia Patel</MenuItem>
                <MenuItem value="67fde24d5a0148bd60617078">Dr. David Lee</MenuItem>
                <MenuItem value="67fde2885a0148bd6061707b">Dr. Jessica Wong</MenuItem>
                <MenuItem value="67fde2b75a0148bd6061707e">Dr. Robert Sanchez</MenuItem>
                <MenuItem value="67fde2de5a0148bd60617081">Dr. Anna Müller</MenuItem>
                <MenuItem value="67fde3085a0148bd60617084">Dr. Benjamin Cooper</MenuItem>
              </Select>
            </div>
            
            <div className="mb-8">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">Appointment Date & Time</label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="MM/DD/YYYY"
                  value={selectedDate && selectedTimeSlot ? 
                    selectedDate.hour(parseInt(selectedTimeSlot.start.split(':')[0])).minute(parseInt(selectedTimeSlot.start.split(':')[1] || '0')) : 
                    null
                  }
                  readOnly
                  className="w-full"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                      sx: {
                        '.MuiOutlinedInput-notchedOutline': {
                          borderColor: '#E5E7EB',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#4AA3BA',
                        },
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </div>
            
            {selectedDate && selectedTimeSlot && !selectedTimeSlot.isBooked && (
              <div className="mb-8 p-6 bg-[#F0F7FA] rounded-lg border border-[#D0E6EB]">
                <h3 className="text-lg font-medium text-[#4AA3BA] mb-4">Your Appointment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#4AA3BA] font-medium mb-1">Date</p>
                    <p className="font-medium text-gray-700">{selectedDate.format('ddd, MMM D, YYYY')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#4AA3BA] font-medium mb-1">Time</p>
                    <p className="font-medium text-gray-700">{selectedTimeSlot.start} - {selectedTimeSlot.end}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-[#4AA3BA] font-medium mb-1">Dentist</p>
                    <p className="font-medium text-gray-700">{dentistName || "Selected Dentist"}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-8">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}
              {success && (
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                  <p className="text-green-600">{success}</p>
                </div>
              )}
            </div>
            
            <div>
              <button
                className={`w-full bg-[#5EBFD3] hover:bg-[#4AA3BA] text-white font-medium py-3 px-6 rounded-full transition-colors duration-200 shadow-md ${
                  !dentist || !selectedDate || !selectedTimeSlot || loading || (selectedTimeSlot?.isBooked)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
                onClick={handleBooking}
                disabled={loading || !dentist || !selectedDate || !selectedTimeSlot || (selectedTimeSlot?.isBooked)}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : "Make an appointment"}
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 md:w-1/2 border border-gray-100">
            {dentist ? (
              <>
                <div className="mb-6 flex justify-between items-center border-b pb-4">
                  <div>
                    <p className="text-sm text-gray-500">Selected Dentist</p>
                    <h3 className="text-lg font-medium text-gray-800">
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin h-4 w-4 mr-2 text-[#4AA3BA]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </span>
                      ) : dentistName || "Please select a dentist"}
                    </h3>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 text-right">Schedule</p>
                    <h3 className="text-lg font-medium text-[#4AA3BA]">{currentMonth}</h3>
                  </div>
                </div>
                
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar
                    value={selectedDate}
                    onChange={(newDate) => {
                      if (newDate) {
                        setSelectedDate(newDate);
                      }
                    }}
                    onMonthChange={handleMonthChange}
                    shouldDisableDate={shouldDisableDate}
                    views={['day']}
                    sx={{
                      width: '100%',
                      '.MuiPickersCalendarHeader-root': {
                        paddingLeft: '8px',
                        paddingRight: '8px',
                      },
                      '.MuiDayCalendar-header': {
                        justifyContent: 'space-around',
                      },
                      '.MuiPickersDay-root': {
                        fontWeight: '500',
                      },
                      '.MuiPickersDay-root.Mui-selected': {
                        backgroundColor: '#4AA3BA',
                        color: 'white',
                      },
                      '.MuiPickersDay-root:hover': {
                        backgroundColor: '#e6f7fa',
                      },
                      '.MuiPickersDay-root.Mui-disabled': {
                        color: '#bbb',
                      },
                      '.MuiDayCalendar-weekContainer': {
                        justifyContent: 'space-around',
                      }
                    }}
                  />
                </LocalizationProvider>
                
                {selectedDate && (
                  <div className="mt-4 border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-md font-medium text-gray-800">Available Time Slots</h4>
                      <p className="text-sm text-gray-500">{selectedDate.format('dddd, MMMM D')}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {availableTimeSlots.length > 0 ? (
                        availableTimeSlots.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => handleTimeSlotClick(slot)}
                            disabled={slot.isBooked}
                            className={`py-2 px-1 text-sm font-medium rounded-md transition-all duration-200 
                              ${slot.isBooked 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 border border-gray-200' 
                                : selectedTimeSlot === slot
                                  ? 'bg-[#4AA3BA] text-white shadow-md'
                                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-[#4AA3BA] hover:text-[#4AA3BA]'
                              }`}
                          >
                            {slot.start}
                          </button>
                        ))
                      ) : (
                        <p className="text-gray-500 col-span-4 text-center py-4">No available time slots for this date</p>
                      )}
                    </div>
                    
                    <div className="flex mt-4 gap-3 text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#4AA3BA] mr-1"></div>
                        <span className="text-gray-600">Available</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-200 mr-1"></div>
                        <span className="text-gray-600">Booked</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col justify-center items-center h-64 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#4AA3BA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 max-w-xs">Please select a dentist from the dropdown to view their availability calendar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}