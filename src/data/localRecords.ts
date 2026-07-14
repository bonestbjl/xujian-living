import { getCurrentMerchantId } from "../config/merchant";
import type {
  ActivityRecord,
  BudgetRecord,
  CurrentBudgetRecord,
  CurrentDiagnosisRecord,
  DiagnosisRecord,
  FollowUpRecord,
  LeadRecord
} from "../types";
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

function createSessionId(prefix: "diag" | "budget") {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replaceAll("-", "").slice(0, 10)
    : Math.random().toString(36).slice(2, 12);
  return `${prefix}_${random}_${Date.now()}`;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function normalizeDiagnosis(record: Partial<DiagnosisRecord>, index: number): DiagnosisRecord {
  const createdAt = record.createdAt ?? formatDate();
  const deviceId = record.deviceId ?? getOrCreateDeviceId();
  const legacyId = `legacy_diag_${deviceId}_${createdAt.replace(/\W/g, "")}_${index}`;
  return {
    id: record.id ?? legacyId,
    diagnosisSessionId: record.diagnosisSessionId ?? legacyId,
    merchantId: record.merchantId ?? getCurrentMerchantId(),
    deviceId,
    answers: record.answers ?? {},
    resultType: record.resultType ?? "历史空间诊断",
    recommendedCases: record.recommendedCases ?? [],
    createdAt
  };
}

function normalizeBudget(record: Partial<BudgetRecord>, index: number): BudgetRecord {
  const createdAt = record.createdAt ?? formatDate();
  const deviceId = record.deviceId ?? getOrCreateDeviceId();
  const legacyId = `legacy_budget_${deviceId}_${createdAt.replace(/\W/g, "")}_${index}`;
  return {
    id: record.id ?? legacyId,
    budgetSessionId: record.budgetSessionId ?? legacyId,
    merchantId: record.merchantId ?? getCurrentMerchantId(),
    deviceId,
    selectedSpaces: record.selectedSpaces ?? [],
    customLevel: record.customLevel ?? "待确认",
    materialLevel: record.materialLevel ?? "待确认",
    resultRange: record.resultRange ?? "待确认",
    area: record.area ?? 0,
    createdAt
  };
}

function mergeRecords<T extends { id: string }>(...groups: T[][]) {
  const records = new Map<string, T>();
  groups.flat().forEach((record) => {
    if (!records.has(record.id)) records.set(record.id, record);
  });
  return Array.from(records.values()).sort((a, b) => {
    const left = "createdAt" in a ? String(a.createdAt) : "";
    const right = "createdAt" in b ? String(b.createdAt) : "";
    return right.localeCompare(left);
  });
}

export function getCurrentDiagnosis() {
  return readDeviceScopedValue<CurrentDiagnosisRecord | null>("currentDiagnosis", null);
}

export function startNewDiagnosisSession() {
  const current: CurrentDiagnosisRecord = {
    diagnosisSessionId: createSessionId("diag"),
    currentStep: 1,
    answers: {},
    updatedAt: formatDate(),
    completed: false
  };
  writeDeviceScopedValue("currentDiagnosis", current);
  saveActivity({
    diagnosisSessionId: current.diagnosisSessionId,
    type: "diagnosis_start",
    page: "空间诊断",
    metadata: { diagnosisSessionId: current.diagnosisSessionId }
  });
  window.dispatchEvent(new CustomEvent("xujian:diagnosis-session-start", { detail: current }));
  return current;
}

export function getOrCreateCurrentDiagnosis() {
  const current = getCurrentDiagnosis();
  return current && !current.completed ? current : startNewDiagnosisSession();
}

export function saveCurrentDiagnosis(
  diagnosisSessionId: string,
  currentStep: number,
  answers: Record<string, unknown>
) {
  const current = getCurrentDiagnosis();
  if (current && current.diagnosisSessionId !== diagnosisSessionId) return current;
  const next: CurrentDiagnosisRecord = {
    diagnosisSessionId,
    currentStep,
    answers,
    updatedAt: formatDate(),
    completed: false
  };
  writeDeviceScopedValue("currentDiagnosis", next);
  return next;
}

export function getDeviceDiagnosisRecords() {
  const records = readDeviceScopedRecords<Partial<DiagnosisRecord>>("diagnosisRecords").map(normalizeDiagnosis);
  if (records.length) return records;

  const legacy = readDeviceScopedRecords<Partial<DiagnosisRecord>>("diagnosis").map(normalizeDiagnosis);
  if (legacy.length) writeDeviceScopedRecords("diagnosisRecords", legacy);
  return legacy;
}

export function saveDiagnosisRecord(
  diagnosisSessionId: string,
  answers: Record<string, unknown>,
  resultType: string,
  recommendedCases: string[]
) {
  const records = getDeviceDiagnosisRecords();
  const existing = records.find((record) => record.diagnosisSessionId === diagnosisSessionId);
  if (existing) return existing;

  const record: DiagnosisRecord = {
    id: `diagnosis_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    diagnosisSessionId,
    merchantId: getCurrentMerchantId(),
    deviceId: getOrCreateDeviceId(),
    answers,
    resultType,
    recommendedCases,
    createdAt: formatDate()
  };
  writeDeviceScopedRecords("diagnosisRecords", [record, ...records]);
  writeDeviceScopedValue<CurrentDiagnosisRecord>("currentDiagnosis", {
    diagnosisSessionId,
    currentStep: 8,
    answers,
    updatedAt: formatDate(),
    completed: true
  });
  return record;
}

export function getLatestDiagnosisRecord() {
  return getDeviceDiagnosisRecords()[0];
}

export function loadDiagnosisDraft<T>(fallback: T) {
  const current = getCurrentDiagnosis();
  return current?.answers ? current.answers as T : fallback;
}

export function saveDiagnosisDraft<T>(answers: T) {
  const current = getOrCreateCurrentDiagnosis();
  saveCurrentDiagnosis(current.diagnosisSessionId, current.currentStep, answers as Record<string, unknown>);
}

export function getCurrentBudget() {
  return readDeviceScopedValue<CurrentBudgetRecord | null>("currentBudget", null);
}

export function startNewBudgetSession() {
  const current: CurrentBudgetRecord = {
    budgetSessionId: createSessionId("budget"),
    currentStep: 1,
    area: 118,
    selectedSpaces: ["玄关", "餐厅", "主卧", "儿童房"],
    customLevel: "完整规划",
    materialLevel: "设计与品质平衡",
    updatedAt: formatDate(),
    completed: false
  };
  writeDeviceScopedValue("currentBudget", current);
  window.dispatchEvent(new CustomEvent("xujian:budget-session-start", { detail: current }));
  return current;
}

export function getOrCreateCurrentBudget() {
  const current = getCurrentBudget();
  return current && !current.completed ? current : startNewBudgetSession();
}

export function saveCurrentBudget(input: Omit<CurrentBudgetRecord, "updatedAt" | "completed">) {
  const current = getCurrentBudget();
  if (current && current.budgetSessionId !== input.budgetSessionId) return current;
  if (current?.completed) return current;
  const next: CurrentBudgetRecord = { ...input, updatedAt: formatDate(), completed: false };
  writeDeviceScopedValue("currentBudget", next);
  return next;
}

export function getDeviceBudgetRecords() {
  const records = readDeviceScopedRecords<Partial<BudgetRecord>>("budgetRecords").map(normalizeBudget);
  if (records.length) return records;

  const legacy = readDeviceScopedRecords<Partial<BudgetRecord>>("budget").map(normalizeBudget);
  if (legacy.length) writeDeviceScopedRecords("budgetRecords", legacy);
  return legacy;
}

export function saveBudgetRecord(
  input: Omit<BudgetRecord, "id" | "budgetSessionId" | "merchantId" | "deviceId" | "createdAt">,
  budgetSessionId = getOrCreateCurrentBudget().budgetSessionId
) {
  const records = getDeviceBudgetRecords();
  const existing = records.find((record) => record.budgetSessionId === budgetSessionId);
  if (existing) return existing;

  const record: BudgetRecord = {
    ...input,
    id: `budget_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    budgetSessionId,
    merchantId: getCurrentMerchantId(),
    deviceId: getOrCreateDeviceId(),
    createdAt: formatDate()
  };
  writeDeviceScopedRecords("budgetRecords", [record, ...records]);
  writeDeviceScopedValue<CurrentBudgetRecord>("currentBudget", {
    budgetSessionId,
    currentStep: 4,
    area: input.area,
    selectedSpaces: input.selectedSpaces,
    customLevel: input.customLevel,
    materialLevel: input.materialLevel,
    updatedAt: formatDate(),
    completed: true
  });
  return record;
}

export function getLatestBudgetRecord() {
  return getDeviceBudgetRecords()[0];
}

export function saveActivity(input: Omit<ActivityRecord, "merchantId" | "deviceId" | "id" | "createdAt">) {
  const merchantId = getCurrentMerchantId();
  const deviceId = getOrCreateDeviceId();
  const currentDiagnosis = getCurrentDiagnosis();
  const currentBudget = getCurrentBudget();
  const diagnosisSessionId = input.diagnosisSessionId ?? currentDiagnosis?.diagnosisSessionId;
  const budgetSessionId = input.budgetSessionId ?? currentBudget?.budgetSessionId;
  const existing = readDeviceScopedRecords<ActivityRecord>("activities");
  const latest = existing[0];
  const latestTime = latest ? new Date(latest.createdAt.replace(" ", "T")).getTime() : 0;

  if (
    latest &&
    latest.type === input.type &&
    latest.page === input.page &&
    latest.caseId === input.caseId &&
    latest.diagnosisSessionId === diagnosisSessionId &&
    latest.budgetSessionId === budgetSessionId &&
    Date.now() - latestTime < 1500
  ) {
    return latest;
  }

  const record: ActivityRecord = {
    ...input,
    diagnosisSessionId,
    budgetSessionId,
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
  const diagnosis = getLatestDiagnosisRecord();
  const budget = getLatestBudgetRecord();
  const diagnosisSessionId = diagnosis?.diagnosisSessionId ?? "";
  const budgetSessionId = budget?.budgetSessionId ?? "";
  const answers = diagnosis?.answers ?? {};
  const records = readDeviceScopedRecords<LeadRecord>("leads");
  const current = diagnosisSessionId
    ? records.find((lead) => lead.diagnosisSessionId === diagnosisSessionId)
    : undefined;
  const now = formatDate();
  const lead: LeadRecord = {
    merchantId,
    deviceId,
    id: current?.id ?? `local-lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    diagnosisSessionId,
    budgetSessionId,
    name: submission.name,
    phone: submission.phone,
    wechat: submission.wechat,
    city: submission.city,
    community: submission.community,
    area: submission.area,
    layout: stringValue(answers.layout, "待补充"),
    familyMembers: submission.familyMembers.length ? submission.familyMembers : stringArray(answers.members),
    painPoints: submission.painPoints.length ? submission.painPoints : stringArray(answers.problems),
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
    diagnosisSessionId,
    budgetSessionId,
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

export function getDeviceLeadRecords() {
  return readDeviceScopedRecords<LeadRecord>("leads");
}

export function getMerchantLocalRecords(merchantId = getCurrentMerchantId()) {
  const diagnosisRecords = getMerchantScopedRecords<Partial<DiagnosisRecord>>("diagnosisRecords", merchantId).map(normalizeDiagnosis);
  const legacyDiagnoses = getMerchantScopedRecords<Partial<DiagnosisRecord>>("diagnosis", merchantId).map(normalizeDiagnosis);
  const budgetRecords = getMerchantScopedRecords<Partial<BudgetRecord>>("budgetRecords", merchantId).map(normalizeBudget);
  const legacyBudgets = getMerchantScopedRecords<Partial<BudgetRecord>>("budget", merchantId).map(normalizeBudget);
  return {
    leads: getMerchantScopedRecords<LeadRecord>("leads", merchantId),
    diagnoses: mergeRecords(diagnosisRecords, legacyDiagnoses),
    budgets: mergeRecords(budgetRecords, legacyBudgets),
    activities: getMerchantScopedRecords<ActivityRecord>("activities", merchantId),
    followUps: getMerchantScopedRecords<FollowUpRecord>("followUps", merchantId)
  };
}
