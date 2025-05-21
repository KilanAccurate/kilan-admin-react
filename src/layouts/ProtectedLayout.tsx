import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, isLoading } = useAuth();

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
        </div>
    );

    if (!isLoggedIn) return <Navigate to="/login" replace />;

    return <>{children}</>;
}
