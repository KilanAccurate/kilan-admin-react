// src/components/FCMHandler.tsx
import React from "react";
import { useFCM } from "../hooks/useFCM";

export default function FCMHandler() {
    useFCM();
    return null; // This component just runs the hook, no UI
}
