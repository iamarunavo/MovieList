import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const validatePassword = () => {
        if (password.length < 6) {
            return 'Password should be at least 6 characters long';
        }
        if (password !== confirmPassword) {
            return 'Passwords do not match';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate password
        const passwordError = validatePassword();
        if (passwordError) {
            setError(passwordError);
            return;
        }

        setLoading(true);
        try {
            await signup(email, password);
            navigate('/');
        } catch (error) {
            setError(error.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithGoogle();
            navigate('/');
        } catch (error) {
            setError(error.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Create Account</h2>
                <p className="auth-subtitle">Join LaxMovies today</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Create a password"
                            disabled={loading}
                        />
                        <small className="form-hint">Must be at least 6 characters long</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Confirm your password"
                            disabled={loading}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="auth-button primary" 
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="auth-button google"
                        disabled={loading}
                    >
                        <svg className="google-icon" width="18" height="18" viewBox="0 0 18 18">
                            <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" fill="#4285F4"/>
                            <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" fill="#34A853"/>
                            <path d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z" fill="#FBBC05"/>
                            <path d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp; 