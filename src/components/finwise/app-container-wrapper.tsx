
'use client';

import React from "react";
import { useAuthState } from "@/hooks/use-auth-state";
import { AppContainer } from "@/components/finwise/app-container";

export default function AppContainerWrapper({ children }: { children: React.ReactNode }) {
    const { user } = useAuthState();

    if (!user) {
        // This can be a loading spinner or some fallback UI
        return null;
    }
    
    return (
        <AppContainer user={user}>
            {children}
        </AppContainer>
    );
}
