// // src/hooks/useFCM.ts

// import { useEffect } from "react";
// import { getMessaging, getToken as firebaseGetToken, onMessage } from "firebase/messaging";
// import { toast } from "sonner";
// import { useAuth } from "src/context/AuthContext";
// import { app } from "src/lib/firebase";
// import { ApiService } from "src/service/ApiService";
// import { ApiEndpoints } from "src/service/Endpoints";

// const vapidKey = import.meta.env.VITE_VAPID_KEY ?? ''; // For Vite
// // For CRA users: const vapidKey = process.env.REACT_APP_VAPID_KEY ?? '';

// export function useFCM() {
//     const { isLoggedIn, isLoading: isAuthLoading } = useAuth();

//     useEffect(() => {
//         if (typeof window === "undefined") return;
//         if (isAuthLoading || !isLoggedIn) return;

//         const messaging = getMessaging(app);

//         async function registerToken() {
//             try {
//                 const permission = await Notification.requestPermission();
//                 if (permission !== "granted") {
//                     console.log("Notification permission not granted");
//                     return;
//                 }

//                 const currentToken = await getToken(messaging, { vapidKey });
//                 if (currentToken) {
//                     const now = new Date().toISOString();
//                     await ApiService.put(ApiEndpoints.UPDATEFCM, {
//                         fcmToken: currentToken,
//                         fcmTokenIssuedAt: now,
//                     });
//                     console.log("FCM Token registered:", currentToken);
//                 } else {
//                     console.log("No registration token available.");
//                 }
//             } catch (err) {
//                 console.error("Error getting FCM token", err);
//             }
//         }

//         registerToken();

//         const unsubscribeMessage = onMessage(messaging, (payload) => {
//             try {
//                 console.log("🔥 Foreground FCM received:", payload);
//                 const title = payload.notification?.title ?? payload.data?.title ?? "No title";
//                 const body = payload.notification?.body ?? payload.data?.body ?? "No body";
//                 toast(title, {
//                     description: body,
//                 });
//             } catch (e) {
//                 console.error("Error in onMessage handler:", e);
//             }
//         });

//         const intervalId = setInterval(() => {
//             registerToken();
//         }, 1000 * 60 * 60); // every 1 hour

//         return () => {
//             unsubscribeMessage();
//             clearInterval(intervalId);
//         };
//     }, [isLoggedIn, isAuthLoading]);
// }

// function getToken(messaging: any, { vapidKey }: { vapidKey: string }) {
//     return firebaseGetToken(messaging, { vapidKey });
// }
