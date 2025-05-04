import axios from "axios";
import { useState, useEffect } from "react";

export default function TxtFileViewer({
  fileUrl,
  className,
}: {
  fileUrl: string;
  className?: string;
}) {
  const [fileContent, setFileContent] = useState("");

  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        const response = await axios.get(`/api/file?url=${fileUrl}`);

        const text = await response.data;
        setFileContent(text);
      } catch (error) {
        if (error instanceof Error) {
          setFileContent(error.message);
        } else {
          setFileContent("An unknown error occurred");
        }
      }
    };

    if (fileUrl) {
      fetchFileContent();
    }
  }, [fileUrl]);

  return <p className={className}>{fileContent}</p>;
}
