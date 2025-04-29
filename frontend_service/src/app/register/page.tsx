import User from "@/db/models/User";
import { dbConnect } from "@/db/dbConnect";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs"; // Import bcryptjs

export default async function RegisterPage() {
  const addUser = async (addUserForm: FormData) => {
    "use server"
    const username = addUserForm.get("name");
    const email = addUserForm.get("email");
    const tel = addUserForm.get("tel");
    const password = addUserForm.get("password");

    try {
      await dbConnect();

      // Hash the password
      const salt = await bcrypt.genSalt(10); // Generate a salt
      const hashedPassword = await bcrypt.hash(password as string, salt); // Hash the password

      // Create the user with the hashed password
      const user = await User.create({
        name: username,
        email: email,
        telephone: tel,
        password: hashedPassword, // Save the hashed password
      });
    } catch (error) {
      console.log(error);
    }
    redirect("/signin");
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center pt-10 md:pt-0"
      style={{
        backgroundImage: 'url(/img/Dentist_Signin.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >      
      <div className="relative w-full max-w-md p-8 bg-white rounded-3xl shadow-lg mx-4 md:mx-0 transform -translate-y-16 md:-translate-y-12">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 flex items-center justify-center bg-[#4AA3BA] rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
            Register
          </h1>
        </div>

        <form action={addUser} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              required
              id="name"
              name="name"
              placeholder="e.g. John Doe"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4AA3BA] focus:border-[#4AA3BA] sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="tel" className="block text-sm font-medium text-gray-700 mb-1">
              Telephone Number
            </label>
            <input
              type="tel"
              required
              id="tel"
              name="tel"
              placeholder="e.g. 095123456"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4AA3BA] focus:border-[#4AA3BA] sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              id="email"
              name="email"
              placeholder="e.g. example@gmail.com"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4AA3BA] focus:border-[#4AA3BA] sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              id="password"
              name="password"
              placeholder="e.g. p@ssw0rd1234"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4AA3BA] focus:border-[#4AA3BA] sm:text-sm"
            />
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#4AA3BA] hover:bg-[#3d8a9e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4AA3BA]"
            >
              Register
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account? <a
              href="/signin"
              className="font-medium text-[#4AA3BA] hover:text-[#3d8a9e]"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}