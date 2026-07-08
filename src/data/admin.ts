import { leadScoringRules, getIntentLevel, type IntentLevel } from "../config/leadScoring";
import { cases } from "./cases";
import { images } from "./images";

export interface SalesPerson {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface AdminLead {
  id: string;
  name: string;
  phone: string;
  wechat: string;
  city: string;
  district: string;
  community: string;
  area: string;
  layout: string;
  familyMembers: string[];
  futureChanges: string[];
  painPoints: string[];
  messySpaces: string[];
  stylePreference: string;
  mainConcern: string;
  budgetRange: string;
  budgetResult: {
    area: string;
    spaces: string[];
    level: string;
    material: string;
    range: string;
  };
  diagnosisType: string;
  score: number;
  intentLevel: IntentLevel;
  status: string;
  ownerId: string;
  source: string;
  createdAt: string;
  lastActivityAt: string;
  nextFollowUpAt: string;
  uploadedPlan: {
    name: string;
    url: string;
    viewed: boolean;
  };
  viewedCases: string[];
  sentCases: string[];
}

export interface Activity {
  id: string;
  leadId: string;
  type: "page_view" | "diagnosis_start" | "diagnosis_complete" | "case_view" | "budget_complete" | "plan_upload" | "lead_submit" | "case_sent";
  page: string;
  caseId?: string;
  duration?: string;
  metadata: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  ownerId: string;
  method: string;
  content: string;
  customerFeedback: string;
  nextAction: string;
  nextFollowUpAt: string;
  createdAt: string;
  done: boolean;
}

export const salesPeople: SalesPerson[] = [
  { id: "owner-chen", name: "陈浩", role: "销售经理", avatar: "陈" },
  { id: "owner-lin", name: "林悦", role: "客户顾问", avatar: "林" },
  { id: "owner-zhou", name: "周乔", role: "设计顾问", avatar: "周" }
];

const names = ["王女士", "陈先生", "周女士", "李女士", "张先生", "赵女士", "刘先生", "孙女士", "吴先生", "顾女士"];
const communities = ["万科翡翠东方", "华润江南府", "中洲华庭", "蠡湖香樟园", "金科世界城", "太湖雍华府", "运河上院", "蔚蓝滨江", "映月湖", "滨江新城"];
const layouts = ["三室两厅", "四室两厅", "两室两厅", "大平层", "三室一厅"];
const statuses = ["new", "contacted", "wechat_added", "appointment", "measured", "proposal", "quotation", "negotiation", "won", "paused"];
const sources = ["空间诊断", "案例详情", "预算规划", "上传户型", "空间效果"];
const styles = ["现代原木", "奶油极简", "现代简约", "意式现代", "中古混搭", "现代自然"];
const needSets = [
  ["玄关收纳不足", "儿童房成长规划", "需要居家办公空间"],
  ["餐厅小家电占桌面", "衣物很多", "换季被褥没地方收"],
  ["家里柜子很多但不好用", "东西经常找不到", "空间看起来拥挤"],
  ["父母可能同住", "厨房效率低", "清洁用品无处安放"]
];

function scoreLead(index: number, status: string, viewedCases: string[], hasPlan: boolean) {
  let score = leadScoringRules.phoneSubmitted + leadScoringRules.diagnosisCompleted;
  if (hasPlan) score += leadScoringRules.planUploaded;
  if (index % 2 === 0) score += leadScoringRules.budgetCompleted + leadScoringRules.budgetClear;
  if (viewedCases.length >= 3) score += leadScoringRules.viewedThreeCases;
  if (index % 5 === 0) score += leadScoringRules.repeatedCaseView;
  if (["appointment", "measured", "proposal", "quotation", "negotiation", "won"].includes(status)) score += leadScoringRules.appointmentRequested;
  if (index % 3 === 0) score += leadScoringRules.returnedWithin24h;
  return Math.min(score, 98);
}

export const adminLeads: AdminLead[] = Array.from({ length: 30 }, (_, index) => {
  const caseA = cases[index % cases.length];
  const caseB = cases[(index + 1) % cases.length];
  const caseC = cases[(index + 4) % cases.length];
  const status = statuses[index % statuses.length];
  const hasPlan = index % 4 !== 3;
  const viewedCases = index % 2 === 0 ? [caseA.id, caseB.id, caseC.id] : [caseA.id, caseB.id];
  const score = scoreLead(index, status, viewedCases, hasPlan);
  const area = [89, 98, 105, 115, 118, 122, 128, 135, 142, 156][index % 10];
  const owner = salesPeople[index % salesPeople.length];
  const needs = needSets[index % needSets.length];
  const day = String(8 - Math.floor(index / 8)).padStart(2, "0");
  const hour = String(9 + (index % 9)).padStart(2, "0");
  return {
    id: `lead-${String(index + 1).padStart(2, "0")}`,
    name: names[index % names.length],
    phone: `${["138", "159", "186", "137", "177"][index % 5]}****${String(3200 + index * 137).slice(-4)}`,
    wechat: `xujian_demo_${String(index + 1).padStart(2, "0")}`,
    city: index % 5 === 2 ? "靖江" : index % 7 === 0 ? "江阴" : "无锡",
    district: ["滨湖区", "梁溪区", "新吴区", "惠山区", "靖江"][index % 5],
    community: communities[index % communities.length],
    area: `${area}㎡`,
    layout: layouts[index % layouts.length],
    familyMembers: index % 6 === 0 ? ["伴侣", "父母"] : index % 4 === 0 ? ["自己", "宠物"] : ["伴侣", "一个孩子"],
    futureChanges: index % 3 === 0 ? ["孩子即将上学", "居家办公增加"] : index % 3 === 1 ? ["准备要孩子", "预算控制"] : ["父母可能同住"],
    painPoints: needs,
    messySpaces: index % 2 === 0 ? ["玄关", "餐厅", "儿童房"] : ["主卧", "厨房", "阳台"],
    stylePreference: styles[index % styles.length],
    mainConcern: ["先把空间规划好", "收纳能力", "预算控制", "材料环保", "后期落地效果"][index % 5],
    budgetRange: index % 3 === 0 ? "5–8 万" : index % 3 === 1 ? "8–12 万" : "4–6 万",
    budgetResult: {
      area: `${area}㎡`,
      spaces: index % 2 === 0 ? ["玄关", "餐厅", "主卧", "儿童房", "书房"] : ["厨房", "主卧", "阳台"],
      level: index % 3 === 0 ? "完整规划" : "基础收纳",
      material: index % 2 === 0 ? "设计与品质平衡" : "实用优先",
      range: index % 3 === 0 ? "¥48,000–¥72,000" : index % 3 === 1 ? "¥78,000–¥112,000" : "¥36,000–¥58,000"
    },
    diagnosisType: index % 2 === 0 ? "成长型 · 高收纳需求家庭" : "效率型 · 预算敏感家庭",
    score,
    intentLevel: getIntentLevel(score),
    status,
    ownerId: owner.id,
    source: sources[index % sources.length],
    createdAt: `2026-07-${day} ${hour}:${String(10 + index).padStart(2, "0")}`,
    lastActivityAt: `2026-07-08 ${String(10 + (index % 8)).padStart(2, "0")}:${String(20 + index).slice(-2)}`,
    nextFollowUpAt: `2026-07-${String(8 + (index % 5)).padStart(2, "0")} ${String(14 + (index % 4)).padStart(2, "0")}:00`,
    uploadedPlan: {
      name: `${communities[index % communities.length]}-${area}㎡户型图.jpg`,
      url: hasPlan ? images.cabinetDetail : "",
      viewed: index % 3 === 0
    },
    viewedCases,
    sentCases: index % 4 === 0 ? [caseA.id] : []
  };
});

export const activities: Activity[] = adminLeads.flatMap((lead, index) => {
  const base = `2026-07-08 ${String(9 + (index % 8)).padStart(2, "0")}`;
  return [
    { id: `act-${lead.id}-01`, leadId: lead.id, type: "page_view", page: "首页", metadata: "进入首页", createdAt: `${base}:21` },
    { id: `act-${lead.id}-02`, leadId: lead.id, type: "diagnosis_start", page: "空间诊断", metadata: "开始空间诊断", createdAt: `${base}:23` },
    { id: `act-${lead.id}-03`, leadId: lead.id, type: "diagnosis_complete", page: "诊断结果", metadata: lead.diagnosisType, createdAt: `${base}:26` },
    { id: `act-${lead.id}-04`, leadId: lead.id, type: "case_view", page: "案例详情", caseId: lead.viewedCases[0], duration: "4 分 32 秒", metadata: "查看推荐案例", createdAt: `${base}:29` },
    { id: `act-${lead.id}-05`, leadId: lead.id, type: "budget_complete", page: "预算规划", metadata: lead.budgetResult.range, createdAt: `${base}:41` },
    { id: `act-${lead.id}-06`, leadId: lead.id, type: "lead_submit", page: "线索表单", metadata: "提交联系方式", createdAt: `${base}:45` }
  ] as Activity[];
});

export const followUps: FollowUp[] = adminLeads.flatMap((lead, index) => {
  const owner = salesPeople.find((item) => item.id === lead.ownerId) ?? salesPeople[0];
  return [
    {
      id: `fu-${lead.id}-01`,
      leadId: lead.id,
      ownerId: owner.id,
      method: index % 2 === 0 ? "电话" : "微信",
      content: index % 2 === 0 ? "电话沟通客户基本情况，确认周末是否方便到店。" : "已发送相似案例，客户重点询问预算和儿童房。",
      customerFeedback: index % 2 === 0 ? "客户正在比较三家品牌，关注材料环保、总预算和设计师能力。" : "客户觉得案例和自家情况接近，希望再看餐边柜方案。",
      nextAction: index % 2 === 0 ? "周六邀请到店沟通" : "发送 2 套儿童房与餐边柜案例",
      nextFollowUpAt: lead.nextFollowUpAt,
      createdAt: `2026-07-0${7 - (index % 2)} ${index % 2 === 0 ? "14:20" : "16:30"}`,
      done: index % 5 === 0
    },
    {
      id: `fu-${lead.id}-02`,
      leadId: lead.id,
      ownerId: owner.id,
      method: "系统建议",
      content: "根据客户画像推荐发送相似案例，并确认预算范围是否可接受。",
      customerFeedback: "待销售补充",
      nextAction: "查看客户详情后联系",
      nextFollowUpAt: lead.nextFollowUpAt,
      createdAt: "2026-07-08 09:00",
      done: false
    }
  ];
});

export const dashboardMetrics = [
  { label: "今日访问", value: "328", trend: "较昨日 +12%" },
  { label: "新增线索", value: "12", trend: "较昨日 +3" },
  { label: "完成空间诊断", value: "47", trend: "完成率 38%" },
  { label: "预算测算", value: "26", trend: "预算明确客户 18 位" },
  { label: "预约量房", value: "5", trend: "高意向转化" },
  { label: "成交客户", value: "2", trend: "本周累计 7 位" }
];

export const funnelSteps = [
  { label: "访客", value: 1280 },
  { label: "诊断", value: 426 },
  { label: "深度浏览", value: 302 },
  { label: "留资", value: 86 },
  { label: "量房", value: 28 },
  { label: "方案", value: 16 },
  { label: "成交", value: 7 }
];
