import Papa from "papaparse";
import Book from "../models/book.model.js";

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
      publishedYear: row.PublishedYear
        ? Number(row.PublishedYear)
        : row.publishedYear
        ? Number(row.publishedYear)
        : null,
      isbn: row.ISBN || row.isbn || "",
    }));

    // Bulk insert (replace existing documents) — adjust as needed
    await Book.deleteMany({});
    await Book.insertMany(data);

    res.json({ message: "Uploaded and saved", count: data.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

export const getBooks = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const limit = Math.max(1, parseInt(req.query.limit || "50"));
    const sortKey = req.query.sortKey || null;
    const sortDir = req.query.sortDir === "desc" ? -1 : 1;
    const search = req.query.q || "";

    const filter = {};
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { author: new RegExp(search, "i") },
        { genre: new RegExp(search, "i") },
        { isbn: new RegExp(search, "i") },
      ];
    }

    let query = Book.find(filter);
    if (sortKey) query = query.sort({ [sortKey]: sortDir });

    const total = await Book.countDocuments(filter);
    const books = await query
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ books, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch failed", error: err.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const book = await Book.findByIdAndUpdate(id, update, { new: true }).lean();
    res.json({ book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

export const deleteAll = async (req, res) => {
  try {
    await Book.deleteMany({});
    res.json({ message: "All deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
