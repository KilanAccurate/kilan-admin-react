// pages/Home.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/context/AuthContext';

function Home() {
    const { isLoggedIn, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading) {
            if (isLoggedIn) {
                navigate('/admin/users', { replace: true });
            } else {
                navigate('/login', { replace: true });
            }
        }
    }, [isLoading, isLoggedIn, navigate]);

    return null; // Or a loading spinner while checking
}

export default Home;
