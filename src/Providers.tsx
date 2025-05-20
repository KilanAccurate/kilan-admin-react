import type { ReactNode } from "react";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./context/AuthContext";
import { GlobalProvider } from "./context/GlobalContext";
// import FCMHandler from "./components/FCMHandler";

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <GlobalProvider>
            <AuthProvider>
                {/* <FCMHandler /> */}
                <Toaster />
                {children}
            </AuthProvider>
        </GlobalProvider>
    );
}
