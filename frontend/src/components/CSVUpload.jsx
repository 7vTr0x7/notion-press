import React from "react";
import { Button } from "@/components/ui/button";

export default function CSVUpload({ onUpload }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) onUpload(file);
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
        className="hidden"
        id="csvInput"
      />
      <label htmlFor="csvInput">
        <Button variant="secondary" asChild>
          <span>Upload CSV</span>
        </Button>
      </label>
    </div>
  );
}
