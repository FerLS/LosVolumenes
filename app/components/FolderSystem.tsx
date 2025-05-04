import { ChevronRight } from "lucide-react";
import { code } from "../fonts/fonts";

export default function FolderSystem({
  currentFolder,
  updateCurrentFolder,
  viewMode,
}: {
  currentFolder: string;
  updateCurrentFolder: Function;
  viewMode: "grid" | "list" | "turntable";
}) {
  return (
    <div
      className="h-10 mx-4 mr-10 flex overflow-hidden text-sm"
      style={{ fontFamily: code.style.fontFamily }}
    >
      {viewMode === "grid" ? (
        <>
          {currentFolder.split("/").map((folder, index, array) => {
            if (index < array.length - 3 && array.length > 4) {
              return index === array.length - 4 ? (
                <div key={index} className="flex items-center">
                  ...
                  <ChevronRight className="mx-1" />
                </div>
              ) : null;
            }
            return (
              <div
                key={index}
                className="flex items-center cursor-pointer"
                onClick={() => {
                  if (array.length > 2) {
                    const path = array.slice(0, index + 1).join("/");
                    if (path === "") return;
                    updateCurrentFolder(path, true);
                  }
                }}
              >
                <span className="truncate">{folder}</span>
                {index < array.length - 1 && <ChevronRight className="mx-1" />}
              </div>
            );
          })}
        </>
      ) : (
        <div className="flex items-center mx-4 italic opacity-50">
          <ChevronRight />
          Carpetas en modo Grid
        </div>
      )}
    </div>
  );
}
