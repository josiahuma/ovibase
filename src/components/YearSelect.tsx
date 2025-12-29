"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function YearSelect({ years }: { years: number[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const current = Number(sp.get("year")) || new Date().getFullYear();

  return (
    <select
      className="border rounded-md px-3 py-2"
      value={current}
      onChange={(e) => {
        router.push(`?year=${e.target.value}`);
      }}
    >
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  );
}
