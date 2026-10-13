export const TICKET_CATEGORIES = [
  { name: 'General Pass', defaultPrice: 100, defaultQuantity: 100 },
  { name: 'VIP', defaultPrice: 500, defaultQuantity: 30 },
  { name: 'Early Access', defaultPrice: 250, defaultQuantity: 50 },
];

export const normalizeTicketName = (name = '') => {
  const value = String(name).trim().toLowerCase();
  if (['regular', 'general', 'general admission', 'general pass', 'standard'].includes(value)) return 'General Pass';
  if (value === 'vip') return 'VIP';
  if (['early', 'early access', 'early bird'].includes(value)) return 'Early Access';
  return name;
};

export const normalizeTickets = (ticketTypes = [], fallbackPrice = 100) => {
  const existing = {};
  if (Array.isArray(ticketTypes)) {
    ticketTypes.forEach((ticket) => {
      const name = normalizeTicketName(ticket.name || ticket.type || ticket.ticketType || '');
      if (TICKET_CATEGORIES.some((category) => category.name === name) && !existing[name]) {
        existing[name] = ticket;
      }
    });
  }

  return TICKET_CATEGORIES.map((category) => {
    const ticket = existing[category.name] || {};
    const legacyFallbackPrice = category.name === 'General Pass' ? Number(fallbackPrice) || category.defaultPrice : category.defaultPrice;
    return {
      name: category.name,
      price: Number(ticket.price ?? ticket.ticketPrice ?? legacyFallbackPrice) || legacyFallbackPrice,
      quantityAvailable: Number(ticket.quantityAvailable ?? ticket.quantity ?? ticket.available ?? category.defaultQuantity) || category.defaultQuantity,
      quantitySold: Number(ticket.quantitySold ?? ticket.sold ?? 0) || 0,
    };
  });
};

export const minTicketPrice = (ticketTypes = [], fallbackPrice = 100) => {
  const tickets = normalizeTickets(ticketTypes, fallbackPrice);
  return Math.min(...tickets.map((ticket) => ticket.price));
};
