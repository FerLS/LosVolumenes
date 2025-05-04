import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FolderPlusIcon, MinusIcon, PlusIcon } from "lucide-react";
import UploadFiles from "./UploadFile";

import { useState } from "react";
import {
  DialogClose,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { code } from "../fonts/fonts";
import CreateFolder from "./CreateFolder";

const FormSchema = z.object({
  folderName: z
    .string()
    .nonempty({ message: "El nombre de la carpeta no puede estar vacío" })
    .min(3, {
      message: "El nombre de la carpeta debe tener al menos 3 caracteres",
    })
    .max(20, {
      message: "El nombre de la carpeta no puede tener más de 20 caracteres",
    }),
});

export default function CreateNew({
  fetchData,
  createFolder,
  currentFolder,
}: {
  fetchData: Function;
  createFolder: Function;
  currentFolder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex justify-end items-center    overflow-hidden">
      <motion.div
        className="flex  bg-secondary rounded-l-full pl-4 "
        initial={{ x: 100 }}
        animate={{ x: isOpen ? 5 : 100 }}
        transition={{ duration: 0.3 }}
      >
        <UploadFiles fetchData={fetchData} currentFolder={currentFolder} />

        <CreateFolder
          fetchData={fetchData}
          createFolder={createFolder}
          currentFolder={currentFolder}
        />
      </motion.div>

      <Button
        size="icon"
        className="z-30 opacity-100 bg-primary/100 hover:bg-primary/100"
        onClick={() => setIsOpen(!isOpen)}
      >
        {!isOpen ? (
          <PlusIcon className="h-5 w-5" />
        ) : (
          <MinusIcon className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
