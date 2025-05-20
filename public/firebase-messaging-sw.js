// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDpVW5B8sx7aPACM64xPxP5K8qGTFC7vYI",
    authDomain: "kilan-accurate.firebaseapp.com",
    projectId: "kilan-accurate",
    storageBucket: "kilan-accurate.firebasestorage.app",
    messagingSenderId: "396860509364",
    appId: "1:396860509364:web:fac9c5d31272e32a105be1",
    measurementId: "G-7RENG0SRP9"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const { title, body } = payload.notification || {};
    self.registration.showNotification(title || 'Notification', {
        body,
        icon: '/icon.png',
    });
});
