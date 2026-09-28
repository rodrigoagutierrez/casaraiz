"use client";

import { useState } from "react";

export default function DescriptionBlock({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 280;
  return (
    <div>
      <p className={`whitespace-pre-line text-mar-950/80 ${!open && long ? "line-clamp-4" : ""}`}>{text}</p>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="mt-2 text-sm font-semibold text-mar-900 underline"
        >
          {open ? "Mostrar menos" : "Mostrar más"}
        </button>
      )}
    </div>
  );
}
