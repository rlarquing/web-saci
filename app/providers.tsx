'use client'

import { useEffect } from "react";
import NextTopLoader from "nextjs-toploader";
import { UserProvider } from "@/contexts";
import { StoreContextProvider } from "@/contexts/store.context";

export function Providers({ children }: { children: React.ReactNode }) {
    // Registered only in production: an active worker would serve stale assets
    // and fight the dev server's hot reload.
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') return;
        if (!('serviceWorker' in navigator)) return;

        navigator.serviceWorker
            .register('/sw.js')
            .catch((error) => console.error('Service worker registration failed', error));
    }, []);

    return (
        <>
            <NextTopLoader
                color="#2299DD"
                initialPosition={0.08}
                crawlSpeed={200}
                height={3}
                crawl={true}
                showSpinner={false}
                easing="ease"
                speed={200}
                shadow="0 0 10px #2299DD,0 0 5px #2299DD"
                template='<div class="bar" role="bar"><div class="peg"></div></div>'
                zIndex={1600}
            />
            <StoreContextProvider>
                <UserProvider>
                    {children}
                </UserProvider>
            </StoreContextProvider>
        </>
    )
}
