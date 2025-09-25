import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  genre: String,
  publishedYear: Number,
  isbn: String,
});

export default mongoose.model("Book", bookSchema);
