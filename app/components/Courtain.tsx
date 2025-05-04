"use client";
import { useState, useEffect } from "react";

export default function Courtain({ isLoaded }: { isLoaded: boolean }) {
  return (
    <div
      id="courtain"
      className={`w-full h-full pattern fixed z-[100] top-0 left-0 flex justify-center items-center transition-transform duration-300 ${
        isLoaded ? "transform translate-y-[120%]" : "transform translate-y-0"
      }`}
    ></div>
  );
}
