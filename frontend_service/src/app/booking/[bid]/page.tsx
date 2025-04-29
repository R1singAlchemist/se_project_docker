"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import dayjs, { Dayjs } from "dayjs";
import getBooking from "@/libs/getBooking";
import { useRouter } from "next/navigation";
import updateBooking from "@/libs/updateBooking";
import getUserProfile from "@/libs/getUserProfile";
import { Select, MenuItem } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DateTimePicker } from "@mui/x-date-pickers";
import getDentistNotAvailable from "@/libs/getDentistNotAvailable";

interface TimeSlot {
  start: string;
  end: string;
  isBooked?: boolean;
}

export default function EditBooking({ params }: { params: { bid: string } }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [bookingJson, setBookingJson] = useState<any>(null);
  const [dentist, setDentist] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [dentistName, setDentistName] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<{
    [date: string]: string[];
  }>({});
  const [currentMonth, setCurrentMonth] = useState<string>(
    dayjs().format("MMMM YYYY")
  );
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [fetchingAvailability, setFetchingAvailability] = useState<boolean>(false);

  const dentistNames: Record<string, string> = {
    "67fde0a05a0148bd6061706c": "Dr. John Carter",
    "67fde18e5a0148bd6061706f": "Dr. Emily Richardson",
    "67fde1ee5a0148bd60617072": "Dr. Michael Tanaka",
    "67fde2225a0148bd60617075": "Dr. Sophia Patel",
    "67fde24d5a0148bd60617078": "Dr. David Lee",
    "67fde2885a0148bd6061707b": "Dr. Jessica Wong",
    "67fde2b75a0148bd6061707e": "Dr. Robert Sanchez",
    "67fde2de5a0148bd60617081": "Dr. Anna Müller",
    "67fde3085a0148bd60617084": "Dr. Benjamin Cooper",
  };

  // Handle authentication
  useEffect(() => {
    if (!session || !session.user?.token) {
      router.push("/auth/signin");
    }
  }, [session, router]);

  // Function to fetch dentist availability
  const fetchDentistAvailability = async (dentistId: string, currentBookingId?: string) => {
    if (!dentistId) return;
    
    try {
      setFetchingAvailability(true);
      
      const timestamp = new Date().getTime(); // Cache busting timestamp
      const bookedResponse = await getDentistNotAvailable(dentistId + `?_t=${timestamp}`);
      
      if (bookedResponse.success && Array.isArray(bookedResponse.data)) {
        const timeSlotsByDate: { [date: string]: string[] } = {};

        // Process all booked dates
        bookedResponse.data.forEach((item: any) => {
          // Skip the current booking so it doesn't appear as booked
          if (currentBookingId && item._id === currentBookingId) {
            return;
          }
          
          const date = dayjs(item.bookingDate);
          const formattedDate = date.format("YYYY-MM-DD");
          const formattedTime = date.format("HH:mm");

          if (!timeSlotsByDate[formattedDate]) {
            timeSlotsByDate[formattedDate] = [];
          }

          timeSlotsByDate[formattedDate].push(formattedTime);
        });

        setBookedTimeSlots(timeSlotsByDate);
      }
    } catch (error) {
      console.error("Failed to fetch dentist availability:", error);
      setError("Failed to load availability data. Please try again.");
    } finally {
      setFetchingAvailability(false);
    }
  };
  
  // Function to update available time slots based on date and booked slots
  const updateAvailableTimeSlots = (date: Dayjs | null, bookedSlots: {[date: string]: string[]}) => {
    if (!date) {
      setAvailableTimeSlots([]);
      return;
    }
    
    const formattedDate = date.format("YYYY-MM-DD");
    
    // Define all possible time slots
    const allTimeSlots = [
      { start: "09:00", end: "10:00" },
      { start: "10:00", end: "11:00" },
      { start: "11:00", end: "12:00" },
      { start: "13:00", end: "14:00" },
      { start: "14:00", end: "15:00" },
      { start: "15:00", end: "16:00" },
      { start: "16:00", end: "17:00" },
    ];
    
    // Get booked times for this date
    const bookedTimes = bookedSlots[formattedDate] || [];
    
    // Mark slots as booked or available
    const slotsWithAvailability = allTimeSlots.map((slot) => {
      // Check if this slot's time is in the booked list
      const isBooked = bookedTimes.some((bookedTime) => {
        const bookedHour = bookedTime.split(":")[0];
        const slotStartHour = slot.start.split(":")[0];
        return bookedHour === slotStartHour;
      });
      
      return {
        ...slot,
        isBooked,
      };
    });
    
    setAvailableTimeSlots(slotsWithAvailability);
  };

  // Initial data loading - only runs once
  useEffect(() => {
    if (!session?.user?.token || dataLoaded) return;
    
    async function loadInitialData() {
      try {
        setInitialLoading(true);
        
        // Check for session first
        if (!session?.user?.token) {
          throw new Error("No session available");
        }

        // Load booking details
        const bookingData = await getBooking(session.user.token, params.bid);
        setBookingJson(bookingData);
        
        if (bookingData.data) {
          const dentistId = bookingData.data.dentist._id || "";
          setDentist(dentistId);
          setDentistName(bookingData.data.dentist.name || "");
          
          // Set selected date from booking
          const bookingDate = dayjs(bookingData.data.bookingDate);
          setSelectedDate(bookingDate);
          
          // Immediately fetch availability for this dentist
          if (dentistId) {
            await fetchDentistAvailability(dentistId, params.bid);
          }
        }
        
        setDataLoaded(true);
      } catch (error) {
        console.error("Error loading initial data:", error);
        setError("Failed to load booking details. Please try again.");
      } finally {
        setInitialLoading(false);
      }
    }
    
    loadInitialData();
  }, [session, params.bid, dataLoaded]);

  // Update time slots when booking data is loaded or dentist changes
  useEffect(() => {
    if (bookingJson && !selectedTimeSlot && selectedDate) {
      const bookingHour = dayjs(bookingJson.data.bookingDate).format("HH:mm");
      const timeSlots = [
        { start: "09:00", end: "10:00" },
        { start: "10:00", end: "11:00" },
        { start: "11:00", end: "12:00" },
        { start: "13:00", end: "14:00" },
        { start: "14:00", end: "15:00" },
        { start: "15:00", end: "16:00" },
        { start: "16:00", end: "17:00" },
      ];
      
      const matchingSlot = timeSlots.find(slot => slot.start === bookingHour);
      if (matchingSlot) {
        setSelectedTimeSlot(matchingSlot);
      }
    }
  }, [bookingJson, selectedDate, selectedTimeSlot]);

  // Update available time slots when selected date or booked slots change
  useEffect(() => {
    if (dataLoaded) {
      updateAvailableTimeSlots(selectedDate, bookedTimeSlots);
    }
  }, [selectedDate, bookedTimeSlots, dataLoaded]);

  // Handler for dentist changes
  const handleDentistChange = (value: string) => {
    setDentist(value);

    if (value in dentistNames) {
      setDentistName(dentistNames[value]);
    } else {
      setDentistName("");
    }

    // Reset time related selections
    setSelectedTimeSlot(null);
    setBookedTimeSlots({});
    
    // Fetch availability for the new dentist
    fetchDentistAvailability(value, params.bid);
  };

  // Handler for date selection
  const handleDateSelection = (newDate: Dayjs | null) => {
    if (!newDate) return;
    
    setSelectedDate(newDate);
    setSelectedTimeSlot(null);
  };

  // Handler for time slot selection
  const handleTimeSlotClick = (timeSlot: TimeSlot) => {
    if (timeSlot.isBooked) return; // Don't select booked slots
    setSelectedTimeSlot(timeSlot);
  };

  // Check if a date should be disabled
  const shouldDisableDate = (date: Dayjs) => {
    // Disable past dates
    if (date.isBefore(dayjs(), "day")) {
      return true;
    }
    
    // Check if date is fully booked (all time slots taken)
    const formattedDate = date.format("YYYY-MM-DD");
    const bookedSlots = bookedTimeSlots[formattedDate] || [];
    
    // If all 7 time slots are booked, disable the date
    return bookedSlots.length >= 7;
  };

  // Handler for month changes in calendar
  const handleMonthChange = (date: Dayjs) => {
    setCurrentMonth(date.format("MMMM YYYY"));
  };

  // Handler for editing the booking
  const handleEditBooking = async () => {
    if (!dentist || !selectedDate || !selectedTimeSlot) {
      setError(
        "Please select a dentist, date, and time slot for your appointment."
      );
      return;
    }
  
    if (selectedTimeSlot.isBooked) {
      setError("This time slot is already booked. Please select another time.");
      return;
    }
  
    if (!session?.user?.token) {
      setError("You must be logged in to update your booking.");
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Format the appointment date with the selected time
      const appointmentDate = selectedDate
        .hour(parseInt(selectedTimeSlot.start.split(":")[0]))
        .minute(parseInt(selectedTimeSlot.start.split(":")[1] || "0"))
        .second(0);
  
      const formattedDate = appointmentDate.toISOString();
      
      // Update the booking with new date and dentist
      await updateBooking(
        bookingJson.data._id,
        session.user.token,
        formattedDate,
        dentist
      );
      
      setSuccess("Booking updated successfully!");
      
      // Change this redirection to go to the manage page instead of bookingHistory
      setTimeout(() => {
        // Using window.location.href to ensure fresh data loading
        window.location.href = "/manage";
      }, 2000);
    } catch (err) {
      const userProfile = await getUserProfile(session.user.token);
      if (userProfile.data.role === "banned") {
        setError("Failed to edit booking. You got banned");
      } else {
        setError("Failed to edit booking");
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl animate-fade-in">
          <div className="flex justify-center space-x-2 mb-5">
            <div className="h-3 w-3 bg-[#5EBFD3] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-3 w-3 bg-[#5EBFD3] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-3 w-3 bg-[#5EBFD3] rounded-full animate-bounce"></div>
          </div>

          <p className="text-lg font-medium text-gray-700 animate-pulse">
            Loading booking details<span className="animate-ellipsis">...</span>
          </p>

          <div className="mt-6 w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-[#5EBFD3] rounded-full animate-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingJson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded-xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">Could not load booking details. The appointment may have been deleted or moved.</p>
          <Link href="/bookingHistory" className="inline-block bg-[#4AA3BA] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#3b8294] transition-colors">
            View Your Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full flex flex-col items-center bg-white min-h-screen">
      <div className="w-full bg-gray-100 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Edit Booking</h1>
        <div className="mt-2 text-sm text-gray-600">
          <Link href="/bookingHistory" className="hover:text-blue-600">
            Booking History
          </Link>{" "}
          / <span>Edit Booking</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">
            Edit your <span className="text-[#4AA3BA]">Dental Booking</span>
          </h2>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 md:w-1/2 border border-gray-100">
            <div className="mb-8">
              <label
                htmlFor="dentist"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Choose Dentist
              </label>
              <Select
                fullWidth
                variant="outlined"
                name="dentist"
                id="dentist"
                value={dentist}
                onChange={(e) => handleDentistChange(e.target.value)}
                className="h-12"
                sx={{
                  ".MuiOutlinedInput-notchedOutline": {
                    borderColor: "#E5E7EB",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4AA3BA",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4AA3BA",
                  },
                }}
              >
                <MenuItem value="67fde0a05a0148bd6061706c">
                  Dr. John Carter
                </MenuItem>
                <MenuItem value="67fde18e5a0148bd6061706f">
                  Dr. Emily Richardson
                </MenuItem>
                <MenuItem value="67fde1ee5a0148bd60617072">
                  Dr. Michael Tanaka
                </MenuItem>
                <MenuItem value="67fde2225a0148bd60617075">
                  Dr. Sophia Patel
                </MenuItem>
                <MenuItem value="67fde24d5a0148bd60617078">
                  Dr. David Lee
                </MenuItem>
                <MenuItem value="67fde2885a0148bd6061707b">
                  Dr. Jessica Wong
                </MenuItem>
                <MenuItem value="67fde2b75a0148bd6061707e">
                  Dr. Robert Sanchez
                </MenuItem>
                <MenuItem value="67fde2de5a0148bd60617081">
                  Dr. Anna Müller
                </MenuItem>
                <MenuItem value="67fde3085a0148bd60617084">
                  Dr. Benjamin Cooper
                </MenuItem>
              </Select>
            </div>

            <div className="mb-8">
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Appointment Date & Time
              </label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="MM/DD/YYYY"
                  value={
                    selectedDate && selectedTimeSlot
                      ? selectedDate
                          .hour(parseInt(selectedTimeSlot.start.split(":")[0]))
                          .minute(
                            parseInt(
                              selectedTimeSlot.start.split(":")[1] || "0"
                            )
                          )
                      : null
                  }
                  readOnly
                  className="w-full"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                      sx: {
                        ".MuiOutlinedInput-notchedOutline": {
                          borderColor: "#E5E7EB",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#4AA3BA",
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </div>

            {selectedDate && selectedTimeSlot && !selectedTimeSlot.isBooked && (
              <div className="mb-8 p-6 bg-[#F0F7FA] rounded-lg border border-[#D0E6EB]">
                <h3 className="text-lg font-medium text-[#4AA3BA] mb-4">
                  Your Appointment Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#4AA3BA] font-medium mb-1">
                      Date
                    </p>
                    <p className="font-medium text-gray-700">
                      {selectedDate.format("ddd, MMM D, YYYY")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#4AA3BA] font-medium mb-1">
                      Time
                    </p>
                    <p className="font-medium text-gray-700">
                      {selectedTimeSlot.start} - {selectedTimeSlot.end}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-[#4AA3BA] font-medium mb-1">
                      Dentist
                    </p>
                    <p className="font-medium text-gray-700">
                      {dentistName || "Selected Dentist"}
                    </p>
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
                  !dentist ||
                  !selectedDate ||
                  !selectedTimeSlot ||
                  loading ||
                  selectedTimeSlot?.isBooked
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-lg transform hover:-translate-y-0.5"
                }`}
                onClick={handleEditBooking}
                disabled={
                  loading ||
                  !dentist ||
                  !selectedDate ||
                  !selectedTimeSlot ||
                  selectedTimeSlot?.isBooked
                }
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Update Appointment"
                )}
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
                      {fetchingAvailability ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin h-4 w-4 mr-2 text-[#4AA3BA]"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Loading...
                        </span>
                      ) : (
                        dentistName
                      )}
                    </h3>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 text-right">Schedule</p>
                    <h3 className="text-lg font-medium text-[#4AA3BA]">
                      {currentMonth}
                    </h3>
                  </div>
                </div>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar
                    value={selectedDate}
                    onChange={handleDateSelection}
                    onMonthChange={handleMonthChange}
                    shouldDisableDate={shouldDisableDate}
                    views={["day"]}
                    sx={{
                      width: "100%",
                      ".MuiPickersCalendarHeader-root": {
                        paddingLeft: "8px",
                        paddingRight: "8px",
                      },
                      ".MuiDayCalendar-header": {
                        justifyContent: "space-around",
                      },
                      ".MuiPickersDay-root": {
                        fontWeight: "500",
                      },
                      ".MuiPickersDay-root.Mui-selected": {
                        backgroundColor: "#4AA3BA",
                        color: "white",
                      },
                      ".MuiPickersDay-root:hover": {
                        backgroundColor: "#e6f7fa",
                      },
                      ".MuiPickersDay-root.Mui-disabled": {
                        color: "#bbb",
                      },
                      ".MuiDayCalendar-weekContainer": {
                        justifyContent: "space-around",
                      },
                    }}
                  />
                </LocalizationProvider>

                {selectedDate && (
                  <div className="mt-4 border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-md font-medium text-gray-800">
                        Available Time Slots
                      </h4>
                      <p className="text-sm text-gray-500">
                        {selectedDate.format("dddd, MMMM D")}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {fetchingAvailability ? (
                        <div className="col-span-full flex justify-center py-4">
                          <svg className="animate-spin h-6 w-6 text-[#4AA3BA]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : availableTimeSlots.length > 0 ? (
                        availableTimeSlots.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => handleTimeSlotClick(slot)}
                            disabled={slot.isBooked}
                            className={`py-2 px-1 text-sm font-medium rounded-md transition-all duration-200 
                                ${
                                  slot.isBooked
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 border border-gray-200"
                                    : selectedTimeSlot && selectedTimeSlot.start === slot.start
                                    ? "bg-[#4AA3BA] text-white shadow-md"
                                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-[#4AA3BA] hover:text-[#4AA3BA]"
                                }`}
                          >
                            {slot.start}
                          </button>
                        ))
                      ) : (
                        <p className="text-gray-500 col-span-4 text-center py-4">
                          No available time slots for this date
                        </p>
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-[#4AA3BA]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 max-w-xs">
                  Please select a dentist from the dropdown to view their
                  availability calendar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}