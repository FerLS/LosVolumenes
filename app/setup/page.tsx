"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  CassetteTape,
  Database,
  User,
  HardDrive,
  ChevronRight,
  ChevronLeft,
  Check,
  Info,
  ArrowRight,
  Server,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { code, Defectica } from "../fonts/fonts";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from "react-responsive";

// Setup steps
const STEPS = [
  { id: "welcome", title: "Bienvenido" },
  { id: "database", title: "Base de Datos" },
  { id: "personalization", title: "Personalización" },
  { id: "complete", title: "Completado" },
];

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionType, setConnectionType] = useState<"string" | "advanced">(
    "string"
  );
  const router = useRouter();
  const { toast } = useToast();
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  // Form state
  const [formData, setFormData] = useState({
    // Database connection
    connectionString: "",
    host: "localhost",
    port: "27017",
    dbUsername: "",
    password: "",
    databaseName: "los_volumenes",
    authSource: "admin",

    // Personalization
    cloudName: "Los Volumenes",
    username: "",

    // Storage
    storageLimit: 30, // GB
  });

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Animation states
  const [animateProgress, setAnimateProgress] = useState(false);

  useEffect(() => {
    // Trigger progress animation when step changes
    setAnimateProgress(true);
    const timer = setTimeout(() => setAnimateProgress(false), 600);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleSliderChange = (value: number[]) => {
    setFormData({
      ...formData,
      storageLimit: value[0],
    });
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      // Database connection
      if (connectionType === "string") {
        if (!formData.connectionString) {
          newErrors.connectionString = "La cadena de conexión es obligatoria";
        } else if (
          !formData.connectionString.startsWith("mongodb://") &&
          !formData.connectionString.startsWith("mongodb+srv://")
        ) {
          newErrors.connectionString =
            "La cadena de conexión debe comenzar con mongodb:// o mongodb+srv://";
        }
      } else {
        if (!formData.host) newErrors.host = "El host es obligatorio";
        if (!formData.port) newErrors.port = "El puerto es obligatorio";
        if (!formData.databaseName)
          newErrors.databaseName =
            "El nombre de la base de datos es obligatorio";
      }
    } else if (currentStep === 2) {
      // Personalization
      if (!formData.cloudName)
        newErrors.cloudName = "El nombre de tu nube es obligatorio";
      if (!formData.username)
        newErrors.username = "El nombre de usuario es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      if (validateStep()) {
        if (currentStep === 1) {
          // Simulate testing database connection
          setIsLoading(true);
          try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            // Simulate successful connection
            toast({
              title: "Conexión exitosa",
              description: "Se ha establecido conexión con la base de datos",
              variant: "default",
            });
            setCurrentStep(currentStep + 1);
          } catch (error) {
            toast({
              title: "Error de conexión",
              description:
                "No se pudo conectar a la base de datos. Verifica tus credenciales.",
              variant: "destructive",
            });
          } finally {
            setIsLoading(false);
          }
        } else {
          setCurrentStep(currentStep + 1);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    // Save configuration and redirect to main page
    toast({
      title: "Configuración guardada",
      description: "Tu nube personal ha sido configurada correctamente",
      variant: "default",
    });

    // Redirect to main page after a short delay
    setTimeout(() => {
      router.push("/main");
    }, 1500);
  };

  const getAdvancedConnectionString = () => {
    const { host, port, dbUsername, password, databaseName, authSource } =
      formData;
    let connectionString = "mongodb://";

    if (dbUsername && password) {
      connectionString += `${dbUsername}:${password}@`;
    }

    connectionString += `${host}:${port}/${databaseName}`;

    if (dbUsername && password) {
      connectionString += `?authSource=${authSource}`;
    }

    return connectionString;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div
            className={`grid ${
              isMobile ? "grid-cols-1 gap-6" : "grid-cols-2 gap-8"
            } h-full`}
          >
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col h-full"
            >
              <Card className="border-border bg-card flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle>Bienvenido a Los Volumenes</CardTitle>
                  <CardDescription>
                    Tu nube personal para almacenar recuerdos
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                  <motion.div
                    className="p-8 bg-primary/10 rounded-full"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <CassetteTape
                      size={isMobile ? 48 : 64}
                      className="text-primary"
                    />
                  </motion.div>
                  <div>
                    <h1
                      className="text-2xl md:text-3xl font-bold text-foreground mb-2"
                      style={{ fontFamily: Defectica.style.fontFamily }}
                    >
                      Los Volumenes
                    </h1>
                    <p className="text-muted-foreground">
                      Vamos a configurar tu nube personal para que puedas
                      comenzar a almacenar tus recuerdos.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.97 }}>
                    <Button onClick={handleNext} className="w-full">
                      Comenzar configuración
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="flex flex-col h-full"
            >
              <Card className="border-border bg-card flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle>¿Qué necesitarás?</CardTitle>
                  <CardDescription>
                    Prepara lo siguiente antes de comenzar
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div className="flex items-start space-x-3">
                    <Database className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-foreground">
                        Conexión a MongoDB
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Necesitarás una cadena de conexión a tu base de datos
                        MongoDB o los detalles de conexión.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <User className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-foreground">
                        Información personal
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Elegirás un nombre para tu nube y configurarás tu perfil
                        de usuario.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <HardDrive className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-foreground">
                        Preferencias de almacenamiento
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Definirás cuánto espacio quieres asignar a tu nube
                        personal.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Alert
                    variant="default"
                    className="border-primary/20 bg-primary/5 w-full"
                  >
                    <Info className="h-4 w-4 text-primary" />
                    <AlertTitle>Consejo</AlertTitle>
                    <AlertDescription>
                      Ten a mano tus credenciales de MongoDB para agilizar el
                      proceso de configuración.
                    </AlertDescription>
                  </Alert>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        );

      case 1: // Database Connection
        return (
          <div
            className={`grid ${
              isMobile ? "grid-cols-1 gap-6" : "grid-cols-2 gap-8"
            } h-full`}
          >
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col h-full"
            >
              <Card className="border-border bg-card flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle>Conexión a Base de Datos</CardTitle>
                  <CardDescription>
                    Conecta tu instancia de MongoDB
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <Tabs
                    value={connectionType}
                    onValueChange={(value) =>
                      setConnectionType(value as "string" | "advanced")
                    }
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="string">
                        Cadena de conexión
                      </TabsTrigger>
                      <TabsTrigger value="advanced">
                        Configuración avanzada
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="string" className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="connectionString">
                            Cadena de conexión MongoDB
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>
                                  La cadena de conexión debe comenzar con
                                  mongodb:// o mongodb+srv://
                                </p>
                                <p className="text-xs mt-1">
                                  Ejemplo:
                                  mongodb://usuario:contraseña@localhost:27017/los_volumenes
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="connectionString"
                          name="connectionString"
                          placeholder="mongodb://usuario:contraseña@localhost:27017/los_volumenes"
                          value={formData.connectionString}
                          onChange={handleInputChange}
                          className={
                            errors.connectionString ? "border-destructive" : ""
                          }
                        />
                        {errors.connectionString && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-destructive"
                          >
                            {errors.connectionString}
                          </motion.p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="databaseName">
                          Nombre de la base de datos
                        </Label>
                        <Input
                          id="databaseName"
                          name="databaseName"
                          placeholder="los_volumenes"
                          value={formData.databaseName}
                          onChange={handleInputChange}
                          className={
                            errors.databaseName ? "border-destructive" : ""
                          }
                        />
                        {errors.databaseName && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-destructive"
                          >
                            {errors.databaseName}
                          </motion.p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="host">Host</Label>
                          <Input
                            id="host"
                            name="host"
                            placeholder="localhost"
                            value={formData.host}
                            onChange={handleInputChange}
                            className={errors.host ? "border-destructive" : ""}
                          />
                          {errors.host && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-destructive"
                            >
                              {errors.host}
                            </motion.p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="port">Puerto</Label>
                          <Input
                            id="port"
                            name="port"
                            placeholder="27017"
                            value={formData.port}
                            onChange={handleInputChange}
                            className={errors.port ? "border-destructive" : ""}
                          />
                          {errors.port && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-destructive"
                            >
                              {errors.port}
                            </motion.p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dbUsername">Usuario</Label>
                          <Input
                            id="dbUsername"
                            name="dbUsername"
                            placeholder="usuario"
                            value={formData.dbUsername}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password">Contraseña</Label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="databaseName">
                            Nombre de la base de datos
                          </Label>
                          <Input
                            id="databaseName"
                            name="databaseName"
                            placeholder="los_volumenes"
                            value={formData.databaseName}
                            onChange={handleInputChange}
                            className={
                              errors.databaseName ? "border-destructive" : ""
                            }
                          />
                          {errors.databaseName && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-destructive"
                            >
                              {errors.databaseName}
                            </motion.p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="authSource">Auth Source</Label>
                          <Input
                            id="authSource"
                            name="authSource"
                            placeholder="admin"
                            value={formData.authSource}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      className="border-border"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Anterior
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}>
                    <Button onClick={handleNext} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "linear",
                            }}
                            className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                          />
                          Conectando...
                        </>
                      ) : (
                        <>
                          Siguiente
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="flex flex-col h-full"
            >
              <Card className="border-border bg-card flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle>Guía de conexión</CardTitle>
                  <CardDescription>
                    Cómo obtener tus datos de conexión
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Server className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium text-foreground">
                          MongoDB Atlas
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Si usas MongoDB Atlas, puedes encontrar tu cadena de
                          conexión en el panel de control, en la sección
                          "Connect" de tu cluster.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Database className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium text-foreground">
                          MongoDB Local
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Para una instalación local, la cadena de conexión
                          suele ser:
                          <code className="block mt-1 p-2 bg-secondary/50 rounded-md text-xs">
                            mongodb://localhost:27017/los_volumenes
                          </code>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Key className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium text-foreground">
                          Credenciales
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Si tu base de datos requiere autenticación, asegúrate
                          de incluir el usuario y contraseña en la cadena de
                          conexión.
                        </p>
                      </div>
                    </div>
                  </div>

                  {connectionType === "advanced" && (
                    <div className="pt-2 space-y-2">
                      <Label>Cadena de conexión generada</Label>
                      <div className="p-3 bg-secondary/50 rounded-md text-sm font-mono break-all">
                        {getAdvancedConnectionString()}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Alert
                    variant="default"
                    className="border-primary/20 bg-primary/5 w-full"
                  >
                    <Info className="h-4 w-4 text-primary" />
                    <AlertTitle>Información importante</AlertTitle>
                    <AlertDescription>
                      Tus credenciales de base de datos se almacenarán de forma
                      segura y solo se utilizarán para conectar con tu instancia
                      de MongoDB.
                    </AlertDescription>
                  </Alert>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        );

      case 2: // Personalization
        return (
          <div
            className={`grid ${
              isMobile ? "grid-cols-1 gap-6" : "grid-cols-2 gap-8"
            } h-full`}
          >
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col h-full"
            >
              <Card className="border-border bg-card flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle>Información básica</CardTitle>
                  <CardDescription>
                    Configura los detalles principales de tu nube
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cloudName">Nombre de tu nube</Label>
                      <Input
                        id="cloudName"
                        name="cloudName"
                        placeholder="Los Volumenes"
                        value={formData.cloudName}
                        onChange={handleInputChange}
                        className={errors.cloudName ? "border-destructive" : ""}
                      />
                      {errors.cloudName && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-destructive"
                        >
                          {errors.cloudName}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Nombre de usuario</Label>
                      <Input
                        id="username"
                        name="username"
                        placeholder="Tu nombre de usuario"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={errors.username ? "border-destructive" : ""}
                      />
                      {errors.username && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-destructive"
                        >
                          {errors.username}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-center pt-4">
                    <motion.div
                      className="p-6 bg-primary/10 rounded-full"
                      whileHover={{ scale: 1.05 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <User
                        size={isMobile ? 48 : 64}
                        className="text-primary"
                      />
                    </motion.div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      className="border-border"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Anterior
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}>
                    <Button onClick={handleNext}>
                      Siguiente
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="flex flex-col h-full"
            >
              <Card className="border-border bg-card flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle>Almacenamiento</CardTitle>
                  <CardDescription>
                    Define cuánto espacio quieres asignar a tu nube
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Límite de almacenamiento</Label>
                      <motion.span
                        key={formData.storageLimit}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-lg font-medium text-primary"
                      >
                        {formData.storageLimit} GB
                      </motion.span>
                    </div>

                    <Slider
                      defaultValue={[formData.storageLimit]}
                      max={100}
                      min={5}
                      step={5}
                      onValueChange={handleSliderChange}
                      className="py-4"
                    />

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5 GB</span>
                      <span>50 GB</span>
                      <span>100 GB</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center pt-4">
                    <motion.div
                      className="p-6 bg-primary/10 rounded-full"
                      whileHover={{ scale: 1.05 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <HardDrive
                        size={isMobile ? 48 : 64}
                        className="text-primary"
                      />
                    </motion.div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <Alert
                      variant="default"
                      className="border-primary/20 bg-primary/5"
                    >
                      <Info className="h-4 w-4 text-primary" />
                      <AlertTitle>Sobre el almacenamiento</AlertTitle>
                      <AlertDescription>
                        El límite de almacenamiento define cuánto espacio podrás
                        utilizar para guardar tus archivos en la nube. Puedes
                        ajustarlo según tus necesidades.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full bg-secondary/30 rounded-md p-3 text-sm text-muted-foreground">
                    <p>
                      Espacio seleccionado:{" "}
                      <span className="font-medium text-foreground">
                        {formData.storageLimit} GB
                      </span>
                    </p>
                    <div className="w-full bg-secondary h-2 rounded-full mt-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: "0%" }}
                        animate={{
                          width: `${(formData.storageLimit / 100) * 100}%`,
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        );

      case 3: // Complete
        return (
          <div
            className={`grid ${
              isMobile ? "grid-cols-1 gap-6" : "grid-cols-2 gap-8"
            } h-full`}
          >
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col h-full"
            >
              <Card className="border-border bg-card flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle>¡Configuración completada!</CardTitle>
                  <CardDescription>
                    Tu nube personal está lista para usar
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center space-y-6">
                  <motion.div
                    className="p-8 bg-primary/10 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.2,
                    }}
                  >
                    <Check size={isMobile ? 48 : 64} className="text-primary" />
                  </motion.div>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      ¡Todo listo!
                    </h2>
                    <p className="text-muted-foreground">
                      Tu nube personal está configurada y lista para que
                      comiences a almacenar tus recuerdos.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button onClick={handleFinish} className="bg-primary">
                      Comenzar a usar Los Volumenes
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="flex flex-col h-full"
            >
              <Card className="border-border bg-card flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle>Resumen de configuración</CardTitle>
                  <CardDescription>
                    Detalles de tu configuración
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Nombre de la nube:
                      </span>
                      <span className="font-medium">{formData.cloudName}</span>
                    </div>
                    <Separator className="bg-border" />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Usuario:</span>
                      <span className="font-medium">{formData.username}</span>
                    </div>
                    <Separator className="bg-border" />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Base de datos:
                      </span>
                      <span className="font-medium">
                        {formData.databaseName}
                      </span>
                    </div>
                    <Separator className="bg-border" />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Almacenamiento:
                      </span>
                      <span className="font-medium">
                        {formData.storageLimit} GB
                      </span>
                    </div>
                    <Separator className="bg-border" />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Conexión:</span>
                      <span className="font-medium text-green-500">
                        Verificada
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Alert
                      variant="default"
                      className="border-primary/20 bg-primary/5"
                    >
                      <Info className="h-4 w-4 text-primary" />
                      <AlertTitle>¿Qué sigue?</AlertTitle>
                      <AlertDescription>
                        Podrás subir archivos, crear carpetas y organizar tu
                        contenido. Todos tus datos estarán disponibles en
                        cualquier momento.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full bg-secondary/30 rounded-md p-3 text-sm text-center">
                    <p className="text-muted-foreground">
                      Puedes modificar esta configuración más adelante desde la
                      sección de ajustes.
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  // Progress indicator animation
  const progressValue = (currentStep / (STEPS.length - 1)) * 100;

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{ fontFamily: code.style.fontFamily }}
    >
      {/* Header */}
      <header className="border-b border-border bg-card py-4 px-6">
        <div className="flex items-center space-x-2">
          <CassetteTape className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Los Volumenes</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        <div className="w-full max-w-6xl mx-auto flex flex-col h-full ">
          {/* Progress indicator */}
          <div className="mb-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-primary font-medium">
                Paso {currentStep + 1} de {STEPS.length}
              </span>
              <span className="text-muted-foreground">
                {STEPS[currentStep].title}
              </span>
            </div>

            <div className="h-2 bg-secondary rounded-full overflow-hidden ">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                animate={{ width: `${progressValue}%` }}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Step indicators */}
            <div className="flex justify-between mt-2">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center space-x-2 ${
                    index <= currentStep
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <motion.div
                    className={`w-3 h-3 rounded-full ${
                      index < currentStep
                        ? "bg-primary"
                        : index === currentStep
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "bg-muted"
                    }`}
                    animate={
                      index === currentStep
                        ? {
                            scale: [1, 1.2, 1],
                            transition: {
                              repeat: animateProgress ? 1 : 0,
                              duration: 0.6,
                            },
                          }
                        : {}
                    }
                  />
                  <span className="text-xs  hidden md:block">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
