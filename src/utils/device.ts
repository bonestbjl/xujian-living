const DEVICE_ID_KEY = "xujian_device_id";

let memoryDeviceId = "";

function createDeviceId() {
  const randomPart = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replaceAll("-", "").slice(0, 12)
    : Math.random().toString(36).slice(2, 14);

  return `device_${randomPart}_${Date.now()}`;
}

export function getOrCreateDeviceId() {
  if (memoryDeviceId) return memoryDeviceId;

  try {
    const saved = localStorage.getItem(DEVICE_ID_KEY);
    if (saved) {
      memoryDeviceId = saved;
      return saved;
    }

    const deviceId = createDeviceId();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
    memoryDeviceId = deviceId;
    return deviceId;
  } catch {
    memoryDeviceId = createDeviceId();
    return memoryDeviceId;
  }
}

