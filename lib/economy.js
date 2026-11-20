// Demo data for the "Saldo → Mit overblik" flow.
// Amounts are in whole kroner unless noted otherwise.

export const yearSummary = {
  year: 2026,
  sold: 3125,
  bought: 1865,
};

export const months = [
  { slug: "januar-2026", short: "Jan", label: "Januar 2026", sold: 420, bought: 1000 },
  { slug: "februar-2026", short: "Feb", label: "Februar 2026", sold: 400, bought: 300 },
  { slug: "marts-2026", short: "Mar", label: "Marts 2026", sold: 75, bought: 420 },
  { slug: "april-2026", short: "Apr", label: "April 2026", sold: 220, bought: 200 },
  { slug: "maj-2026", short: "Maj", label: "Maj 2026", sold: 740, bought: 420 },
  { slug: "juni-2026", short: "Jun", label: "Juni 2026", sold: 950, bought: 200 },
];

export const years = [
  { slug: "2023", short: "2023", label: "2023", sold: 2540, bought: 1195 },
  { slug: "2024", short: "2024", label: "2024", sold: 950, bought: 2815 },
  { slug: "2025", short: "2025", label: "2025", sold: 1990, bought: 3890 },
  { slug: "2026", short: "2026", label: "2026", sold: yearSummary.sold, bought: yearSummary.bought },
];

// Sales and purchases per month. Only January is fully designed in Figma.
const sales = {
  "januar-2026": [
    { id: "birkenstock", title: "Birkenstock", date: "02. januar 2026", price: 120, image: "/economy/birkenstock.jpg", buyer: "mariaskov12", orderNumber: "654321" },
    { id: "kamera", title: "Kamera", date: "09. januar 2026", price: 100, image: "/economy/kamera.jpg", buyer: "anne-louise0709", orderNumber: "654322" },
    { id: "jakke", title: "Jakke", date: "11. januar 2026", price: 100, image: "/economy/jakke.jpg", buyer: "naja3409", orderNumber: "654323" },
    { id: "smykker", title: "Smykker", date: "20. januar 2026", price: 50, image: "/economy/smykker.jpg", buyer: "bibilula2", orderNumber: "654324" },
    { id: "kasket", title: "Kasket", date: "28. januar 2026", price: 50, image: "/economy/kasket.jpg", buyer: "kaska_537", orderNumber: "654325" },
  ],
};

const purchases = {
  "januar-2026": [
    { id: "haandlavet-vase", title: "Håndlavet vase", date: "15. januar 2026", price: 400, itemPrice: 370, shipping: 22.75, fee: 7.25, image: "/economy/vase.jpg", seller: "anne-louise0709", orderNumber: "123456" },
    { id: "lava-lampe", title: "Lava lampe", date: "19. januar 2026", price: 300, itemPrice: 270, shipping: 22.75, fee: 7.25, image: "/economy/lava-lampe.jpg", seller: "mariaskov12", orderNumber: "123457" },
    { id: "hylde", title: "Hylde", date: "26. januar 2026", price: 300, itemPrice: 270, shipping: 22.75, fee: 7.25, image: "/economy/hylde.jpg", seller: "anitt284", orderNumber: "123458" },
  ],
};

export function getMonth(slug) {
  return months.find((month) => month.slug === slug);
}

export function getSales(monthSlug) {
  return sales[monthSlug] ?? [];
}

export function getPurchases(monthSlug) {
  return purchases[monthSlug] ?? [];
}

export function getSale(monthSlug, id) {
  return getSales(monthSlug).find((item) => item.id === id);
}

export function getPurchase(monthSlug, id) {
  return getPurchases(monthSlug).find((item) => item.id === id);
}

// 3125 → "3.125 kr."  ·  -250 → "- 250 kr."
export function formatKr(value) {
  const abs = Math.abs(value).toLocaleString("da-DK");
  return `${value < 0 ? "- " : ""}${abs} kr.`;
}

// 22.75 → "22,75 kr."
export function formatKrDecimals(value) {
  return `${value.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr.`;
}
