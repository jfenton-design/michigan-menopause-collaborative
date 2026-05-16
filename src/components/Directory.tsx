"use client";

import { useMemo, useState } from "react";
import { MemberRow } from "./MemberRow";
import { MEMBERS, SPECIALTIES } from "@/lib/data";

export function Directory() {
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState("All specialties");

  const filtered = useMemo(() => {
    const lq = q.trim().toLowerCase();
    return MEMBERS.filter((m) => {
      const matchQ =
        lq === "" ||
        m.name.toLowerCase().includes(lq) ||
        m.specialty.toLowerCase().includes(lq) ||
        m.location.toLowerCase().includes(lq);
      const matchS = spec === "All specialties" || m.specialty === spec;
      return matchQ && matchS;
    });
  }, [q, spec]);

  return (
    <>
      <div className="dir-filters">
        <div className="field">
          <label htmlFor="dir-q">Search name, specialty, city</label>
          <input
            id="dir-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. cardiology · Royal Oak · Dr. Park"
          />
        </div>
        <div className="field">
          <label htmlFor="dir-spec">Specialty</label>
          <select id="dir-spec" value={spec} onChange={(e) => setSpec(e.target.value)}>
            {SPECIALTIES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="dir-count">
          {filtered.length} of {MEMBERS.length} members
        </div>
      </div>

      <div className="dir-header">
        {["Member", "Specialty", "Location", "Practice"].map((h) => (
          <div key={h} className="eyebrow">{h}</div>
        ))}
      </div>

      {filtered.map((m, i) => (
        <MemberRow key={i} m={m} />
      ))}
    </>
  );
}
