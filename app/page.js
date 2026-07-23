import Link from "next/link";
import { CAMPUSES } from "@/lib/supabaseClient";
import { Church, ChevronRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-md mx-auto px-5 py-16 text-center">
      <Church size={26} className="text-brass mx-auto mb-3" />
      <h1 className="font-display text-3xl font-semibold mb-1">Destiny Church</h1>
      <p className="text-muted text-sm mb-10">Choose your campus</p>
      <div className="flex flex-col gap-3">
        {CAMPUSES.map((c) => (
          <Link
            key={c.key}
            href={`/${c.key}`}
            className="flex items-center justify-between px-5 py-4 rounded-xl bg-surface border border-borderCol hover:border-brass transition-colors"
          >
            <span className="font-medium">{c.name}</span>
            <ChevronRight size={16} className="text-brass" />
          </Link>
        ))}
      </div>
      <Link href="/dashboard" className="inline-block mt-14 text-xs text-muted font-mono uppercase tracking-widest">
        Staff Control Room →
      </Link>
    </div>
  );
}
