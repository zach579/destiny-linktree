import { supabase, CAMPUSES } from "@/lib/supabaseClient";
import { SOCIAL_ICONS } from "@/lib/socialIcons";
import { notFound } from "next/navigation";
import { FileText, ChevronRight, ExternalLink, Download, Church } from "lucide-react";

export const revalidate = 0; // always fetch fresh data

export default async function CampusPage({ params }) {
  const campus = CAMPUSES.find((c) => c.key === params.campus);
  if (!campus) return notFound();

  const [{ data: profile }, { data: links }, { data: sermons }] = await Promise.all([
    supabase.from("profiles").select("*").eq("campus", campus.key).maybeSingle(),
    supabase.from("links").select("*").eq("campus", campus.key).eq("active", true).order("position", { ascending: true }),
    supabase.from("sermons").select("*").eq("campus", campus.key).order("sermon_date", { ascending: false }),
  ]);

  const socialLinks = (links || []).filter((l) => l.icon);
  const sectionedLinks = (links || []).filter((l) => !l.icon);

  // Group by section, preserving the order sections first appear in
  const sectionOrder = [];
  const sections = {};
  for (const link of sectionedLinks) {
    const key = link.section || "General";
    if (!sections[key]) {
      sections[key] = [];
      sectionOrder.push(key);
    }
    sections[key].push(link);
  }

  const sermonsWithUrls = (sermons || []).map((s) => ({
    ...s,
    publicUrl: supabase.storage.from("sermons").getPublicUrl(s.file_path).data.publicUrl,
  }));

  return (
    <div className="max-w-md mx-auto px-5 py-10 pb-16">
      {/* Hero: avatar, logo, tagline */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-surface border-2 border-brass flex items-center justify-center">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={campus.name} className="w-full h-full object-cover" />
          ) : (
            <Church size={30} className="text-brass" />
          )}
        </div>

        {profile?.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.logo_url} alt="" className="h-10 mx-auto mb-3 object-contain" />
        )}

        <h1 className="font-display text-3xl font-semibold mb-1.5">{campus.name}</h1>
        <p className="text-sm text-muted px-4">
          {profile?.tagline || "One Church. One Family. Three Cities."}
        </p>

        {socialLinks.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            {socialLinks.map((link) => {
              const Icon = SOCIAL_ICONS[link.icon] || ExternalLink;
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.title}
                  className="w-10 h-10 rounded-full bg-surface border border-borderCol flex items-center justify-center hover:border-brass transition-colors"
                >
                  <Icon size={17} className="text-brass" />
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Sermon Notes */}
      {sermonsWithUrls.length > 0 && (
        <div className="mb-8">
          <div className="font-mono text-[11px] tracking-[0.15em] text-muted uppercase mb-2.5">Sermon Notes</div>
          <div className="flex flex-col gap-2">
            {sermonsWithUrls.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-surface border border-borderCol">
                <FileText size={18} className="text-brass shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{s.title}</div>
                  {s.sermon_date && <div className="text-xs text-muted">{s.sermon_date}</div>}
                </div>
                <a href={s.publicUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-brass text-[#1A1408]">
                  <ExternalLink size={13} />
                </a>
                <a href={s.publicUrl} download className="p-2 rounded-lg bg-surfaceAlt border border-borderCol">
                  <Download size={13} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom sections */}
      {sectionOrder.length === 0 && sermonsWithUrls.length === 0 ? (
        <div className="text-center text-muted text-sm py-6 border border-dashed border-borderCol rounded-xl">
          Links will appear here soon.
        </div>
      ) : (
        sectionOrder.map((sectionName) => (
          <div key={sectionName} className="mb-8">
            <div className="font-mono text-[11px] tracking-[0.15em] text-muted uppercase mb-2.5">{sectionName}</div>
            <div className="flex flex-col gap-2.5">
              {sections[sectionName].map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-5 py-4 rounded-xl bg-surface border border-borderCol font-medium hover:border-brass transition-colors"
                >
                  {link.title}
                  <ChevronRight size={16} className="text-brass" />
                </a>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
