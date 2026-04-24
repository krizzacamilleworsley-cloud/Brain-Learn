import jsPDF from "jspdf";
import { LEVEL_META, type Level } from "@/lib/levels";

export type CertificateKind = "level" | "champion";

export interface CertificateData {
  kind: CertificateKind;
  name: string;
  level?: Level;            // required when kind === "level"
  correct?: number;         // required when kind === "level"
  total?: number;           // required when kind === "level"
  xpEarned?: number;        // xp from this run (level cert)
  totalXp: number;          // user's lifetime XP
}

interface Tier {
  label: string;
  emoji: string;
  blurb: string;
  // Colors for the title text [r,g,b]
  titleRgb: [number, number, number];
}

function tierFor(percent: number): Tier {
  if (percent === 100)
    return {
      label: "FLAWLESS",
      emoji: "🏆",
      blurb: "with a perfect score - every answer correct.",
      titleRgb: [190, 242, 100], // lime
    };
  if (percent >= 80)
    return {
      label: "GOLD",
      emoji: "🥇",
      blurb: "with outstanding mastery of the level.",
      titleRgb: [250, 204, 21], // gold
    };
  if (percent >= 60)
    return {
      label: "SILVER",
      emoji: "🥈",
      blurb: "with solid command of the material.",
      titleRgb: [192, 192, 220], // silver
    };
  if (percent >= 40)
    return {
      label: "BRONZE",
      emoji: "🥉",
      blurb: "for completing the quest with growing skill.",
      titleRgb: [205, 127, 50], // bronze
    };
  return {
    label: "PARTICIPATION",
    emoji: "🎖️",
    blurb: "for taking on the challenge and pressing forward.",
    titleRgb: [180, 180, 200],
  };
}

/**
 * Build the certificate as a jsPDF document. Returns the doc plus a sensible filename.
 * Use .save(filename) for download or .output('bloburl') for preview in an iframe.
 */
export function buildCertificate(data: CertificateData): { doc: jsPDF; filename: string } {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  const isChampion = data.kind === "champion";
  const meta = data.level ? LEVEL_META[data.level] : null;
  const total = data.total ?? 0;
  const correct = data.correct ?? 0;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 100;
  const tier = isChampion
    ? {
        label: "CHAMPION",
        emoji: "",
        blurb:
          "for conquering all three levels of GrammarQuest - Easy, Medium and Hard - on the path to English mastery.",
        titleRgb: [190, 242, 100] as [number, number, number],
      }
    : tierFor(percent);

  // Background
  doc.setFillColor(15, 12, 30);
  doc.rect(0, 0, w, h, "F");

  // Outer neon frame
  doc.setDrawColor(217, 70, 239); // magenta
  doc.setLineWidth(6);
  doc.roundedRect(28, 28, w - 56, h - 56, 18, 18, "S");

  doc.setDrawColor(34, 211, 238); // cyan
  doc.setLineWidth(2);
  doc.roundedRect(44, 44, w - 88, h - 88, 14, 14, "S");

  // Decorative star accents (drawn, not text — Helvetica doesn't include glyphs)
  const drawStar = (cx: number, cy: number, size: number, rgb: [number, number, number]) => {
    doc.setFillColor(...rgb);
    const pts: [number, number][] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? size : size / 2.4;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    const lines = pts.slice(1).map(([x, y], i) => [x - pts[i][0], y - pts[i][1]] as [number, number]);
    doc.lines(lines, pts[0][0], pts[0][1], [1, 1], "F", true);
  };

  // Title
  doc.setTextColor(217, 70, 239);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(40);
  const title = isChampion
    ? "CERTIFICATE OF MASTERY"
    : "CERTIFICATE OF ACHIEVEMENT";
  doc.text(title, w / 2, 130, { align: "center" });

  // Sub-title strip
  doc.setTextColor(190, 190, 230);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  const subtitle = isChampion
    ? "GRAMMARQUEST  |  ENGLISH CHAMPION"
    : `GRAMMARQUEST  |  ${meta?.label.toUpperCase() ?? ""} LEVEL`;
  doc.text(subtitle, w / 2, 158, { align: "center" });

  // Tier badge (text only — emoji glyphs are not in Helvetica)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...tier.titleRgb);
  const tierText = `- ${tier.label} -`;
  doc.text(tierText, w / 2, 196, { align: "center" });
  // Star accents on either side of the tier label
  const tierWidth = doc.getTextWidth(tierText);
  drawStar(w / 2 - tierWidth / 2 - 22, 190, 8, tier.titleRgb);
  drawStar(w / 2 + tierWidth / 2 + 22, 190, 8, tier.titleRgb);

  // Awarded to
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.text("Awarded to", w / 2, 240, { align: "center" });

  doc.setTextColor(...tier.titleRgb);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(38);
  doc.text(data.name, w / 2, 286, { align: "center" });

  // Body
  doc.setTextColor(220, 220, 240);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);

  if (isChampion) {
    doc.text(tier.blurb, w / 2, 330, { align: "center" });
    doc.text(
      `Lifetime XP earned: ${data.totalXp}`,
      w / 2,
      354,
      { align: "center" }
    );
  } else {
    doc.text(
      `for completing the ${meta?.label} level ${tier.blurb}`,
      w / 2,
      330,
      { align: "center" }
    );
    doc.text(
      `Score: ${correct} / ${total}  (${percent}%)    +${data.xpEarned ?? 0} XP earned    ${data.totalXp} XP total`,
      w / 2,
      354,
      { align: "center" }
    );
  }

  // Footer
  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  doc.setDrawColor(190, 242, 100);
  doc.line(120, h - 110, 320, h - 110);
  doc.line(w - 320, h - 110, w - 120, h - 110);

  doc.setFontSize(12);
  doc.setTextColor(190, 190, 230);
  doc.text("Date", 220, h - 92, { align: "center" });
  doc.text(date, 220, h - 75, { align: "center" });

  doc.text("GrammarQuest Academy", w - 220, h - 92, { align: "center" });
  doc.setTextColor(217, 70, 239);
  doc.text(`${tier.label} SEAL`, w - 220, h - 75, { align: "center" });
  // Star flourishes around the seal label
  const sealText = `${tier.label} SEAL`;
  const sealWidth = doc.getTextWidth(sealText);
  drawStar(w - 220 - sealWidth / 2 - 14, h - 79, 5, [217, 70, 239]);
  drawStar(w - 220 + sealWidth / 2 + 14, h - 79, 5, [217, 70, 239]);

  const safeName = data.name.replace(/\s+/g, "_");
  const filename = isChampion
    ? `GrammarQuest-Champion-${safeName}.pdf`
    : `GrammarQuest-${meta?.label ?? "Level"}-${tier.label}-${safeName}.pdf`;

  return { doc, filename };
}

/** Build certificate and return a data URI suitable for an <iframe> preview.
 *  We use a data URI (not blob:) because some browsers (notably Chrome on
 *  certain hosting setups) block blob: URLs inside sandboxed iframes,
 *  showing "This page has been blocked by Chrome". Data URIs render inline. */
export function getCertificatePreviewUrl(data: CertificateData): { url: string; filename: string } {
  const { doc, filename } = buildCertificate(data);
  const url = doc.output("datauristring") as unknown as string;
  return { url: String(url), filename };
}

/** Build and trigger a download. */
export function downloadCertificate(data: CertificateData) {
  const { doc, filename } = buildCertificate(data);
  doc.save(filename);
}

/* ---------- Backwards-compatible legacy API ---------- */
export function generateCertificate(name: string, totalXp: number) {
  downloadCertificate({ kind: "champion", name, totalXp });
}
