"use client";

import { useState, useEffect } from "react";

export default function SavingsSimulator() {
  const [precio, setPrecio] = useState(800);
  const [pisos, setPisos] = useState(1);

  useEffect(() => {
    const p = document.getElementById("precioAlquiler") as HTMLInputElement | null;
    const n = document.getElementById("numPisos") as HTMLSelectElement | null;
    if (p && n) {
      setPrecio(Number(p.value) || 0);
      setPisos(Number(n.value) || 1);
      p.addEventListener("input", () => setPrecio(Number(p.value) || 0));
      n.addEventListener("change", () => setPisos(Number(n.value) || 0));
      calcular();
    }
  }, []);

  const calcular = () => {
    const anual = precio * 12 * pisos;
    const casa = pisos <= 3 ? 19 * 12 : pisos <= 5 ? 29 * 12 : 149;
    const airbnb = anual * 0.03;
    const booking = anual * 0.15;
    const ahorroAirbnb = airbnb - casa;
    const ahorroBooking = booking - casa;

    const elCasa = document.getElementById("resultadoCasa");
    const elAirbnb = document.getElementById("resultadoAirbnb");
    const elBooking = document.getElementById("resultadoBooking");
    const elAhorro = document.getElementById("resultadoAhorro");

    if (elCasa) elCasa.textContent = `${Math.round(casa).toLocaleString("es-ES")} €/año`;
    if (elAirbnb) elAirbnb.textContent = `${Math.round(airbnb).toLocaleString("es-ES")} €/año`;
    if (elBooking) elBooking.textContent = `${Math.round(booking).toLocaleString("es-ES")} €/año`;
    if (elAhorro) {
      const ahorro = Math.max(ahorroAirbnb, ahorroBooking);
      elAhorro.textContent = `${ahorro > 0 ? Math.round(ahorro).toLocaleString("es-ES") : 0} €/año`;
    }
  };

  useEffect(() => {
    calcular();
  }, [precio, pisos]);

  return null;
}
