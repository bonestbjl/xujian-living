import type { CaseItem } from "../types";

export interface MatchInput {
  areaRange: string;
  layout: string;
  familyType: string;
  needs: string[];
  style: string;
}

export function matchCases(cases: CaseItem[], input: MatchInput) {
  return cases
    .map((item) => {
      const reasons: string[] = [];
      let score = 42;
      if (item.areaRange === input.areaRange) {
        score += 16;
        reasons.push("面积区间接近");
      }
      if (item.layout === input.layout) {
        score += 14;
        reasons.push("户型结构相似");
      }
      if (item.familyType.includes(input.familyType) || item.familyLabel.includes(input.familyType)) {
        score += 16;
        reasons.push("家庭结构相近");
      }
      const sameNeeds = input.needs.filter((need) => item.needs.some((caseNeed) => caseNeed.includes(need) || need.includes(caseNeed)));
      if (sameNeeds.length) {
        score += sameNeeds.length * 8;
        reasons.push(`同样关注${sameNeeds.slice(0, 2).join("、")}`);
      }
      if (item.style === input.style) {
        score += 10;
        reasons.push(`偏好${input.style}`);
      }
      return { item, score: Math.min(score, 98), reasons: reasons.length ? reasons : ["可作为同面积段参考"] };
    })
    .sort((a, b) => b.score - a.score);
}
