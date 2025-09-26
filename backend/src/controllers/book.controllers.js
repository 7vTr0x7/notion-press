import Papa from "papaparse";
import Book from "../models/book.model.js";

// Upload CSV
export const uploadCSV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const csvString = req.file.buffer.toString("utf8");
    const parsed = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
    });
    const data = parsed.data.map((row) => ({
      title: row.Title || row.title || "",
      author: row.Author || row.author || "",
      genre: row.Genre || row.genre || "",
      publishedYear: row.PublishedYear ? Number(row.PublishedYear) : null,
      isbn: row.ISBN || row.isbn || "",
    }));

    await Book.deleteMany({});
    await Book.insertMany(data);
    res.json({ message: "Uploaded", count: data.length });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

// Get books with pagination + sorting + search
export const getBooks = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const limit = Math.max(1, parseInt(req.query.limit || "50"));
    const sortKey = req.query.sortKey || null;
    const sortDir = req.query.sortDir === "desc" ? -1 : 1;
    const q = req.query.q || "";

    const filter = q
      ? {
          $or: [
            { title: new RegExp(q, "i") },
            { author: new RegExp(q, "i") },
            { genre: new RegExp(q, "i") },
            { isbn: new RegExp(q, "i") },
          ],
        }
      : {};

    let query = Book.find(filter);
    if (sortKey) query = query.sort({ [sortKey]: sortDir });

    const total = await Book.countDocuments(filter);
    const books = await query
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ books, total });
  } catch (err) {
    res.status(500).json({ message: "Fetch failed", error: err.message });
  }
};

// Bulk update
export const bulkUpdateBooks = async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items))
      return res.status(400).json({ message: "Expected array" });

    const ops = items.map((it) => ({
      updateOne: { filter: { _id: it._id }, update: { $set: it } },
    }));
    const result = await Book.bulkWrite(ops);
    res.json({ updated: result.modifiedCount || 0 });
  } catch (err) {
    res.status(500).json({ message: "Bulk update failed", error: err.message });
  }
};

// Delete all
export const deleteAll = async (req, res) => {
  try {
    await Book.deleteMany({});
    res.json({ message: "All deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
