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
    <div className="flex flex-col items-center justify-center w-full h-screen p-4">
      <div className="border rounded overflow-clip flex flex-col lg:flex-row w-full max-w-4xl h-full bg-background items-center justify-center">
        <Image src="https://picsum.photos/1080" alt="Auth Background" width={1080} height={1080} className="object-cover w-full lg:w-1/2 h-64 lg:h-full border-b lg:border-r hidden lg:block" />
        <div className="w-full lg:w-1/2 p-5 flex items-center justify-center">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
