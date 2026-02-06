import Image from "next/image";
import { ReactNode } from "react";
const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-screen flex items-center ">
      <div className="hidden md:inline h-full w-[372px] bg-[url('/auth-image.svg')] bg-cover bg-center object-cover">
        <h1 className="text-white font-regular text-[40px] text-center pt-28 leading-10">
          Professional Approach to Security
        </h1>
      </div>
      <div className="w-full flex items-center justify-center px-3  ">{children}</div>
    </div>
  );
};

export default AuthLayout;
