"use client";

import {useState} from "react";
import AdminModerationSearch from "./AdminModerationSearch";
import HospitalSuppliesPanel from "./HospitalSuppliesPanel";
import {useAdminSession} from "./AdminSessionProvider";

export default function AdminInsumosSection() {
  const {token} = useAdminSession();
  const [query, setQuery] = useState("");

  if (!token) return null;

  return (
    <section className="admin-insumos">
      <div className="mb-4">
        <AdminModerationSearch value={query} onChange={setQuery} />
      </div>
      <HospitalSuppliesPanel token={token} query={query} />
    </section>
  );
}
