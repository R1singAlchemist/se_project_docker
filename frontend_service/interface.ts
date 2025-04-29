interface DentistItem {
  _id: string;
  name: string;
  year_experience: number;
  area_expertise: string;
  picture: string;
  __v: number;
  StartingPrice: number;
  bookings: [];
  id: string;
}

interface DentistJson {
  success: boolean;
  count: number;
  pagination: Object;
  data: DentistItem[];
}

interface BookingItem {
  _id: string;
  bookingDate: string;
  user: string;
  dentist: DentistItem;
  createdAt: string;
  __v: number;
  status: string;
}

interface BookingJson {
  success: boolean;
  count: number;
  pagination: Object;
  data: BookingItem[];
}

interface UserItem {
  _id: string;
  name: string;
  email: string;
  telephone: string;
  role: string;
}

interface UserJson {
  success: boolean;
  count: number;
  data: UserItem | UserItem[];
}

interface DentistData {
  _id: string;
  name: string;
  area_expertise: string[];
  year_experience: number;
  StartingPrice: number;
  picture: string;
  rating: any[];
  bio?: string;
}