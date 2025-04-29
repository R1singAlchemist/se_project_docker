'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import getUserProfile from '@/libs/getUserProfile';
import getDentist from '@/libs/getDentist';
import updateDentist from '@/libs/updateDentist';
import addDentistExpertise from '@/libs/addDentistExpertise';
import ExpertiseTagSelector from '@/components/ExpertiseTagSelector';
import { 
  CircularProgress, 
  TextField, 
  Button,
  Snackbar, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';

const expertiseOptions = [
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

export default function EditDentistProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dentistId, setDentistId] = useState<string>('');
  
  const [formData, setFormData] = useState<Partial<DentistData>>({
    name: '',
    area_expertise: [],
    year_experience: 0,
    StartingPrice: 0,
    picture: '',
    bio: ''
  });

  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);

  const [bio, setBio] = useState<string>('');
  const [bioCharCount, setBioCharCount] = useState<number>(0);
  const MAX_BIO_LENGTH = 150;

  const [originalData, setOriginalData] = useState<Partial<DentistData> | null>(null);

  useEffect(() => {
    const handleExpertiseTagsChange = (event: Event) => {
      const customEvent = event as CustomEvent<{id: string, tags: string[]}>;
      if (customEvent.detail && customEvent.detail.id === 'dentist-expertise-selector') {
        const newTags = customEvent.detail.tags;
        setSelectedExpertise(newTags);
        setFormData(prev => ({ ...prev, area_expertise: newTags }));
      }
    };

    window.addEventListener('expertise-tags-changed', handleExpertiseTagsChange);
    
    return () => {
      window.removeEventListener('expertise-tags-changed', handleExpertiseTagsChange);
    };
  }, []);

  useEffect(() => {
    async function fetchDentistProfile() {
      if (!session?.user?.token) {
        router.push('/signin');
        return;
      }

      try {
        setLoading(true);
        // Get the user profile to verify they are a dentist and get their dentist_id
        const userProfile = await getUserProfile(session.user.token);
        
        if (userProfile.data.role !== 'dentist' || !userProfile.data.dentist_id) {
          setError('You are not authorized to edit this profile');
          router.push('/');
          return;
        }

        setDentistId(userProfile.data.dentist_id);

        // Fetch the dentist data using the dentist_id from the user profile
        const dentistResponse = await getDentist(userProfile.data.dentist_id);
        if (dentistResponse.sucess && dentistResponse.data) {
          const dentistData = dentistResponse.data;
          const expertise = Array.isArray(dentistData.area_expertise) 
            ? dentistData.area_expertise 
            : [dentistData.area_expertise];
          
          setSelectedExpertise(expertise);
          setFormData({
            name: dentistData.name,
            area_expertise: expertise,
            year_experience: dentistData.year_experience,
            StartingPrice: dentistData.StartingPrice,
            picture: dentistData.picture,
            bio: dentistData.bio || ''
          });
          
          if (dentistData.bio) {
            setBio(dentistData.bio);
            setBioCharCount(dentistData.bio.length);
          }
          
          setOriginalData(dentistData);
        } else {
          setError('Failed to load dentist profile');
        }
      } catch (err) {
        console.error('Error fetching dentist profile:', err);
        setError('An error occurred while loading your profile');
      } finally {
        setLoading(false);
      }
    }

    fetchDentistProfile();
  }, [session, router]);

  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_BIO_LENGTH) {
      setBio(value);
      setBioCharCount(value.length);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.token || !dentistId) {
      setError('You must be logged in to update your profile');
      return;
    }

    try {
      setSaving(true);
      
      // Validate form data
      if (!formData.area_expertise || formData.area_expertise.length === 0) {
        setError('Please select at least one area of expertise');
        setSaving(false);
        return;
      }
      
      if (typeof formData.year_experience === 'number' && formData.year_experience < 0) {
        setError('Years of experience cannot be negative');
        setSaving(false);
        return;
      }
      
      if (typeof formData.StartingPrice === 'number' && formData.StartingPrice < 0) {
        setError('Starting price cannot be negative');
        setSaving(false);
        return;
      }
      
      console.log('Session user token:', session.user.token.slice(0, 10) + '...');
      console.log('Dentist ID:', dentistId);
      
      try {
        const updateData = {
          year_experience: formData.year_experience,
          StartingPrice: formData.StartingPrice,
          picture: formData.picture,
          area_expertise: formData.area_expertise,
          bio: bio // Add bio
        };
        
        console.log('Updating dentist profile with data:', updateData);
        console.log('Bio content to be saved:', bio);
        
        const result = await updateDentist(dentistId, session.user.token, updateData);
        console.log('Profile update result:', result);
        
        if (!result.success && JSON.stringify(formData.area_expertise) !== JSON.stringify(originalData?.area_expertise)) {
          console.log('Falling back to expertise-specific update...');
          const expertiseResult = await addDentistExpertise(
            dentistId, 
            session.user.token, 
            formData.area_expertise || []
          );
          console.log('Expertise update result:', expertiseResult);
        }
        
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          window.location.href = '/dentist/profile';
        }, 2000);
      } catch (updateError: any) {
        console.error('Update error:', updateError);
        setError(`Update failed: ${updateError.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(`An error occurred: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgress color="inherit" />
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
          <Link 
            href="/"
            className="mt-4 inline-block px-6 py-2 bg-[#4AA3BA] text-white rounded-md hover:bg-[#3b8294] transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const hasChanges = () => {
    if (!originalData) return false;
    
    return (
      formData.year_experience !== originalData.year_experience ||
      formData.StartingPrice !== originalData.StartingPrice ||
      formData.picture !== originalData.picture ||
      JSON.stringify(formData.area_expertise) !== JSON.stringify(originalData.area_expertise) ||
      bio !== (originalData.bio || '') 
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
        
        {/* Profile Photo Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden mr-6">
              <Image
                src={formData.picture || '/img/placeholder-dentist.jpg'}
                alt="Profile picture"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold">{formData.name}</h2>
              <p className="text-gray-600">@{formData.name}</p>
            </div>
            <div className="ml-auto">
              <button 
                className="bg-[#4AA3BA] hover:bg-[#3b8294] text-white px-4 py-2 rounded-md font-medium transition-colors"
                onClick={() => document.getElementById('pictureUrl')?.focus()}
              >
                Change Photo
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <TextField
              id="pictureUrl"
              label="Profile Image URL"
              variant="outlined"
              fullWidth
              name="picture"
              value={formData.picture || ''}
              onChange={handleInputChange}
              size="small"
              className="mt-2"
            />
          </div>
        </div>
        
        {/* Area of Expertise Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Area of expertise</h2>
          
          <ExpertiseTagSelector
            id="dentist-expertise-selector"
            selectedTags={selectedExpertise}
            buttonColor="#3b82f6"
            buttonHoverColor="#2563eb"
          />
        </div>
        
        {/* Years of Experience Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Years of experience</h2>
          <FormControl fullWidth>
            <TextField
              select
              label="Years of experience"
              value={formData.year_experience || 0}
              onChange={(e) => setFormData({...formData, year_experience: Number(e.target.value)})}
              variant="outlined"
              fullWidth
            >
              {Array.from({ length: 51 }, (_, i) => i).map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
        </div>
        
        {/* Starting Price Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Starting price</h2>
          <TextField
            label="Starting price (฿)"
            type="number"
            variant="outlined"
            fullWidth
            name="StartingPrice"
            value={formData.StartingPrice || 0}
            onChange={(e) => setFormData({...formData, StartingPrice: Number(e.target.value)})}
            InputProps={{
              inputProps: { min: 0, step: 100 }
            }}
          />
        </div>
        
        {/* Bio Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Bio</h2>
          <TextField
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={bio}
            onChange={handleBioChange}
            placeholder="Write something about yourself..."
            InputProps={{
              endAdornment: (
                <div className="absolute bottom-2 right-3 text-gray-400 text-sm">
                  {bioCharCount}/{MAX_BIO_LENGTH}
                </div>
              ),
            }}
          />
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <Button
            variant="contained"
            color="primary"
            disabled={!hasChanges() || saving}
            onClick={handleSubmit}
            style={{ 
              backgroundColor: hasChanges() && !saving ? '#4AA3BA' : '#9CA3AF',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '6px'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Success message */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Error message */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </main>
  );
}