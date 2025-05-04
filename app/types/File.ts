export type CustomFile = {
  [x: string]: any;
  type: "Image" | "Video" | "Audio" | "Other";
  size: string;
  date: string;
  location: string;
  url: string;
  favorite: boolean;
};

export const fileTypes = ["All", "Image", "Video ", "Audio", "Other"];
