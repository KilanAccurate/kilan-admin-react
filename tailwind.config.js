/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}", // adjust to your source folder
    ],
    darkMode: 'class', // you are using `.dark` class for dark mode
    theme: {
        extend: {},
    },
    plugins: [
        require('tw-animate-css'), // if this is an npm plugin you have installed
    ],
};
