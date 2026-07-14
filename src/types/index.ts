export type AreaRange = "80㎡以下" | "80–100㎡" | "100–120㎡" | "120–150㎡" | "150㎡以上";
export type LayoutType = "两室" | "三室" | "四室" | "五室及以上" | "复式" | "大平层";
export type FamilyType = "独居" | "新婚" | "三口" | "二胎" | "三代同堂" | "宠物家庭" | "居家办公家庭";
export type StyleType = "现代原木" | "奶油极简" | "意式现代" | "中古混搭" | "现代简约" | "法式自然" | "现代极简" | "现代自然";

export interface Hotspot {
  x: number;
  y: number;
  title: string;
  body: string;
}

export interface SpaceStory {
  name: string;
  image: string;
  thought: string;
  details: string[];
  hotspots: Hotspot[];
}

export interface CaseItem {
  id: string;
  title: string;
  city: string;
  community: string;
  area: number;
  areaRange: AreaRange;
  layout: LayoutType;
  layoutDetail: string;
  familyType: FamilyType;
  familyLabel: string;
  style: StyleType;
  needs: string[];
  highlight: string;
  cover: string;
  fullDetail: boolean;
  cabinetArea: number;
  story: string;
  problems: { zone: string; issue: string }[];
  planImages: { before: string; after: string };
  spaces: SpaceStory[];
}

export interface InspirationItem {
  id: string;
  category: string;
  question: string;
  image: string;
  solution: string;
  dimension: string;
  families: string[];
  relatedCaseIds: string[];
}

export interface Designer {
  id: string;
  name: string;
  role: string;
  years: string;
  image: string;
  specialties: string[];
}

export interface Lead {
  merchantId: string;
  deviceId: string;
  id: string;
  name: string;
  phone: string;
  wechat?: string;
  city: string;
  community: string;
  area: string;
  layout: string;
  familyType: string;
  budgetRange: string;
  preferredStyle: string;
  mainNeeds: string[];
  sourcePage: string;
  sourceCase?: string;
  createdAt: string;
  status: string;
  riskLevel: "高" | "中" | "低";
  followUpNote: string;
}

export interface LeadRecord {
  merchantId: string;
  deviceId: string;
  id: string;
  diagnosisSessionId: string;
  budgetSessionId: string;
  name: string;
  phone: string;
  wechat: string;
  city: string;
  community: string;
  area: string;
  layout: string;
  familyMembers: string[];
  painPoints: string[];
  stylePreference: string;
  budgetRange: string;
  diagnosisType: string;
  source: string;
  sourceCase?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosisRecord {
  id: string;
  diagnosisSessionId: string;
  merchantId: string;
  deviceId: string;
  answers: Record<string, unknown>;
  resultType: string;
  recommendedCases: string[];
  createdAt: string;
}

export interface BudgetRecord {
  id: string;
  budgetSessionId: string;
  merchantId: string;
  deviceId: string;
  selectedSpaces: string[];
  customLevel: string;
  materialLevel: string;
  resultRange: string;
  area: number;
  createdAt: string;
}

export interface ActivityRecord {
  merchantId: string;
  deviceId: string;
  id: string;
  leadId?: string;
  diagnosisSessionId?: string;
  budgetSessionId?: string;
  type: "page_view" | "diagnosis_start" | "diagnosis_complete" | "case_view" | "budget_complete" | "plan_upload" | "lead_submit" | "case_sent";
  page: string;
  caseId?: string;
  metadata: Record<string, unknown> | string;
  createdAt: string;
}

export interface CurrentDiagnosisRecord {
  diagnosisSessionId: string;
  currentStep: number;
  answers: Record<string, unknown>;
  updatedAt: string;
  completed: boolean;
}

export interface CurrentBudgetRecord {
  budgetSessionId: string;
  currentStep: number;
  area: number;
  selectedSpaces: string[];
  customLevel: string;
  materialLevel: string;
  updatedAt: string;
  completed: boolean;
}

export interface FollowUpRecord {
  merchantId: string;
  id: string;
  leadId: string;
  ownerId: string;
  method: string;
  content: string;
  nextAction: string;
  nextFollowUpAt: string;
  createdAt: string;
  customerFeedback?: string;
  done?: boolean;
}
