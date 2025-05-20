import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, isLoading } = useAuth();

    if (isLoading) return <div>Loading...</div>;

    if (!isLoggedIn) return <Navigate to="/login" replace />;

    return <>{children}</>;
}
