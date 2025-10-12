import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import api from '../services/api';
import { setUser, setLoading, logout } from '../store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          dispatch(setUser(response.data.user));
        } catch (error) {
          console.error('Token verification failed:', error);
          dispatch(logout());
        }
      } else {
        dispatch(setLoading(false));
      }
    };

    verifyToken();
  }, [token, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
