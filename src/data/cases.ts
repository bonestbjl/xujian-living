import type { CaseItem } from "../types";
import { images } from "./images";

const fullSpaces = [
  {
    name: "玄关",
    image: images.entryway,
    thought: "把回家后的动作拆开：放包、换鞋、收快递、挂外套，各自拥有顺手的位置。",
    details: ["悬空换鞋区", "临时置物台", "清洁工具高柜"],
    hotspots: [
      { x: 28, y: 62, title: "底部常用鞋位", body: "常穿鞋不用反复开柜，回家动线更轻。" },
      { x: 52, y: 38, title: "随手置物台", body: "钥匙、门禁卡和快递被集中在入户第一站。" },
      { x: 74, y: 52, title: "清洁工具区", body: "吸尘器、拖把和耗材独立收纳，避免占用阳台。" }
    ]
  },
  {
    name: "客餐厅",
    image: images.warmDining,
    thought: "餐边柜成为家庭第二储物中心，公共区不再被小家电和零散物品占据。",
    details: ["餐边电器塔", "开放展示比例控制", "儿童随手收纳抽屉"],
    hotspots: [
      { x: 35, y: 43, title: "小家电集中区", body: "咖啡机、饮水设备和杯具在同一条操作线上。" },
      { x: 64, y: 54, title: "低位抽屉", body: "孩子可以自己拿取绘本和桌游，减少客厅杂乱。" }
    ]
  },
  {
    name: "主卧",
    image: images.bedroom,
    thought: "衣柜与梳妆区一体化，减少单件家具造成的视觉割裂。",
    details: ["男女主人分区", "换季被褥顶柜", "隐藏梳妆台"],
    hotspots: [
      { x: 58, y: 40, title: "分区衣柜", body: "常穿、换季和长衣区独立规划，减少混放。" },
      { x: 42, y: 58, title: "一体梳妆", body: "梳妆和小件收纳嵌入柜体，卧室保持安静。" }
    ]
  },
  {
    name: "儿童房",
    image: images.kids,
    thought: "保留未来学习阶段变化空间，不把儿童房一次性做满。",
    details: ["成长型书桌", "玩具低位收纳", "可替换开放格"],
    hotspots: [
      { x: 47, y: 46, title: "成长书桌", body: "桌面长度预留到小学阶段，后续可以增加书架系统。" },
      { x: 28, y: 67, title: "低位玩具区", body: "让孩子自己归位，公共区压力会小很多。" }
    ]
  },
  {
    name: "书房",
    image: images.study,
    thought: "用一面柜解决文件、打印机和偶尔双人办公，门片比例控制压迫感。",
    details: ["文件高柜", "打印设备位", "双人临时办公"],
    hotspots: [
      { x: 61, y: 52, title: "打印设备位", body: "预留插座和散热，不让设备长期占桌面。" }
    ]
  },
  {
    name: "阳台",
    image: images.balcony,
    thought: "家政柜不只放洗衣机，也要安排清洁剂、脏衣篮和扫地机器人。",
    details: ["洗烘叠放", "扫地机器人仓", "清洁耗材抽屉"],
    hotspots: [
      { x: 36, y: 70, title: "机器人回充位", body: "提前留出高度和电源，机器不用停在通道上。" }
    ]
  }
];

const problems = [
  { zone: "入户", issue: "鞋柜容量不足，临时物品没有位置。" },
  { zone: "餐厅", issue: "饮水机、咖啡机等设备长期占据桌面。" },
  { zone: "主卧", issue: "两人衣物与换季被褥混放。" },
  { zone: "儿童房", issue: "目前家具无法适应未来学习阶段。" }
];

const base = {
  city: "无锡",
  fullDetail: true,
  cabinetArea: 38,
  story:
    "屋主希望家里保持整洁，但不是靠不断增加柜子解决问题。我们从每天回家、做饭、办公、陪孩子学习的真实动作出发，重新组织每个空间的收纳节点。",
  problems,
  planImages: { before: images.cabinetDetail, after: images.calmLiving },
  spaces: fullSpaces
};

export const cases: CaseItem[] = [
  {
    ...base,
    id: "case-01",
    title: "万科翡翠东方",
    community: "万科翡翠东方",
    area: 128,
    areaRange: "120–150㎡",
    layout: "三室",
    layoutDetail: "三室两厅",
    familyType: "三口",
    familyLabel: "三口之家",
    style: "现代原木",
    needs: ["强收纳", "儿童成长", "居家办公"],
    highlight: "把分散的储物空间，变成一套完整的家庭收纳系统。",
    cover: images.case01Cover
  },
  {
    ...base,
    id: "case-02",
    title: "华润江南府",
    community: "华润江南府",
    area: 105,
    areaRange: "100–120㎡",
    layout: "三室",
    layoutDetail: "三室两厅",
    familyType: "新婚",
    familyLabel: "新婚二人",
    style: "奶油极简",
    needs: ["衣帽间", "未来儿童房", "居家办公"],
    highlight: "在有限面积中，同时解决衣帽间、办公和未来儿童房需求。",
    cover: images.case02Cover,
    cabinetArea: 31
  },
  {
    ...base,
    id: "case-03",
    title: "中洲华庭",
    city: "靖江",
    community: "中洲华庭",
    area: 142,
    areaRange: "120–150㎡",
    layout: "四室",
    layoutDetail: "四室两厅",
    familyType: "二胎",
    familyLabel: "二胎家庭",
    style: "现代简约",
    needs: ["儿童成长", "强收纳", "社交空间"],
    highlight: "两个孩子、两个成长阶段，一套可以持续变化的儿童空间。",
    cover: images.case03Cover,
    cabinetArea: 42
  },
  {
    ...base,
    id: "case-04",
    title: "蠡湖香樟园",
    community: "蠡湖香樟园",
    area: 89,
    areaRange: "80–100㎡",
    layout: "两室",
    layoutDetail: "两室两厅",
    familyType: "三口",
    familyLabel: "小三口",
    style: "现代原木",
    needs: ["小户型收纳", "儿童成长", "厨房效率"],
    highlight: "用玄关和餐边柜补足小户型最容易缺失的高频收纳。",
    cover: images.case04Cover,
    cabinetArea: 27
  },
  {
    ...base,
    id: "case-05",
    title: "金科世界城",
    community: "金科世界城",
    area: 168,
    areaRange: "150㎡以上",
    layout: "四室",
    layoutDetail: "四室两厅",
    familyType: "三代同堂",
    familyLabel: "三代同堂",
    style: "意式现代",
    needs: ["适老", "强收纳", "社交空间"],
    highlight: "把老人使用便利、孩子活动和公共会客放在同一套秩序里。",
    cover: images.case05Cover,
    cabinetArea: 52
  },
  {
    ...base,
    id: "case-06",
    title: "太湖雍华府",
    community: "太湖雍华府",
    area: 115,
    areaRange: "100–120㎡",
    layout: "三室",
    layoutDetail: "三室两厅",
    familyType: "宠物家庭",
    familyLabel: "宠物家庭",
    style: "中古混搭",
    needs: ["宠物", "强收纳", "开放式书房"],
    highlight: "为猫砂、粮食、清洁工具和展示收藏安排各自的位置。",
    cover: images.case06Cover,
    cabinetArea: 34
  },
  {
    ...base,
    id: "case-07",
    title: "运河上院",
    community: "运河上院",
    area: 98,
    areaRange: "80–100㎡",
    layout: "两室",
    layoutDetail: "两室两厅",
    familyType: "独居",
    familyLabel: "独居女性",
    style: "奶油极简",
    needs: ["衣帽间", "展示收藏", "厨房效率"],
    highlight: "用更温柔的材质和更清晰的收纳比例，承接独居生活的仪式感。",
    cover: images.case07Cover,
    fullDetail: false
  },
  {
    ...base,
    id: "case-08",
    title: "江阴蔚蓝滨江",
    city: "江阴",
    community: "蔚蓝滨江",
    area: 135,
    areaRange: "120–150㎡",
    layout: "三室",
    layoutDetail: "三室两厅",
    familyType: "居家办公家庭",
    familyLabel: "居家办公家庭",
    style: "现代极简",
    needs: ["居家办公", "强收纳", "空间显大"],
    highlight: "把书房从临时桌面升级为真正能长期工作的家庭工作区。",
    cover: images.case08Cover,
    fullDetail: false
  },
  {
    ...base,
    id: "case-09",
    title: "锡山映月湖",
    community: "映月湖",
    area: 156,
    areaRange: "150㎡以上",
    layout: "四室",
    layoutDetail: "四室两厅",
    familyType: "二胎",
    familyLabel: "二胎家庭",
    style: "现代简约",
    needs: ["门墙柜一体", "儿童成长", "强收纳"],
    highlight: "用门墙柜一体化降低大面积柜体存在感。",
    cover: images.case09Cover,
    fullDetail: false
  },
  {
    ...base,
    id: "case-10",
    title: "靖江滨江新城",
    city: "靖江",
    community: "滨江新城",
    area: 82,
    areaRange: "80–100㎡",
    layout: "两室",
    layoutDetail: "两室两厅",
    familyType: "新婚",
    familyLabel: "新婚小户型",
    style: "现代原木",
    needs: ["多功能空间", "厨房效率", "强收纳"],
    highlight: "让客餐厅、书桌和储物在小户型里互不打架。",
    cover: images.case10Cover,
    fullDetail: false
  },
  {
    ...base,
    id: "case-11",
    title: "太湖如院",
    community: "太湖如院",
    area: 122,
    areaRange: "120–150㎡",
    layout: "三室",
    layoutDetail: "三室两厅",
    familyType: "三口",
    familyLabel: "三口之家",
    style: "现代自然",
    needs: ["开放式书房", "儿童成长", "强收纳"],
    highlight: "把书房打开，让陪伴、学习和客厅活动发生在一起。",
    cover: images.case11Cover,
    fullDetail: false
  },
  {
    ...base,
    id: "case-12",
    title: "蠡园天著",
    community: "蠡园天著",
    area: 180,
    areaRange: "150㎡以上",
    layout: "大平层",
    layoutDetail: "大平层",
    familyType: "三口",
    familyLabel: "改善型住宅",
    style: "现代自然",
    needs: ["社交空间", "门墙柜一体", "强收纳"],
    highlight: "改善型住宅不堆满柜体，而是让收纳成为空间秩序的一部分。",
    cover: images.case12Cover,
    fullDetail: false
  }
];

export const getCase = (id?: string) => cases.find((item) => item.id === id) ?? cases[0];

export const getSimilarCases = (item: CaseItem, limit = 3) =>
  cases
    .filter((candidate) => candidate.id !== item.id)
    .map((candidate) => ({
      candidate,
      score:
        (candidate.areaRange === item.areaRange ? 3 : 0) +
        (candidate.familyType === item.familyType ? 3 : 0) +
        (candidate.style === item.style ? 2 : 0) +
        candidate.needs.filter((need) => item.needs.includes(need)).length
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
