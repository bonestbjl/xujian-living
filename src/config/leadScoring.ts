export const leadScoringRules = {
  phoneSubmitted: 20,
  planUploaded: 25,
  diagnosisCompleted: 10,
  budgetCompleted: 10,
  viewedThreeCases: 10,
  repeatedCaseView: 5,
  appointmentRequested: 30,
  budgetClear: 10,
  returnedWithin24h: 10
};

export type IntentLevel = "high" | "medium" | "low";

export function getIntentLevel(score: number): IntentLevel {
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
}

export const intentLabels: Record<IntentLevel, string> = {
  high: "高意向",
  medium: "持续跟进",
  low: "待观察"
};

export const leadStatusLabels: Record<string, string> = {
  new: "新线索",
  contacted: "已联系",
  wechat_added: "已加微信",
  appointment: "已预约",
  measured: "已量房",
  designing: "方案设计中",
  proposal: "方案沟通",
  quotation: "已报价",
  negotiation: "成交沟通",
  won: "已成交",
  lost: "未成交",
  paused: "暂缓"
};
