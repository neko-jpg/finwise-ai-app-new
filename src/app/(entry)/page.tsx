
'use client';

import { AuthDialog } from "@/components/finwise/auth-dialog";
import { useAuthState } from "@/hooks/use-auth-state";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

export default function EntryPage() {
    const { user, loading } = useAuthState();
    const router = useRouter();
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.replace('/app');
            } else {
                setDialogOpen(true);
            }
        }
    }, [user, loading, router]);
    
    const handleSignin = () => {
        // The useEffect will handle the redirect
        setDialogOpen(false);
    };

    if (loading || user) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background dark">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">読み込み中...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="dark">
            <div className="w-screen h-screen bg-gradient-to-b from-mk-bg-1 to-mk-bg-2" />
            <AuthDialog 
                open={dialogOpen} 
                onOpenChange={(open) => {
                    if (!open) {
                        router.push('/'); // Go back to landing if dialog is closed
                    }
                    setDialogOpen(open)
                }} 
                onSignin={handleSignin}
            />
        </div>
    );
}
