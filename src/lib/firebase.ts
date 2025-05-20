// // src/lib/firebase.ts
// import { initializeApp } from "firebase/app";
// import { getMessaging } from "firebase/messaging";

// const base64Config = process.env.VITE_FIREBASE_CONFIG;

// if (!base64Config) {
//     throw new Error("Firebase config not found in environment variables");
// }

// const decodedConfig = JSON.parse(
//     atob(base64Config) // browser-compatible base64 decode instead of Buffer
// );

// export const app = initializeApp(decodedConfig);

// export const messaging =
//     typeof window !== "undefined" ? getMessaging(app) : null;
