import * as React from 'react';
import Rating from '@mui/material/Rating';
import { useState, useEffect } from 'react';

export default function Card({
  dentistName,
  onRate,
}: {
  dentistName: string;
  onRate: (dentistName: string, rating: number, review: string) => void;
}) {
  const [value, setValue] = useState<number | null>(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    onRate(dentistName, value ?? 0, review);
  }, []);

  return (
    <div className="w-full max-w-md p-4  rounded-xl space-y-1">
      <div className="hidden">{dentistName}</div>

      <textarea
        className="w-full border-b border-gray-400 p-2 text-gray-600 placeholder-gray-400 focus:outline-none focus:border-black resize-none"
        placeholder="add Review . . ."
        value={review}
        onChange={(e) => setReview(e.target.value)}
        rows={2}
      />

      <div className="flex items-center justify-between">
        <Rating
          name={`${dentistName}-rating`}
          value={value}
          onChange={(event, newValue) => {
            event.stopPropagation();
            setValue(newValue);
            onRate(dentistName, newValue ?? 0, review);
          }}
        />
        <button
          className="bg-gray-300 text-black px-4 py-1 rounded-full shadow hover:bg-gray-400 transition"
          onClick={() => onRate(dentistName, value ?? 0, review)}
        >
          Post
        </button>
      </div>
    </div>
  );
}
