import Image from 'next/image';
import getDentist from '@/libs/getDentist';
import Link from 'next/link';

export default async function DentistDetailPage({ params }: { params: { did: string } }) {
  const dentistDetail = await getDentist(params.did);

  // Calculate average rating
  const ratings = dentistDetail.data.rating || [];
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum: number, review: any) => sum + review.rating, 0) / ratings.length 
    : 0;

  // Helper function to render stars
  const renderStars = (count: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`text-xl ${star <= count ? "text-yellow-400" : "text-gray-300"}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="w-full bg-gray-100 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Dentists</h1>
        <div className="mt-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home </Link> /
          <Link href="/dentist" className="hover:text-blue-600"> Dentists </Link> /
          <span className="text-gray-900"> {dentistDetail.data.name}</span>
        </div>
      </div>

      {/* Dentist Details */}
      <div className=" mx-auto my-auto bg-white ">
        <div className="flex items-center gap-10 px-40 py-10 max-w-7xl mx-auto gap-40">
          {/* Image */}
          <Image
            src={dentistDetail.data.picture}
            alt="Dentist Image"
            width={350}
            height={350}
            className="rounded-lg shadow-md"
          />

          {/* Details */}
          <div className="text-center md:text-left space-y-10">
            <h1 className="text-5xl font-bold text-gray-900">{dentistDetail.data.name}</h1>
            <p className="text-gray-600 mt-2">
              <span className="font-semibold text-gray-900">Area of expertise:</span> {dentistDetail.data.area_expertise}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">Years of experience:</span> {dentistDetail.data.year_experience} Years
            </p>
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">Starting price:</span> {dentistDetail.data.StartingPrice}
            </p>
            
            {/* Appointment Button */}
            <Link href={`/booking?did=${params.did}`}>
              <button className="mt-12 rounded-3xl bg-[#4AA3BA] text-white px-4 py-2 text-lg font-medium hover:bg-[#3b8294] transition-colors">
                Make an Appointment
              </button>
            </Link>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 px-40 py-10 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-gray-900 border-b pb-4">Patient Reviews</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Average Rating Summary */}
            <div className="flex items-center gap-4 mb-6 border-b pb-4">
              <div className="text-3xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </div>
              <div>
                {renderStars(Math.round(averageRating))}
                <p className="text-gray-500 text-sm mt-1">
                  Based on {ratings.length} reviews
                </p>
              </div>
            </div>
            
            {/* Reviews List */}
            <div className="space-y-6">
              {ratings.length > 0 ? (
                ratings.map((review: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">{review.user?.name || 'Anonymous'}</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={`${star <= review.rating ? "text-yellow-400" : "text-gray-300"}`}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600">{review.review || "No comment provided."}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No reviews yet</p>
              )}
            </div>
          </div>
        </div>
      </div> 
    </main>
  );
}