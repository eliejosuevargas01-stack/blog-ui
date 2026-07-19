import Admin from "@/components/Admin";
import { defaultLang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return <Admin lang={defaultLang} />;
}
