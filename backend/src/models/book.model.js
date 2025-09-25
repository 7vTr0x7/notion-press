import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  author: { type: String, default: "" },
  genre: { type: String, default: "" },
  publishedYear: { type: Number, default: null },
  isbn: { type: String, default: "" },
});

export default mongoose.model("Book", bookSchema);
