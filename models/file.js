import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Image", "Video", "Audio", "Other"],
    required: true,
  },
  size: { type: String, required: true },
  date: { type: String },
  location: { type: String, required: true },
  url: { type: String, required: true },
  favorite: { type: Boolean, default: false },
  metadata: mongoose.Schema.Types.Mixed,
});

const File = mongoose.models.File || mongoose.model("File", fileSchema);

export default File;
