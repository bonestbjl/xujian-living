import type { InspirationItem } from "../types";
import { images } from "./images";

export const inspirationCategories = [
  "全部",
  "玄关",
  "客厅",
  "餐厅",
  "厨房",
  "主卧",
  "儿童房",
  "衣帽间",
  "书房",
  "阳台"
];

export const inspirations: InspirationItem[] = [
  {
    id: "entry-1",
    category: "玄关",
    question: "1.2 米宽玄关，如何同时放下鞋柜和换鞋区？",
    image: images.entryway,
    solution: "减少整面柜压迫感，底部悬空放常用鞋，中段留置物台，高柜承接清洁工具。",
    dimension: "建议预留 350mm 以上进深，换鞋凳宽度控制在 600–800mm。",
    families: ["三口之家", "新婚二人", "鞋量较多家庭"],
    relatedCaseIds: ["case-01", "case-04"]
  },
  {
    id: "dining-1",
    category: "餐厅",
    question: "餐边柜怎样预留咖啡机和饮水设备？",
    image: images.warmDining,
    solution: "把饮水、咖啡、杯具和小家电放在一条操作线上，减少餐桌占用。",
    dimension: "台面高度可参考 900mm，背板预留插座和可擦洗材质。",
    families: ["新婚二人", "居家办公家庭"],
    relatedCaseIds: ["case-02", "case-08"]
  },
  {
    id: "kids-1",
    category: "儿童房",
    question: "儿童房只有 8㎡，怎样规划未来学习空间？",
    image: images.kids,
    solution: "先保留活动区，用低位收纳培养归位习惯，书桌和书架按成长阶段逐步增强。",
    dimension: "书桌长度建议不低于 1000mm，低位抽屉高度控制在孩子可触达范围。",
    families: ["三口之家", "二胎家庭"],
    relatedCaseIds: ["case-01", "case-03"]
  },
  {
    id: "balcony-1",
    category: "阳台",
    question: "扫地机器人应该藏在哪里？",
    image: images.balcony,
    solution: "在家政柜下方设置回充位，避开洗衣机排水和门扇开启范围。",
    dimension: "常见高度预留 150–180mm，宽度按设备尺寸增加余量。",
    families: ["宠物家庭", "三口之家"],
    relatedCaseIds: ["case-06", "case-11"]
  },
  {
    id: "wardrobe-1",
    category: "衣帽间",
    question: "衣柜内部为什么不应该平均分格？",
    image: images.bedroom,
    solution: "衣物类型不平均，悬挂、抽屉、叠放和换季区应该按家庭真实衣量分配。",
    dimension: "长衣区、短衣区和抽屉比例先由衣物清单决定，再进入深化设计。",
    families: ["独居女性", "新婚二人", "改善型住宅"],
    relatedCaseIds: ["case-02", "case-07"]
  },
  {
    id: "study-1",
    category: "书房",
    question: "没有独立书房，如何做一个长期办公角？",
    image: images.study,
    solution: "把文件、打印机和插座纳入柜体，桌面只保留正在工作的内容。",
    dimension: "桌面深度建议 600mm 左右，椅后活动距离尽量不低于 800mm。",
    families: ["居家办公家庭", "三口之家"],
    relatedCaseIds: ["case-08", "case-11"]
  }
];

export const getInspiration = (id?: string) => inspirations.find((item) => item.id === id) ?? inspirations[0];
