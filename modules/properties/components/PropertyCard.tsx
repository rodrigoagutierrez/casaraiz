import Link from "next/link";
import Image from "next/image";
import { eur } from "@/shared/utils/format";

export type CardProp = {
  slug: string;
  title: string;
  priceCents: number;
  rooms: number;
  m2: number;
  barrio: string;
  maxHuespedes: number;
  photos: string[];
};

export default function PropertyCard({ p }: { p: CardProp }) {
  const cover = p.photos[0];
  return (
    <Link href={`/p/${p.slug}`} className="group overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-lg">
      {cover ? (
        <span className="relative block aspect-[4/3] w-full bg-mar-100">
          <Image src={cover} alt={p.title} fill loading="lazy" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-[1.02] transition" />
        </span>
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-mar-100 text-sm text-mar-700">
          Sin fotos
        </div>
      )}
      <div className="p-4">
        <p className="truncate font-semibold text-mar-900">{p.title}</p>
        <p className="text-sm text-mar-950/55">{p.barrio} · {p.rooms} hab · {p.maxHuespedes} huésp.</p>
        <p className="mt-1 font-bold text-mar-900">
          {eur(p.priceCents)}<span className="text-sm font-normal text-mar-950/55">/mes</span>
        </p>
      </div>
    </Link>
  );
}
