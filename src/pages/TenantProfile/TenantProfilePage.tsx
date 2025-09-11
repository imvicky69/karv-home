import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { toast } from 'react-toastify';
import { getInitials } from '../../utils/avatar';
import { FiUser, FiMail, FiLogOut, FiEdit2, FiCamera } from 'react-icons/fi';
import Card from '../../components/ui/Card';

const TenantProfilePage = () => {
  const { currentUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div>
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
            className="hidden" // The input is hidden, we trigger it with the button
          />
        </div>
        {isUploading && <p className="text-text-secondary mb-4">Uploading...</p>}

        {/* --- USER DETAILS CARD --- */}
        <Card className="w-full max-w-md">
          <div className="space-y-4">
            <div className="flex items-center">
              <FiUser className="text-primary mr-4" size={20} />
              <div>
                <p className="text-sm text-text-secondary">Full Name</p>
                <p className="font-semibold">{currentUser?.displayName || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiMail className="text-primary mr-4" size={20} />
              <div>
                <p className="text-sm text-text-secondary">Email Address</p>
                <p className="font-semibold">{currentUser?.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* --- ACTION BUTTONS --- */}
        <div className="w-full max-w-md mt-6 space-y-3">
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
    </div>
  );
};

export default TenantProfilePage;