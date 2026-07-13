import { getCurrentMerchantId } from "../config/merchant";
import type { ActivityRecord, BudgetRecord, DiagnosisRecord, FollowUpRecord, LeadRecord } from "../types";
import { getOrCreateDeviceId } from "../utils/device";
import {
  appendDeviceScopedRecord,
  getMerchantScopedRecords,
  readDeviceScopedRecords,
  readDeviceScopedValue,
  writeDeviceScopedRecords,
  writeDeviceScopedValue
} from "../utils/storage";

function formatDate(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function loadDiagnosisDraft<T>(fallback: T) {
  return readDeviceScopedValue<T>("diagnosis_draft", fallback);
}

export function saveDiagnosisDraft<T>(answers: T) {
  writeDeviceScopedValue("diagnosis_draft", answers);
}

export function saveDiagnosisRecord(
  answers: Record<string, unknown>,
  resultType: string,
  recommendedCases: string[]
) {
  const record: DiagnosisRecord = {
    merchantId: getCurrentMerchantId(),
    deviceId: getOrCreateDeviceId(),
    answers,
    resultType,
    recommendedCases,
    createdAt: formatDate()
  };
  return appendDeviceScopedRecord("diagnosis", record);
}

export function saveBudgetRecord(input: Omit<BudgetRecord, "merchantId" | "deviceId" | "createdAt">) {
  const record: BudgetRecord = {
    ...input,
    merchantId: getCurrentMerchantId(),
    deviceId: getOrCreateDeviceId(),
    createdAt: formatDate()
  };
  return appendDeviceScopedRecord("budget", record);
}

export function saveActivity(input: Omit<ActivityRecord, "merchantId" | "deviceId" | "id" | "createdAt">) {
  const merchantId = getCurrentMerchantId();
  const deviceId = getOrCreateDeviceId();
  const existing = readDeviceScopedRecords<ActivityRecord>("activities");
  const latest = existing[0];
  const latestTime = latest ? new Date(latest.createdAt.replace(" ", "T")).getTime() : 0;

  if (
    latest &&
    latest.type === input.type &&
    latest.page === input.page &&
    latest.caseId === input.caseId &&
    Date.now() - latestTime < 1500
  ) {
    return latest;
  }

  const record: ActivityRecord = {
    ...input,
    merchantId,
    deviceId,
    id: `activity_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: formatDate()
  };
  return appendDeviceScopedRecord("activities", record);
}

export type LeadSubmission = {
  name: string;
  phone: string;
  wechat: string;
  city: string;
  community: string;
  area: string;
  familyMembers: string[];
  painPoints: string[];
  sourcePage: string;
  sourceCase?: string;
};

export function saveLeadRecord(submission: LeadSubmission) {
  const merchantId = getCurrentMerchantId();
  const deviceId = getOrCreateDeviceId();
  const diagnosis = readDeviceScopedRecords<DiagnosisRecord>("diagnosis")[0];
  const budget = readDeviceScopedRecords<BudgetRecord>("budget")[0];
  const answers = diagnosis?.answers ?? {};
  const records = readDeviceScopedRecords<LeadRecord>("leads");
  const current = records.find((lead) => !["won", "lost", "closed"].includes(lead.status));
  const now = formatDate();
  const lead: LeadRecord = {
    merchantId,
    deviceId,
    id: current?.id ?? `local-lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: submission.name,
    phone: submission.phone,
    wechat: submission.wechat,
    city: submission.city,
    community: submission.community,
    area: submission.area,
    layout: stringValue(answers.layout, "待补充"),
    familyMembers: submission.familyMembers.length ? submission.familyMembers : stringArray(answers.members),
    painPoints: submission.painPoints,
    stylePreference: stringValue(answers.style, "待确认"),
    budgetRange: budget?.resultRange ?? stringValue(answers.budgetPreference, "待确认"),
    diagnosisType: diagnosis?.resultType ?? "尚未完成空间诊断",
    source: submission.sourcePage,
    sourceCase: submission.sourceCase,
    status: current?.status ?? "new",
    createdAt: current?.createdAt ?? now,
    updatedAt: now
  };

  writeDeviceScopedRecords("leads", [lead, ...records.filter((item) => item.id !== lead.id)]);
  saveActivity({
    leadId: lead.id,
    type: "lead_submit",
    page: "线索表单",
    metadata: { sourcePage: submission.sourcePage, sourceCase: submission.sourceCase ?? "" }
  });
  return lead;
}

export function saveFollowUpRecord(input: Omit<FollowUpRecord, "merchantId" | "id" | "createdAt">) {
  const record: FollowUpRecord = {
    ...input,
    merchantId: getCurrentMerchantId(),
    id: `local-follow-up-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: formatDate()
  };
  return appendDeviceScopedRecord("followUps", record);
}

export function getMerchantLocalRecords(merchantId = getCurrentMerchantId()) {
  return {
    leads: getMerchantScopedRecords<LeadRecord>("leads", merchantId),
    diagnoses: getMerchantScopedRecords<DiagnosisRecord>("diagnosis", merchantId),
    budgets: getMerchantScopedRecords<BudgetRecord>("budget", merchantId),
    activities: getMerchantScopedRecords<ActivityRecord>("activities", merchantId),
    followUps: getMerchantScopedRecords<FollowUpRecord>("followUps", merchantId)
  };
}
