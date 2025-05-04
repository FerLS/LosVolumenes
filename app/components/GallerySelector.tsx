import { Button } from "@/components/ui/button";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { ImagePlus, PlusIcon } from "lucide-react";

const GallerySelector = () => {
  const openGallery = async () => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos, // Esto abre la galería
    });
    console.log("Imagen seleccionada:", image.base64String);
  };

  return (
    <Button size="icon" onClick={openGallery}>
      <ImagePlus className="h-5 w-5" />
    </Button>
  );
};

export default GallerySelector;
