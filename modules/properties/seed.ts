import { db } from "@/shared/db/client";
import { users } from "@/modules/users/schema";
import { properties } from "./schema";
import { eq } from "drizzle-orm";

const DEMO_OWNER_CLERK_ID = "demo-owner-valencia";

const pic = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

const DEMO_PROPERTIES = [
  {
    title: "Piso 2hab reformado en Ruzafa",
    description: "Exterior, balcón, amueblado. A 5 min del mercado de Ruzafa. Dueño directo.",
    priceCents: 135000, rooms: 2, baths: 1, m2: 72,
    barrio: "ruzafa", slug: "piso-2hab-reformado-ruzafa-1",
    entorno: "ciudad",
    lat: "39.4618", lng: "-0.3769",
    photos: [pic("casaraiz-ruzafa-1a"), pic("casaraiz-ruzafa-1b"), pic("casaraiz-ruzafa-1c")],
  },
  {
    title: "Ático con terraza en Ruzafa",
    description: "Ático 85m2 + terraza 20m2, ideal parejas. Sin amueblar.",
    priceCents: 159000, rooms: 2, baths: 2, m2: 85,
    barrio: "ruzafa", slug: "atico-terraza-ruzafa-2",
    entorno: "ciudad",
    lat: "39.4630", lng: "-0.3755",
    photos: [pic("casaraiz-ruzafa-2a"), pic("casaraiz-ruzafa-2b")],
  },
  {
    title: "Estudio luminoso en Ruzafa para profesionales",
    description: "45m2, bajo consumo, fibra 1Gb. Disponible ya.",
    priceCents: 95000, rooms: 1, baths: 1, m2: 45,
    barrio: "ruzafa", slug: "estudio-luminoso-ruzafa-3",
    entorno: "ciudad",
    lat: "39.4605", lng: "-0.3778",
    photos: [pic("casaraiz-ruzafa-3a")],
  },
  {
    title: "Piso 3hab familiar en Benimaclet",
    description: "Junto a la UPV, plaza de la iglesia. Amueblado, admite estudiantes.",
    priceCents: 115000, rooms: 3, baths: 1, m2: 90,
    barrio: "benimaclet", slug: "piso-3hab-benimaclet-1",
    entorno: "ciudad",
    lat: "39.4867", lng: "-0.3637",
    photos: [pic("casaraiz-beni-1a"), pic("casaraiz-beni-1b"), pic("casaraiz-beni-1c")],
  },
  {
    title: "Piso 2hab económico en Benimaclet",
    description: "Ideal primera vivienda o estudiantes. Metro línea 3 y 9.",
    priceCents: 98000, rooms: 2, baths: 1, m2: 68,
    barrio: "benimaclet", slug: "piso-2hab-benimaclet-2",
    entorno: "rio",
    lat: "39.4849", lng: "-0.3651",
    photos: [pic("casaraiz-beni-2a"), pic("casaraiz-beni-2b")],
  },
  {
    title: "Bajo con patio en Benimaclet",
    description: "70m2 + patio 30m2, pet-friendly. Dueño directo.",
    priceCents: 105000, rooms: 2, baths: 1, m2: 70,
    barrio: "benimaclet", slug: "bajo-patio-benimaclet-3",
    entorno: "bosque",
    lat: "39.4880", lng: "-0.3620",
    photos: [pic("casaraiz-beni-3a")],
  },
  {
    title: "Casa marinera en El Cabanyal",
    description: "Planta baja rehabilitada, 4 min playa. Aire acondicionado.",
    priceCents: 140000, rooms: 3, baths: 2, m2: 95,
    barrio: "el-cabanyal", slug: "casa-marinera-cabanyal-1",
    entorno: "playa",
    lat: "39.4668", lng: "-0.3302",
    photos: [pic("casaraiz-caba-1a"), pic("casaraiz-caba-1b"), pic("casaraiz-caba-1c")],
  },
  {
    title: "Piso 2hab a 200m de la Malvarrosa",
    description: "Vistas lateral mar, ascensor, parking bici.",
    priceCents: 129000, rooms: 2, baths: 1, m2: 70,
    barrio: "el-cabanyal", slug: "piso-malvarrosa-cabanyal-2",
    entorno: "playa",
    lat: "39.4701", lng: "-0.3285",
    photos: [pic("casaraiz-caba-2a"), pic("casaraiz-caba-2b")],
  },
  {
    title: "Apartamento 1hab El Cabanyal, ideal teletrabajo",
    description: "55m2, fibra, escritorio y balcón. Disponible larga estancia.",
    priceCents: 110000, rooms: 1, baths: 1, m2: 55,
    barrio: "el-cabanyal", slug: "apartamento-teletrabajo-cabanyal-3",
    entorno: "playa",
    lat: "39.4640", lng: "-0.3315",
    photos: [pic("casaraiz-caba-3a")],
  },
  {
    title: "Piso 2hab en Malasaña, Madrid centro",
    description: "Exterior, amueblado, metro Tribunal. Dueño directo.",
    priceCents: 165000, rooms: 2, baths: 1, m2: 65,
    city: "Madrid",
    barrio: "malasaña", slug: "piso-malasaña-madrid-1",
    entorno: "ciudad",
    lat: "40.4250", lng: "-3.7010",
    photos: [pic("casaraiz-mad-1a"), pic("casaraiz-mad-1b")],
  },
  {
    title: "Apartamento en Eixample, Barcelona",
    description: "70m2 reformado, balcón, a 10 min de Sagrada Familia.",
    priceCents: 158000, rooms: 2, baths: 1, m2: 70,
    city: "Barcelona",
    barrio: "eixample", slug: "apartamento-eixample-barcelona-1",
    entorno: "ciudad",
    lat: "41.3880", lng: "2.1590",
    photos: [pic("casaraiz-bcn-1a"), pic("casaraiz-bcn-1b")],
  },
  {
    title: "Casa con patio en Triana, Sevilla",
    description: "Planta baja con patio andaluz, aire acondicionado.",
    priceCents: 125000, rooms: 3, baths: 2, m2: 95,
    city: "Sevilla",
    barrio: "triana", slug: "casa-triana-sevilla-1",
    entorno: "rio",
    lat: "37.3830", lng: "-6.0050",
    photos: [pic("casaraiz-sev-1a"), pic("casaraiz-sev-1b")],
  },
];

async function main() {
  let [owner] = await db.select().from(users).where(eq(users.clerkId, DEMO_OWNER_CLERK_ID));
  if (!owner) {
    [owner] = await db
      .insert(users)
      .values({
        clerkId: DEMO_OWNER_CLERK_ID,
        role: "owner",
        email: "dueno.demo@casaraiz.local",
        dniVerified: true,
      })
      .returning();
    console.log("Owner demo creado:", owner.id);
  } else {
    console.log("Owner demo existe:", owner.id);
  }

  let created = 0;
  let updated = 0;
  for (const p of DEMO_PROPERTIES) {
    const ent = ("entorno" in p ? (p as { entorno: string }).entorno : undefined) as string | undefined;
    const existing = await db.select().from(properties).where(eq(properties.slug, p.slug));
    if (existing.length > 0) {
      const patch: Record<string, unknown> = {};
      if (existing[0].photos.length === 0 && "photos" in p && (p as { photos: string[] }).photos.length > 0) {
        patch.photos = (p as { photos: string[] }).photos;
      }
      if (!existing[0].entorno && ent) patch.entorno = ent;
      if (Object.keys(patch).length > 0) {
        await db.update(properties).set(patch).where(eq(properties.slug, p.slug));
        updated++;
      }
      continue;
    }
    await db.insert(properties).values({
      ownerId: owner.id,
      title: p.title,
      description: p.description,
      priceCents: p.priceCents,
      rooms: p.rooms,
      baths: p.baths,
      m2: p.m2,
      city: ("city" in p ? (p as { city: string }).city : undefined) ?? "Valencia",
      barrio: p.barrio,
      entorno: ent,
      slug: p.slug,
      lat: p.lat,
      lng: p.lng,
      status: "active",
      photos: ("photos" in p ? (p as { photos: string[] }).photos : []) ?? [],
    });
    created++;
  }
  console.log(`Seed OK: ${created} nuevos, ${updated} actualizados.`);
}

main().catch((e) => {
  console.error("SEED_FAIL:", e);
  process.exit(1);
});
