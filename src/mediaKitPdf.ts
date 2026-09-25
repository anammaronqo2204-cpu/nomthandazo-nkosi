import { jsPDF } from "jspdf";

type RGB = readonly [number, number, number];

const INK: RGB = [15, 27, 46];
const BONE: RGB = [244, 241, 234];
const BRASS: RGB = [166, 124, 61];
const CHARCOAL: RGB = [42, 42, 40];
const SLATE: RGB = [92, 100, 112];
const MIST: RGB = [214, 208, 196];

const PAGE_W = 210;
const PAGE_H = 297;
const M = 16;
const CONTENT_W = PAGE_W - M * 2;
const EMAIL = "nomiemotso@gmail.com";
const MAILTO =
  "mailto:nomiemotso@gmail.com?subject=Partnership%20enquiry%20-%20Nomthandazo%20Nkosi";
const TIKTOK = "https://www.tiktok.com/@nomie_nkosi";
const INSTAGRAM = "https://www.instagram.com/nomieland.nkosi/";

export const partnershipOverviewFileName = "Nomthandazo-Nkosi-Partnership-Overview.pdf";

function fill(doc: jsPDF, color: RGB) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function ink(doc: jsPDF, color: RGB) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function stroke(doc: jsPDF, color: RGB) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function rule(doc: jsPDF, x: number, y: number, width: number, weight = 0.35) {
  stroke(doc, BRASS);
  doc.setLineWidth(weight);
  doc.line(x, y, x + width, y);
}

function label(doc: jsPDF, text: string, x: number, y: number, color: RGB = BRASS, size = 8) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size);
  doc.setCharSpace(1.15);
  ink(doc, color);
  doc.text(text.toUpperCase(), x, y);
  doc.setCharSpace(0);
}

function lineHeight(size: number, factor: number) {
  return size * 0.3528 * factor;
}

function paragraph(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  options?: { size?: number; factor?: number; color?: RGB; style?: "normal" | "italic" | "bold" },
) {
  const size = options?.size ?? 11;
  const factor = options?.factor ?? 1.38;
  doc.setFont("times", options?.style ?? "normal");
  doc.setFontSize(size);
  ink(doc, options?.color ?? CHARCOAL);
  const lines = doc.splitTextToSize(text, width) as string[];
  doc.text(lines, x, y, { lineHeightFactor: factor });
  return y + lines.length * lineHeight(size, factor);
}

function fittedSize(doc: jsPDF, text: string, font: string, style: string, size: number, maxWidth: number) {
  doc.setFont(font, style);
  let next = size;
  doc.setFontSize(next);
  while (next > 16 && doc.getTextWidth(text) > maxWidth) {
    next -= 0.5;
    doc.setFontSize(next);
  }
  return next;
}

function footer(doc: jsPDF, page: string) {
  stroke(doc, BRASS);
  doc.setLineWidth(0.25);
  doc.line(M, 281, PAGE_W - M, 281);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  ink(doc, SLATE);
  doc.text("Nomthandazo Nkosi  /  Partnership overview", M, 286.5);
  doc.text(page, PAGE_W - M, 286.5, { align: "right" });
}

function paintPage(doc: jsPDF, color: RGB) {
  fill(doc, color);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
}

function drawCover(doc: jsPDF) {
  paintPage(doc, INK);
  stroke(doc, BRASS);
  doc.setLineWidth(0.7);
  doc.line(0, 0, 0.7, PAGE_H);

  label(doc, "Partnership overview", M, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setCharSpace(1.15);
  ink(doc, MIST);
  doc.text("3 PAGES", PAGE_W - M, 20, { align: "right" });
  doc.setCharSpace(0);
  rule(doc, M, 25, 32, 0.45);

  const firstSize = fittedSize(doc, "Nomthandazo", "times", "normal", 46, CONTENT_W);
  doc.setFont("times", "normal");
  doc.setFontSize(firstSize);
  ink(doc, BONE);
  doc.text("Nomthandazo", M, 56);

  const secondSize = fittedSize(doc, "Nkosi", "times", "italic", 46, CONTENT_W);
  doc.setFont("times", "italic");
  doc.setFontSize(secondSize);
  doc.text("Nkosi", M, 74);
  rule(doc, M, 82, 28, 0.4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  ink(doc, BRASS);
  doc.text("Master's graduate   /   Businesswoman   /   Host, Not Sorry", M, 92);

  paragraph(
    doc,
    "A Johannesburg businesswoman with a postgraduate degree, a compliance practice, and a public voice that does not soften the point. This overview is for brands, affiliates and clients deciding whether to work with her.",
    M,
    106,
    148,
    { size: 13, factor: 1.36, color: MIST },
  );

  const credentials = [
    ["01", "Master's graduate", "The credential that leads every introduction."],
    ["02", "Business owner", "Tender and RFQ compliance consulting."],
    ["03", "Host, Not Sorry", "With Seemah Mangolwane and Munaka Muthambi."],
  ];
  credentials.forEach((item, index) => {
    const y = 154 + index * 22;
    doc.setFont("times", "italic");
    doc.setFontSize(16);
    ink(doc, BRASS);
    doc.text(item[0], M, y);
    doc.setFont("times", "normal");
    doc.setFontSize(14);
    ink(doc, BONE);
    doc.text(item[1], M + 16, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    ink(doc, MIST);
    doc.text(item[2], M + 16, y + 6);
  });

  label(doc, "Prepared for", 122, 154);
  const readers = [
    "Brands booking a partner",
    "Affiliates and ambassadors",
    "Clients who need her in the room",
    "Businesses with a tender or RFQ",
  ];
  readers.forEach((reader, index) => {
    const y = 164 + index * 8;
    stroke(doc, BRASS);
    doc.setLineWidth(0.3);
    doc.line(122, y - 1.2, 126, y - 1.2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    ink(doc, BONE);
    doc.text(reader, 130, y);
  });

  rule(doc, M, 224, CONTENT_W, 0.25);
  doc.setFont("times", "italic");
  doc.setFontSize(16);
  ink(doc, BONE);
  doc.textWithLink(EMAIL, M, 236, { url: MAILTO });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  ink(doc, MIST);
  doc.text("Johannesburg, South Africa", M, 244);
  doc.textWithLink("TikTok  @nomie_nkosi", M, 252, { url: TIKTOK });
  doc.textWithLink("Instagram  @nomieland.nkosi", 78, 252, { url: INSTAGRAM });

  stroke(doc, BRASS);
  doc.setLineWidth(0.25);
  doc.line(M, 281, PAGE_W - M, 281);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  ink(doc, MIST);
  doc.text("For circulation before a conversation. Not a rate card.", M, 286.5);
  doc.text("01", PAGE_W - M, 286.5, { align: "right" });
}

function drawCase(doc: jsPDF) {
  paintPage(doc, BONE);
  fill(doc, INK);
  doc.rect(0, 0, PAGE_W, 18, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setCharSpace(1.2);
  ink(doc, BONE);
  doc.text("NKOSI", M, 11);
  ink(doc, BRASS);
  doc.text("02  /  THE CASE", PAGE_W - M, 11, { align: "right" });
  doc.setCharSpace(0);

  label(doc, "Why she is in the room", M, 32);
  doc.setFont("times", "normal");
  doc.setFontSize(24);
  ink(doc, INK);
  doc.text("Credentials before a following.", M, 43);
  rule(doc, M, 48, 28, 0.4);

  let y = paragraph(
    doc,
    "Nomthandazo Nkosi is introduced by her education, her business and the show she hosts. The audience is real. It is not the reason she has a seat.",
    M,
    58,
    CONTENT_W,
    { size: 12.5, factor: 1.35, style: "italic", color: INK },
  );

  y = paragraph(
    doc,
    "She is based in Johannesburg and works across business, media and political spaces. In rooms where women are still outnumbered, her position rests on preparation and the standard of the work, not on visibility alone.",
    M,
    y + 4,
    CONTENT_W,
  );
  y = paragraph(
    doc,
    "Her consultancy handles tender and RFQ compliance for businesses preparing submissions. That practice is separate from her public work. It is for companies that need the documents to hold up.",
    M,
    y + 3,
    CONTENT_W,
  );
  y = paragraph(
    doc,
    "On camera she is direct. The work moves between faith, television and show reviews, running and everyday life, alongside clips from Not Sorry. She is the wrong partner for a soft, undifferentiated lifestyle read. She is the right partner when the association has to hold up in a serious room.",
    M,
    y + 3,
    CONTENT_W,
  );

  y += 6;
  label(doc, "Where she is useful", M, y);
  y += 8;
  const uses = [
    ["01", "A brand needs a South African partner who can be put in front of a client without apology."],
    ["02", "An affiliate or ambassador brief needs a business owner, not only a distributor of posts."],
    ["03", "A show integration has to survive an honest conversation."],
    ["04", "A company needs tender or RFQ compliance support, and a creator brief would be the wrong document."],
  ];
  uses.forEach((item) => {
    doc.setFont("times", "italic");
    doc.setFontSize(11);
    ink(doc, BRASS);
    doc.text(item[0], M, y);
    y = paragraph(doc, item[1], M + 12, y, CONTENT_W - 12, { size: 10.5, factor: 1.32 });
    y += 3.2;
  });

  y += 2;
  label(doc, "Audience, as proof", M, y);
  y += 5;
  rule(doc, M, y, CONTENT_W, 0.3);
  y += 9;

  const stats = [
    {
      kicker: "TikTok  /  primary",
      figure: "492K",
      unit: "followers",
      secondary: "17.2M likes",
      handle: "@nomie_nkosi",
      url: TIKTOK,
    },
    {
      kicker: "Instagram",
      figure: "26.5K",
      unit: "followers",
      secondary: "A closer community",
      handle: "@nomieland.nkosi",
      url: INSTAGRAM,
    },
  ];
  const boxW = (CONTENT_W - 8) / 2;
  stats.forEach((stat, index) => {
    const x = M + index * (boxW + 8);
    label(doc, stat.kicker, x, y, BRASS, 7.5);
    doc.setFont("times", "normal");
    doc.setFontSize(28);
    ink(doc, INK);
    const figureWidth = doc.getTextWidth(stat.figure);
    doc.text(stat.figure, x, y + 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    ink(doc, SLATE);
    doc.text(stat.unit, x + figureWidth + 2.8, y + 12.2);
    doc.setFont("times", "italic");
    doc.setFontSize(12);
    ink(doc, CHARCOAL);
    doc.text(stat.secondary, x, y + 21);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    ink(doc, SLATE);
    doc.textWithLink(stat.handle, x, y + 28, { url: stat.url });
  });

  paragraph(
    doc,
    "These are the working figures for this overview. Confirm them at booking. Reach is evidence of attention. It is not a substitute for the credentials on the previous lines.",
    M,
    y + 38,
    CONTENT_W,
    { size: 9, factor: 1.35, color: SLATE },
  );

  rule(doc, M, 262, 28, 0.35);
  doc.setFont("times", "italic");
  doc.setFontSize(12);
  ink(doc, INK);
  doc.text("To continue the conversation: ", M, 270);
  const lead = doc.getTextWidth("To continue the conversation: ");
  doc.textWithLink(EMAIL, M + lead, 270, { url: MAILTO });

  footer(doc, "02");
}

function drawWorking(doc: jsPDF) {
  paintPage(doc, BONE);
  fill(doc, INK);
  doc.rect(0, 0, PAGE_W, 86, "F");
  label(doc, "03  /  The show", M, 18, BRASS);
  doc.setFont("times", "italic");
  doc.setFontSize(36);
  ink(doc, BONE);
  doc.text("Not Sorry.", M, 36);
  rule(doc, M, 42, 24, 0.4);
  paragraph(
    doc,
    "A South African podcast built on unfiltered, honest conversation. Hosted by Nomthandazo Nkosi, Seemah Mangolwane and Munaka Muthambi.",
    M,
    52,
    150,
    { size: 12, factor: 1.35, color: MIST },
  );
  paragraph(
    doc,
    "The show does not sand a subject down to make it easier to sponsor. A partnership belongs here only if the brand can live with that format.",
    M,
    70,
    150,
    { size: 10.5, factor: 1.32, color: BONE },
  );

  let y = 100;
  label(doc, "Four ways in", M, y);
  y += 8;
  const ways = [
    ["01", "Brand partnerships", "TikTok and Instagram, shaped around a credible fit with faith, television, running, lifestyle or the podcast. Not a costume change for a brief."],
    ["02", "Not Sorry", "Show partnerships and integrations for an audience that came for candour. The tone of the show stays intact."],
    ["03", "Affiliate and ambassador", "A longer association for brands that want to be identified with her, not rented for a weekend. The relationship is disclosed. The fit still has to be credible."],
    ["04", "Tender and RFQ compliance", "Consulting for businesses preparing submissions. This is professional services. It is not creator marketing, and it should not be briefed as if it were."],
  ];
  ways.forEach((way, index) => {
    if (index > 0) {
      stroke(doc, [197, 196, 190]);
      doc.setLineWidth(0.25);
      doc.line(M, y - 5, PAGE_W - M, y - 5);
    }
    doc.setFont("times", "italic");
    doc.setFontSize(12);
    ink(doc, BRASS);
    doc.text(way[0], M, y);
    doc.setFont("times", "normal");
    doc.setFontSize(13);
    ink(doc, INK);
    doc.text(way[1], M + 14, y);
    y = paragraph(doc, way[2], M + 14, y + 6, CONTENT_W - 14, { size: 10, factor: 1.32, color: SLATE });
    y += 8;
  });

  y += 1;
  label(doc, "What to send", M, y);
  y += 7;
  y = paragraph(
    doc,
    "Write with the brand or business, the ask, the timing, and which door this is: a campaign, a show partnership, an affiliate or ambassador relationship, or a compliance brief. Rates are issued against that brief. They are not published here.",
    M,
    y,
    CONTENT_W,
    { size: 11, factor: 1.36 },
  );
  paragraph(
    doc,
    "A clear brief gets a clear answer. She reads the room before she accepts the work.",
    M,
    y + 2,
    CONTENT_W,
    { size: 11, factor: 1.35, style: "italic", color: INK },
  );

  fill(doc, INK);
  doc.rect(0, 250, PAGE_W, 47, "F");
  label(doc, "Make the introduction", M, 262, BRASS);
  doc.setFont("times", "italic");
  doc.setFontSize(16);
  ink(doc, BONE);
  doc.textWithLink(EMAIL, M, 272, { url: MAILTO });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  ink(doc, MIST);
  doc.text("Johannesburg, South Africa", M, 280);
  doc.text("03", PAGE_W - M, 280, { align: "right" });
}

export function buildPartnershipOverview() {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.setProperties({
    title: "Nomthandazo Nkosi - Partnership overview",
    subject: "Overview for brands, affiliates and clients",
    author: "Nomthandazo Nkosi",
    keywords: "Nomthandazo Nkosi, Not Sorry, brand partnerships, affiliate, Johannesburg",
    creator: "Nomthandazo Nkosi media kit",
  });
  drawCover(doc);
  doc.addPage();
  drawCase(doc);
  doc.addPage();
  drawWorking(doc);
  return doc;
}

export function downloadPartnershipOverview() {
  buildPartnershipOverview().save(partnershipOverviewFileName);
}
