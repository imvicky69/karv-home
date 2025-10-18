import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth, storage, db } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, Timestamp, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { getInitials } from '../../utils/avatar';
import { FiUser, FiLogOut, FiEdit2, FiCamera, FiPhone, FiMapPin, FiUserCheck, FiCalendar, FiBriefcase, FiSave, FiX, FiHome } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Profile } from '../../types/profile';

const TenantProfilePage = () => {
  const { currentUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unitDetails, setUnitDetails] = useState<{ unitName: string; rentAmount: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      
      try {
        // Fetch profile
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

        // Fetch unit details
        const unitsQuery = query(
          collection(db, 'units'),
          where('currentTenantId', '==', currentUser.uid),
          limit(1)
        );
        const unitSnapshot = await getDocs(unitsQuery);
        
        if (!unitSnapshot.empty) {
          const unitData = unitSnapshot.docs[0].data();
          setUnitDetails({
            unitName: unitData.unitName,
            rentAmount: unitData.rentAmount
          });
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
    return <LoadingSpinner text="Loading profile..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold font-secondary mb-8">My Profile</h1>
      
      {/* Profile Header Card */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar Section */}
          <div className="relative">
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

          {/* Profile Summary */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-text-primary mb-2">{profile?.displayName || 'N/A'}</h2>
            <p className="text-text-secondary mb-4">{profile?.email || 'N/A'}</p>
            {unitDetails && (
              <div className="flex items-center justify-center md:justify-start space-x-4">
                <div className="flex items-center text-sm">
                  <FiHome className="text-primary mr-2" />
                  <span className="font-semibold">{unitDetails.unitName}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-text-secondary mr-1">Rent:</span>
                  <span className="font-semibold">₹{unitDetails.rentAmount}/month</span>
                </div>
              </div>
            )}
          </div>

          {/* Edit Button */}
          {!isEditing && (
            <Button
              onClick={handleEditProfile}
              variant="secondary"
              icon={FiEdit2}
            >
              Edit Profile
            </Button>
          )}
        </div>
        {isUploading && <p className="text-text-secondary text-center mt-4">Uploading...</p>}
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Personal Information Card */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <FiUser className="mr-2 text-primary" />
              Personal Information
            </h2>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editedProfile.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter phone number"
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
                <label className="block text-sm text-text-secondary mb-1">Address</label>
                <textarea
                  value={editedProfile.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your address"
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start">
                <FiPhone className="text-primary mr-3 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-text-secondary">Phone Number</p>
                  <p className="font-semibold">{profile?.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FiCalendar className="text-primary mr-3 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-text-secondary">Date of Birth</p>
                  <p className="font-semibold">{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FiMapPin className="text-primary mr-3 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-text-secondary">Address</p>
                  <p className="font-semibold">{profile?.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Lease Information Card */}
        <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FiBriefcase className="mr-2 text-primary" />
            Lease Information
          </h2>

          {isEditing ? (
            <div className="space-y-4">
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
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start">
                <FiBriefcase className="text-primary mr-3 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-text-secondary">Unit Type</p>
                  <p className="font-semibold">{profile?.unitType ? profile.unitType.charAt(0).toUpperCase() + profile.unitType.slice(1) : 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FiUserCheck className="text-primary mr-3 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-text-secondary">Lease Start</p>
                  <p className="font-semibold">{profile?.leaseStartDate ? new Date(profile.leaseStartDate).toLocaleDateString() : 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FiCalendar className="text-primary mr-3 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-text-secondary">Lease End</p>
                  <p className="font-semibold">{profile?.leaseEndDate ? new Date(profile.leaseEndDate).toLocaleDateString() : 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Action Buttons */}
      {isEditing ? (
        <div className="flex gap-3 mb-6">
          <Button
            onClick={handleSaveProfile}
            variant="primary"
            icon={FiSave}
            fullWidth
          >
            Save Changes
          </Button>
          <Button
            onClick={handleCancelEdit}
            variant="secondary"
            icon={FiX}
            fullWidth
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Button 
            onClick={handleChangePassword}
            variant="secondary"
            icon={FiEdit2}
            fullWidth
          >
            Change Password
          </Button>
          <Button 
            onClick={handleLogout}
            variant="danger"
            icon={FiLogOut}
            fullWidth
          >
            Logout
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default TenantProfilePage;