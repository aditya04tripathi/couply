"use client";

import { store, persistor } from "../store";
import { Provider } from "react-redux";
import React, { useEffect } from "react";
import { Toaster } from "sonner";
import { PersistGate } from "redux-persist/integration/react";
import { auth } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user && (!window.location.pathname.includes("/login") || !window.location.pathname.includes("/signup"))) {
        router.push("/login");
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
        <Toaster />
      </PersistGate>
    </Provider>
  );
};

export default Providers;
