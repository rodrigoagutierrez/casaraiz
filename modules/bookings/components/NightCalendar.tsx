"use client";

import { useEffect, useRef, useState } from "react";

type Kind = "reserva" | "temporada";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function ymd(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function localToday() {
  const n = new Date();
  return ymd(n.getFullYear(), n.getMonth(), n.getDate());
}

function addDays(date: string, days: number) {
  const t = Date.parse(`${date}T00:00:00Z`) + days * 86400000;
  return new Date(t).toISOString().slice(0, 10);
}

// Calendario noche a noche: libre / reservado / fuera de temporada + selección check-in → check-out.
export default function NightCalendar({
  propertyId,
  checkin,
  checkout,
  onChange,
}: {
  propertyId: string;
  checkin: string;
  checkout: string;
  onChange: (checkin: string, checkout: string) => void;
}) {
  const today = localToday();
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });
  const [blocked, setBlocked] = useState<Map<string, Kind>>(new Map());
  const fetched = useRef<Set<string>>(new Set());

  const from = ymd(month.y, month.m, 1);
  const to = ymd(month.y, month.m, new Date(month.y, month.m + 1, 0).getDate());

  useEffect(() => {
    if (fetched.current.has(from)) return;
    let alive = true;
    fetch(`/api/availability?propertyId=${propertyId}&from=${from}&to=${to}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!alive || !j?.blocked) return;
        fetched.current.add(from);
        setBlocked((prev) => {
          const next = new Map(prev);
          for (const b of j.blocked as { d: string; k: Kind }[]) next.set(b.d, b.k);
          return next;
        });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [propertyId, from, to]);

  function pick(day: string) {
    if (day < today || blocked.has(day)) return;
    if (!checkin || checkout || day <= checkin) {
      onChange(day, "");
      return;
    }
    for (let t = checkin; t < day; t = addDays(t, 1)) {
      if (blocked.has(t)) {
        onChange(day, "");
        return;
      }
    }
    onChange(checkin, day);
  }

  const firstDow = (new Date(month.y, month.m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(month.y, month.m + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => ymd(month.y, month.m, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const now = new Date();
  const atCurrentMonth = month.y === now.getFullYear() && month.m === now.getMonth();

  function prevMonth() {
    setMonth((m) => (m.m === 0 ? { y: m.y - 1, m: 11 } : { y: m.y, m: m.m - 1 }));
  }
  function nextMonth() {
    setMonth((m) => (m.m === 11 ? { y: m.y + 1, m: 0 } : { y: m.y, m: m.m + 1 }));
  }

  const cellBase =
    "flex h-8 items-center justify-center rounded-lg text-xs transition-colors sm:h-9";

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          disabled={atCurrentMonth}
          aria-label="Mes anterior"
          className="flex h-7 w-7 items-center justify-center rounded-full text-mar-700 hover:bg-mar-100 disabled:opacity-30"
        >
          ‹
        </button>
        <p className="text-xs font-semibold text-mar-900">
          {MONTHS[month.m]} {month.y}
        </p>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Mes siguiente"
          className="flex h-7 w-7 items-center justify-center rounded-full text-mar-700 hover:bg-mar-100"
        >
          ›
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1 text-center text-[10px] font-semibold text-mar-500">
            {w}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`pad-${i}`} className={cellBase} />;
          const kind = blocked.get(day);
          const past = day < today;
          const isStart = day === checkin;
          const isEnd = day === checkout;
          const inRange =
            checkin && checkout && day > checkin && day < checkout;

          let cls = `${cellBase} cursor-pointer text-mar-800 hover:bg-mar-100`;
          if (past) cls = `${cellBase} cursor-not-allowed text-mar-300 line-through`;
          else if (kind === "reserva")
            cls = `${cellBase} cursor-not-allowed bg-otono-100 font-medium text-otono-700 line-through`;
          else if (kind === "temporada")
            cls = `${cellBase} cursor-not-allowed bg-mar-50 text-mar-400 line-through`;
          else if (isStart || isEnd) cls = `${cellBase} cursor-pointer bg-mar-900 font-semibold text-white`;
          else if (inRange) cls = `${cellBase} cursor-pointer bg-mar-100 text-mar-900`;

          return (
            <button
              key={day}
              type="button"
              disabled={past || !!kind}
              onClick={() => pick(day)}
              className={cls}
              title={
                kind === "reserva" ? "Reservado" : kind === "temporada" ? "No disponible" : undefined
              }
            >
              {Number(day.slice(8))}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-mar-600">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-mar-100" /> Selección
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-otono-100" /> Reservado
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-mar-50 ring-1 ring-mar-200" /> No disponible
        </span>
      </div>
    </div>
  );
}
