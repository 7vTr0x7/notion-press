import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import CSVUpload from "./components/CSVUpload";
import BooksTable from "./components/BooksTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadCSVFromData } from "./utils/csv";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function App() {
  const [originalMap, setOriginalMap] = useState({});
  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  // Debounce function using useRef
  const debounceTimer = useRef(null);
  const debounce = (fn, delay = 500) => {
    return (...args) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => fn(...args), delay);
    };
  };

  // Fetch books
  const fetchPage = async (p = page, query = q) => {
    setLoading(true);
    try {
      const resp = await axios.get(`${API_BASE}/books`, {
        params: { page: p, limit, sortKey, sortDir, q: query },
      });
      setTableData(resp.data.books);
      const map = {};
      resp.data.books.forEach((b) => {
        map[b._id] = { ...b };
      });
      setOriginalMap(map);
      setTotal(resp.data.total);
    } catch {
      toast.error("Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  // Debounced fetch
  const debouncedFetch = useCallback(debounce(fetchPage, 500), [
    page,
    limit,
    sortKey,
    sortDir,
  ]);

  // Reset page to 1 on search/limit/sort change
  useEffect(() => {
    setPage(1);
    debouncedFetch(1, q);
  }, [q, limit, sortKey, sortDir]);

  // Fetch on page change
  useEffect(() => {
    fetchPage(page, q);
  }, [page]);

  // Upload CSV
  const handleUpload = async (file) => {
    try {
      const form = new FormData();
      form.append("file", file);
      await toast.promise(
        axios.post(`${API_BASE}/books/upload`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
        {
          loading: "Uploading CSV...",
          success: "CSV uploaded successfully!",
          error: "Upload failed",
        }
      );
      fetchPage(1);
      fetchPage(1);
    } catch {
      toast.error("Upload failed");
    }
  };

  // Edit local table
  const handleEditLocal = (updatedRow) => {
    setTableData((prev) =>
      prev.map((r) => (r._id === updatedRow._id ? updatedRow : r))
    );
  };

  // Save all edits
  const saveAllEdits = async () => {
    const changed = tableData.filter((row) => {
      const orig = originalMap[row._id];
      if (!orig) return true;
      return Object.keys(row).some(
        (k) => String(row[k] ?? "") !== String(orig[k] ?? "")
      );
    });
    if (!changed.length) return toast("No changes to save", { icon: "ℹ️" });

    try {
      await axios.put(`${API_BASE}/books`, changed);
      toast.success(`Saved ${changed.length} rows successfully!`);
      fetchPage(page);
    } catch {
      toast.error("Failed to save edits");
    }
  };

  // Reset all edits
  const resetAll = () => {
    setTableData(tableData.map((r) => originalMap[r._id] || r));
    toast("All edits reset 🔄");
  };

  // Download CSV
  const handleDownload = () => {
    const toDownload = tableData.map(({ _id, __v, ...rest }) => rest);
    downloadCSVFromData(toDownload, `books_page_${page}.csv`);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <h1 className="text-3xl font-bold mb-6">CSV Editor</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <CSVUpload onUpload={handleUpload} />
        <Button variant="outline" onClick={resetAll}>
          Reset
        </Button>
        <Button onClick={saveAllEdits}>Save All</Button>
        <Button variant="secondary" onClick={handleDownload}>
          Download
        </Button>
        <Input
          placeholder="Search..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="ml-auto w-[200px]"
        />

        {/* Sort by PublishedYear button */}
        <Button
          variant="outline"
          onClick={() => {
            if (sortKey === "publishedYear") {
              setSortDir((d) => (d === "asc" ? "desc" : "asc"));
            } else {
              setSortKey("publishedYear");
              setSortDir("asc");
            }
          }}>
          Sort by Year{" "}
          {sortKey === "publishedYear" ? (sortDir === "asc" ? "▲" : "▼") : ""}
        </Button>
      </div>

      {loading ? (
        <div className="p-4 text-center text-gray-500">Loading...</div>
      ) : (
        <BooksTable
          data={tableData}
          originalMap={originalMap}
          onLocalEdit={handleEditLocal}
          onSort={(k) => {
            sortKey === k
              ? setSortDir((d) => (d === "asc" ? "desc" : "asc"))
              : (setSortKey(k), setSortDir("asc"));
          }}
        />
      )}

      <div className="flex gap-4 mt-6 items-center">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Prev
        </Button>
        <span>
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          Next
        </Button>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="ml-4 border rounded px-2 py-1">
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="ml-auto">Total: {total}</span>
      </div>

      <Toaster position="bottom-right" />
    </div>
  );
}
