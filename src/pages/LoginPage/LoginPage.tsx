import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FcGoogle } from 'react-icons/fc';
import { motion } from 'framer-motion'; // Import motion for animations

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail, // Import the function for password reset
} from "firebase/auth";
import { auth } from '../../firebase';

// Import your logo
import logo from '../../assets/logo.png';

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- HANDLERS ---

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!");
      navigate('/');
    } catch {
      setError("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Signed in with Google!");
      navigate('/');
    } catch {
      setError("Failed to sign in with Google.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (e) {
      const err = e as { code?: string } | undefined;
      if (err?.code === 'auth/user-not-found') {
        toast.error("No user found with this email address.");
      } else {
        toast.error("Failed to send reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      {/* Use motion.div to animate the entire card on load */}
      <motion.div 
        className="w-full max-w-sm p-8 space-y-6 bg-surface rounded-2xl shadow-xl"
        initial={{ opacity: 0, y: 20 }} // Start invisible and slightly down
        animate={{ opacity: 1, y: 0 }}   // Animate to visible and original position
        transition={{ duration: 0.5 }}   // Animation duration
      >
        {/* Logo */}
        <div className="flex justify-center">
          <img src={logo} alt="KARV Logo" className="w-32" />
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary">Welcome Back</h2>
          <p className="text-text-secondary">Sign in to continue to your dashboard</p>
        </div>
        
        {/* Main Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="input-field w-full"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="input-field w-full"
            required
          />

          {/* Forgot Password Button */}
          <div className="text-right">
            <button
              type="button" // Important: type="button" to prevent form submission
              onClick={handleForgotPassword}
              className="text-sm font-medium text-primary hover:underline focus:outline-none"
            >
              Forgot Password?
            </button>
          </div>

          <motion.button 
            type="submit" 
            disabled={isLoading} 
            className="w-full button-primary"
            whileHover={{ scale: 1.03 }} // Animate button on hover
            whileTap={{ scale: 0.98 }}   // Animate button on click
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </motion.button>
        </form>

        {/* Separator */}
        <div className="flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-text-secondary text-sm">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Google Sign-in Button */}
        <motion.button 
          onClick={handleGoogleSignIn} 
          disabled={isLoading} 
          className="w-full flex items-center justify-center font-semibold bg-white border border-gray-300 rounded-lg shadow-sm py-3 px-4 hover:bg-gray-50 transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
            <FcGoogle size={22} className="mr-3" />
            Sign in with Google
        </motion.button>

        {error && <p className="text-sm text-danger text-center font-medium mt-4">{error}</p>}
      </motion.div>
    </div>
  );
};

export default LoginPage;