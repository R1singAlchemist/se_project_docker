"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Rating from "@mui/material/Rating";
import submitDentistReview from "@/libs/createReview";


interface BookingItem {
  _id: string;
  bookingDate: string;
  status: string;
  dentist: {
    _id: string;
    name: string;
    area_expertise: string | string[];
  };
  user: string;
  treatmentDetail: string;
}

interface UserJson {
  data: UserItem;
}

interface UserItem {
  _id: string;
  name: string;
  email: string;
  telephone: string;
  role: string;
}

interface BookingJson {
  data: BookingItem[];
}

interface UserItem {
  _id: string;
  name: string;
  email: string;
  telephone: string;
  role: string;
}

export default function PatientTreatmentHistoryCatalog({
  bookingJson, patient
}: {
  bookingJson: Promise<BookingJson>,
  patient: Promise<UserJson> ;
}) {
  const { data: session } = useSession();
  const [bookingJsonReady, setBookingJsonReady] = useState<BookingJson | null>(
    null
  );
  const [sortOption, setSortOption] = useState<string>("newest");
  const [statusFilter, setStatusFilter] = useState<string>("completed");
  // New state for expertise filter
  const [expertiseFilter, setExpertiseFilter] = useState<string>("All");
  const [expertiseOptions, setExpertiseOptions] = useState<string[]>(["All"]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [filteredBookings, setFilteredBookings] = useState<BookingItem[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [displayedBookings, setDisplayedBookings] = useState<BookingItem[]>([]);

  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [patientName, setPatientName] = useState<string>("");

  useEffect(() => {
    async function fetchPatientName() {
      try {
        console.log(patient);
        const userData = await patient;
        if(userData?.data){
          console.log("hi");
        }else{
          console.log("what");
        }
        if (userData?.data?.name) {
          setPatientName(userData.data.name);
        } else {
          console.warn("Patient data or name not found.");
        }
      } catch (error) {
        console.error("Failed to load patient data:", error);
      }
    }
    fetchPatientName();
  }, [patient]);

  useEffect(() => {
    async function fetchBookingData() {
      try {
        const patientData = await patient;
        if (patientData && patientData.data) {
          if (Array.isArray(patientData.data) && patientData.data.length > 0) {
            setPatientName(patientData.data[0].name || "Unknown");
          } else {
            const userData = patientData.data as UserItem;
            setPatientName(userData.name || "Unknown");
          }
        }
        
        const data = await bookingJson;
        setBookingJsonReady(data);
        
        const allExpertiseAreas = new Set<string>();
        allExpertiseAreas.add("All");
        
        const predefinedExpertiseOptions = [
          'Orthodontics', 
          'Endodontics', 
          'Prosthodontics', 
          'Pediatric Dentistry', 
          'Oral Surgery', 
          'Periodontics', 
          'Cosmetic Dentistry', 
          'General Dentistry',
          'Implant Dentistry'
        ];
        
        predefinedExpertiseOptions.forEach(option => allExpertiseAreas.add(option));
        
        data.data.forEach(booking => {
          if (booking.dentist && booking.dentist.area_expertise) {
            if (Array.isArray(booking.dentist.area_expertise)) {
              booking.dentist.area_expertise.forEach(area => allExpertiseAreas.add(area));
            } else {
              allExpertiseAreas.add(booking.dentist.area_expertise);
            }
          }
        });
        
        setExpertiseOptions(Array.from(allExpertiseAreas));
        applyFiltersAndSort(data.data);
      } catch (error) {
        console.error("Failed to load bookings:", error);
      }
    }
    fetchBookingData();
  }, [bookingJson, patient]);

  useEffect(() => {
    if (bookingJsonReady) {
      setCurrentPage(1);
      applyFiltersAndSort(bookingJsonReady.data);
    }
  }, [sortOption, statusFilter, expertiseFilter, searchTerm, dateRange, bookingJsonReady]);

  useEffect(() => {
    updateDisplayedBookings();
  }, [filteredBookings, currentPage, itemsPerPage]);

  const applyFiltersAndSort = (bookings: BookingItem[]) => {
    if (!bookings) return;

    let filtered = [...bookings];
  
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Add filter by expertise area
    if (expertiseFilter !== "All") {
      filtered = filtered.filter((booking) => {
        if (booking.dentist && booking.dentist.area_expertise) {
          if (Array.isArray(booking.dentist.area_expertise)) {
            return booking.dentist.area_expertise.includes(expertiseFilter);
          } else {
            return booking.dentist.area_expertise === expertiseFilter;
          }
        }
        return false;
      });
    }

    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(
        (booking) => new Date(booking.bookingDate) >= startDate
      );
    }
    
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (booking) => new Date(booking.bookingDate) <= endDate
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.dentist.name.toLowerCase().includes(term) ||
          booking._id.toLowerCase().includes(term)
     );
    }

    const sortedBookings = [...filtered].sort((a, b) => {
      const dateA = new Date(a.bookingDate).getTime();
      const dateB = new Date(b.bookingDate).getTime();
    
     switch (sortOption) {
        case "newest":
          return dateB - dateA;
        case "oldest":
          return dateA - dateB;
        default:
          return dateB - dateA; 
      }
    });

    setFilteredBookings(sortedBookings);
    setTotalPages(Math.max(1, Math.ceil(sortedBookings.length / itemsPerPage)));
  };

  const updateDisplayedBookings = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedBookings(filteredBookings.slice(startIndex, endIndex));
  };

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(e.target.value);
  };

  // New handler for expertise filter change
  const handleExpertiseFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setExpertiseFilter(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const viewBookingDetails = (booking: BookingItem) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedBooking(null);
  };

  const openReviewModal = (booking: BookingItem) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedBooking(null);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const resetFilters = () => {
    setSortOption("newest");
    setStatusFilter("completed");
    setExpertiseFilter("All");
    setSearchTerm("");
    setDateRange({ start: "", end: "" });
    setCurrentPage(1);
  };

  if (!session?.user?.token) {
    return (
      <p className="text-center my-4 text-red-500">
        You must be logged in to see your booking History.
      </p>
    );
  }

  if (!bookingJsonReady) {
    return <p className="text-center my-4">Loading...</p>;
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;

    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    buttons.push(
      <button
        key="prev"
        onClick={goToPreviousPage}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded ${
          currentPage === 1
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-white text-[#4AA3BA] hover:bg-gray-100"
        }`}
      >
        &lt;
      </button>
    );

    if (startPage > 1) {
      buttons.push(
        <button
          key="1"
          onClick={() => goToPage(1)}
          className="px-3 py-1 bg-white text-[#4AA3BA] hover:bg-gray-100 rounded"
        >
          1
        </button>
      );

      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-2">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i
              ? "bg-[#4AA3BA] text-white"
              : "bg-white text-[#4AA3BA] hover:bg-gray-100"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages - 1) {
      buttons.push(
        <span key="ellipsis2" className="px-2">
          ...
        </span>
      );
    }

    if (endPage < totalPages) {
      buttons.push(
        <button
          key={totalPages}
          onClick={() => goToPage(totalPages)}
          className="px-3 py-1 bg-white text-[#4AA3BA] hover:bg-gray-100 rounded"
        >
          {totalPages}
        </button>
      );
    }

    buttons.push(
      <button
        key="next"
        onClick={goToNextPage}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded ${
          currentPage === totalPages
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-white text-[#4AA3BA] hover:bg-gray-100"
        }`}
      >
        &gt;
      </button>
    );

    return buttons;
  };

  const BookingDetailModal = () => {
    if (!selectedBooking || !showDetailModal) return null;

    const statusClass = getStatusColor(selectedBooking.status);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#4AA3BA]">
              Appointment Details
            </h2>
            <button
              onClick={closeDetailModal}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">Booking ID</h3>
                <p className="text-gray-700 break-all">{selectedBooking._id}</p>
              </div>
              <div className="mt-2 md:mt-0">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}
                >
                  {selectedBooking.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Appointment Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium">
                      {formatDate(selectedBooking.bookingDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Dentist Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Dentist Name</p>
                    <p className="font-medium">
                      {selectedBooking.dentist?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Area of Expertise</p>
                    <p className="font-medium">
                      {Array.isArray(selectedBooking.dentist?.area_expertise)
                        ? selectedBooking.dentist?.area_expertise.join(', ')
                        : selectedBooking.dentist?.area_expertise}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Treatment Detail</h3>
                <p className="text-gray-700 break-all">{selectedBooking.treatmentDetail}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ReviewModal = () => {
    const [rating, setRating] = useState<number | null>(0);
    const [reviewText, setReviewText] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | "">(
      ""
    );
    
    const [validationErrors, setValidationErrors] = useState<{
      rating?: string;
      reviewText?: string;
    }>({});

    const MAX_REVIEW_LENGTH = 500;
    const MIN_REVIEW_LENGTH = 10;
    
    const [touched, setTouched] = useState({
      rating: false,
      reviewText: false
    });
  
    if (!selectedBooking || !showReviewModal) return null;
    
    const handleFieldTouch = (field: 'rating' | 'reviewText') => {
      setTouched(prev => ({
        ...prev,
        [field]: true
      }));
      
      validateField(field);
    };
    
    const validateField = (field: 'rating' | 'reviewText') => {
      const newErrors = { ...validationErrors };
      
      if (field === 'rating') {
        if (!rating || rating === 0) {
          newErrors.rating = "Please select a rating";
        } else {
          delete newErrors.rating;
        }
      }
      
      if (field === 'reviewText') {
        if (!reviewText.trim()) {
          newErrors.reviewText = "Please add your review comment";
        } else if (reviewText.trim().length < MIN_REVIEW_LENGTH) {
          newErrors.reviewText = `Review comment must be at least ${MIN_REVIEW_LENGTH} characters`;
        } else if (reviewText.trim().length > MAX_REVIEW_LENGTH) {
          newErrors.reviewText = `Review comment must not exceed ${MAX_REVIEW_LENGTH} characters`;
        } else if (/^\s*$/.test(reviewText)) {
          newErrors.reviewText = "Review cannot be only whitespace";
        } else {
          delete newErrors.reviewText;
        }
      }
      
      setValidationErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
    
    const validateForm = () => {
      setTouched({
        rating: true,
        reviewText: true
      });
      
      const ratingValid = validateField('rating');
      const reviewTextValid = validateField('reviewText');
      
      return ratingValid && reviewTextValid;
    };
  
    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }
      
      try {
        setLoading(true);
        
        if (!rating) {
          throw new Error("Rating is required");
        }
        
        await submitDentistReview(
          selectedBooking.dentist._id,
          session.user.token,
          rating,
          reviewText
        );
        
        setMessage("Thank you! Your review has been submitted successfully.");
        setMessageType("success");
        
        setReviewText("");
        setRating(5);
        setValidationErrors({});
        setTouched({ rating: false, reviewText: false });
        
        setTimeout(() => {
          closeReviewModal();
          setMessage("");
          setMessageType("");
        }, 2000);
      } catch (err) {
        console.error("Review submission error:", err);
        setMessage("Failed to submit review. Please try again later.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };
    
    const handleReviewTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setReviewText(value);
      
      if (touched.reviewText) {
        validateField('reviewText');
      }
    };
    
    const handleRatingChange = (_: React.SyntheticEvent, newValue: number | null) => {
      setRating(newValue);
      
      if (touched.rating) {
        validateField('rating');
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#4AA3BA]">Review Dentist</h2>
            <button
              onClick={closeReviewModal}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            {message && (
              <div
                className={`p-3 rounded-md ${
                  messageType === "success"
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-red-100 text-red-700 border border-red-300"
                } flex items-start`}
              >
                <span className="mr-2">
                  {messageType === "success" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                {message}
              </div>
            )}
            
            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <div className="font-medium text-gray-800">Dentist: {selectedBooking.dentist.name}</div>
              <div className="text-sm text-gray-600">Appointment Date: {formatDate(selectedBooking.bookingDate)}</div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Your Rating
              </label>
              <div className="flex items-center" onBlur={() => handleFieldTouch('rating')}>
                <Rating
                  value={rating}
                  onChange={handleRatingChange}
                  size="large"
                  precision={1}
                />
                <span className="ml-2 text-sm text-gray-500">
                  {rating ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select rating'}
                </span>
              </div>
              {touched.rating && validationErrors.rating && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.rating}
                </p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="reviewText" className="block text-gray-700 font-medium mb-2">
                Your Review
              </label>
              <textarea
                id="reviewText"
                className={`w-full border rounded-md p-3 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4AA3BA] resize-none transition ${
                  touched.reviewText && validationErrors.reviewText 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:border-[#4AA3BA]"
                }`}
                placeholder="Share your experience with this dentist..."
                rows={4}
                value={reviewText}
                onChange={handleReviewTextChange}
                onBlur={() => handleFieldTouch('reviewText')}
                maxLength={MAX_REVIEW_LENGTH}
              />
              
              {/* Character counter */}
              <div className="flex justify-between text-xs mt-1">
                <div>
                  {touched.reviewText && validationErrors.reviewText ? (
                    <p className="text-red-500 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {validationErrors.reviewText}
                    </p>
                  ) : (
                    <span className="text-gray-500">Minimum {MIN_REVIEW_LENGTH} characters</span>
                  )}
                </div>
                <span className={`${
                  reviewText.length > MAX_REVIEW_LENGTH * 0.9 
                    ? "text-orange-500" 
                    : "text-gray-500"
                }`}>
                  {reviewText.length}/{MAX_REVIEW_LENGTH}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={loading || Object.keys(validationErrors).length > 0}
              className={`mt-2 bg-[#4AA3BA] text-white px-4 py-3 rounded-md hover:bg-[#3A92A9] transition duration-300 w-full flex justify-center items-center font-medium ${
                (loading || Object.keys(validationErrors).length > 0) 
                  ? "opacity-70 cursor-not-allowed" 
                  : "opacity-100"
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : "Submit Review"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      <div className="text-center text-3xl font-bold text-gray-900"><span>Patient Name : </span> <span className="text-center text-3xl font-bold text-[#4AA3BA]">{patientName}</span></div>
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h2 className="text-lg font-bold mb-3">Filter Appointments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="searchTerm"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              Search
            </label>
            <input
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by dentist or ID"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#4AA3BA] focus:border-[#4AA3BA]"
            />
          </div>

          <div>
            <label
              htmlFor="expertiseFilter"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              Treatment type
            </label>
            <div className="relative">
              <select
                id="expertiseFilter"
                value={expertiseFilter}
                onChange={handleExpertiseFilterChange}
                className="w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#4AA3BA] focus:border-[#4AA3BA] appearance-none"
              >
                {expertiseOptions.map((expertise, index) => (
                  <option key={index} value={expertise}>{expertise}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="startDate"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              From Date
            </label>
            <input
              type="date"
              id="startDate"
              name="start"
              value={dateRange.start}
              onChange={handleDateChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#4AA3BA] focus:border-[#4AA3BA]"
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              To Date
            </label>
            <input
              type="date"
              id="endDate"
              name="end"
              value={dateRange.end}
              onChange={handleDateChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#4AA3BA] focus:border-[#4AA3BA]"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-4">
          <button
            onClick={resetFilters}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition duration-300 mb-2 md:mb-0"
          >
            Reset Filters
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="sortBookings" className="text-gray-700 font-medium">
              Sort by:
            </label>
            <div className="relative">
              <select
                id="sortBookings"
                value={sortOption}
                onChange={handleSortChange}
                className="bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#4AA3BA] focus:border-[#4AA3BA] appearance-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-gray-600 mb-2 md:mb-0">
          Showing {displayedBookings.length} of {filteredBookings.length}{" "}
          {filteredBookings.length === 1 ? "appointment" : "appointments"}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="itemsPerPage"
              className="text-gray-700 text-sm whitespace-nowrap"
            >
              Show:
            </label>
            <div className="relative">
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="bg-white border border-gray-300 rounded-md py-1 pl-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#4AA3BA] focus:border-[#4AA3BA] appearance-none text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-3 w-3"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {displayedBookings.length > 0 ? (
        displayedBookings.map((bookingItem: BookingItem) => (
          <div
            key={bookingItem._id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300"
          >
            <div className="flex w-full text-gray-500 items-center py-4">
              <div className="flex-1.5 min-w-[200px] px-4 border-r border-gray-300">
                <div className="font-bold text-black text-lg mb-1">
                  Booking ID
                </div>
                <div className="text-sm break-all">{bookingItem._id}</div>
              </div>
              <div className="flex-1 min-w-[200px] px-4 border-r border-gray-300">
                <div className="font-bold text-black text-lg mb-1">
                  Appointment Date
                </div>
                <div className="text-sm">
                  {formatDate(bookingItem.bookingDate)}
                </div>
              </div>
              <div className="flex-0.5 min-w-[180px] px-4 border-r border-gray-300">
                <div className="font-bold text-black text-lg mb-1">
                  Dentist Name
                </div>
                <div className="text-sm">{bookingItem.dentist.name}</div>
              </div>
              <div className="flex-0.5 min-w-[150px] px-4 border-r border-gray-300">
                <div className="font-bold text-black text-lg mb-1">
                  Patient ID
                </div>
                <div className="text-sm">{bookingItem.user || "Patient"}</div>
              </div>
              <div className="flex-0.5 min-w-[150px] px-4 border-r border-gray-300">
                <div className="font-bold text-black text-lg mb-1">Status</div>
                <div className="text-sm">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      bookingItem.status
                    )}`}
                  >
                    {bookingItem.status || "Status"}
                  </span>
                </div>
              </div>
              <div className="flex-0.5 min-w-[120px] px-4">
                <button
                  onClick={() => viewBookingDetails(bookingItem)}
                  className={`bg-[#4AA3BA] text-white px-4 py-2 rounded-md hover:bg-[#3A92A9] transition duration-300 ${
                    bookingItem.status === "completed"
                      ? "w-full h-1/3 text-sm mb-2"
                      : "w-full"
                  }`}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 bg-white p-8 rounded-xl shadow-md">
          No appointments found matching your filters.
        </div>
      )}

      {filteredBookings.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-1">{renderPaginationButtons()}</div>
        </div>
      )}

      {filteredBookings.length > 0 && (
        <div className="text-center text-gray-500 text-sm">
          Page {currentPage} of {totalPages}
        </div>
      )}

      <BookingDetailModal />
      <ReviewModal />
    </div>
  );
}