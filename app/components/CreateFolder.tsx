import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FolderPlusIcon, MinusIcon, PlusIcon } from "lucide-react";

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

import { useMediaQuery } from "react-responsive";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      folderName: "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsDialogOpen(false);
    await createFolder(data.folderName);
  };

  return (
    <div className="flex justify-end items-center min-w-full    overflow-hidden">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          {isDesktop ? (
            <Button
              variant="outline"
              className="w-full min-w-full  "
              onClick={() => {
                setIsDialogOpen(!isDialogOpen);
                form.reset();
              }}
            >
              <FolderPlusIcon className="h-5 w-5" />
              Crear carpeta
            </Button>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              className="w-full mr-4"
              onClick={() => {
                setIsDialogOpen(!isDialogOpen);
                form.reset();
              }}
            >
              <FolderPlusIcon className="h-5 w-5" />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent
          style={{ fontFamily: code.style.fontFamily }}
          className="text-xl w-[80%] transition-all rounded-xl p-4 max-h-[80vh] overflow-y-scroll overflow-x-hidden flex flex-col "
        >
          <DialogTitle>Crear nueva carpeta</DialogTitle>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6"
            >
              <FormField
                control={form.control}
                name="folderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lo que tu quieras</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la carpeta" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Crear</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="w-1"></div>
    </div>
  );
}
