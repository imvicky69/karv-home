import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth, storage, db } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { getInitials } from '../../utils/avatar';
import { FiUser, FiMail, FiLogOut, FiEdit2, FiCamera, FiPhone, FiMapPin, FiUserCheck, FiCalendar, FiBriefcase, FiSave, FiX } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import type { Profile } from '../../types/profile';

const TenantProfilePage = () => {
  const { currentUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      
      try {
        const profileDoc = await getDoc(doc(db, 'profiles', currentUser.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as Profile);
        } else {
          // Create default profile
          const defaultProfile: Profile = {
            uid: currentUser.uid,
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };
          await setDoc(doc(db, 'profiles', currentUser.uid), defaultProfile);
          setProfile(defaultProfile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  // --- LOGOUT HANDLER ---
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // No need to navigate, our router in App.tsx will handle it automatically
      toast.success("You have been logged out.");
    } catch {
      toast.error("Failed to log out. Please try again.");
    }
  };

  // --- CHANGE PASSWORD HANDLER ---
  const handleChangePassword = async () => {
    if (currentUser?.email) {
      try {
        await sendPasswordResetEmail(auth, currentUser.email);
        toast.success("A password reset link has been sent to your email.");
  } catch {
    toast.error("Failed to send password reset email.");
  }
    } else {
      toast.error("No email associated with this account.");
    }
  };

  // --- PROFILE PICTURE UPLOAD HANDLER ---
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    setIsUploading(true);
    const storageRef = ref(storage, `profile_pictures/${currentUser.uid}`);

    try {
      // Upload the file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, file);
      // Get the public URL of the uploaded file
      const photoURL = await getDownloadURL(snapshot.ref);

      // Update the user's profile in Firebase Authentication
      await updateProfile(currentUser, { photoURL });
      
      toast.success("Profile picture updated!");
      // This will force a re-render with the new image, but a page refresh is sometimes needed for auth state to fully update
      // A more advanced solution uses state management to update the UI instantly. For now, this is robust.
      window.location.reload(); 

    } catch {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  const handleEditProfile = () => {
    setIsEditing(true);
    setEditedProfile(profile || {});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedProfile({});
  };

  const handleSaveProfile = async () => {
    if (!currentUser || !profile) return;

    try {
      const updatedProfile = {
        ...profile,
        ...editedProfile,
        updatedAt: Timestamp.now(),
      };
      await updateDoc(doc(db, 'profiles', currentUser.uid), updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      setEditedProfile({});
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleInputChange = (field: keyof Profile, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <motion.div 
        className="flex items-center justify-center min-h-[400px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold font-secondary mb-8">My Profile</h1>
      
      <div className="flex flex-col items-center">
        {/* --- AVATAR SECTION --- */}
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center text-white text-5xl font-bold ring-4 ring-primary/20">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span>{getInitials(currentUser?.displayName)}</span>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-surface p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
            title="Change profile picture"
          >
            <FiCamera className="text-primary" />
          </button>
          <input 
            type="file"
            accept="image/png, image/jpeg"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        {isUploading && <p className="text-text-secondary mb-4">Uploading...</p>}

        {/* --- PROFILE DETAILS CARD --- */}
        <Card className="w-full max-w-2xl mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Personal Information</h2>
            {!isEditing ? (
              <button 
                onClick={handleEditProfile}
                className="flex items-center text-primary hover:text-primary-dark"
              >
                <FiEdit2 className="mr-2" />
                Edit
              </button>
            ) : (
              <div className="flex space-x-2">
                <button 
                  onClick={handleSaveProfile}
                  className="flex items-center text-green-600 hover:text-green-700"
                >
                  <FiSave className="mr-2" />
                  Save
                </button>
                <button 
                  onClick={handleCancelEdit}
                  className="flex items-center text-red-600 hover:text-red-700"
                >
                  <FiX className="mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <FiUser className="text-primary mr-3" size={20} />
              <div>
                <p className="text-sm text-text-secondary">Full Name</p>
                <p className="font-semibold">{profile?.displayName || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiMail className="text-primary mr-3" size={20} />
              <div>
                <p className="text-sm text-text-secondary">Email Address</p>
                <p className="font-semibold">{profile?.email || 'N/A'}</p>
              </div>
            </div>
            
            {isEditing ? (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm text-text-secondary mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editedProfile.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-text-secondary mb-1">Address</label>
                  <textarea
                    value={editedProfile.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your address"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editedProfile.dateOfBirth || ''}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Unit Type</label>
                  <select
                    value={editedProfile.unitType || ''}
                    onChange={(e) => handleInputChange('unitType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select unit type</option>
                    <option value="shop">Shop</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="library">Library</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Lease Start Date</label>
                  <input
                    type="date"
                    value={editedProfile.leaseStartDate || ''}
                    onChange={(e) => handleInputChange('leaseStartDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Lease End Date</label>
                  <input
                    type="date"
                    value={editedProfile.leaseEndDate || ''}
                    onChange={(e) => handleInputChange('leaseEndDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <FiPhone className="text-primary mr-3" size={20} />
                  <div>
                    <p className="text-sm text-text-secondary">Phone Number</p>
                    <p className="font-semibold">{profile?.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FiCalendar className="text-primary mr-3" size={20} />
                  <div>
                    <p className="text-sm text-text-secondary">Date of Birth</p>
                    <p className="font-semibold">{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FiBriefcase className="text-primary mr-3" size={20} />
                  <div>
                    <p className="text-sm text-text-secondary">Unit Type</p>
                    <p className="font-semibold">{profile?.unitType ? profile.unitType.charAt(0).toUpperCase() + profile.unitType.slice(1) : 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FiUserCheck className="text-primary mr-3" size={20} />
                  <div>
                    <p className="text-sm text-text-secondary">Lease Start</p>
                    <p className="font-semibold">{profile?.leaseStartDate ? new Date(profile.leaseStartDate).toLocaleDateString() : 'Not provided'}</p>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center">
                  <FiMapPin className="text-primary mr-3" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-text-secondary">Address</p>
                    <p className="font-semibold">{profile?.address || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FiCalendar className="text-primary mr-3" size={20} />
                  <div>
                    <p className="text-sm text-text-secondary">Lease End</p>
                    <p className="font-semibold">{profile?.leaseEndDate ? new Date(profile.leaseEndDate).toLocaleDateString() : 'Not provided'}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* --- ACTION BUTTONS --- */}
        <div className="w-full max-w-md space-y-3">
          <button 
            onClick={handleChangePassword}
            className="w-full flex items-center justify-center font-semibold bg-white border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition-colors"
          >
            <FiEdit2 className="mr-3" />
            Change Password
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center font-semibold text-danger bg-danger/10 rounded-lg py-3 px-4 hover:bg-danger/20 transition-colors"
          >
            <FiLogOut className="mr-3" />
            Logout
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TenantProfilePage;