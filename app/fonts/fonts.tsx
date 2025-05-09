import {
  Major_Mono_Display,
  Playfair_Display,
  Space_Mono,
} from "next/font/google";

export const major = Major_Mono_Display({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});
export const playfair = Playfair_Display({
  weight: "700",
  subsets: ["latin"],
  style: "italic",
  display: "swap",
});
export const code = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  style: "normal",
  display: "swap",
});

import localFont from "next/font/local";

export const Defectica = localFont({
  src: "Defectica.ttf",
  weight: "400",
  style: "normal",
  display: "swap",
});
