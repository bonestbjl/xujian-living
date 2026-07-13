export interface MerchantConfig {
  merchantId: string;
  merchantName: string;
}

export const merchants: MerchantConfig[] = [
  { merchantId: "xujian-demo", merchantName: "叙间定制" },
  { merchantId: "wuxi-custom-demo", merchantName: "无锡全屋定制" },
  { merchantId: "jingjiang-custom-demo", merchantName: "靖江全屋定制" }
];

export const defaultMerchant = merchants[0];

const CURRENT_MERCHANT_KEY = "xujian_current_merchant_id";
const VALID_MERCHANT_ID = /^[a-z0-9_-]+$/i;

function normalizeMerchantId(id: string | null | undefined) {
  const value = id?.trim();
  return value && VALID_MERCHANT_ID.test(value) ? value : defaultMerchant.merchantId;
}

export function getCurrentMerchantId() {
  try {
    const queryMerchant = new URLSearchParams(window.location.search).get("merchant");
    if (queryMerchant) {
      const merchantId = normalizeMerchantId(queryMerchant);
      localStorage.setItem(CURRENT_MERCHANT_KEY, merchantId);
      return merchantId;
    }

    return normalizeMerchantId(localStorage.getItem(CURRENT_MERCHANT_KEY));
  } catch {
    return defaultMerchant.merchantId;
  }
}

export function setCurrentMerchantId(id: string) {
  const merchantId = normalizeMerchantId(id);

  try {
    localStorage.setItem(CURRENT_MERCHANT_KEY, merchantId);
    const url = new URL(window.location.href);
    url.searchParams.set("merchant", merchantId);
    window.history.replaceState({}, "", url);
  } catch {
    // The selected merchant still applies to this call even if storage is unavailable.
  }

  return merchantId;
}

export function getCurrentMerchant(): MerchantConfig {
  const merchantId = getCurrentMerchantId();
  return merchants.find((merchant) => merchant.merchantId === merchantId) ?? {
    merchantId,
    merchantName: `${merchantId} Demo`
  };
}

