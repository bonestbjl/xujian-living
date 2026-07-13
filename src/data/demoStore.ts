import { adminLeads, followUps, type AdminLead, type FollowUp } from "./admin";

const adminStorageKey = "xujian-demo-admin-data";
const leadSubmissionKey = "xujian-demo-lead-submissions";

export type AdminDemoData = {
  leads: AdminLead[];
  followUps: FollowUp[];
};

export type DemoLeadSubmission = {
  id: string;
  name: string;
  phone: string;
  area: string;
  community: string;
  needs: string[];
  sourcePage: string;
  sourceCase?: string;
  createdAt: string;
};

function cloneInitialData(): AdminDemoData {
  return JSON.parse(JSON.stringify({ leads: adminLeads, followUps })) as AdminDemoData;
}

export function loadAdminDemoData(): AdminDemoData {
  try {
    const saved = localStorage.getItem(adminStorageKey);
    if (!saved) return cloneInitialData();
    const parsed = JSON.parse(saved) as Partial<AdminDemoData>;
    if (!Array.isArray(parsed.leads) || !Array.isArray(parsed.followUps)) return cloneInitialData();
    return { leads: parsed.leads, followUps: parsed.followUps };
  } catch {
    return cloneInitialData();
  }
}

export function saveAdminDemoData(data: AdminDemoData) {
  localStorage.setItem(adminStorageKey, JSON.stringify(data));
}

export function resetAdminDemoData() {
  const data = cloneInitialData();
  saveAdminDemoData(data);
  return data;
}

export function saveLeadSubmission(submission: Omit<DemoLeadSubmission, "id" | "createdAt">) {
  const entry: DemoLeadSubmission = {
    ...submission,
    id: `demo-submission-${Date.now()}`,
    createdAt: new Date().toLocaleString("zh-CN", { hour12: false })
  };
  try {
    const saved = JSON.parse(localStorage.getItem(leadSubmissionKey) ?? "[]") as DemoLeadSubmission[];
    localStorage.setItem(leadSubmissionKey, JSON.stringify([entry, ...saved].slice(0, 20)));
  } catch {
    localStorage.setItem(leadSubmissionKey, JSON.stringify([entry]));
  }
  return entry;
}
