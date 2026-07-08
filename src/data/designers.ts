import type { Designer } from "../types";
import { images } from "./images";

export const designers: Designer[] = [
  {
    id: "lin-yu",
    name: "林屿",
    role: "主案设计师",
    years: "8 年住宅空间设计经验",
    image: images.designerA,
    specialties: ["改善型住宅", "收纳规划", "现代原木"]
  },
  {
    id: "zhou-qiao",
    name: "周乔",
    role: "空间设计师",
    years: "6 年居住空间优化经验",
    image: images.designerB,
    specialties: ["小户型优化", "奶油风", "女性居住空间"]
  },
  {
    id: "chen-fang",
    name: "陈放",
    role: "主案设计师",
    years: "10 年全案落地经验",
    image: images.designerC,
    specialties: ["大平层", "极简空间", "门墙柜一体化"]
  }
];
