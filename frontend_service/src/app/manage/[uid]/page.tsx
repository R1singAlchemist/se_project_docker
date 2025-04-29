"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress, 
  Snackbar, 
  Alert, 
  Card,
  CardContent,
  Typography,
  Divider,
  Box
} from '@mui/material';
import getUser from "@/libs/getUser";
import updateUser from "@/libs/updateUser";

export default function EditUser({ params }: { params: { uid: string } }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [userJson, setUserJson] = useState<any>(null);
  const [role, setRole] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [telephone, setTelephone] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dentistId, setDentistId] = useState<string>("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    if (!session || !session.user?.token) {
      router.push("/auth/signin");
    }
  }, [session, router]);

  useEffect(() => {
    if (session?.user?.token) {
      setLoading(true);
      getUser(session.user.token, params.uid)
        .then((data) => {
          setUserJson(data);
          setRole(data.data.role || "");
          setName(data.data.name || "");
          setEmail(data.data.email || "");
          setTelephone(data.data.telephone || "");
          setDentistId(data.data.dentist_id || "");
        })
        .catch((err) => {
          console.error("Error fetching user:", err);
          setError("Failed to load user data");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [session, params.uid]);

  const handleRoleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newRole = event.target.value as string;
    setRole(newRole);
  };

  const handleDentistIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDentistId(event.target.value);
  };

  const handleEditUser = async () => {
    if (!role) {
      setError("Please select a role");
      setOpenSnackbar(true);
      return;
    }
  
    if (!session?.user?.token) {
      setError("You must be logged in to edit user");
      setOpenSnackbar(true);
      return;
    }
  
    setSubmitting(true);
    setError(null);
    setSuccess(null);
  
    try {
      await updateUser(session.user.token, params.uid, role, 
        role === 'dentist' && dentistId ? dentistId : undefined);
      setSuccess("User updated successfully!");
      setOpenSnackbar(true);
      
      setTimeout(() => {
        router.push("/manage");
      }, 2000);
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Failed to update user. Please try again.");
      setOpenSnackbar(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <CircularProgress size={60} thickness={4} sx={{ color: '#4AA3BA' }} />
      </div>
    );
  }

  if (error && !userJson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card sx={{ maxWidth: 500, textAlign: 'center', borderRadius: 2, boxShadow: 3 }}>
          <CardContent sx={{ padding: 4 }}>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <Typography variant="h5" component="h2" color="error" gutterBottom>
              Error
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Link href="/manage">
              <Button 
                variant="contained" 
                sx={{ 
                  bgcolor: '#4AA3BA', 
                  '&:hover': { bgcolor: '#3b8294' },
                  borderRadius: '24px',
                  px: 3
                }}
              >
                Return to Manage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="w-full bg-gray-100 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Edit User</h1>
        <div className="mt-2 text-sm text-gray-600">
          <Link href="/manage" className="hover:text-blue-600">Manage</Link>{" "}
          / <span>Edit User</span>
        </div>
      </div>

      {/* Centered Main Content */}
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          px: 2
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 600, textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Edit User: <span style={{ color: '#4AA3BA' }}>{name}</span>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Update user information and access level
          </Typography>
        </Box>

        <Card sx={{ 
          borderRadius: 2, 
          boxShadow: 1, 
          overflow: 'hidden', 
          width: '100%',
          maxWidth: 500
        }}>
          {/* User Information Section */}
          <Box sx={{ bgcolor: '#f8fafc', py: 3, px: 4, borderBottom: '1px solid #e2e8f0' }}>
            <Typography variant="h6" gutterBottom color="text.secondary">
              User Information
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, my: 2 }}>
              <div>
                <Typography variant="subtitle2" color="text.secondary">User ID</Typography>
                <Typography variant="body1" fontWeight="medium">{params.uid}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                <Typography variant="body1" fontWeight="medium">{name}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1" fontWeight="medium">{email}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="text.secondary">Telephone</Typography>
                <Typography variant="body1" fontWeight="medium">{telephone}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="text.secondary">Current Role</Typography>
                <Typography variant="body1" fontWeight="medium" className="capitalize">
                  {userJson?.data?.role || "User"}
                </Typography>
              </div>
            </Box>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Update User Role
            </Typography>
            
            <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                value={role}
                onChange={(e) => setRole(e.target.value as string)}
                label="Role"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e2e8f0',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4AA3BA',
                  },
                }}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="dentist">Dentist</MenuItem>
                <MenuItem value="banned">Banned</MenuItem>
              </Select>
            </FormControl>
            
            {role === 'dentist' && (
              <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                <TextField
                  id="dentist-id"
                  label="Dentist ID"
                  value={dentistId}
                  onChange={handleDentistIdChange}
                  variant="outlined"
                  helperText="Required for dentist role"
                  required
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e2e8f0',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4AA3BA',
                    },
                  }}
                />
              </FormControl>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                component={Link}
                href="/manage"
                variant="outlined"
                sx={{ 
                  borderColor: '#e2e8f0', 
                  color: 'text.secondary',
                  '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
                  borderRadius: '24px',
                  px: 3
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditUser}
                disabled={submitting}
                variant="contained"
                sx={{ 
                  bgcolor: '#4AA3BA', 
                  '&:hover': { bgcolor: '#3b8294' },
                  '&.Mui-disabled': { bgcolor: '#9ca3af' },
                  borderRadius: '24px',
                  px: 4
                }}
              >
                {submitting ? (
                  <>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    Updating...
                  </>
                ) : "Update User"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
      
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={success ? "success" : "error"} 
          sx={{ width: '100%' }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </main>
  );
}