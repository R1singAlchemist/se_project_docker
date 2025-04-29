import Link from "next/link";

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
  data: UserItem[];
}

export default async function UserCatalog({
  usersJson,
}: {
  usersJson: Promise<UserJson>;
}) {
  try {
    const userJsonReady = await usersJson;

    const userData = Array.isArray(userJsonReady.data) 
      ? userJsonReady.data 
      : [userJsonReady.data];

    return (
        <div className="w-full max-w-7xl mx-auto space-y-4">
        {userData.length > 0 ? (
          userData.map((userItem: UserItem) => (
            <div key={userItem._id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="flex w-full text-gray-500 items-center py-4">
                
                {/* User ID */}
                <div className="flex-1.5 min-w-[200px] px-4 border-r border-gray-300">
                  <div className="font-bold text-black text-lg mb-1">User ID</div>
                  <div className="text-sm break-all">{userItem._id}</div>
                </div>
    
                {/* User Name */}
                <div className="flex-1 min-w-[200px] px-4 border-r border-gray-300">
                  <div className="font-bold text-black text-lg mb-1">Name</div>
                  <div className="text-sm">{userItem.name}</div>
                </div>
    
                {/* User Email */}
                <div className="flex-1 min-w-[180px] px-4 border-r border-gray-300">
                  <div className="font-bold text-black text-lg mb-1">Email</div>
                  <div className="text-sm">{userItem.email}</div>
                </div>

                {/* User Telephone */}
                <div className="flex-1 min-w-[180px] px-4 border-r border-gray-300">
                  <div className="font-bold text-black text-lg mb-1">Telephone</div>
                  <div className="text-sm">{userItem.telephone}</div>
                </div>
    
                {/* User role */}
                <div className="flex-1 min-w-[180px] px-4">
                  <div className="font-bold text-black text-lg mb-1">Role</div>
                  <div className="text-sm">{userItem.role}</div>
                </div>
    
                {/* Buttons */}
                <div className="flex-shrink-0 px-4 flex gap-2">
                  <Link
                    href={`/manage/${userItem._id}`}
                    className="bg-[#4AA3BA] text-white px-4 py-2 rounded-full font-medium hover:bg-[#3b8294] transition duration-300 text-sm whitespace-nowrap"
                  >
                    Edit user account
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            No user accounts found.
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Failed to load user account:", error);
    return (
      <p className="text-center my-4 text-red-500">
        Failed to load user accounts. Please try again later.
      </p>
    );
  }
}