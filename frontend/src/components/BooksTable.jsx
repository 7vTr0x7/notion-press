import React from "react";
import { Input } from "@/components/ui/input";

function isModifiedCell(value, original) {
  return String(value ?? "") !== String(original ?? "");
}

export default function BooksTable({ data, originalMap, onLocalEdit, onSort }) {
  if (!data?.length)
    return <div className="text-gray-500">No data loaded.</div>;
  const cols = Object.keys(data[0]).filter((k) => k !== "__v");

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border rounded-lg shadow-sm text-sm">
        <thead className="bg-gray-100">
          <tr>
            {cols.map((col) => (
              <th
                key={col}
                className={`px-3 py-2 border-b ${
                  col !== "publishedYear" ? "cursor-pointer" : ""
                }`}
                onClick={() => col !== "publishedYear" && onSort(col)}>
                {col} {col === "publishedYear" ? "" : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row._id} className="hover:bg-gray-50">
              {cols.map((col) => {
                const modified =
                  originalMap[row._id] &&
                  isModifiedCell(row[col], originalMap[row._id][col]);
                return (
                  <td
                    key={col}
                    className={`px-3 py-2 border-b ${
                      modified ? "bg-yellow-100" : ""
                    }`}>
                    {col === "_id" ? (
                      <small className="text-gray-500">{row[col]}</small>
                    ) : (
                      <Input
                        className="h-8"
                        value={row[col] ?? ""}
                        onChange={(e) =>
                          onLocalEdit({ ...row, [col]: e.target.value })
                        }
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
