import { query } from "@/lib/db";
import CatchClient from "./CatchClient";

export const dynamic = "force-dynamic";

export default async function LineCatchPage() {
  const species = await query<{ name: string }>("SELECT name FROM fish_species WHERE status='ACTIVE' ORDER BY name ASC");
  return <CatchClient species={species.map((row) => row.name)} />;
}
