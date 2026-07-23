"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase, CAMPUSES } from "@/lib/supabaseClient";
import { SOCIAL_ICONS, SOCIAL_ICON_OPTIONS } from "@/lib/socialIcons";
import {
  Plus, Trash2, ArrowUp, ArrowDown, FileText, ExternalLink,
  Radio, Link2, Upload, Loader2, LogOut, Image as ImageIcon, Church,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeCampus, setActiveCampus] = useState("columbia");
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/dashboard/login");
      else setCheckingAuth(false);
    });
  }, [router]);

  const loadCampusData = useCallback(async (campusKey) => {
    setLoading(true);
    const [{ data: profileRow }, { data: linkRows }, { data: sermonRows }] = await Promise.all([
      supabase.from("profiles").select("*").eq("campus", campusKey).maybeSingle(),
      supabase.from("links").select("*").eq("campus", campusKey).order("position", { ascending: true }),
      supabase.from("sermons").select("*").eq("campus", campusKey).order("sermon_date", { ascending: false }),
    ]);
    setProfile(profileRow || { campus: campusKey, avatar_url: "", logo_url: "", tagline: "" });
    setLinks(linkRows || []);
    setSermons(sermonRows || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!checkingAuth) loadCampusData(activeCampus);
  }, [checkingAuth, activeCampus, loadCampusData]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/dashboard/login");
  }

  // ---- Profile / branding ----
  async function saveTagline(tagline) {
    const { error } = await supabase
      .from("profiles")
      .upsert({ campus: activeCampus, tagline }, { onConflict: "campus" });
    if (error) return showToast("Couldn't save tagline.");
    showToast("Tagline saved");
  }

  async function uploadBrandingImage(file, field) {
    if (!file) return;
    setBusy(true);
    const path = `${activeCampus}/${field}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("branding").upload(path, file);
    if (uploadError) {
      setBusy(false);
      return showToast("Image upload failed.");
    }
    const publicUrl = supabase.storage.from("branding").getPublicUrl(path).data.publicUrl;
    const { error } = await supabase
      .from("profiles")
      .upsert({ campus: activeCampus, [field]: publicUrl }, { onConflict: "campus" });
    setBusy(false);
    if (error) return showToast("Uploaded but couldn't save it.");
    showToast(field === "avatar_url" ? "Profile photo updated" : "Logo updated");
    loadCampusData(activeCampus);
  }

  // ---- Links ----
  async function addLink({ title, url, section, icon }) {
    if (!title.trim() || !url.trim()) return;
    const safeUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const position = links.length;
    const { error } = await supabase.from("links").insert({
      campus: activeCampus, title, url: safeUrl, active: true, position,
      section: section || "General", icon: icon || null,
    });
    if (error) return showToast("Couldn't save that link.");
    showToast("Link added");
    loadCampusData(activeCampus);
  }

  async function removeLink(id) {
    await supabase.from("links").delete().eq("id", id);
    loadCampusData(activeCampus);
  }

  async function toggleLink(id, active) {
    await supabase.from("links").update({ active: !active }).eq("id", id);
    loadCampusData(activeCampus);
  }

  async function moveLink(index, dir) {
    const j = index + dir;
    if (j < 0 || j >= links.length) return;
    const a = links[index];
    const b = links[j];
    await supabase.from("links").update({ position: b.position }).eq("id", a.id);
    await supabase.from("links").update({ position: a.position }).eq("id", b.id);
    loadCampusData(activeCampus);
  }

  // ---- Sermons ----
  async function addSermon(title, date, file) {
    if (!title.trim() || !file) return;
    if (file.type !== "application/pdf") return showToast("Please choose a PDF file.");
    setBusy(true);
    const path = `${activeCampus}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("sermons").upload(path, file);
    if (uploadError) {
      setBusy(false);
      return showToast("Upload failed. Try again.");
    }
    const { error } = await supabase
      .from("sermons")
      .insert({ campus: activeCampus, title, sermon_date: date || null, file_path: path });
    setBusy(false);
    if (error) return showToast("Saved the file but couldn't save its details.");
    showToast("Sermon uploaded");
    loadCampusData(activeCampus);
  }

  async function deleteSermon(sermon) {
    await supabase.storage.from("sermons").remove([sermon.file_path]);
    await supabase.from("sermons").delete().eq("id", sermon.id);
    loadCampusData(activeCampus);
  }

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted gap-2">
        <Loader2 size={18} className="animate-spin" /> Checking session…
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-16">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Radio size={15} className="text-brass" />
          <span className="font-mono text-[11px] tracking-widest text-muted uppercase">
            Broadcasting to 3 campuses
          </span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-muted">
          <LogOut size={13} /> Sign out
        </button>
      </div>
      <h1 className="font-display text-3xl font-semibold mt-0.5 mb-4">Control Room</h1>

      <div className="flex gap-2 mb-5">
        {CAMPUSES.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCampus(c.key)}
            className={`flex-1 py-2.5 px-2 rounded-xl text-sm font-semibold border transition-colors ${
              activeCampus === c.key ? "border-brass bg-brass/10 text-brass" : "border-borderCol bg-surface text-ink"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted gap-2">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : (
        <>
          <ProfilePanel profile={profile} saveTagline={saveTagline} uploadBrandingImage={uploadBrandingImage} busy={busy} />
          <LinksPanel links={links} addLink={addLink} removeLink={removeLink} toggleLink={toggleLink} moveLink={moveLink} />
          <SermonsPanel sermons={sermons} addSermon={addSermon} deleteSermon={deleteSermon} busy={busy} />
        </>
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-surfaceAlt border border-brassDim text-ink px-4 py-2.5 rounded-xl text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

function Panel({ title, icon, children }) {
  return (
    <div className="bg-surface border border-borderCol rounded-2xl p-4.5 mb-4.5">
      <div className="flex items-center gap-1.5 mb-3.5">
        {icon}
        <span className="font-mono text-xs tracking-wider text-muted uppercase">{title}</span>
      </div>
      {children}
    </div>
  );
}

function ProfilePanel({ profile, saveTagline, uploadBrandingImage, busy }) {
  const [tagline, setTagline] = useState(profile?.tagline || "");
  const avatarRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => setTagline(profile?.tagline || ""), [profile]);

  return (
    <Panel title="Profile & Branding" icon={<ImageIcon size={15} className="text-brass" />}>
      <div className="flex gap-3 mb-3.5">
        <label className="flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-lg bg-bg border border-dashed border-borderCol cursor-pointer text-center">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-surfaceAlt flex items-center justify-center">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <Church size={18} className="text-brass" />
            )}
          </div>
          <span className="text-xs text-muted">Profile photo</span>
          <input
            ref={avatarRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files[0] && uploadBrandingImage(e.target.files[0], "avatar_url")}
          />
        </label>
        <label className="flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-lg bg-bg border border-dashed border-borderCol cursor-pointer text-center">
          <div className="w-12 h-8 flex items-center justify-center">
            {profile?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.logo_url} alt="" className="max-h-8 max-w-full object-contain" />
            ) : (
              <ImageIcon size={16} className="text-brass" />
            )}
          </div>
          <span className="text-xs text-muted">Logo (optional)</span>
          <input
            ref={logoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files[0] && uploadBrandingImage(e.target.files[0], "logo_url")}
          />
        </label>
      </div>
      {busy && <div className="text-xs text-muted mb-2 flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" /> Uploading…</div>}
      <div className="flex gap-2">
        <input
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Tagline (e.g. One Church. One Family. Three Cities.)"
          className="flex-1 px-3 py-2.5 rounded-lg bg-bg border border-borderCol outline-none text-sm"
        />
        <button onClick={() => saveTagline(tagline)} className="px-4 py-2.5 rounded-lg bg-brass text-[#1A1408] font-semibold text-sm">
          Save
        </button>
      </div>
    </Panel>
  );
}

function LinksPanel({ links, addLink, removeLink, toggleLink, moveLink }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [section, setSection] = useState("General");
  const [icon, setIcon] = useState("");

  function submit(e) {
    e.preventDefault();
    addLink({ title, url, section, icon });
    setTitle(""); setUrl(""); setSection("General"); setIcon("");
  }

  return (
    <Panel title="Links" icon={<Link2 size={15} className="text-brass" />}>
      <form onSubmit={submit} className="flex flex-col gap-2 mb-3.5">
        <div className="flex gap-2 flex-wrap">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Link title" className="flex-1 min-w-[140px] px-3 py-2.5 rounded-lg bg-bg border border-borderCol outline-none text-sm" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="flex-1 min-w-[140px] px-3 py-2.5 rounded-lg bg-bg border border-borderCol outline-none text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            value={section}
            onChange={(e) => setSection(e.target.value)}
            placeholder="Section (e.g. Coming Up)"
            disabled={!!icon}
            className="flex-1 min-w-[140px] px-3 py-2.5 rounded-lg bg-bg border border-borderCol outline-none text-sm disabled:opacity-40"
          />
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="flex-1 min-w-[140px] px-3 py-2.5 rounded-lg bg-bg border border-borderCol outline-none text-sm"
          >
            {SOCIAL_ICON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="py-2.5 rounded-lg bg-brass text-[#1A1408] font-semibold flex items-center justify-center gap-1.5 text-sm">
          <Plus size={15} /> Add link
        </button>
      </form>

      {links.length === 0 ? (
        <div className="text-center text-muted text-sm py-5 border border-dashed border-borderCol rounded-xl">No links yet.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {links.map((link, i) => {
            const Icon = link.icon ? SOCIAL_ICONS[link.icon] : null;
            return (
              <div key={link.id} className={`flex flex-wrap items-center gap-2 px-3 py-2.5 rounded-lg bg-surfaceAlt ${!link.active && "opacity-45"}`}>
                <div className="flex items-center gap-2 flex-1 min-w-[160px]">
                  {Icon && <Icon size={15} className="text-brass shrink-0" />}
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{link.title}</div>
                    <div className="text-xs text-muted truncate">
                      {link.icon ? "Social icon" : link.section} · {link.url}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <button onClick={() => moveLink(i, -1)} disabled={i === 0} className="p-1.5 rounded border border-borderCol disabled:opacity-30"><ArrowUp size={13} /></button>
                  <button onClick={() => moveLink(i, 1)} disabled={i === links.length - 1} className="p-1.5 rounded border border-borderCol disabled:opacity-30"><ArrowDown size={13} /></button>
                  <button onClick={() => toggleLink(link.id, link.active)} className="px-2 py-1.5 rounded border border-borderCol text-xs">{link.active ? "Hide" : "Show"}</button>
                  <button onClick={() => removeLink(link.id)} className="p-1.5 rounded border border-borderCol text-clay"><Trash2 size={13} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

function SermonsPanel({ sermons, addSermon, deleteSermon, busy }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  function submit(e) {
    e.preventDefault();
    if (!file) return;
    addSermon(title, date, file);
    setTitle(""); setDate(""); setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <Panel title="Sermon Notes (PDF)" icon={<FileText size={15} className="text-brass" />}>
      <form onSubmit={submit} className="flex flex-col gap-2 mb-3.5">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sermon title" className="px-3 py-2.5 rounded-lg bg-bg border border-borderCol outline-none text-sm" />
        <div className="flex gap-2 flex-wrap">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex-1 min-w-[130px] px-3 py-2.5 rounded-lg bg-bg border border-borderCol outline-none text-sm" />
          <label className="flex-[2] min-w-[180px] px-3 py-2.5 rounded-lg bg-bg border border-borderCol flex items-center gap-1.5 text-sm">
            <Upload size={14} />
            <span className={file ? "text-ink" : "text-muted"}>{file ? file.name : "Choose PDF file"}</span>
            <input ref={fileRef} type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0] || null)} className="hidden" />
          </label>
        </div>
        <button type="submit" disabled={busy} className="py-2.5 rounded-lg bg-brass text-[#1A1408] font-semibold flex items-center justify-center gap-1.5 text-sm">
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          {busy ? "Uploading…" : "Upload sermon"}
        </button>
      </form>
      {sermons.length === 0 ? (
        <div className="text-center text-muted text-sm py-5 border border-dashed border-borderCol rounded-xl">No sermons uploaded yet.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {sermons.map((s) => {
            const publicUrl = supabase.storage.from("sermons").getPublicUrl(s.file_path).data.publicUrl;
            return (
              <div key={s.id} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-surfaceAlt">
                <FileText size={16} className="text-brass shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{s.title}</div>
                  <div className="text-xs text-muted">{s.sermon_date || "No date"}</div>
                </div>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded border border-borderCol"><ExternalLink size={13} /></a>
                <button onClick={() => deleteSermon(s)} className="p-1.5 rounded border border-borderCol text-clay"><Trash2 size={13} /></button>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
