export function cmsConfigured() {
  return Boolean(
    process.env.DATABASE_URL && (process.env.PAYLOAD_SECRET?.length ?? 0) >= 32,
  );
}

export function ordersConfigured() {
  const shipping = Number(process.env.SHIPPING_PRICE_BANI);
  return (
    cmsConfigured() && Boolean(process.env.APP_URL) &&
    /^\d+$/.test(process.env.SHIPPING_PRICE_BANI ?? "") &&
    Number.isSafeInteger(shipping) && shipping >= 0 && shipping <= 99999999
  );
}

/** Fail closed unless payments, signed webhooks and an explicit shipping amount are configured. */
export function checkoutConfigured() {
  return (
    ordersConfigured() &&
    Boolean(
      process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET,
    )
  );
}

export function requireCMS() {
  if (!cmsConfigured())
    throw new Error(
      "Configure DATABASE_URL and PAYLOAD_SECRET before starting commerce.",
    );
}
