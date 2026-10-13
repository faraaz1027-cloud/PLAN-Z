const TICKET_CATEGORIES = ["General Pass", "VIP", "Early Access"];

const DEFAULT_TICKET_CONFIG = {
  "General Pass": { price: 100, quantityAvailable: 100 },
  VIP: { price: 500, quantityAvailable: 30 },
  "Early Access": { price: 250, quantityAvailable: 50 },
};

const normalizeTicketName = (name = "") => String(name).trim().toLowerCase();

const mapLegacyTicketName = (name = "") => {
  const normalized = normalizeTicketName(name);
  if (["regular", "general", "general admission", "general pass", "standard"].includes(normalized)) return "General Pass";
  if (["vip", "v.i.p"].includes(normalized)) return "VIP";
  if (["early", "early access", "early bird", "early-bird"].includes(normalized)) return "Early Access";
  return null;
};

const toSafeNumber = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
};

const normalizeEventTicketTypes = (ticketTypes = [], fallbackPrice = 100) => {
  const existingByCategory = {};

  if (Array.isArray(ticketTypes)) {
    ticketTypes.forEach((ticket) => {
      const category = mapLegacyTicketName(ticket?.name || ticket?.type || ticket?.ticketType);
      if (!category || existingByCategory[category]) return;
      existingByCategory[category] = ticket;
    });
  }

  return TICKET_CATEGORIES.map((category) => {
    const existing = existingByCategory[category] || {};
    const defaults = DEFAULT_TICKET_CONFIG[category];
    const legacyFallbackPrice = category === "General Pass" ? toSafeNumber(fallbackPrice, defaults.price) : defaults.price;

    return {
      name: category,
      price: toSafeNumber(existing.price ?? existing.ticketPrice, legacyFallbackPrice),
      quantityAvailable: toSafeNumber(existing.quantityAvailable ?? existing.quantity ?? existing.available, defaults.quantityAvailable),
      quantitySold: toSafeNumber(existing.quantitySold ?? existing.sold, 0),
    };
  });
};

const getMinimumTicketPrice = (ticketTypes = []) => {
  const normalized = normalizeEventTicketTypes(ticketTypes);
  return Math.min(...normalized.map((ticket) => ticket.price));
};

module.exports = {
  TICKET_CATEGORIES,
  DEFAULT_TICKET_CONFIG,
  normalizeEventTicketTypes,
  getMinimumTicketPrice,
  mapLegacyTicketName,
};
