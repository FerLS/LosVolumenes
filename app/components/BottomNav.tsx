import { Button } from "@/components/ui/button";
import {
  Image,
  Video,
  Music,
  FileText,
  BookMarked,
  Layout,
  LayoutGrid,
  Film,
} from "lucide-react";

interface BottomNavProps {
  currentFileType: string;
  setCurrentFileType: (fileType: string) => void;
  setViewMode: (viewMode: "grid" | "list" | "turntable") => void;
  fetchData: Function;
}

// Get gradient class based on file type
const getFileTypeGradient = (type: string) => {
  switch (type) {
    case "Image":
      return "from-secondary to-[hsl(var(--chart-1))]";
    case "Video":
      return "from-secondary to-[hsl(var(--chart-2))]";
    case "Audio":
      return "from-secondary to-[hsl(var(--chart-3))]";
    case "Other":
      return "from-secondary to-[hsl(var(--chart-4))]";
    default:
      return "from-secondary to-primary/80";
  }
};

export default function BottomNav({
  currentFileType,
  setCurrentFileType,
  fetchData,
  setViewMode,
}: BottomNavProps) {
  const fileTypes = [
    { name: "All", icon: LayoutGrid },
    { name: "Image", icon: Image },
    { name: "Video", icon: Film },
    { name: "Audio", icon: Music },
    { name: "Other", icon: BookMarked },
  ];

  return (
    <nav className="via-20% p-8 flex justify-center items-center sticky bottom-0 w-full z-40 drop-shadow-lg">
      <div className="flex justify-between w-full bg-secondary rounded-3xl h-16 items-center">
        {fileTypes.map((type) => (
          <Button
            key={type.name}
            variant="ghost"
            onClick={() => {
              setCurrentFileType(type.name);
              fetchData(type.name);
              if (type.name === "All") {
                setViewMode("grid");
              }
            }}
            className={`rounded-3xl p-8 w-12 h-12 -shadow-lg flex flex-col space-y-2 transition-all opacity-100 focus:opacity-100 ${
              currentFileType === type.name
                ? `-translate-y-2 bg-gradient-to-r ${getFileTypeGradient(
                    type.name
                  )} `
                : "bg-transparent hover:bg-transparent"
            }`}
          >
            <type.icon
              className={`min-h-6 min-w-6 text-white transition-colors stroke-white`}
            />
          </Button>
        ))}
      </div>
    </nav>
  );
}
