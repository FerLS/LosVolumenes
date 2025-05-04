"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CloudApp() {
  const router = useRouter();

  useEffect(() => {
    router.push("/main");
  }, []);
}
