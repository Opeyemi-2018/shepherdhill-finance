"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ClipLoader } from "react-spinners";

const Home = () => {
  const router = useRouter();
  useEffect(() => {
    router.push("/sign-in");
  });
  return (
    <div className="flex items-center justify-center min-h-screen">
      <ClipLoader size={50} color="#FAB435" />
    </div>
  );
};

export default Home;
