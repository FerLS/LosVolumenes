import mongoose from "mongoose";

let isConnected = false; // Estado de conexión

export const connectToDatabase = async () => {
  if (isConnected) {
    console.log("Ya conectado a MongoDB.");
    return;
  }

  if (mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("Conectado a MongoDB.");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    throw error;
  }
};

export default connectToDatabase;
