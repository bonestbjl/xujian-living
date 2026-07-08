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
