const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) return false;

  const phone = to.replace(/\D/g, "");
  if (!phone) return false;

  try {
    const res = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendWhatsAppNotification(to: string, message: string) {
  return sendWhatsAppMessage(to, message);
}

export async function notifyNewBooking(
  tenantPhone: string,
  tenantName: string,
  customerName: string,
  serviceName: string,
  date: Date
) {
  const dateStr = date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const message =
    `🔔 Nouvelle réservation sur ${tenantName} !\n` +
    `Client : ${customerName}\n` +
    `Service : ${serviceName}\n` +
    `Date souhaitée : ${dateStr}\n\n` +
    `Connectez-vous à votre dashboard pour confirmer.`;

  return sendWhatsAppMessage(tenantPhone, message);
}

export async function sendAppointmentReminder(
  customerPhone: string,
  tenantName: string,
  serviceName: string,
  date: Date
) {
  const dateStr = date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const message =
    `👋 Rappel de votre rendez-vous avec ${tenantName}\n` +
    `Service : ${serviceName}\n` +
    `Date : ${dateStr}\n\n` +
    `En cas d'empêchement, contactez-nous directement.`;

  return sendWhatsAppMessage(customerPhone, message);
}

export async function sendBookingConfirmation(
  customerPhone: string,
  tenantName: string,
  serviceName: string,
  date: Date
) {
  const dateStr = date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const message =
    `✅ Votre demande de rendez-vous a bien été reçue !\n` +
    `Prestataire : ${tenantName}\n` +
    `Service : ${serviceName}\n` +
    `Date souhaitée : ${dateStr}\n\n` +
    `Nous vous confirmerons votre rendez-vous très prochainement.`;

  return sendWhatsAppMessage(customerPhone, message);
}
