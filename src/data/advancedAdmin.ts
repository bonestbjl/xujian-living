export type CaseRequestStatus = "待提交" | "已提交" | "客服处理中" | "待客户确认" | "已完成";
export type CaseChangeType = "替换图片" | "修改标题" | "修改文案" | "调整标签" | "新增案例" | "下架案例";

export interface CaseChangeRequest {
  id: string;
  merchantId: string;
  caseId: string;
  caseTitle: string;
  changeType: CaseChangeType;
  description: string;
  materialName: string;
  contact: string;
  expectedDate: string;
  status: CaseRequestStatus;
  serviceNote: string;
  quotaMonth: string;
  createdAt: string;
  completedAt: string;
}

export type ContentPlatform = "抖音" | "小红书" | "视频号";

export type InfluencerStatus = "待筛选" | "待联系" | "沟通中" | "已确认" | "已发布" | "已复盘";

export interface InfluencerCollaboration {
  id: string;
  merchantId: string;
  name: string;
  platform: ContentPlatform;
  city: string;
  followers: string;
  contentType: string;
  collaborationForm: string;
  quote: string;
  contactStatus: string;
  collaborationStatus: InfluencerStatus;
  expectedPublishAt: string;
  performance: string;
  notes: string;
}

const caseRequestMocks: Omit<CaseChangeRequest, "merchantId">[] = [
  {
    id: "case-request-history-01",
    caseId: "case-01",
    caseTitle: "云栖雅居",
    changeType: "替换图片",
    description: "替换玄关和儿童房完工图，并补充柜体内部细节。",
    materialName: "云栖雅居补拍素材.zip",
    contact: "演示联系人 王女士",
    expectedDate: "2026-06-24",
    status: "已完成",
    serviceNote: "图片已压缩并完成移动端适配，客户确认后上线。",
    quotaMonth: "2026-06",
    createdAt: "2026-06-18 10:30",
    completedAt: "2026-06-22 16:10"
  },
  {
    id: "case-request-history-02",
    caseId: "case-03",
    caseTitle: "松湖家园",
    changeType: "修改文案",
    description: "补充二胎家庭入住后的收纳反馈，弱化效果图表达。",
    materialName: "入住反馈文字.docx",
    contact: "演示联系人 陈先生",
    expectedDate: "2026-05-21",
    status: "待客户确认",
    serviceNote: "新版文案已整理，等待确认儿童房年龄信息。",
    quotaMonth: "2026-05",
    createdAt: "2026-05-15 14:20",
    completedAt: ""
  },
  {
    id: "case-request-draft-01",
    caseId: "case-02",
    caseTitle: "观澜公馆",
    changeType: "调整标签",
    description: "考虑增加宠物共居和阳台家政标签。",
    materialName: "",
    contact: "演示联系人",
    expectedDate: "",
    status: "待提交",
    serviceNote: "草稿不会占用本月修改额度。",
    quotaMonth: "2026-07",
    createdAt: "2026-07-02 09:15",
    completedAt: ""
  }
];

const influencerMocks: Omit<InfluencerCollaboration, "merchantId">[] = [
  {
    id: "influencer-01",
    name: "阿禾的家居观察",
    platform: "小红书",
    city: "无锡",
    followers: "3.6 万",
    contentType: "小户型改造 / 收纳",
    collaborationForm: "探店图文 + 真实尺寸清单",
    quote: "¥2,800",
    contactStatus: "已发合作资料",
    collaborationStatus: "沟通中",
    expectedPublishAt: "2026-07-25",
    performance: "待发布",
    notes: "受众以无锡新婚家庭为主，希望减少硬广口播。"
  },
  {
    id: "influencer-02",
    name: "锡城住研笔记",
    platform: "抖音",
    city: "无锡",
    followers: "8.2 万",
    contentType: "装修避坑 / 门店实测",
    collaborationForm: "门店探访短视频",
    quote: "¥5,500",
    contactStatus: "已加演示微信",
    collaborationStatus: "已确认",
    expectedPublishAt: "2026-07-28",
    performance: "脚本确认中",
    notes: "重点拍封边、抽屉五金和报价拆解，不拍虚构施工现场。"
  },
  {
    id: "influencer-03",
    name: "靖江理想家",
    platform: "视频号",
    city: "靖江",
    followers: "1.9 万",
    contentType: "本地家装 / 家庭访谈",
    collaborationForm: "案例访谈 + 视频号发布",
    quote: "¥1,800",
    contactStatus: "等待首次联系",
    collaborationStatus: "待联系",
    expectedPublishAt: "2026-08-06",
    performance: "待确认",
    notes: "适合三代同堂案例，需先确认业主是否愿意出镜。"
  },
  {
    id: "influencer-04",
    name: "木木空间实验室",
    platform: "小红书",
    city: "常州",
    followers: "5.1 万",
    contentType: "柜体细节 / 材料测评",
    collaborationForm: "产品细节图文",
    quote: "¥3,600",
    contactStatus: "暂未联系",
    collaborationStatus: "待筛选",
    expectedPublishAt: "待定",
    performance: "待筛选",
    notes: "内容专业度高，需评估跨城受众与到店成本。"
  },
  {
    id: "influencer-05",
    name: "住进好动线",
    platform: "抖音",
    city: "江阴",
    followers: "6.7 万",
    contentType: "动线分析 / 户型诊断",
    collaborationForm: "联合户型诊断直播",
    quote: "¥4,200",
    contactStatus: "已完成沟通",
    collaborationStatus: "已发布",
    expectedPublishAt: "2026-06-30",
    performance: "播放 3.8 万 / 收藏 860 / 咨询 17",
    notes: "直播中玄关和餐边柜问题互动最好，可安排二次切片。"
  },
  {
    id: "influencer-06",
    name: "小满装修手记",
    platform: "视频号",
    city: "无锡",
    followers: "2.4 万",
    contentType: "装修日记 / 预算记录",
    collaborationForm: "预算拆解口播",
    quote: "¥2,200",
    contactStatus: "已完成合作",
    collaborationStatus: "已复盘",
    expectedPublishAt: "2026-06-18",
    performance: "播放 1.6 万 / 留资 9 / 到店 2",
    notes: "留资质量较好，下次建议聚焦 5-8 万柜体预算人群。"
  }
];

export function createAdvancedAdminData(merchantId: string) {
  return {
    caseRequests: caseRequestMocks.map((item) => ({ ...item, merchantId })),
    influencerCollabs: influencerMocks.map((item) => ({ ...item, merchantId }))
  };
}
