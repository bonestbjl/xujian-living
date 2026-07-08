export const budgetRules = {
  baseByLevel: {
    基础收纳: 560,
    完整规划: 760,
    整体空间: 980
  },
  materialMultiplier: {
    实用优先: 0.9,
    设计与品质平衡: 1,
    高阶质感: 1.22
  },
  spaceWeights: {
    玄关: 0.8,
    客厅: 1,
    餐厅: 1,
    厨房: 1.35,
    主卧: 1.2,
    次卧: 0.75,
    儿童房: 0.9,
    书房: 0.8,
    阳台: 0.7
  }
};

export type BudgetLevel = keyof typeof budgetRules.baseByLevel;
export type MaterialLevel = keyof typeof budgetRules.materialMultiplier;

export function estimateBudget(area: number, spaces: string[], level: BudgetLevel, material: MaterialLevel) {
  const weight = spaces.reduce((sum, item) => sum + (budgetRules.spaceWeights[item as keyof typeof budgetRules.spaceWeights] ?? 0.8), 0);
  const normalized = Math.max(weight, 1) / 5;
  const center = area * budgetRules.baseByLevel[level] * normalized * budgetRules.materialMultiplier[material];
  return {
    low: Math.round((center * 0.86) / 1000) * 1000,
    high: Math.round((center * 1.18) / 1000) * 1000
  };
}
