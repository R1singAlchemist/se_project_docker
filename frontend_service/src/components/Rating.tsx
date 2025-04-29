'use client';

import { useEffect, useReducer } from "react";
import getReviewsDentist from "@/libs/getReviewsDentist";

type RatingData = {
  rating: number;
  review: string;
};

type Action =
  | { type: 'change'; dentistName: string; data: RatingData }
  | { type: 'remove'; dentistName: string }
  | { type: 'init'; data: Map<string, RatingData> };

export default function DentistRating({ dentistId }: { dentistId: string }) {
  const ratingReducer = (ratingList: Map<string, RatingData>, action: Action) => {
    const newList = new Map(ratingList);
    switch (action.type) {
      case 'change':
        newList.set(action.dentistName, action.data);
        return newList;
      case 'remove':
        newList.delete(action.dentistName);
        return newList;
      case 'init':
        return action.data;
      default:
        return newList;
    }
  };

  const [ratingList, dispatchChange] = useReducer(
    ratingReducer,
    new Map<string, RatingData>()
  );

  useEffect(() => {
    async function fetchRatings() {
      const response = await getReviewsDentist(dentistId);
      const dataMap = new Map<string, RatingData>();

      if (response.success && Array.isArray(response.data)) {
        for (const review of response.data) {
          dataMap.set(review.user.name, {
            rating: review.rating,
            review: review.review,
          });
        }
      }

      dispatchChange({ type: 'init', data: dataMap });
    }

    fetchRatings();
  }, [dentistId]);

  // Function to render star ratings visually
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < rating ? "text-yellow-500" : "text-gray-300"}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-black py-4 sm:py-6 px-4 sm:px-10">Reviews</h1>
      <div className="px-4 sm:px-14 py-2">
        {/* Responsive grid layout - removed the "Ratings Collected" heading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {Array.from(ratingList.entries()).map(([name, data]) => (
            <div 
              key={name} 
              className="bg-white p-4 rounded-lg shadow-md border border-gray-200 h-full flex flex-col"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-gray-800 text-sm sm:text-base">{name}</p>
                <div>
                  {renderStars(data.rating)}
                </div>
              </div>
              <p className="italic text-gray-600 text-sm border-t pt-2 mt-2 flex-grow">"{data.review}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}