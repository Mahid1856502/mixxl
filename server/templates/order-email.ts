function formatMoney(amount: number) {
  return `£${amount.toFixed(2)}`;
}

function formatAddress(address?: any) {
  if (!address) return "—";
  return `
    ${address.line1 || ""}<br/>
    ${address.line2 || ""}<br/>
    ${address.city || ""}<br/>
    ${address.postal_code || ""}<br/>
    ${address.country || ""}
  `;
}

export function generateCustomerOrderEmail(order: any) {
  const subject = `Order confirmed · ${order.id}`;

  const itemsHtml = order.lines
    .map(
      (l: any) => `
        <tr>
          <td>${l.title || "Product"}</td>
          <td align="center">${l.quantity}</td>
          <td align="right">${formatMoney(l.unitPrice)}</td>
          <td align="right">${formatMoney(l.lineTotal)}</td>
        </tr>
      `
    )
    .join("");

  const html = `
    <h2>Thanks for your order</h2>
    <p>Your payment was successful. Here are your order details:</p>

    <p><strong>Order ID:</strong> ${order.id}</p>

    <table width="100%" cellpadding="8" cellspacing="0" border="1">
      <thead>
        <tr>
          <th align="left">Item</th>
          <th align="center">Qty</th>
          <th align="right">Price</th>
          <th align="right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <p><strong>Order total:</strong> ${formatMoney(order.totalAmount)}</p>

    <h3>Shipping address</h3>
    <p>${formatAddress(order.shippingAddress)}</p>

    <p>If you have any issues, just reply to this email.</p>
  `;

  const text = `
Order confirmed

Order ID: ${order.id}
Total: ${formatMoney(order.totalAmount)}

Thank you for your purchase.
  `.trim();

  return { subject, html, text };
}

export function generateArtistOrderEmail(
  order: any,
  buyer: {
    name: string;
    email: string;
  }
) {
  const subject = `New order received`;

  const itemsText = order.lines
    .map(
      (l: any) =>
        `- ${l.title || "Product"} ×${l.quantity} (${formatMoney(l.lineTotal)})`
    )
    .join("\n");

  const html = `
    <h2>New order received</h2>
    <p>You’ve just made a sale.</p>

    <p><strong>Order ID:</strong> ${order.id}</p>
    <p><strong>Total:</strong> ${formatMoney(order.totalAmount)}</p>

    <h3>Customer</h3>
    <p>
      ${buyer.name}<br/>
      <a href="mailto:${buyer.email}">${buyer.email}</a>
    </p>

    <h3>Items</h3>
    <ul>
      ${order.lines
        .map(
          (l: any) =>
            `<li>${l.title || "Product"} ×${l.quantity} — ${formatMoney(
              l.lineTotal
            )}</li>`
        )
        .join("")}
    </ul>

    <h3>Shipping address</h3>
    <p>${formatAddress(order.shippingAddress)}</p>
  `;

  const text = `
New order received

Order ID: ${order.id}
Total: ${formatMoney(order.totalAmount)}

Customer:
${buyer.name}
${buyer.email}

Items:
${itemsText}
  `.trim();

  return { subject, html, text };
}

export function generatePaymentFailedEmail(order: any) {
  const subject = `Payment failed for your order`;
  const html = `
    <h2>Payment failed</h2>
    <p>Your payment for order ${order.id} did not succeed.</p>
  `;
  const text = `Payment failed for order ${order.id}`;
  return { subject, html, text };
}
export function generateRefundEmail(order: any, isArtist: boolean) {
  const subject = `Order refunded · ${order.id}`;

  const intro = isArtist
    ? "An order has been refunded."
    : "Your order has been refunded.";

  const html = `
    <h2>Refund processed</h2>
    <p>${intro}</p>

    <p><strong>Order ID:</strong> ${order.id}</p>
    <p><strong>Refund amount:</strong> ${formatMoney(order.totalAmount)}</p>

    ${
      !isArtist
        ? "<p>The funds will return to your original payment method shortly.</p>"
        : ""
    }
  `;

  const text = `
Order refunded

Order ID: ${order.id}
Amount: ${formatMoney(order.totalAmount)}
  `.trim();

  return { subject, html, text };
}

export function generateTicketConfirmationEmail(
  order: any,
  event: any,
  tickets: Array<{
    id: string;
    ticketTypeName: string;
    ticketTypePrice: string;
  }>
) {
  const subject = `Your tickets for ${event.title}`;
  
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: string | number) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return `£${num.toFixed(2)}`;
  };

  const ticketsHtml = tickets
    .map(
      (ticket) => `
        <tr>
          <td>${ticket.ticketTypeName}</td>
          <td align="right">${formatPrice(ticket.ticketTypePrice)}</td>
          <td align="center">${ticket.id.substring(0, 8)}...</td>
        </tr>
      `
    )
    .join("");

  const html = `
    <h2>Your tickets are confirmed!</h2>
    <p>Thank you for your purchase. Your tickets for <strong>${event.title}</strong> are ready.</p>

    <h3>Event Details</h3>
    <p>
      <strong>Event:</strong> ${event.title}<br/>
      <strong>Date & Time:</strong> ${formatDate(event.startDateTime)}<br/>
      <strong>Venue:</strong> ${event.venue}<br/>
      <strong>Location:</strong> ${event.location}
    </p>

    <h3>Your Tickets</h3>
    <table width="100%" cellpadding="8" cellspacing="0" border="1">
      <thead>
        <tr>
          <th align="left">Ticket Type</th>
          <th align="right">Price</th>
          <th align="center">Ticket ID</th>
        </tr>
      </thead>
      <tbody>
        ${ticketsHtml}
      </tbody>
    </table>

    <p><strong>Order ID:</strong> ${order.id}</p>
    <p><strong>Total Paid:</strong> ${formatPrice(order.totalAmount)}</p>

    <p>Please bring a valid ID and this confirmation email to the event. Your tickets will be checked at the venue.</p>
    
    <p>If you have any questions, please contact the event organizer or reply to this email.</p>
  `;

  const text = `
Your tickets are confirmed!

Event: ${event.title}
Date & Time: ${formatDate(event.startDateTime)}
Venue: ${event.venue}
Location: ${event.location}

Your Tickets:
${tickets.map(t => `- ${t.ticketTypeName} (${formatPrice(t.ticketTypePrice)}) - Ticket ID: ${t.id.substring(0, 8)}...`).join("\n")}

Order ID: ${order.id}
Total Paid: ${formatPrice(order.totalAmount)}

Please bring a valid ID and this confirmation to the event.
  `.trim();

  return { subject, html, text };
}
