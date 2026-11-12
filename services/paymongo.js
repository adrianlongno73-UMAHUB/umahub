/**
 * PayMongo Payment Gateway Service for UmaHub
 * Supports GCash, Maya, Cards, and Sandbox/Test Mode.
 *
 * For Production: replace test keys with live keys from your PayMongo dashboard.
 */

// Default Test Keys (can be overridden via localStorage or .env)
export const PAYMONGO_CONFIG = {
  // Public test key for client-side token/source creation
  publicKey:
    localStorage.getItem('umahub_paymongo_pk') ||
    import.meta.env?.VITE_PAYMONGO_PUBLIC_KEY ||
    'pk_test_zFpGzYF8uVvTqR5jQc3M',

  // Secret test key (for backend/checkout session creation)
  secretKey:
    localStorage.getItem('umahub_paymongo_sk') ||
    import.meta.env?.VITE_PAYMONGO_SECRET_KEY ||
    '',

  isTestMode: true,
  currency: 'PHP',
  merchantName: 'UmaHub Marketplace'
};

/**
 * Check if custom PayMongo keys have been supplied
 */
export function hasCustomPayMongoKey() {
  return (
    Boolean(localStorage.getItem('umahub_paymongo_pk')) ||
    Boolean(import.meta.env?.VITE_PAYMONGO_PUBLIC_KEY)
  );
}

/**
 * Save custom PayMongo keys (useful for test & live switching)
 */
export function savePayMongoKeys({ publicKey, secretKey, isTest = true }) {
  if (publicKey) localStorage.setItem('umahub_paymongo_pk', publicKey.trim());
  if (secretKey) localStorage.setItem('umahub_paymongo_sk', secretKey.trim());
  localStorage.setItem('umahub_paymongo_mode', isTest ? 'test' : 'live');
}

/**
 * Create a PayMongo Source for e-wallets (GCash, Maya)
 */
export async function createPayMongoSource({
  amount,
  type = 'gcash', // 'gcash' or 'paymaya'
  customerName = 'Customer',
  customerEmail = 'customer@umahub.ph',
  customerPhone = '09171234567',
  redirectSuccess = window.location.origin + window.location.pathname + '#confirmation',
  redirectFailed = window.location.origin + window.location.pathname + '#checkout'
}) {
  // Amount in Philippine Centavos (PHP 100.00 = 10000)
  const amountInCentavos = Math.round(parseFloat(amount) * 100);

  const payload = {
    data: {
      attributes: {
        amount: amountInCentavos,
        redirect: {
          success: redirectSuccess,
          failed: redirectFailed
        },
        type: type === 'maya' ? 'paymaya' : 'gcash',
        currency: 'PHP',
        billing: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        }
      }
    }
  };

  try {
    const res = await fetch('https://api.paymongo.com/v1/sources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(PAYMONGO_CONFIG.publicKey + ':')}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok && data?.data?.attributes?.redirect?.checkout_url) {
      return {
        success: true,
        sourceId: data.data.id,
        checkoutUrl: data.data.attributes.redirect.checkout_url
      };
    }
    // Return error or fallback
    return {
      success: false,
      error: data?.errors?.[0]?.detail || 'Could not initiate PayMongo source'
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Simulate PayMongo Test Authorization
 * Provides instant authentic test-mode response without waiting for external webhooks
 */
export async function simulatePayMongoTestPayment({
  amount,
  method = 'gcash',
  customerName = 'Customer',
  customerPhone = '09171234567'
}) {
  await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate realistic network hop

  const testRef = 'pay_test_' + Math.random().toString(36).substring(2, 10).toUpperCase();
  const sourceRef = 'src_test_' + Math.random().toString(36).substring(2, 10).toUpperCase();

  return {
    success: true,
    status: 'paid',
    paymentId: testRef,
    sourceId: sourceRef,
    amount: parseFloat(amount).toFixed(2),
    currency: 'PHP',
    paidVia: method.toUpperCase(),
    paidAt: new Date().toISOString(),
    customer: {
      name: customerName,
      phone: customerPhone
    }
  };
}
