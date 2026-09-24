"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminLink() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((j) => setShow(!!j.isAdmin))
      .catch(() => {});
  }, []);
  if (!show) return null;
  return (
    <Link href="/admin" className="font-medium text-mar-700">
      Admin
    </Link>
  );
}
