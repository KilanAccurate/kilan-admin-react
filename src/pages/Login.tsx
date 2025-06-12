import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // React Router hook instead of Next.js useRouter
import { EyeIcon, EyeOffIcon, Loader2, AlertTriangle } from 'lucide-react';
import { Label } from '@radix-ui/react-label';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from 'src/components/ui/card';
import { Input } from 'src/components/ui/input';
import { useAuth } from 'src/context/AuthContext';
import { useGlobalContext } from 'src/context/GlobalContext';
import { ApiService } from 'src/service/ApiService';
import { ApiEndpoints } from 'src/service/Endpoints';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';

export default function Login() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [siteLocation, setSiteLocation] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { login, isLoggedIn, isLoading: isAuthLoading } = useAuth();
    const { sites, isLoading } = useGlobalContext();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate(); // React Router hook

    useEffect(() => {
        if (!isAuthLoading && isLoggedIn) {
            navigate('/', { replace: true }); // redirect to home page after login
        }
    }, [isAuthLoading, isLoggedIn, navigate]);

    const handleLogin = async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            const res = await ApiService.post(ApiEndpoints.AUTH_LOGIN, {
                fullName: name,
                password,
                site: siteLocation,
                isAdmin: true,
            });

            const userData = res.data.data;
            if (userData.token) {
                login(userData);
                setLoading(false);
            }
        } catch (err) {
            setLoading(false);

            if (
                err &&
                typeof err === 'object' &&
                'data' in err &&
                err.data &&
                typeof err.data === 'object' &&
                'message' in err.data &&
                typeof (err.data as { message?: unknown }).message === 'string'
            ) {
                setErrorMessage((err.data as { message: string }).message);
            } else {
                setErrorMessage('Login failed');
            }
        }
    };

    if (isLoading || isAuthLoading || isLoggedIn) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
            </div>
        );
    }

    return (
        <Card className="max-w-md mx-auto mt-20 shadow-lg">
            <CardHeader className="text-center">
                <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-primary"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>
                <h2 className="text-lg font-medium mt-2">Login</h2>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {errorMessage && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-100 p-2 rounded-md">
                        <AlertTriangle className="h-4 w-4" />
                        {errorMessage}
                    </div>
                )}
            </CardContent>

            <CardFooter>
                <Button onClick={handleLogin} className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : null} {loading ? 'Logging in...' : 'Sign In'}
                </Button>
            </CardFooter>
        </Card>
    );
}
