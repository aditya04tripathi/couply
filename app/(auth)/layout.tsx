import Image from "next/image";
import React from "react";

export const metadata = {
  title: {
    default: "Couply | Authentication",
    template: "Couply | %s",
  },
  description: "Authentication page for Couply",
};

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      <div className="border rounded overflow-clip flex justify-start items-center w-[80%] h-[80%] bg-background">
        <Image src="https://picsum.photos/1080" alt="Auth Background" width={1080} height={1080} className="object-cover w-1/2 h-full border-r" />
        <div className="w-1/2 p-5">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
