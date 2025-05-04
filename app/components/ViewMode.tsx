import { Button } from "@/components/ui/button";
import { Disc, Grid, List, Sparkle } from "lucide-react";

interface ViewModeNavProps {
  viewMode: "grid" | "list" | "turntable";
  setViewMode: (viewMode: "grid" | "list" | "turntable") => void;
  currentFileType: string;
}

export function ViewModeNav({
  viewMode,
  setViewMode,
  currentFileType,
}: ViewModeNavProps) {
  return (
    <nav className="p-4  flex justify-center items-center">
      <div className="flex space-x-2 items-start w-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setViewMode("grid")}
          className={viewMode === "grid" ? "bg-primary hover:bg-primary" : ""}
        >
          <Grid
            className={`h-5 w-5 ${
              viewMode === "grid" ? "stroke-secondary" : ""
            }`}
          />
        </Button>
        {currentFileType != "All" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("turntable")}
            className={
              viewMode === "turntable" ? "bg-primary hover:bg-primary" : ""
            }
          >
            <Sparkle
              className={`"h-5 w-5 text-white ${
                viewMode === "turntable" ? "stroke-secondary" : ""
              }`}
            />
          </Button>
        )}
      </div>
    </nav>
  );
}
