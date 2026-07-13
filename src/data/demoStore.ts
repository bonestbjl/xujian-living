import { getIntentLevel } from "../config/leadScoring";
import { getCurrentMerchantId } from "../config/merchant";
import type { ActivityRecord, BudgetRecord, DiagnosisRecord, LeadRecord } from "../types";
import { removeDeviceScopedValue, readDeviceScopedValue, writeDeviceScopedValue } from "../utils/storage";
import {
  activities as mockActivities,
  adminLeads,
  followUps as mockFollowUps,
  type Activity,
  type AdminLead,
  type FollowUp
} from "./admin";
import { getMerchantLocalRecords, saveLeadRecord, type LeadSubmission } from "./localRecords";
import {
  createAdvancedAdminData,
  type CaseChangeRequest,
  type ContentPlanItem,
  type InfluencerCollaboration
} from "./advancedAdmin";

export type AdminDemoData = {
  leads: AdminLead[];
  followUps: FollowUp[];
  activities: Activity[];
  caseRequests: CaseChangeRequest[];
  contentItems: ContentPlanItem[];
  influencerCollabs: InfluencerCollaboration[];
};

export type DemoLeadSubmission = LeadSubmission;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function metadataLabel(metadata: ActivityRecord["metadata"]) {
  if (typeof metadata === "string") return metadata;
  return Object.values(metadata).filter((value) => typeof value === "string" && value).join(" · ") || "本机浏览记录";
}

function latestForDevice<T extends { deviceId: string; createdAt: string }>(records: T[], deviceId: string) {
  return records
    .filter((record) => record.deviceId === deviceId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

function toAdminLead(
  lead: LeadRecord,
  diagnoses: DiagnosisRecord[],
  budgets: BudgetRecord[],
  localActivities: ActivityRecord[]
): AdminLead {
  const diagnosis = latestForDevice(diagnoses, lead.deviceId);
  const budget = latestForDevice(budgets, lead.deviceId);
  const answers = diagnosis?.answers ?? {};
  const answerList = (key: string) => Array.isArray(answers[key]) ? answers[key].filter((item): item is string => typeof item === "string") : [];
  const answerText = (key: string, fallback: string) => typeof answers[key] === "string" ? answers[key] as string : fallback;
  const viewedCases = Array.from(new Set(localActivities
    .filter((activity) => activity.deviceId === lead.deviceId && activity.type === "case_view" && activity.caseId)
    .map((activity) => activity.caseId as string)));
  const score = Math.min(98, 45 + (diagnosis ? 20 : 0) + (budget ? 15 : 0) + Math.min(12, viewedCases.length * 4));

  return {
    merchantId: lead.merchantId,
    deviceId: lead.deviceId,
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    wechat: lead.wechat || "未填写",
    city: lead.city,
    district: "本机提交",
    community: lead.community,
    area: lead.area,
    layout: lead.layout,
    familyMembers: lead.familyMembers.length ? lead.familyMembers : ["待补充"],
    futureChanges: answerList("futureChanges"),
    painPoints: lead.painPoints.length ? lead.painPoints : answerList("problems"),
    messySpaces: answerList("messySpaces"),
    stylePreference: lead.stylePreference,
    mainConcern: answerText("priority", "空间规划"),
    budgetRange: lead.budgetRange,
    budgetResult: {
      area: budget ? `${budget.area}㎡` : lead.area,
      spaces: budget?.selectedSpaces ?? [],
      level: budget?.customLevel ?? "待测算",
      material: budget?.materialLevel ?? "待确认",
      range: budget?.resultRange ?? lead.budgetRange
    },
    diagnosisType: lead.diagnosisType,
    score,
    intentLevel: getIntentLevel(score),
    status: lead.status,
    ownerId: "owner-chen",
    source: lead.source,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
    lastActivityAt: localActivities.find((activity) => activity.deviceId === lead.deviceId)?.createdAt ?? lead.updatedAt,
    nextFollowUpAt: lead.updatedAt,
    uploadedPlan: { name: "", url: "", viewed: false },
    viewedCases,
    sentCases: []
  };
}

function mergeById<T extends { id: string }>(...groups: T[][]) {
  const merged = new Map<string, T>();
  groups.flat().forEach((item) => {
    if (!merged.has(item.id)) merged.set(item.id, item);
  });
  return Array.from(merged.values());
}

function initialData(merchantId = getCurrentMerchantId()): AdminDemoData {
  const local = getMerchantLocalRecords(merchantId);
  const advancedData = createAdvancedAdminData(merchantId);
  const localLeads = local.leads
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((lead) => toAdminLead(lead, local.diagnoses, local.budgets, local.activities));
  const leadByDevice = new Map(localLeads.map((lead) => [lead.deviceId, lead.id]));
  const localActivities: Activity[] = local.activities.map((activity) => ({
    merchantId: activity.merchantId,
    deviceId: activity.deviceId,
    id: activity.id,
    leadId: activity.leadId ?? leadByDevice.get(activity.deviceId) ?? "unlinked-local-lead",
    type: activity.type,
    page: activity.page,
    caseId: activity.caseId,
    metadata: metadataLabel(activity.metadata),
    createdAt: activity.createdAt
  }));

  return {
    leads: [...localLeads, ...clone(adminLeads.filter((lead) => lead.merchantId === merchantId))],
    followUps: [
      ...local.followUps.map((followUp): FollowUp => ({
        merchantId: followUp.merchantId,
        id: followUp.id,
        leadId: followUp.leadId,
        ownerId: followUp.ownerId,
        method: followUp.method,
        content: followUp.content,
        customerFeedback: followUp.customerFeedback ?? "待补充",
        nextAction: followUp.nextAction,
        nextFollowUpAt: followUp.nextFollowUpAt,
        createdAt: followUp.createdAt,
        done: followUp.done ?? false
      })),
      ...clone(mockFollowUps.filter((followUp) => followUp.merchantId === merchantId))
    ],
    activities: [...localActivities, ...clone(mockActivities.filter((activity) => activity.merchantId === merchantId))],
    ...advancedData
  };
}

export function loadAdminDemoData(): AdminDemoData {
  const base = initialData();
  const saved = readDeviceScopedValue<Partial<AdminDemoData>>("admin_state", {});
  const savedLeads = Array.isArray(saved.leads) ? saved.leads.filter((lead) => lead.merchantId === getCurrentMerchantId()) : [];
  const savedFollowUps = Array.isArray(saved.followUps) ? saved.followUps.filter((followUp) => followUp.merchantId === getCurrentMerchantId()) : [];
  const savedActivities = Array.isArray(saved.activities) ? saved.activities.filter((activity) => activity.merchantId === getCurrentMerchantId()) : [];
  const savedCaseRequests = Array.isArray(saved.caseRequests) ? saved.caseRequests.filter((request) => request.merchantId === getCurrentMerchantId()) : [];
  const savedContentItems = Array.isArray(saved.contentItems) ? saved.contentItems.filter((item) => item.merchantId === getCurrentMerchantId()) : [];
  const savedInfluencerCollabs = Array.isArray(saved.influencerCollabs) ? saved.influencerCollabs.filter((item) => item.merchantId === getCurrentMerchantId()) : [];

  const mergedLeads = base.leads.map((lead) => {
    const savedLead = savedLeads.find((item) => item.id === lead.id);
    if (!savedLead) return lead;
    return {
      ...lead,
      status: savedLead.status,
      intentLevel: savedLead.intentLevel,
      ownerId: savedLead.ownerId,
      nextFollowUpAt: savedLead.nextFollowUpAt,
      sentCases: savedLead.sentCases
    };
  });

  return {
    leads: mergeById(mergedLeads, savedLeads),
    followUps: mergeById(savedFollowUps, base.followUps),
    activities: mergeById(base.activities, savedActivities),
    caseRequests: savedCaseRequests.length ? savedCaseRequests : base.caseRequests,
    contentItems: savedContentItems.length ? savedContentItems : base.contentItems,
    influencerCollabs: savedInfluencerCollabs.length ? savedInfluencerCollabs : base.influencerCollabs
  };
}

export function saveAdminDemoData(data: AdminDemoData) {
  writeDeviceScopedValue("admin_state", data);
}

export function resetAdminDemoData() {
  removeDeviceScopedValue("admin_state");
  return initialData();
}

export function saveLeadSubmission(submission: DemoLeadSubmission) {
  return saveLeadRecord(submission);
}
