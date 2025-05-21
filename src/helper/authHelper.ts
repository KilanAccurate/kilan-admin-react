export const logoutHandler = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Optionally reload page or redirect to login
    window.location.href = '/login';
};
