import { Instagram, Facebook, Youtube, Mail, Globe, Music2, Twitter } from "lucide-react";

export const SOCIAL_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  email: Mail,
  website: Globe,
  tiktok: Music2,
  x: Twitter,
};

export const SOCIAL_ICON_OPTIONS = [
  { value: "", label: "None (regular link)" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
  { value: "tiktok", label: "TikTok" },
  { value: "x", label: "X / Twitter" },
];
