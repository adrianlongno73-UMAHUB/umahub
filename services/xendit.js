/**
 * Xendit Payment Gateway Integration for UmaHub
 * Supports GCash, Maya, Cards, and Test Sandbox Mode.
 *
 * Official Xendit Docs: https://docs.xendit.co
 */

// ==============================================================================
// 🔑 XENDIT DIRECT CREDENTIALS CONFIGURATION
// I-paste diri LARGO ang imong Xendit Secret Key gikan sa Xendit Dashboard:
// (Xendit Dashboard -> Settings -> Developers -> API Keys -> Secret Key)
//
// 1. Para sa Test / Sandbox: magsugod sa 'xnd_development_...'
// 2. Para sa Live / Production: magsugod sa 'xnd_production_...'
// ==============================================================================
export const XENDIT_SECRET_KEY = '';
export const XENDIT_PUBLIC_KEY = 'xnd_public_development_1Tcud65upqOAlDbfTHAK0j7D8m848Y_Rkj5K1uc6muRqFU4RXMfG9x_6H8_MVrnM';

// I-set sa 'test' kung test sandbox pa, o 'live' kung tinuod na nga kwarta
export const XENDIT_ENVIRONMENT = 'test'; // 'test' | 'live'
export const XENDIT_MERCHANT_NAME = 'UmaHub Marketplace';

/**
 * Kuhaon ang pinakabag-o nga epektibong secret key
 */
export function getEffectiveXenditKey() {
  const localKey = localStorage.getItem('umahub_xendit_key');
  return localKey && localKey.trim() ? localKey.trim() : XENDIT_SECRET_KEY;
}

/**
 * Check kung naka-set na ba og custom key
 */
export function isXenditConfigured() {
  const key = getEffectiveXenditKey();
  return Boolean(key) && !key.includes('yourSecretKeyHere');
}

/**
 * Save Xendit API keys sa browser storage (optional)
 */
export function saveXenditKeys({ secretKey, publicKey, isTest = true }) {
  if (secretKey) localStorage.setItem('umahub_xendit_key', secretKey.trim());
  if (publicKey) localStorage.setItem('umahub_xendit_public_key', publicKey.trim());
  localStorage.setItem('umahub_xendit_mode', isTest ? 'test' : 'live');
}

/**
 * Create a Xendit Invoice via Xendit API
 */
export async function createXenditInvoice({
  externalId,
  amount,
  payerEmail = 'customer@umahub.ph',
  description = 'UmaHub Fresh Produce Order',
  customerName = 'Customer',
  customerPhone = '09171234567',
  successRedirectUrl = window.location.origin + window.location.pathname + '#confirmation',
  failureRedirectUrl = window.location.origin + window.location.pathname + '#checkout'
}) {
  const currentKey = getEffectiveXenditKey();

  const payload = {
    external_id: externalId || 'UH-' + Date.now(),
    amount: parseFloat(amount),
    description,
    invoice_duration: 86400,
    customer: {
      given_names: customerName,
      email: payerEmail,
      mobile_number: customerPhone
    },
    currency: 'PHP',
    payment_methods: ['GCASH', 'PAYMAYA', 'CARD', '7ELEVEN'],
    success_redirect_url: successRedirectUrl,
    failure_redirect_url: failureRedirectUrl
  };

  try {
    const res = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(currentKey + ':')}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok && data?.invoice_url) {
      return {
        success: true,
        invoiceId: data.id,
        invoiceUrl: data.invoice_url
      };
    }

    return {
      success: false,
      error: data?.message || 'Could not create Xendit invoice'
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Simulate Xendit Sandbox Test Payment
 */
export async function simulateXenditTestPayment({
  amount,
  method = 'GCASH',
  orderNumber = '#UH-24038',
  customerName = 'Customer',
  customerPhone = '0917 123 4567'
}) {
  // Realistic simulated network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const testInvoiceId = 'inv_xnd_' + Math.random().toString(36).substring(2, 10).toUpperCase();
  const testPaymentRef = 'pay_xnd_' + Math.random().toString(36).substring(2, 10).toUpperCase();

  return {
    success: true,
    status: 'PAID',
    invoiceId: testInvoiceId,
    paymentId: testPaymentRef,
    amount: parseFloat(amount).toFixed(2),
    currency: 'PHP',
    paidVia: method.toUpperCase(),
    paidAt: new Date().toISOString(),
    orderNumber,
    customer: {
      name: customerName,
      phone: customerPhone
    }
  };
}
