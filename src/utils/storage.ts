import { getCurrentMerchantId } from "../config/merchant";
import { getOrCreateDeviceId } from "./device";

export type ScopedDataType =
  | "diagnosis"
  | "diagnosis_draft"
  | "budget"
  | "leads"
  | "activities"
  | "followUps"
  | "admin_state";

const BUSINESS_PREFIX = "xujian:";

export function getDeviceScopedKey(
  dataType: ScopedDataType,
  merchantId = getCurrentMerchantId(),
  deviceId = getOrCreateDeviceId()
) {
  return `${BUSINESS_PREFIX}${merchantId}:${deviceId}:${dataType}`;
}

export function getMerchantScopedKeys(merchantId = getCurrentMerchantId()) {
  const prefix = `${BUSINESS_PREFIX}${merchantId}:`;
  const keys: string[] = [];

  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(prefix)) keys.push(key);
    }
  } catch {
    return [];
  }

  return keys;
}

export function readDeviceScopedValue<T>(dataType: ScopedDataType, fallback: T): T {
  try {
    const saved = localStorage.getItem(getDeviceScopedKey(dataType));
    return saved ? JSON.parse(saved) as T : fallback;
  } catch {
    return fallback;
  }
}

export function writeDeviceScopedValue<T>(dataType: ScopedDataType, value: T) {
  try {
    localStorage.setItem(getDeviceScopedKey(dataType), JSON.stringify(value));
  } catch {
    // Local demo data is best-effort when browser storage is unavailable.
  }
}

export function removeDeviceScopedValue(dataType: ScopedDataType) {
  try {
    localStorage.removeItem(getDeviceScopedKey(dataType));
  } catch {
    // Ignore storage failures in the local-only demo.
  }
}

export function readDeviceScopedRecords<T>(dataType: ScopedDataType) {
  const value = readDeviceScopedValue<unknown>(dataType, []);
  return Array.isArray(value) ? value as T[] : [];
}

export function writeDeviceScopedRecords<T>(dataType: ScopedDataType, records: T[]) {
  writeDeviceScopedValue(dataType, records);
}

export function appendDeviceScopedRecord<T>(dataType: ScopedDataType, record: T, limit = 200) {
  const records = readDeviceScopedRecords<T>(dataType);
  writeDeviceScopedRecords(dataType, [record, ...records].slice(0, limit));
  return record;
}

export function getMerchantScopedRecords<T>(dataType: ScopedDataType, merchantId = getCurrentMerchantId()) {
  const suffix = `:${dataType}`;
  return getMerchantScopedKeys(merchantId)
    .filter((key) => key.endsWith(suffix))
    .flatMap((key) => {
      try {
        const value = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown;
        return Array.isArray(value) ? value as T[] : [];
      } catch {
        return [];
      }
    });
}

export function getMerchantScopedLeads<T>(merchantId = getCurrentMerchantId()) {
  return getMerchantScopedRecords<T>("leads", merchantId);
}

export function clearCurrentDeviceScopedData(merchantId = getCurrentMerchantId(), deviceId = getOrCreateDeviceId()) {
  const prefix = `${BUSINESS_PREFIX}${merchantId}:${deviceId}:`;

  try {
    getMerchantScopedKeys(merchantId)
      .filter((key) => key.startsWith(prefix))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    return false;
  }

  return true;
}
