import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, NavLink, Outlet, Route, Routes, useNavigate, useOutletContext, useParams, useSearchParams } from "react-router-dom";
import { Bell, CalendarClock, Check, ChevronRight, FilePenLine, Filter, Handshake, LayoutDashboard, Lightbulb, Plus, Search, Settings, UserRound } from "lucide-react";
import { Layout } from "./components/Layout";
import { CaseCard } from "./components/CaseCard";
import { HotspotImage } from "./components/HotspotImage";
import { LeadForm } from "./components/LeadForm";
import { brand } from "./config/brand";
import { contact } from "./config/contact";
import { cases, getCase, getSimilarCases } from "./data/cases";
import { designers } from "./data/designers";
import { images } from "./data/images";
import { inspirationCategories, inspirations, getInspiration } from "./data/inspiration";
import { materialCards, processSteps } from "./data/materials";
import { estimateBudget, type BudgetLevel, type MaterialLevel } from "./data/budgetRules";
import { salesPeople, type Activity, type AdminLead, type FollowUp } from "./data/admin";
import { loadAdminDemoData, resetAdminDemoData, saveAdminDemoData } from "./data/demoStore";
import {
  getCurrentDiagnosis,
  getDeviceDiagnosisRecords,
  getDeviceLeadRecords,
  getLatestDiagnosisRecord,
  getOrCreateCurrentBudget,
  getOrCreateCurrentDiagnosis,
  saveActivity,
  saveBudgetRecord,
  saveCurrentBudget,
  saveCurrentDiagnosis,
  saveDiagnosisRecord,
  saveFollowUpRecord,
  startNewBudgetSession,
  startNewDiagnosisSession
} from "./data/localRecords";
import { matchCases, type MatchInput } from "./utils/match";
import { intentLabels, leadStatusLabels } from "./config/leadScoring";
import { getCurrentMerchant, merchants, setCurrentMerchantId } from "./config/merchant";
import { getOrCreateDeviceId } from "./utils/device";
import { clearCurrentDeviceScopedData } from "./utils/storage";
import {
  type CaseChangeRequest,
  type CaseChangeType,
  type InfluencerCollaboration,
  type InfluencerStatus
} from "./data/advancedAdmin";
import {
  contentMonthOptions,
  contentPlatformOptions,
  contentTopics,
  contentTypeOptions,
  getContentPlatformLabel,
  type ContentTopic,
  type ContentTopicPlatform,
  type ContentTopicType
} from "./data/contentTopics";

type OutletTools = { openLead: (sourcePage?: string) => void };

const areaOptions = ["80㎡以下", "80–100㎡", "100–120㎡", "120–150㎡", "150㎡以上"];

interface DiagnosisState {
  layout: string;
  areaRange: string;
  members: string[];
  habits: string[];
  storageNeeds: string[];
  messySpaces: string[];
  problems: string[];
  futureChanges: string[];
  style: string;
  priority: string;
  budgetPreference: string;
}

const defaultDiagnosis: DiagnosisState = {
  layout: "",
  areaRange: "",
  members: [],
  habits: [],
  storageNeeds: [],
  messySpaces: [],
  problems: [],
  futureChanges: [],
  style: "",
  priority: "",
  budgetPreference: ""
};

const diagnosisStepMeta = [
  {
    label: "HOME LAYOUT",
    description: "这会影响玄关、餐边柜、卧室收纳和公共区的规划方式。",
    hint: "先判断户型结构，再匹配相似家庭方案。",
    purpose: "识别你的空间基础条件"
  },
  {
    label: "FAMILY PROFILE",
    description: "家庭成员决定空间如何分配，也影响未来几年的收纳变化。",
    hint: "理解共同生活的人，才能判断空间真正服务于谁。",
    purpose: "建立家庭结构与使用关系"
  },
  {
    label: "DAILY ROUTINE",
    description: "生活习惯会决定柜体位置、公共区功能和日常动线。",
    hint: "从每天重复发生的动作里，找到设计的优先级。",
    purpose: "还原真实的居住场景"
  },
  {
    label: "STORAGE NEEDS",
    description: "不同物品需要不同的深度、位置与取用方式。",
    hint: "先确认需要收什么，再判断柜子应该怎么做。",
    purpose: "识别重点收纳对象"
  },
  {
    label: "PAIN POINTS",
    description: "这些高频困扰会帮助我们判断空间问题的根源。",
    hint: "问题越具体，后续匹配的方案越接近真实生活。",
    purpose: "定位当前空间矛盾"
  },
  {
    label: "STYLE PREFERENCE",
    description: "风格不只是颜色，也会影响材质、比例与空间松弛感。",
    hint: "选择更接近你理想居住感受的视觉方向。",
    purpose: "确定空间气质与材质倾向"
  },
  {
    label: "SPACE PRIORITY",
    description: "优先解决高频使用区域，可以让预算和设计更有重点。",
    hint: "从最影响日常体验的空间开始，而不是平均用力。",
    purpose: "建立空间规划顺序"
  },
  {
    label: "BUDGET APPROACH",
    description: "预算倾向会影响定制范围、材料选择和落地节奏。",
    hint: "最后确认投入方式，形成更完整的方案判断。",
    purpose: "理解项目投入与落地偏好"
  }
] as const;

function diagnosisStateFromAnswers(answers: Record<string, unknown>): DiagnosisState {
  return { ...defaultDiagnosis, ...answers } as DiagnosisState;
}

function loadDiagnosisResult(): DiagnosisState {
  const current = getCurrentDiagnosis();
  const answers = current?.completed ? current.answers : getLatestDiagnosisRecord()?.answers;
  return diagnosisStateFromAnswers(answers ?? {});
}

function getDiagnosisFamily(input: DiagnosisState) {
  if (input.members.includes("两个及以上孩子")) return "二胎";
  if (input.members.includes("一个孩子")) return "三口";
  if (input.members.includes("父母")) return "三代同堂";
  if (input.members.includes("伴侣")) return "新婚";
  return "独居";
}

function diagnosisToMatchInput(input: DiagnosisState): MatchInput {
  const needMap = [
    ["儿童", "儿童成长"],
    ["办公", "居家办公"],
    ["餐桌", "厨房效率"],
    ["鞋", "强收纳"],
    ["衣服", "强收纳"],
    ["柜子", "强收纳"],
    ["宠物", "宠物"]
  ];
  const joined = [...input.members, ...input.problems, ...input.futureChanges, ...input.messySpaces, ...input.habits, ...input.storageNeeds].join(" ");
  const needs = needMap.filter(([key]) => joined.includes(key)).map(([, value]) => value);
  return {
    areaRange: input.areaRange,
    layout: input.layout.includes("大平层") ? "大平层" : input.layout.includes("四") ? "四室" : input.layout.includes("两") ? "两室" : "三室",
    familyType: getDiagnosisFamily(input),
    needs: needs.length ? Array.from(new Set(needs)) : ["强收纳"],
    style: input.style === "奶油自然" ? "奶油极简" : input.style === "自然松弛" ? "现代自然" : input.style
  };
}

function getDiagnosisJudgements(input: DiagnosisState) {
  const judgements = [
    {
      title: "收纳缺少完整路径",
      body: `你的问题可能不是储物空间不足，而是${input.messySpaces.slice(0, 3).join("、")}之间没有形成完整的物品归位路径。`
    }
  ];
  if (input.futureChanges.includes("孩子即将上学") || input.members.includes("一个孩子") || input.members.includes("两个及以上孩子") || input.habits.includes("孩子会在客厅活动")) {
    judgements.push({
      title: "儿童房需要考虑未来变化",
      body: "孩子进入学习阶段后，儿童房需要预留学习、书籍和未来衣物增长空间。"
    });
  }
  if (input.messySpaces.includes("餐厅") || input.problems.includes("小家电占满餐桌") || input.storageNeeds.includes("小家电需要集中收纳")) {
    judgements.push({
      title: "餐厅可能承担第二收纳中心",
      body: "对于有小家电、饮水和咖啡需求的家庭，餐厅通常不只是吃饭区域。"
    });
  }
  if (input.problems.includes("没有固定办公区") || input.futureChanges.includes("居家办公增加") || input.habits.includes("经常居家办公")) {
    judgements.push({
      title: "办公区不一定需要单独书房",
      body: "可以通过客厅、主卧或开放书房重新组织空间，让工作设备和文件有固定位置。"
    });
  }
  return judgements.slice(0, 4);
}

function useLead() {
  return useOutletContext<OutletTools>();
}

function PillPicker({
  options,
  value,
  onChange,
  multi = false,
  maxSelections = 4
}: {
  options: string[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multi?: boolean;
  maxSelections?: number;
}) {
  return (
    <div className="pill-grid">
      {options.map((option) => {
        const selected = Array.isArray(value) ? value.includes(option) : value === option;
        return (
          <button
            className={selected ? "pill selected" : "pill"}
            key={option}
            onClick={() => {
              if (!multi) onChange(option);
              else {
                const current = Array.isArray(value) ? value : [];
                onChange(current.includes(option) ? current.filter((item) => item !== option) : [...current, option].slice(0, maxSelections));
              }
            }}
            type="button"
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function HomePage() {
  return (
    <section className="hero home-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(25,24,22,.72), rgba(25,24,22,.16)), url(${images.hero})` }}>
      <div className="hero__content reveal">
        <span className="eyebrow">{brand.enName}</span>
        <h1>你的家，不该被标准答案定义。</h1>
        <p>从户型、家庭成员到生活习惯，先找到真正需要解决的问题，再开始设计。</p>
        <div className="button-row">
          <Link className="button light" to="/diagnosis" onClick={startNewDiagnosisSession}>开始空间诊断</Link>
          <Link className="button outline-light" to="/cases">查看真实案例</Link>
        </div>
        <p className="hero-note">已整理 {brand.solutionCount} 套不同家庭结构与户型需求的设计方案</p>
        <div className="home-next-hint">
          <strong>下一步</strong>
          <span>2 分钟完成诊断，结果页会给出空间方向、案例、Moodboard 与预算建议。</span>
        </div>
      </div>
    </section>
  );
}

function DesignerSection() {
  return (
    <section className="section warm">
      <div className="section-title">
        <span className="eyebrow">DESIGN TEAM</span>
        <h2>用设计经验，判断什么应该留下。</h2>
      </div>
      <div className="designer-grid">
        {designers.map((designer) => (
          <article className="designer-card" key={designer.id}>
            <img src={designer.image} alt={`${designer.name}设计师形象`} loading="lazy" />
            <div>
              <h3>{designer.name}</h3>
              <p>{designer.role} · {designer.years}</p>
              <p className="muted">擅长：{designer.specialties.join(" / ")}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DiagnosisPage() {
  const navigate = useNavigate();
  const [flow, setFlow] = useState(() => {
    const current = getOrCreateCurrentDiagnosis();
    return {
      diagnosisSessionId: current.diagnosisSessionId,
      step: current.currentStep,
      input: diagnosisStateFromAnswers(current.answers)
    };
  });
  const { diagnosisSessionId, step, input } = flow;
  const stepsTotal = 8;
  const stepMeta = diagnosisStepMeta[step - 1];
  const selectedCount = [
    input.layout ? 1 : 0,
    input.members.length,
    input.habits.length,
    input.storageNeeds.length,
    input.problems.length,
    input.style ? 1 : 0,
    input.messySpaces.length,
    input.budgetPreference ? 1 : 0
  ][step - 1];
  const isMultiStep = [2, 3, 4, 5, 7].includes(step);
  const styleImages = [
    images.diagnosisModernWood,
    images.diagnosisCreamNatural,
    images.diagnosisModernMinimal,
    images.diagnosisMidCentury,
    images.diagnosisItalianModern,
    images.diagnosisNaturalRelaxed
  ];

  useEffect(() => {
    saveCurrentDiagnosis(diagnosisSessionId, step, { ...input });
  }, [diagnosisSessionId, input, step]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    const resetFlow = (event: Event) => {
      const current = (event as CustomEvent<ReturnType<typeof startNewDiagnosisSession>>).detail;
      setFlow({
        diagnosisSessionId: current.diagnosisSessionId,
        step: 1,
        input: diagnosisStateFromAnswers(current.answers)
      });
    };
    window.addEventListener("xujian:diagnosis-session-start", resetFlow);
    return () => window.removeEventListener("xujian:diagnosis-session-start", resetFlow);
  }, []);

  const next = () => {
    if (step < stepsTotal) setFlow((current) => ({ ...current, step: current.step + 1 }));
    else {
      const recommendedCases = matchCases(cases, diagnosisToMatchInput(input)).slice(0, 3).map(({ item }) => item.id);
      const resultType = "成长型 · 高收纳需求家庭";
      saveDiagnosisRecord(diagnosisSessionId, { ...input }, resultType, recommendedCases);
      saveActivity({
        diagnosisSessionId,
        type: "diagnosis_complete",
        page: "诊断结果",
        metadata: { diagnosisSessionId, resultType, recommendedCases }
      });
      navigate("/diagnosis/result");
    }
  };

  return (
    <section className="diagnosis-page">
      <div className="diagnosis-page-index">DIAGNOSIS / XUJIAN LIVING</div>
      <div className="diagnosis-keywords" aria-hidden="true">
        <span>LAYOUT</span><span>FAMILY</span><span>STORAGE</span><span>STYLE</span>
      </div>
      <div className="diagnosis-shell">
        <div className="diagnosis-corner-line" aria-hidden="true" />
        <header className="diagnosis-progress">
          <div className="diagnosis-progress-heading">
            <span>SPACE DIAGNOSIS</span>
            <div><strong>STEP {String(step).padStart(2, "0")}</strong><small>OF {String(stepsTotal).padStart(2, "0")}</small></div>
          </div>
          <div className="diagnosis-progress-track"><i style={{ width: `${(step / stepsTotal) * 100}%` }} /></div>
          <p>{stepMeta.hint}</p>
        </header>

        <div className="diagnosis-step-stage" key={step}>
        {step === 1 && (
          <WizardStep title="你家是什么户型？" label={stepMeta.label} description={stepMeta.description}>
            <PillPicker
              options={["两室一厅", "两室两厅", "三室两厅", "四室两厅", "大平层", "复式"]}
              value={input.layout}
              onChange={(v) => setFlow((current) => ({ ...current, input: { ...current.input, layout: v as string } }))}
            />
          </WizardStep>
        )}

        {step === 2 && (
          <WizardStep title="现在谁和你一起生活？" label={stepMeta.label} description={stepMeta.description}>
            <PillPicker
              multi
              options={["自己", "伴侣", "一个孩子", "两个及以上孩子", "父母", "宠物"]}
              value={input.members}
              onChange={(v) => setFlow((current) => ({ ...current, input: { ...current.input, members: v as string[] } }))}
              maxSelections={6}
            />
          </WizardStep>
        )}

        {step === 3 && (
          <WizardStep title="哪些生活习惯最像你家？" label={stepMeta.label} description={stepMeta.description}>
            <PillPicker
              multi
              options={["经常居家办公", "每天做饭", "常在家喝咖啡", "孩子会在客厅活动", "父母偶尔长住", "经常网购囤货", "喜欢保持台面清爽", "朋友经常来家里", "其他"]}
              value={input.habits}
              onChange={(v) => setFlow((current) => ({ ...current, input: { ...current.input, habits: v as string[] } }))}
              maxSelections={4}
            />
          </WizardStep>
        )}

        {step === 4 && (
          <WizardStep title="收纳最需要解决什么？" label={stepMeta.label} description={stepMeta.description}>
            <PillPicker
              multi
              options={["鞋子很多", "衣服很多", "换季被褥", "小家电需要集中收纳", "玩具绘本", "清洁用品", "宠物用品", "文件和办公设备", "其他"]}
              value={input.storageNeeds}
              onChange={(v) => setFlow((current) => ({ ...current, input: { ...current.input, storageNeeds: v as string[] } }))}
              maxSelections={5}
            />
          </WizardStep>
        )}

        {step === 5 && (
          <WizardStep title="下面哪些问题最像你家？" label={stepMeta.label} description={stepMeta.description}>
            <PillPicker
              multi
              options={["鞋子没有地方放", "衣服很多", "换季被褥没地方收", "小家电占满餐桌", "孩子玩具到处都是", "没有固定办公区", "清洁用品无处安放", "家里柜子很多但不好用", "东西经常找不到", "空间看起来拥挤", "其他"]}
              value={input.problems}
              onChange={(v) => setFlow((current) => ({ ...current, input: { ...current.input, problems: v as string[] } }))}
              maxSelections={11}
            />
          </WizardStep>
        )}

        {step === 6 && (
          <WizardStep title="你更希望家是什么感觉？" label={stepMeta.label} description={stepMeta.description}>
            <div className="style-grid">
              {["现代原木", "奶油自然", "现代极简", "中古", "意式现代", "自然松弛"].map((style, index) => (
                <button className={input.style === style ? "style-card selected" : "style-card"} onClick={() => setFlow((current) => ({ ...current, input: { ...current.input, style } }))} key={style}>
                  <img src={styleImages[index]} alt={style} />
                  <span>{style}</span>
                </button>
              ))}
            </div>
          </WizardStep>
        )}

        {step === 7 && (
          <WizardStep title="哪些空间最需要优先规划？" label={stepMeta.label} description={stepMeta.description}>
            <p className="muted">最多选择 3 个重点空间。</p>
            <PillPicker
              multi
              options={["玄关", "客厅", "餐厅", "厨房", "主卧", "儿童房", "书房", "阳台", "到处都乱", "其他"]}
              value={input.messySpaces}
              onChange={(v) => setFlow((current) => ({ ...current, input: { ...current.input, messySpaces: v as string[] } }))}
              maxSelections={3}
            />
          </WizardStep>
        )}

        {step === 8 && (
          <WizardStep title="你目前更倾向哪种预算方式？" label={stepMeta.label} description={stepMeta.description}>
            <PillPicker
              options={["先把空间规划好", "实用优先", "设计与品质平衡", "高阶质感", "严格控制预算", "后期落地效果更重要"]}
              value={input.budgetPreference}
              onChange={(v) => setFlow((current) => ({ ...current, input: { ...current.input, budgetPreference: v as string, priority: v as string } }))}
            />
          </WizardStep>
        )}
        </div>

        <div className="diagnosis-footer">
          <div className="diagnosis-purpose">
            <span>本步骤用于</span>
            <strong>{stepMeta.purpose}</strong>
            {isMultiStep && <small>已选择 {selectedCount} 项</small>}
          </div>
          <div className="wizard-actions">
            {step > 1 && <button className="button ghost" onClick={() => setFlow((current) => ({ ...current, step: current.step - 1 }))}>上一步</button>}
            <button className="button dark diagnosis-next" onClick={next}>
              {step === stepsTotal ? "生成诊断结果" : "下一步"}<ChevronRight size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function DiagnosisResultPage() {
  const { openLead } = useLead();
  const [input] = useState<DiagnosisState>(loadDiagnosisResult);
  const matchInput = useMemo(() => diagnosisToMatchInput(input), [input]);
  const results = useMemo(() => matchCases(cases, matchInput).slice(0, 3), [matchInput]);
  const judgements = getDiagnosisJudgements(input);
  const focusSpaces = Array.from(new Set(input.messySpaces.includes("到处都乱") ? ["玄关", "餐厅", "儿童房", "书房"] : input.messySpaces)).slice(0, 4);
  const family = getDiagnosisFamily(input);
  const styleImage =
    {
      现代原木: images.diagnosisModernWood,
      奶油自然: images.diagnosisCreamNatural,
      现代极简: images.diagnosisModernMinimal,
      中古: images.diagnosisMidCentury,
      意式现代: images.diagnosisItalianModern,
      自然松弛: images.diagnosisNaturalRelaxed
    }[input.style] ?? images.diagnosisModernWood;
  const moodboard = [
    { title: input.style, image: styleImage, body: "整体保持温暖、安静和真实居住感。" },
    { title: "重点收纳", image: images.entryway, body: input.storageNeeds.slice(0, 2).join(" / ") || "玄关与餐边柜优先建立归位路径。" },
    { title: "日常场景", image: images.warmDining, body: input.habits.slice(0, 2).join(" / ") || "餐厅和公共区承担更多家庭活动。" }
  ];
  return (
    <section className="page-section diagnosis-result-page">
      <header className="diagnosis-result-hero">
        <span className="eyebrow">空间诊断完成</span>
        <h1>根据你的选择，你的家庭属于：<br />成长型 · 高收纳需求家庭</h1>
        <div className="result-tags">
          {[input.layout, input.areaRange, `${family}家庭`, ...input.habits.slice(0, 2), `偏好${input.style}`].map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      </header>

      <section className="section result-diagnosis">
        <div className="section-title">
          <span className="eyebrow">CORE JUDGEMENT</span>
          <h2>你家真正需要解决的，可能不是“多做柜子”。</h2>
        </div>
        <div className="problem-grid">
          {judgements.map((item, index) => (
            <article key={item.title}>
              <span className="eyebrow">0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section warm">
        <div className="section-title split">
          <div>
            <span className="eyebrow">FOCUS SPACES</span>
            <h2>推荐空间方向</h2>
          </div>
          <Link className="text-link" to="/inspiration">查看空间效果</Link>
        </div>
        <div className="space-strip result-space-strip">
          {focusSpaces.map((space) => (
            <Link to={`/inspiration?category=${space}`} className="focus-space-card" key={space}>
              <strong>{space}</strong>
              <p>{space === "玄关" ? "先建立回家后的物品归位路径。" : space === "餐厅" ? "把小家电、饮水和家庭杂物集中管理。" : space === "儿童房" ? "预留学习和成长阶段变化空间。" : "查看这个空间的解决思路。"}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-title">
          <span className="eyebrow">STYLE DIRECTION</span>
          <h2>适合你的设计风格与 Moodboard：{input.style}</h2>
          <p>建议以{input.style}作为主视觉方向，同时控制开放格比例，让收纳和空间质感同时成立。</p>
        </div>
        <div className="moodboard-grid">
          {moodboard.map((item) => (
            <article className="moodboard-card" key={item.title}>
              <img src={item.image} alt={item.title} />
              <div>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-title">
          <span className="eyebrow">MATCHED CASES</span>
          <h2>这些家庭，和你的情况很接近。</h2>
        </div>
        <div className="case-grid">
          {results.map((result) => <CaseCard item={result.item} match={result.score} reasons={result.reasons} key={result.item.id} />)}
        </div>
      </section>

      <section className="section warm">
        <div className="section-title">
          <span className="eyebrow">MATERIAL & BUDGET</span>
          <h2>材料建议与预算方向</h2>
          <p>你的预算倾向：{input.budgetPreference}。当前阶段先用区间判断项目量级，不做假精准报价。</p>
        </div>
        <div className="result-advice-grid">
          {materialCards.slice(0, 3).map((item) => (
            <article key={item.title}>
              <img src={item.image} alt={item.title} />
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
          <article className="budget-advice-card">
            <span className="eyebrow">BUDGET</span>
            <h3>{input.budgetPreference.includes("严格") ? "先控制定制范围" : "建议先做完整规划"}</h3>
            <p>优先确认玄关、餐厅、主卧和重点空间的柜体范围，再根据材料和五金选择拉开预算区间。</p>
            <Link className="text-link" to="/budget" onClick={startNewBudgetSession}>进入预算规划</Link>
          </article>
        </div>
      </section>

      <section className="final-cta diagnosis-conversion-cta">
        <span className="eyebrow">NEXT STEP</span>
        <h2>下一步，把户型和需求发给设计师。</h2>
        <p>系统已经整理出你的家庭结构、收纳重点、风格偏好和预算方向。上传户型图后，设计师可以更快判断哪些空间值得优先规划。</p>
        <div className="diagnosis-primary-action">
          <button className="button dark" onClick={() => openLead("诊断结果页")}>上传户型图，获取初步规划建议</button>
        </div>
        <div className="diagnosis-secondary-actions">
          <Link className="button ghost" to="/cases">查看推荐案例</Link>
          <Link className="button ghost" to="/budget" onClick={startNewBudgetSession}>规划我的预算</Link>
        </div>
        <Link className="diagnosis-restart-link" to="/diagnosis" onClick={startNewDiagnosisSession}>重新诊断</Link>
      </section>
    </section>
  );
}

function CasesPage() {
  const [filters, setFilters] = useState({ area: "全部", family: "全部", style: "全部", need: "全部" });
  const filtered = cases.filter((item) =>
    (filters.area === "全部" || item.areaRange === filters.area) &&
    (filters.family === "全部" || item.familyLabel.includes(filters.family) || item.familyType.includes(filters.family)) &&
    (filters.style === "全部" || item.style.includes(filters.style)) &&
    (filters.need === "全部" || item.needs.some((need) => need.includes(filters.need) || filters.need.includes(need)))
  );
  return (
    <section className="page-section">
      <PageHero eyebrow="CASES" title="全屋案例库" body="不是按风格堆图片，而是按家庭问题理解每一个真实的家。" />
      <div className="filter-panel">
        <Filter size={18} />
        <FilterGroup label="面积" options={["全部", ...areaOptions]} value={filters.area} onChange={(v) => setFilters({ ...filters, area: v })} />
        <FilterGroup label="家庭" options={["全部", "独居", "新婚", "三口", "二胎", "三代同堂"]} value={filters.family} onChange={(v) => setFilters({ ...filters, family: v })} />
        <FilterGroup label="风格" options={["全部", "现代原木", "奶油", "极简", "中古", "意式", "法式"]} value={filters.style} onChange={(v) => setFilters({ ...filters, style: v })} />
        <FilterGroup label="需求" options={["全部", "强收纳", "儿童成长", "居家办公", "宠物", "适老", "社交空间"]} value={filters.need} onChange={(v) => setFilters({ ...filters, need: v })} />
      </div>
      <div className="case-grid">
        {filtered.map((item) => <CaseCard item={item} key={item.id} />)}
      </div>
    </section>
  );
}

function FilterGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="filter-group">
      <strong>{label}</strong>
      <div>
        {options.map((option) => (
          <button className={value === option ? "selected" : ""} onClick={() => onChange(option)} key={option}>{option}</button>
        ))}
      </div>
    </div>
  );
}

function CaseDetailPage() {
  const { id } = useParams();
  const item = getCase(id);
  const { openLead } = useLead();
  const [leadOpen, setLeadOpen] = useState(false);
  const similar = getSimilarCases(item);
  useEffect(() => {
    saveActivity({ type: "case_view", page: "案例详情", caseId: item.id, metadata: { title: item.title } });
  }, [item.id, item.title]);
  return (
    <article>
      <section className="detail-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(23,22,20,.72), rgba(23,22,20,.12)), url(${item.cover})` }}>
        <div>
          <span className="eyebrow">{item.city} · {item.community}</span>
          <h1>{item.title}</h1>
          <p>{item.area}㎡ · {item.layoutDetail} · {item.familyLabel} · {item.style} · 全屋定制 {item.cabinetArea}㎡</p>
        </div>
      </section>
      <section className="section detail-layout">
        <div>
          <span className="eyebrow">OWNER STORY</span>
          <h2>一个正在进入“上学阶段”的{item.familyLabel}</h2>
          <p>{item.story}</p>
        </div>
        <div className="problem-grid">
          {item.problems.map((problem) => (
            <article key={problem.zone}><strong>{problem.zone}</strong><p>{problem.issue}</p></article>
          ))}
        </div>
      </section>
      <section className="section warm">
        <div className="section-title">
          <span className="eyebrow">PLAN</span>
          <h2>平面规划与定制节点</h2>
        </div>
        <div className="plan-grid">
          <img src={item.planImages.before} alt="原始平面示意" />
          <img src={item.planImages.after} alt="定制规划示意" />
        </div>
      </section>
      <section className="section">
        <div className="section-title">
          <span className="eyebrow">SPACES</span>
          <h2>分空间浏览</h2>
        </div>
        {item.spaces.map((space) => (
          <div className="space-detail" key={space.name}>
            <HotspotImage image={space.image} alt={`${item.title}${space.name}`} hotspots={space.hotspots} />
            <div>
              <span className="eyebrow">{space.name}</span>
              <h3>{space.thought}</h3>
              <ul>{space.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
            </div>
          </div>
        ))}
      </section>
      <section className="section result-summary">
        <h2>这套方案没有单纯追求柜体数量。</h2>
        <p>最终重新组织了玄关、餐厅、主卧和儿童房四个核心储物节点，让物品按照使用路径进入最合适的位置。</p>
        <div className="stat-grid">
          {["6 个定制区域", `${item.cabinetArea}㎡柜体投影面积`, "4 个核心生活问题解决", "12 个重点功能分区"].map((stat) => <strong key={stat}>{stat}</strong>)}
        </div>
      </section>
      <section className="section warm">
        <div className="section-title split">
          <h2>相似案例推荐</h2>
          <button className="text-link as-button" onClick={() => openLead()}>上传我的户型</button>
        </div>
        <div className="case-grid">{similar.map((candidate) => <CaseCard item={candidate} key={candidate.id} />)}</div>
      </section>
      <section className="final-cta">
        <h2>你家的问题，可能和这个案例相似，但解决方法不会完全相同。</h2>
        <button className="button light" onClick={() => setLeadOpen(true)}>上传我的户型</button>
      </section>
      <LeadForm open={leadOpen} onClose={() => setLeadOpen(false)} sourcePage="案例详情" sourceCase={item.title} />
    </article>
  );
}

function WizardStep({ title, label, description, children }: { title: string; label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="wizard-step">
      <div className="wizard-step-copy">
        <span>{label}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}

function InspirationPage() {
  const [params] = useSearchParams();
  const [category, setCategory] = useState(params.get("category") || "全部");
  const items = category === "全部" ? inspirations : inspirations.filter((item) => item.category === category);
  return (
    <section className="page-section">
      <PageHero eyebrow="INSPIRATION" title="空间效果" body="每一张图都绑定一个真实居住问题，而不是普通图片瀑布流。" />
      <div className="category-tabs">{inspirationCategories.map((item) => <button className={category === item ? "selected" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div>
      <div className="inspiration-grid">
        {items.map((item) => (
          <Link className="inspiration-card" to={`/inspiration/${item.id}`} key={item.id}>
            <img src={item.image} alt={item.question} />
            <span>{item.category}</span>
            <h3>{item.question}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}

function InspirationDetailPage() {
  const { id } = useParams();
  const item = getInspiration(id);
  return (
    <section className="page-section">
      <div className="article-detail">
        <img src={item.image} alt={item.question} />
        <div>
          <span className="eyebrow">{item.category}</span>
          <h1>{item.question}</h1>
          <h3>设计方案</h3>
          <p>{item.solution}</p>
          <h3>尺寸逻辑</h3>
          <p>{item.dimension}</p>
          <h3>适用家庭</h3>
          <p>{item.families.join(" / ")}</p>
          <h3>关联案例</h3>
          <div className="link-list">{item.relatedCaseIds.map((caseId) => <Link to={`/cases/${caseId}`} key={caseId}>{getCase(caseId).title}<ChevronRight size={16} /></Link>)}</div>
        </div>
      </div>
    </section>
  );
}

function LifestylePage() {
  const questions: [string, string[]][] = [
    ["回家以后，你最容易随手放下什么？", ["包", "钥匙", "快递", "外套", "都有"]],
    ["你的鞋大概有多少？", ["20 双以内", "20–40 双", "40–60 双", "60 双以上"]],
    ["餐厅除了吃饭，还承担什么功能？", ["小家电", "咖啡", "饮水", "孩子学习", "临时办公"]],
    ["你是否经常居家办公？", ["经常", "偶尔", "很少"]],
    ["家庭中是否有正在成长的孩子？", ["有", "暂时没有", "未来可能有"]],
    ["是否有宠物？", ["有猫", "有狗", "没有"]],
    ["最无法接受的家庭状态是什么？", ["台面杂乱", "东西找不到", "柜子不够用", "空间压抑", "风格不统一"]]
  ];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const done = index >= questions.length;
  return (
    <section className="page-section narrow">
      <PageHero eyebrow="LIFESTYLE QUIZ" title="生活方式测试" body="先理解日常，再谈柜子应该放什么。" />
      {!done ? (
        <div className="quiz-card">
          <div className="progress">{index + 1} / {questions.length}</div>
          <h2>{questions[index][0]}</h2>
          <PillPicker options={questions[index][1]} value={answers[index] || ""} onChange={(v) => { const next = [...answers]; next[index] = v as string; setAnswers(next); }} />
          <div className="wizard-actions">
            {index > 0 && <button className="button ghost" onClick={() => setIndex(index - 1)}>上一题</button>}
            <button className="button dark" onClick={() => setIndex(index + 1)}>下一题</button>
          </div>
        </div>
      ) : (
        <div className="quiz-result">
          <span className="eyebrow">RESULT</span>
          <h2>高收纳需求 · 成长型家庭</h2>
          {["建立玄关回家动线", "把餐厅作为家庭第二储物中心", "儿童房采用成长型家具规划", "提前设计家政用品与清洁设备位置", "减少开放格比例，控制视觉杂乱"].map((item) => <p key={item}><Check size={17} />{item}</p>)}
          <div className="case-grid">{cases.slice(0, 3).map((item) => <CaseCard item={item} key={item.id} />)}</div>
          <Link className="button dark" to="/diagnosis" onClick={startNewDiagnosisSession}>进一步诊断我的户型</Link>
        </div>
      )}
    </section>
  );
}

function BudgetPage() {
  const { openLead } = useLead();
  const [initialBudget] = useState(getOrCreateCurrentBudget);
  const [budgetSessionId, setBudgetSessionId] = useState(initialBudget.budgetSessionId);
  const [step, setStep] = useState(initialBudget.currentStep);
  const [area, setArea] = useState(initialBudget.area);
  const [spaces, setSpaces] = useState<string[]>(initialBudget.selectedSpaces);
  const [level, setLevel] = useState<BudgetLevel>(initialBudget.customLevel as BudgetLevel);
  const [material, setMaterial] = useState<MaterialLevel>(initialBudget.materialLevel as MaterialLevel);
  const result = estimateBudget(area, spaces, level, material);

  useEffect(() => {
    saveCurrentBudget({ budgetSessionId, currentStep: step, area, selectedSpaces: spaces, customLevel: level, materialLevel: material });
  }, [area, budgetSessionId, level, material, spaces, step]);

  useEffect(() => {
    const resetFlow = (event: Event) => {
      const current = (event as CustomEvent<ReturnType<typeof startNewBudgetSession>>).detail;
      setBudgetSessionId(current.budgetSessionId);
      setStep(current.currentStep);
      setArea(current.area);
      setSpaces(current.selectedSpaces);
      setLevel(current.customLevel as BudgetLevel);
      setMaterial(current.materialLevel as MaterialLevel);
    };
    window.addEventListener("xujian:budget-session-start", resetFlow);
    return () => window.removeEventListener("xujian:budget-session-start", resetFlow);
  }, []);

  const completeBudget = () => {
    const resultRange = `¥${result.low.toLocaleString()}–¥${result.high.toLocaleString()}`;
    saveBudgetRecord({ area, selectedSpaces: spaces, customLevel: level, materialLevel: material, resultRange }, budgetSessionId);
    saveActivity({ budgetSessionId, type: "budget_complete", page: "预算规划", metadata: { budgetSessionId, resultRange, area } });
    setStep(4);
  };
  return (
    <section className="page-section">
      <PageHero eyebrow="BUDGET" title="预算不是一个数字，而是一组选择。" body="这里帮助用户建立预算范围，而不是替代实际测量报价。" />
      <div className="budget-layout stepped-budget">
        <div className="budget-panel">
          <div className="progress">Step {step} / 4</div>
          {step === 1 && (
            <>
          <label>房屋面积：{area}㎡</label>
          <input type="range" min="70" max="200" value={area} onChange={(e) => setArea(Number(e.target.value))} />
            </>
          )}
          {step === 2 && (
            <>
          <h3>定制空间</h3>
          <PillPicker multi options={["玄关", "客厅", "餐厅", "厨房", "主卧", "次卧", "儿童房", "书房", "阳台"]} value={spaces} onChange={(v) => setSpaces(v as string[])} />
            </>
          )}
          {step === 3 && (
            <>
          <h3>定制程度</h3>
          <PillPicker options={["基础收纳", "完整规划", "整体空间"]} value={level} onChange={(v) => setLevel(v as BudgetLevel)} />
          <h3>材料倾向</h3>
          <PillPicker options={["实用优先", "设计与品质平衡", "高阶质感"]} value={material} onChange={(v) => setMaterial(v as MaterialLevel)} />
            </>
          )}
          {step === 4 && (
            <div>
              <h3>确认你的预算条件</h3>
              <p>{area}㎡ · {spaces.join("、")} · {level} · {material}</p>
              <p className="muted">结果是范围判断，用于帮助你判断项目量级。</p>
            </div>
          )}
          <div className="wizard-actions">
            {step > 1 && <button className="button ghost" onClick={() => setStep(step - 1)}>上一步</button>}
            {step < 4 && <button className="button dark" onClick={() => step === 3 ? completeBudget() : setStep(step + 1)}>下一步</button>}
          </div>
        </div>
        <aside className="budget-result">
          <span className="eyebrow">DEMO RANGE</span>
          <h2>¥{result.low.toLocaleString()} – ¥{result.high.toLocaleString()}</h2>
          <p>根据当前选择，你的项目属于：{level}全屋定制需求。</p>
          <p className="fineprint">当前结果仅用于预算规划演示。实际项目需根据测量尺寸、柜体展开结构、材料、五金和安装条件确认。</p>
          <div className="impact-list">{["定制范围", "柜体内部结构", "门板与饰面", "功能五金"].map((item) => <span key={item}>{item}</span>)}</div>
          <button className="button dark" onClick={() => openLead()}>上传户型，进一步了解规划方向</button>
        </aside>
      </div>
    </section>
  );
}

function MaterialsPage() {
  return (
    <section className="page-section">
      <PageHero eyebrow="MATERIALS" title="选择材料之前，先理解它将如何被使用。" body="Demo 不虚构检测报告和品牌授权，只解释影响真实使用体验的关键位置。" />
      <div className="material-grid">{materialCards.map((item) => <article key={item.title}><img src={item.image} alt={item.title} /><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
      <section className="section process-section">
        <h2>安装过程</h2>
        <div className="process-line">{processSteps.map((step) => <span key={step}>{step}</span>)}</div>
      </section>
    </section>
  );
}

function AboutPage() {
  return (
    <section className="page-section">
      <PageHero eyebrow="ABOUT" title="设计不是增加，而是判断什么应该留下。" body="叙间关注的不只是柜体本身，而是人在空间中的动作、习惯和关系。" />
      <section className="section three-columns">
        {["初步沟通", "上门测量", "需求梳理", "方案设计", "预算确认", "深化生产", "安装交付", "售后服务"].map((step, index) => <article key={step}><span className="eyebrow">0{index + 1}</span><h3>{step}</h3><p>每一步都围绕真实居住动作和落地条件展开。</p></article>)}
      </section>
      <DesignerSection />
      <section className="section final-card">
        <h2>{contact.studioName}</h2>
        <p>{contact.demoAddress}</p>
        <p>正式上线时，门店地址、联系方式、团队资料均从集中配置替换。</p>
      </section>
    </section>
  );
}

const adminNav = [
  { label: "数据概览", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "客户线索", path: "/admin/leads", icon: UserRound },
  { label: "跟进任务", path: "/admin/follow-ups", icon: CalendarClock },
  { label: "内容中心", path: "/admin/content", icon: Lightbulb },
  { label: "达人合作", path: "/admin/influencers", icon: Handshake },
  { label: "案例更新申请", path: "/admin/case-requests", icon: FilePenLine },
  { label: "系统设置", path: "/admin/settings", icon: Settings }
];

function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getNextMonthStart(date = new Date()) {
  const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return `${nextMonth.getFullYear()} 年 ${nextMonth.getMonth() + 1} 月 1 日`;
}

function formatAdminDate(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getOwner(id: string) {
  return salesPeople.find((item) => item.id === id) ?? salesPeople[0];
}

function getLead(id: string | undefined, leads: AdminLead[]) {
  return leads.find((lead) => lead.id === id);
}

function getCaseTitle(id?: string) {
  return cases.find((item) => item.id === id)?.title ?? "未关联案例";
}

type AdminDemoTools = {
  leads: AdminLead[];
  followUps: FollowUp[];
  activities: Activity[];
  caseRequests: CaseChangeRequest[];
  influencerCollabs: InfluencerCollaboration[];
  updateLead: (id: string, changes: Partial<AdminLead>) => void;
  addFollowUp: (entry: Omit<FollowUp, "merchantId" | "id" | "createdAt" | "ownerId" | "done">) => void;
  addCaseRequest: (entry: Omit<CaseChangeRequest, "id" | "merchantId" | "status" | "serviceNote" | "quotaMonth" | "createdAt" | "completedAt">) => void;
  updateInfluencer: (id: string, changes: Partial<InfluencerCollaboration>) => void;
  resetDemoData: () => void;
  clearCurrentDeviceData: () => void;
};

function useAdminDemo() {
  return useOutletContext<AdminDemoTools>();
}

function AdminShell() {
  const [demoData, setDemoData] = useState(loadAdminDemoData);
  const merchant = getCurrentMerchant();

  useEffect(() => {
    saveAdminDemoData(demoData);
  }, [demoData]);

  const updateLead = (id: string, changes: Partial<AdminLead>) => {
    setDemoData((current) => ({
      ...current,
      leads: current.leads.map((lead) => lead.id === id ? { ...lead, ...changes } : lead)
    }));
  };

  const addFollowUp = (entry: Omit<FollowUp, "merchantId" | "id" | "createdAt" | "ownerId" | "done">) => {
    const followUp = saveFollowUpRecord({
      ...entry,
      ownerId: "owner-chen",
      done: false
    });
    setDemoData((current) => ({
      ...current,
      followUps: [{
        ...followUp,
        customerFeedback: entry.customerFeedback,
        done: false
      }, ...current.followUps]
    }));
  };

  const addCaseRequest: AdminDemoTools["addCaseRequest"] = (entry) => {
    const request: CaseChangeRequest = {
      ...entry,
      id: `case-request-${Date.now()}`,
      merchantId: merchant.merchantId,
      status: "已提交",
      serviceNote: "Bonest 客服将在 1 个工作日内确认素材与排期。",
      quotaMonth: getMonthKey(),
      createdAt: formatAdminDate(),
      completedAt: ""
    };
    setDemoData((current) => ({ ...current, caseRequests: [request, ...current.caseRequests] }));
  };

  const updateInfluencer = (id: string, changes: Partial<InfluencerCollaboration>) => {
    setDemoData((current) => ({
      ...current,
      influencerCollabs: current.influencerCollabs.map((item) => item.id === id ? { ...item, ...changes } : item)
    }));
  };

  const resetDemoData = () => setDemoData(resetAdminDemoData());
  const clearCurrentDeviceData = () => {
    clearCurrentDeviceScopedData();
    setDemoData(loadAdminDemoData());
  };

  return (
    <section className="admin-page">
      <aside className="admin-sidebar">
        <Link className="admin-brand" to="/admin/dashboard">
          <strong>{merchant.merchantName}工作台</strong>
          <span>XUJIAN CRM</span>
        </Link>
        <nav>
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.path} to={item.path}>
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="admin-plan-card">
          <span>当前服务：进阶版</span>
          <strong>599 元 / 月</strong>
          <p>线索管理 · 跟进任务 · 内容选题 · 达人合作管理 · 每月 3 次案例修改</p>
        </div>
        <div className="admin-account">
          <span>演</span>
          <div>
            <strong>演示管理员</strong>
            <Link to="/">返回 Demo 首页</Link>
          </div>
        </div>
        <div className="admin-demo-tools">
          <p>Bonest 演示案例<br />页面与数据均为示例</p>
          <button className="text-link as-button" onClick={resetDemoData}>重置演示数据</button>
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <div>
            <span className="eyebrow">BUSINESS WORKSPACE</span>
            <h1>商家工作台</h1>
            <p className="admin-demo-notice">Bonest 演示案例 · 页面与数据均为示例 · {merchant.merchantName} Demo</p>
          </div>
          <label className="admin-search">
            <Search size={18} />
            <input placeholder="搜索客户姓名、手机号、小区" />
          </label>
          <div className="admin-actions">
            <button className="icon-button" aria-label="通知"><Bell size={18} /></button>
            <Link className="button small" to="/admin/case-requests"><Plus size={16} />提交案例申请</Link>
            <span className="avatar">演</span>
          </div>
        </header>
        <Outlet context={{
          leads: demoData.leads,
          followUps: demoData.followUps,
          activities: demoData.activities,
          caseRequests: demoData.caseRequests,
          influencerCollabs: demoData.influencerCollabs,
          updateLead,
          addFollowUp,
          addCaseRequest,
          updateInfluencer,
          resetDemoData,
          clearCurrentDeviceData
        }} />
      </div>
    </section>
  );
}

function AdminDashboardPage() {
  const { leads, followUps, activities } = useAdminDemo();
  const highIntent = leads.filter((lead) => lead.intentLevel === "high").slice(0, 4);
  const todayLeads = leads.slice(0, 5);
  const todayTasks = followUps.filter((item) => !item.done).slice(0, 5);
  const recentActivities = [...activities].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
  const hotCases = cases.slice(0, 5);
  const scopedMetrics = [
    { label: "本商家访问", value: String(activities.filter((item) => ["page_view", "case_view"].includes(item.type)).length), trend: "按当前商家统计" },
    { label: "线索总数", value: String(leads.length), trend: "含演示与本地提交" },
    { label: "完成空间诊断", value: String(activities.filter((item) => item.type === "diagnosis_complete").length), trend: "当前商家记录" },
    { label: "预算测算", value: String(activities.filter((item) => item.type === "budget_complete").length), trend: "当前商家记录" },
    { label: "预约量房", value: String(leads.filter((lead) => ["appointment", "measured"].includes(lead.status)).length), trend: "当前商家客户" },
    { label: "成交客户", value: String(leads.filter((lead) => lead.status === "won").length), trend: "当前商家客户" }
  ];
  const visitorCount = Math.max(new Set(activities.map((item) => item.deviceId)).size, leads.length);
  const scopedFunnel = [
    { label: "访客", value: visitorCount },
    { label: "诊断", value: activities.filter((item) => item.type === "diagnosis_complete").length },
    { label: "深度浏览", value: activities.filter((item) => item.type === "case_view").length },
    { label: "留资", value: leads.length },
    { label: "量房", value: leads.filter((lead) => ["measured", "proposal", "quotation", "negotiation", "won"].includes(lead.status)).length },
    { label: "方案", value: leads.filter((lead) => ["proposal", "quotation", "negotiation", "won"].includes(lead.status)).length },
    { label: "成交", value: leads.filter((lead) => lead.status === "won").length }
  ];
  return (
    <div className="admin-main">
      <section className="admin-welcome">
        <div>
          <span className="eyebrow">TODAY</span>
          <h2>欢迎回来，演示管理员。</h2>
          <p>当前商家共有 {leads.length} 条线索，其中 {highIntent.length} 位客户建议优先联系。</p>
        </div>
        <Link className="button dark" to="/admin/follow-ups">查看今日待办</Link>
      </section>

      <div className="admin-stats">
        {scopedMetrics.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.trend}</p>
          </article>
        ))}
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <div className="panel-title">
            <h2>今日新线索</h2>
            <Link to="/admin/leads">查看全部</Link>
          </div>
          <div className="lead-card-list">
            {todayLeads.map((lead) => <LeadMiniCard lead={lead} key={lead.id} />)}
          </div>
        </section>
        <section className="admin-panel">
          <div className="panel-title"><h2>高意向客户</h2><span>{highIntent.length} 位建议优先联系</span></div>
          {highIntent.map((lead) => (
            <Link className="priority-lead" to={`/admin/leads/${lead.id}`} key={lead.id}>
              <strong>{lead.name}</strong>
              <span>{lead.score} 分 · {intentLabels[lead.intentLevel]}</span>
              <p>{lead.community} · {lead.budgetRange} · {lead.painPoints.slice(0, 2).join(" / ")}</p>
            </Link>
          ))}
        </section>
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <div className="panel-title"><h2>销售漏斗</h2><span>Hover 可查看转化率</span></div>
          <div className="admin-funnel">
            {scopedFunnel.map((step, index) => {
              const previous = scopedFunnel[index - 1]?.value;
              const rate = previous ? Math.round((step.value / previous) * 100) : 100;
              return (
                <div title={`相对上一环节转化率 ${rate}%`} style={{ width: `${100 - index * 10}%` }} key={step.label}>
                  <span>{step.label}</span>
                  <strong>{step.value.toLocaleString()}</strong>
                </div>
              );
            })}
          </div>
        </section>
        <section className="admin-panel">
          <div className="panel-title"><h2>今日待跟进</h2><Link to="/admin/follow-ups">进入任务</Link></div>
          {todayTasks.map((task) => {
            const lead = getLead(task.leadId, leads);
            if (!lead) return null;
            return (
              <div className="task-row" key={task.id}>
                <time>{task.nextFollowUpAt.slice(11)}</time>
                <div><strong>{lead.name}</strong><p>{task.nextAction}</p></div>
                <Link to={`/admin/leads/${lead.id}`}>查看客户</Link>
              </div>
            );
          })}
        </section>
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <div className="panel-title"><h2>最近客户行为</h2></div>
          <ActivityTimeline items={recentActivities} compact />
        </section>
        <section className="admin-panel">
          <div className="panel-title"><h2>热门案例</h2><Link to="/admin/case-requests">申请案例更新</Link></div>
          {hotCases.map((item) => (
            <Link className="case-admin-row" to={`/admin/case-requests?case=${item.id}`} key={item.id}>
              <img src={item.cover} alt={item.title} />
              <div><strong>{item.title}</strong><p>{item.area}㎡ · {item.familyLabel} · 浏览 {activities.filter((activity) => activity.type === "case_view" && activity.caseId === item.id).length} · 获客 {leads.filter((lead) => lead.viewedCases.includes(item.id)).length}</p></div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}

function LeadMiniCard({ lead }: { lead: AdminLead }) {
  return (
    <Link className="lead-mini-card" to={`/admin/leads/${lead.id}`}>
      <div>
        <strong>{lead.name}</strong>
        <span>{lead.phone}</span>
      </div>
      <p>{lead.district} · {lead.community}</p>
      <p>{lead.area} · {lead.familyMembers.join("+")} · 预算倾向：{lead.budgetRange}</p>
      <div className="tag-row">
        {[...lead.painPoints.slice(0, 2), lead.stylePreference].map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      <small>来源：{lead.source} · {lead.createdAt.slice(11)}</small>
    </Link>
  );
}

function AdminLeadsPage() {
  const { leads, followUps } = useAdminDemo();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("全部");
  const [intent, setIntent] = useState("全部");
  const [source, setSource] = useState("全部");
  const filtered = leads.filter((lead) => {
    const haystack = `${lead.name} ${lead.phone} ${lead.community} ${lead.city} ${lead.stylePreference}`;
    return (
      haystack.includes(query) &&
      (status === "全部" || lead.status === status) &&
      (intent === "全部" || lead.intentLevel === intent) &&
      (source === "全部" || lead.source === source)
    );
  });
  const counts = {
    all: leads.length,
    today: leads.filter((lead) => lead.createdAt.includes("2026-07-08")).length,
    high: leads.filter((lead) => lead.intentLevel === "high").length,
    follow: followUps.filter((item) => !item.done).length,
    measured: leads.filter((lead) => lead.status === "measured").length,
    proposal: leads.filter((lead) => lead.status === "proposal").length,
    won: leads.filter((lead) => lead.status === "won").length
  };

  return (
    <div className="admin-main">
      <section className="admin-panel">
        <div className="lead-tabs">
          {[
            ["全部客户", counts.all],
            ["今日新增", counts.today],
            ["高意向", counts.high],
            ["待跟进", counts.follow],
            ["已量房", counts.measured],
            ["方案阶段", counts.proposal],
            ["已成交", counts.won]
          ].map(([label, count]) => <button key={label}>{label}<strong>{count}</strong></button>)}
        </div>
        <div className="lead-filters">
          <label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="姓名 / 手机 / 小区" /></label>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>全部</option>
            {Object.entries(leadStatusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
          <select value={intent} onChange={(event) => setIntent(event.target.value)}>
            <option>全部</option>
            <option value="high">高意向</option>
            <option value="medium">持续跟进</option>
            <option value="low">待观察</option>
          </select>
          <select value={source} onChange={(event) => setSource(event.target.value)}>
            <option>全部</option>
            {Array.from(new Set(leads.map((lead) => lead.source))).map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </div>
      </section>

      <section className="admin-panel lead-list-panel">
        <div className="lead-table-head">
          <span>客户</span><span>房屋信息</span><span>核心需求</span><span>预算</span><span>意向</span><span>阶段</span><span>负责人</span><span>下次跟进</span><span>操作</span>
        </div>
        {filtered.map((lead) => (
          <Link className="lead-table-row" to={`/admin/leads/${lead.id}`} key={lead.id}>
            <div><strong>{lead.name}</strong><p>{lead.phone}</p></div>
            <div><strong>{lead.city} · {lead.community}</strong><p>{lead.area} / {lead.layout}</p></div>
            <div className="tag-row">{lead.painPoints.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
            <span>{lead.budgetRange}</span>
            <span className={`intent-pill ${lead.intentLevel}`}>{intentLabels[lead.intentLevel]} · {lead.score}</span>
            <span>{leadStatusLabels[lead.status]}</span>
            <span>{getOwner(lead.ownerId).name}</span>
            <span>{lead.nextFollowUpAt.slice(5)}</span>
            <span className="table-action">查看详情</span>
          </Link>
        ))}
      </section>
    </div>
  );
}

function AdminLeadDetailPage() {
  const { id } = useParams();
  const { leads, followUps, activities, updateLead, addFollowUp } = useAdminDemo();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [followUpNote, setFollowUpNote] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const lead = getLead(id, leads);

  if (!lead) {
    return (
      <div className="admin-main">
        <section className="admin-panel empty-admin-state">
          <span className="eyebrow">LEAD NOT FOUND</span>
          <h2>未找到该客户或无权查看</h2>
          <p>该客户可能不属于当前演示商家，或记录已经被清除。</p>
          <Link className="button dark" to="/admin/leads">返回客户列表</Link>
        </section>
      </div>
    );
  }

  const owner = getOwner(lead.ownerId);
  const leadActivities = activities.filter((item) => item.leadId === lead.id);
  const leadFollowUps = followUps.filter((item) => item.leadId === lead.id);
  const recommended = cases
    .map((item) => ({
      item,
      score: (lead.viewedCases.includes(item.id) ? 12 : 0) + (item.style === lead.stylePreference ? 10 : 0) + item.needs.filter((need) => lead.painPoints.join("").includes(need.slice(0, 2))).length * 6
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const submitFollowUp = () => {
    if (!followUpNote.trim()) return setActionMessage("请先填写本次沟通记录");
    addFollowUp({
      leadId: lead.id,
      method: "演示跟进",
      content: followUpNote.trim(),
      customerFeedback: "演示环境记录，等待后续确认。",
      nextAction: "下次联系确认空间方案与预约时间",
      nextFollowUpAt: lead.nextFollowUpAt
    });
    setFollowUpNote("");
    setFollowUpOpen(false);
    setActionMessage("跟进记录已保存到当前浏览器");
  };

  return (
    <div className="admin-main">
      <section className="lead-detail-hero admin-panel">
        <div>
          <Link className="text-link" to="/admin/leads">返回客户列表</Link>
          <h2>{lead.name}</h2>
          <p>{lead.phone} · 微信 {lead.wechat} · {lead.city} · {lead.community}</p>
          <div className="tag-row">
            <span className={`intent-pill ${lead.intentLevel}`}>{intentLabels[lead.intentLevel]} · {lead.score} 分</span>
            <span>{leadStatusLabels[lead.status]}</span>
            <span>负责人：{owner.name}</span>
            <span>创建：{lead.createdAt}</span>
          </div>
        </div>
        <div className="lead-actions">
          <button className="button ghost" onClick={() => setActionMessage("演示环境不拨打真实电话")}>
            拨打电话
          </button>
          <button className="button ghost" onClick={() => setActionMessage("演示微信号仅用于展示，不会复制真实联系方式")}>
            复制微信
          </button>
          <button className="button ghost" onClick={() => setFollowUpOpen(true)}>添加跟进</button>
          <button className="button ghost" onClick={() => { updateLead(lead.id, { status: "appointment" }); setActionMessage("已标记为预约量房（演示数据）"); }}>
            预约量房
          </button>
          <button className="button dark" onClick={() => setDrawerOpen(true)}>发送案例</button>
        </div>
      </section>

      {actionMessage && <p className="demo-action-message" role="status">{actionMessage}</p>}

      <div className="lead-detail-layout">
        <main className="lead-detail-main">
          <section className="admin-panel">
            <div className="panel-title"><h2>家庭空间画像</h2><span>{lead.diagnosisType}</span></div>
            <div className="profile-grid">
              <InfoBlock label="家庭结构" value={lead.familyMembers.join(" + ")} />
              <InfoBlock label="房屋" value={`${lead.area} · ${lead.layout}`} />
              <InfoBlock label="未来变化" value={lead.futureChanges.join(" / ")} />
              <InfoBlock label="风格" value={lead.stylePreference} />
              <InfoBlock label="最关心" value={lead.mainConcern} />
              <InfoBlock label="预算" value={lead.budgetRange} />
            </div>
            <div className="tag-row roomy">{lead.painPoints.map((point) => <span key={point}>{point}</span>)}</div>
          </section>

          <section className="admin-panel">
            <div className="panel-title"><h2>诊断记录</h2><span>完整答题结果</span></div>
            {lead.hasDiagnosisRecord ? (
              <div className="diagnosis-record">
                <InfoBlock label="诊断 session" value={lead.diagnosisSessionId} />
                <InfoBlock label="Q1 房屋面积" value={lead.area} />
                <InfoBlock label="Q2 家庭成员" value={lead.familyMembers.join("、")} />
                <InfoBlock label="Q3 最容易乱的位置" value={lead.messySpaces.join("、")} />
                <InfoBlock label="Q4 当前问题" value={lead.painPoints.join("、")} />
                <InfoBlock label="Q5 未来变化" value={lead.futureChanges.join("、")} />
                <InfoBlock label="Q6 风格" value={lead.stylePreference} />
                <InfoBlock label="Q7 最关心" value={lead.mainConcern} />
              </div>
            ) : <p className="muted">暂无记录</p>}
          </section>

          <section className="admin-panel">
            <div className="panel-title"><h2>客户浏览轨迹</h2><span>销售判断兴趣点</span></div>
            <ActivityTimeline items={leadActivities} />
          </section>
        </main>

        <aside className="lead-detail-side">
          <section className="admin-panel">
            <h2>下一步建议</h2>
            <p>先联系客户确认周末到店时间，并发送 {recommended[0]?.item.title} 案例作为沟通切入。</p>
            <Link className="button dark wide" to="/admin/follow-ups">创建下次跟进任务</Link>
          </section>

          <section className="admin-panel">
            <div className="panel-title"><h2>演示客户管理</h2><span>保存在本机</span></div>
            <label className="demo-field">跟进状态
              <select value={lead.status} onChange={(event) => updateLead(lead.id, { status: event.target.value })}>
                {Object.entries(leadStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="demo-field">客户等级
              <select value={lead.intentLevel} onChange={(event) => updateLead(lead.id, { intentLevel: event.target.value as AdminLead["intentLevel"] })}>
                <option value="high">高意向</option>
                <option value="medium">持续跟进</option>
                <option value="low">待观察</option>
              </select>
            </label>
            <label className="demo-field">预约 / 下次跟进
              <input value={lead.nextFollowUpAt} onChange={(event) => updateLead(lead.id, { nextFollowUpAt: event.target.value })} />
            </label>
          </section>

          <section className="admin-panel">
            <div className="panel-title"><h2>预算记录</h2><span>自助测算</span></div>
            {lead.hasBudgetRecord ? (
              <>
                <p className="muted">session：{lead.budgetSessionId}</p>
                <p>{lead.budgetResult.area} · {lead.budgetResult.spaces.join("、")}</p>
                <p>{lead.budgetResult.level} · {lead.budgetResult.material}</p>
                <strong className="budget-number">{lead.budgetResult.range}</strong>
                <p className="fineprint">这是客户自助预算测算结果，不是正式报价。</p>
              </>
            ) : <p className="muted">暂无记录</p>}
          </section>

          <section className="admin-panel">
            <div className="panel-title"><h2>上传户型图</h2><span>{lead.uploadedPlan.viewed ? "已查看" : "待查看"}</span></div>
            {lead.uploadedPlan.url ? <img className="plan-preview" src={lead.uploadedPlan.url} alt={lead.uploadedPlan.name} /> : <p>客户暂未上传户型图。</p>}
            <div className="button-row"><button className="button ghost">点击放大</button><button className="button ghost">下载</button></div>
          </section>

          <section className="admin-panel">
            <div className="panel-title"><h2>跟进记录</h2><button className="text-link as-button" onClick={() => setFollowUpOpen(true)}>新增跟进</button></div>
            {followUpOpen && <div className="followup-composer"><textarea value={followUpNote} onChange={(event) => setFollowUpNote(event.target.value)} placeholder="记录本次沟通重点、客户反馈或下次动作" rows={3} /><button className="button dark" onClick={submitFollowUp}>保存演示跟进</button></div>}
            {leadFollowUps.map((item) => (
              <article className="followup-card" key={item.id}>
                <strong>{item.createdAt} · {item.method}</strong>
                <p>{item.content}</p>
                <p className="muted">{item.customerFeedback}</p>
                <span>下一步：{item.nextAction}</span>
              </article>
            ))}
          </section>
        </aside>
      </div>

      {drawerOpen && (
        <div className="admin-drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <aside className="admin-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="panel-title"><h2>推荐给{lead.name}</h2><button className="icon-button" onClick={() => setDrawerOpen(false)}>×</button></div>
            {recommended.map(({ item }) => (
              <article className="send-case-card" key={item.id}>
                <img src={item.cover} alt={item.title} />
                <h3>{item.title} {item.area}㎡</h3>
                <p>推荐理由：面积相近 / {item.familyLabel} / {item.style} / {item.needs.slice(0, 2).join("、")}</p>
                <div className="button-row">
                  <button className="button ghost">复制链接</button>
                  <button className="button dark">标记已发送</button>
                </div>
              </article>
            ))}
          </aside>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-block">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ActivityTimeline({ items, compact = false }: { items: Activity[]; compact?: boolean }) {
  return (
    <div className={compact ? "activity-timeline compact" : "activity-timeline"}>
      {items.map((item) => (
        <article key={item.id}>
          <time>{item.createdAt.slice(11)}</time>
          <div>
            <strong>{item.page}</strong>
            <p>{item.caseId ? `查看案例：${getCaseTitle(item.caseId)}` : item.metadata}{item.duration ? ` · 停留 ${item.duration}` : ""}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function AdminFollowUpsPage() {
  const { leads, followUps } = useAdminDemo();
  const buckets = [
    { title: "今天", items: followUps.filter((item) => !item.done).slice(0, 6) },
    { title: "逾期", items: followUps.filter((item, index) => !item.done && index % 4 === 1).slice(0, 5) },
    { title: "明天", items: followUps.filter((item, index) => !item.done && index % 4 === 2).slice(0, 5) },
    { title: "本周", items: followUps.filter((item, index) => !item.done && index % 4 === 3).slice(0, 6) },
    { title: "已完成", items: followUps.filter((item) => item.done).slice(0, 5) }
  ];

  return (
    <div className="admin-main">
      <section className="admin-panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">FOLLOW UP</span>
            <h2>跟进任务</h2>
          </div>
          <button className="button dark">新增跟进</button>
        </div>
        <div className="followup-board">
          {buckets.map((bucket) => (
            <article className="followup-column" key={bucket.title}>
              <header>
                <strong>{bucket.title}</strong>
                <span>{bucket.items.length}</span>
              </header>
              {bucket.items.map((item) => {
                const lead = getLead(item.leadId, leads);
                if (!lead) return null;
                return (
                  <Link className="followup-task" to={`/admin/leads/${lead.id}`} key={item.id}>
                    <div className="task-meta">
                      <span>{item.nextFollowUpAt.slice(5)}</span>
                      <span className={`intent-pill ${lead.intentLevel}`}>{intentLabels[lead.intentLevel]}</span>
                    </div>
                    <strong>{lead.name} · {lead.community}</strong>
                    <p>{item.nextAction}</p>
                    <small>{item.method} · {getOwner(item.ownerId).name}</small>
                  </Link>
                );
              })}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

const caseChangeTypes: CaseChangeType[] = ["替换图片", "修改标题", "修改文案", "调整标签", "新增案例", "下架案例"];
const influencerStatuses: InfluencerStatus[] = ["待筛选", "待联系", "沟通中", "已确认", "已发布", "已复盘"];

function AdminCaseRequestsPage() {
  const { caseRequests, addCaseRequest } = useAdminDemo();
  const [searchParams] = useSearchParams();
  const requestedCaseId = searchParams.get("case");
  const [selectedCaseId, setSelectedCaseId] = useState(() => cases.some((item) => item.id === requestedCaseId) ? requestedCaseId as string : cases[0].id);
  const [changeType, setChangeType] = useState<CaseChangeType>("替换图片");
  const [description, setDescription] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [contactValue, setContactValue] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [message, setMessage] = useState("");
  const currentMonth = getMonthKey();
  const usedCount = caseRequests.filter((request) => request.quotaMonth === currentMonth && request.status !== "待提交").length;
  const remainingCount = Math.max(0, 3 - usedCount);
  const selectedCase = cases.find((item) => item.id === selectedCaseId) ?? cases[0];

  const submitRequest = () => {
    if (!description.trim()) return setMessage("请填写具体修改需求，方便客服准确评估。");
    if (!contactValue.trim()) return setMessage("请填写演示联系方式。");
    if (!expectedDate.trim()) return setMessage("请选择期望完成时间。");
    if (remainingCount <= 0) return setMessage("本月 3 次修改额度已用完，可联系客服沟通下月排期。");

    addCaseRequest({
      caseId: changeType === "新增案例" ? "new-case" : selectedCase.id,
      caseTitle: changeType === "新增案例" ? "新增案例" : selectedCase.title,
      changeType,
      description: description.trim(),
      materialName: materialName || "暂未上传素材",
      contact: contactValue.trim(),
      expectedDate
    });
    setDescription("");
    setMaterialName("");
    setExpectedDate("");
    setMessage("申请已提交，已使用 1 次本月案例修改额度。");
  };

  return (
    <div className="admin-main case-request-page">
      <section className="admin-panel admin-page-heading">
        <div>
          <span className="eyebrow">CASE UPDATE SERVICE</span>
          <h2>案例更新申请</h2>
          <p>进阶版每月包含 3 次案例修改，由 Bonest 客服协助完成。</p>
        </div>
        <div className="service-contact-actions">
          <button className="button ghost" onClick={() => setMessage("Demo 环境暂不接入真实客服，正式服务将从专属客服入口沟通。")}>联系 Bonest 客服</button>
          <button className="button dark" onClick={() => setMessage("已记录预约沟通意向，Demo 环境不会发送真实预约。")}>预约沟通</button>
        </div>
      </section>

      {message && <p className="demo-action-message" role="status">{message}</p>}

      <section className="quota-grid" aria-label="本月案例修改额度">
        <article><span>本月总额度</span><strong>3 次</strong><p>进阶版固定额度</p></article>
        <article><span>已使用</span><strong>{usedCount} 次</strong><p>已提交的申请</p></article>
        <article><span>剩余额度</span><strong>{remainingCount} 次</strong><p>{remainingCount ? "可继续提交" : "本月额度已用完"}</p></article>
        <article><span>下次重置</span><strong>{getNextMonthStart()}</strong><p>每月自动恢复为 3 次</p></article>
      </section>

      <section className="admin-panel">
        <div className="panel-title">
          <div><span className="eyebrow">CURRENT CASES</span><h2>当前案例列表</h2></div>
          <span>仅查看，内容修改由 Bonest 客服处理</span>
        </div>
        <div className="case-request-grid">
          {cases.map((item) => (
            <article className={selectedCaseId === item.id ? "case-request-card selected" : "case-request-card"} key={item.id}>
              <img src={item.cover} alt={item.title} />
              <div>
                <strong>{item.title}</strong>
                <p>{item.city} · {item.area}㎡ · {item.style}</p>
                <button
                  className="button ghost"
                  onClick={() => {
                    setSelectedCaseId(item.id);
                    setMessage(`已选择“${item.title}”，请在下方填写修改需求。`);
                  }}
                >
                  申请修改
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-panel" id="case-request-form">
        <div className="panel-title">
          <div><span className="eyebrow">SUBMIT REQUEST</span><h2>提交修改需求</h2></div>
          <span>提交后客服会确认素材与排期</span>
        </div>
        <div className="case-request-form">
          <label>需要修改的案例
            <select value={selectedCaseId} onChange={(event) => setSelectedCaseId(event.target.value)} disabled={changeType === "新增案例"}>
              {cases.map((item) => <option value={item.id} key={item.id}>{item.title} · {item.city}</option>)}
            </select>
          </label>
          <label>修改类型
            <select value={changeType} onChange={(event) => setChangeType(event.target.value as CaseChangeType)}>
              {caseChangeTypes.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="span-two">需求说明
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} placeholder="例如：替换玄关完工图，并把标题改为更突出三口之家收纳动线的表达。" />
          </label>
          <label className="material-upload span-two">上传素材（Demo）
            <input type="file" accept="image/*,.zip,.pdf,.doc,.docx" onChange={(event) => setMaterialName(event.target.files?.[0]?.name ?? "")} />
            <span>{materialName || "可选择图片、压缩包或需求文档；Demo 不会实际上传文件。"}</span>
          </label>
          <label>联系方式
            <input value={contactValue} onChange={(event) => setContactValue(event.target.value)} placeholder="联系人 / 演示微信或手机号" />
          </label>
          <label>期望完成时间
            <input value={expectedDate} onChange={(event) => setExpectedDate(event.target.value)} placeholder="例如 2026-07-28" />
          </label>
        </div>
        <div className="request-submit-row">
          <p>本次提交将使用 1 次额度，提交前请确认需求和素材完整。</p>
          <button className="button dark" disabled={remainingCount <= 0} onClick={submitRequest}>提交案例更新申请</button>
        </div>
      </section>

      <section className="admin-panel">
        <div className="panel-title"><div><span className="eyebrow">REQUEST HISTORY</span><h2>申请记录</h2></div><span>{caseRequests.length} 条记录</span></div>
        <div className="request-history-list">
          {[...caseRequests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((request) => (
            <article className="request-history-item" key={request.id}>
              <div className="request-history-main">
                <span className="status-pill" data-status={request.status}>{request.status}</span>
                <div><strong>{request.caseTitle} · {request.changeType}</strong><p>{request.description}</p></div>
              </div>
              <dl>
                <div><dt>申请时间</dt><dd>{request.createdAt}</dd></div>
                <div><dt>期望完成</dt><dd>{request.expectedDate || "待确认"}</dd></div>
                <div><dt>客服备注</dt><dd>{request.serviceNote}</dd></div>
                <div><dt>完成时间</dt><dd>{request.completedAt || "尚未完成"}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function AdminContentCenterPage() {
  const [month, setMonth] = useState("2026-07");
  const [platform, setPlatform] = useState<"all" | ContentTopicPlatform>("all");
  const [topicType, setTopicType] = useState<"all" | ContentTopicType>("all");
  const [selectedTopic, setSelectedTopic] = useState<ContentTopic | null>(null);
  const monthLabel = contentMonthOptions.find((option) => option.value === month)?.label ?? month;
  const monthTopics = contentTopics.filter((topic) => topic.month === month);
  const filteredTopics = monthTopics.filter((topic) => (
    (platform === "all" || topic.platform === platform)
    && (topicType === "all" || topic.topicType === topicType)
  ));
  const platformCounts = contentPlatformOptions
    .filter((option) => option.value !== "all")
    .map((option) => ({
      ...option,
      count: monthTopics.filter((topic) => topic.platform === option.value).length
    }));

  useEffect(() => {
    if (!selectedTopic) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedTopic(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedTopic]);

  return (
    <div className="admin-main content-center-page">
      <section className="admin-panel admin-page-heading content-library-heading">
        <div>
          <span className="eyebrow">MONTHLY TOPIC LIBRARY</span>
          <h2>内容选题库</h2>
          <p>每月为商家整理适合抖音、小红书、视频号的内容选题方向。选题用于辅助商家持续输出内容，实际拍摄与发布效果取决于账号基础、执行质量和平台反馈。</p>
        </div>
        <span className="service-note">进阶版内容选题服务</span>
      </section>

      <section className="content-library-note" aria-label="内容服务说明">
        <strong>服务说明</strong>
        <p>这里提供的是“选题方向”和“内容承接建议”，不是拍摄计划，也不承诺具体流量效果。</p>
      </section>

      <section className="admin-panel content-library-controls">
        <div className="content-month-row">
          <label className="content-month-select">
            <span>月份选择</span>
            <select value={month} onChange={(event) => setMonth(event.target.value)}>
              {contentMonthOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
            </select>
          </label>
          <div className="content-month-summary">
            <span>{monthLabel}选题</span>
            <strong>{monthTopics.length} 个方向</strong>
          </div>
        </div>

        <div className="content-filter-group">
          <span>平台筛选</span>
          <div className="content-filter-tabs">
            {contentPlatformOptions.map((option) => (
              <button type="button" className={platform === option.value ? "selected" : ""} onClick={() => setPlatform(option.value)} key={option.value}>{option.label}</button>
            ))}
          </div>
        </div>

        <div className="content-filter-group">
          <span>类型筛选</span>
          <div className="content-filter-tabs">
            {contentTypeOptions.map((option) => (
              <button type="button" className={topicType === option.value ? "selected" : ""} onClick={() => setTopicType(option.value)} key={option.value}>{option.label}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="content-topic-stats" aria-label={`${monthLabel}平台选题统计`}>
        <div className="content-topic-stats-heading">
          <span>{monthLabel}选题：</span>
          <small>按平台整理，不按日期拆分</small>
        </div>
        {platformCounts.map((item) => (
          <article key={item.value}>
            <span>{item.label}</span>
            <strong>{item.count}</strong>
            <small>个选题</small>
          </article>
        ))}
      </section>

      <section className="content-topic-section">
        <div className="panel-title">
          <div><span className="eyebrow">TOPIC COLLECTION</span><h2>{monthLabel}内容方向</h2></div>
          <span>当前显示 {filteredTopics.length} 个</span>
        </div>
        {filteredTopics.length > 0 ? (
          <div className="content-topic-grid">
            {filteredTopics.map((topic) => (
              <article className="content-topic-card" data-topic-id={topic.id} key={topic.id}>
                <div className="content-topic-card-meta">
                  <span>{getContentPlatformLabel(topic.platform)}</span>
                  <span>{topic.topicType}</span>
                  <strong data-priority={topic.priority}>{topic.priority}</strong>
                </div>
                <h3>{topic.title}</h3>
                <p>{topic.hook}</p>
                <div className="content-topic-entry">
                  <span>适合承接页面</span>
                  <strong>{topic.relatedEntry.join(" / ")}</strong>
                </div>
                <button className="button secondary content-topic-detail-button" type="button" onClick={() => setSelectedTopic(topic)}>查看详情</button>
              </article>
            ))}
          </div>
        ) : (
          <div className="content-topic-empty">
            <strong>当前筛选下暂无选题</strong>
            <p>{monthLabel}的内容方向尚未录入，可以切换到 2026年7月查看完整示例。</p>
          </div>
        )}
      </section>

      {selectedTopic && (
        <div className="admin-drawer-backdrop content-topic-drawer-backdrop" role="presentation" onMouseDown={() => setSelectedTopic(null)}>
          <aside className="admin-drawer content-topic-drawer" role="dialog" aria-modal="true" aria-labelledby="content-topic-drawer-title" onMouseDown={(event) => event.stopPropagation()}>
            <header className="content-topic-drawer-header">
              <div>
                <span className="eyebrow">TOPIC DETAILS</span>
                <h2 id="content-topic-drawer-title">{selectedTopic.title}</h2>
              </div>
              <button className="content-topic-drawer-close" type="button" onClick={() => setSelectedTopic(null)} aria-label="关闭选题详情">关闭</button>
            </header>

            <div className="content-topic-drawer-meta">
              <span>{getContentPlatformLabel(selectedTopic.platform)}</span>
              <span>{selectedTopic.topicType}</span>
              <strong>{selectedTopic.priority}</strong>
            </div>

            <section className="content-topic-detail-section">
              <h3>适合客户痛点</h3>
              <div className="content-topic-tags">{selectedTopic.painPoints.map((item) => <span key={item}>{item}</span>)}</div>
            </section>

            <section className="content-topic-detail-section">
              <h3>推荐切入角度</h3>
              <ul>{selectedTopic.angles.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>

            <section className="content-topic-detail-section">
              <h3>标题参考</h3>
              <ol>{selectedTopic.titleIdeas.map((item) => <li key={item}>{item}</li>)}</ol>
            </section>

            <section className="content-topic-detail-section">
              <h3>内容要点</h3>
              <ul>{selectedTopic.contentPoints.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>

            <section className="content-topic-detail-section content-topic-related-grid">
              <div><h3>可关联案例</h3><ul>{selectedTopic.relatedCases.map((item) => <li key={item}>{item}</li>)}</ul></div>
              <div><h3>可关联系统入口</h3><ul>{selectedTopic.relatedEntry.map((item) => <li key={item}>{item}</li>)}</ul></div>
            </section>

            <section className="content-topic-detail-section content-topic-cta">
              <h3>建议承接引导</h3>
              <p>{selectedTopic.cta}</p>
            </section>

            <section className="content-topic-risk">
              <h3>风险提示</h3>
              <p>{selectedTopic.riskNote}</p>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}

function AdminInfluencersPage() {
  const { influencerCollabs, updateInfluencer } = useAdminDemo();
  const [status, setStatus] = useState("全部");
  const filtered = status === "全部" ? influencerCollabs : influencerCollabs.filter((item) => item.collaborationStatus === status);

  return (
    <div className="admin-main influencer-page">
      <section className="admin-panel admin-page-heading">
        <div><span className="eyebrow">CREATOR COLLABORATION</span><h2>达人合作</h2><p>记录本地家居内容合作进度、报价与发布效果，数据均为自然虚构的演示资料。</p></div>
        <label className="compact-filter">合作状态
          <select value={status} onChange={(event) => setStatus(event.target.value)}><option>全部</option>{influencerStatuses.map((item) => <option key={item}>{item}</option>)}</select>
        </label>
      </section>

      <section className="influencer-card-grid">
        {filtered.map((item) => (
          <article className="admin-panel influencer-card" data-influencer-id={item.id} key={item.id}>
            <header><div><span>{item.platform} · {item.city}</span><h3>{item.name}</h3></div><strong>{item.followers}粉丝</strong></header>
            <div className="influencer-detail-grid">
              <p><span>内容类型</span><strong>{item.contentType}</strong></p>
              <p><span>合作形式</span><strong>{item.collaborationForm}</strong></p>
              <p><span>合作报价</span><strong>{item.quote}</strong></p>
              <p><span>联系状态</span><strong>{item.contactStatus}</strong></p>
              <p><span>预计发布</span><strong>{item.expectedPublishAt}</strong></p>
              <p><span>发布效果</span><strong>{item.performance}</strong></p>
            </div>
            <label className="influencer-status-field">合作状态
              <select value={item.collaborationStatus} onChange={(event) => updateInfluencer(item.id, { collaborationStatus: event.target.value as InfluencerStatus })}>
                {influencerStatuses.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <p className="influencer-notes"><strong>备注：</strong>{item.notes}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export function AdminCasesPage() {
  const { leads, activities } = useAdminDemo();
  return (
    <div className="admin-main">
      <section className="admin-panel">
        <div className="panel-title"><h2>案例管理</h2><button className="button dark">新建案例</button></div>
        <div className="case-management-head">
          <span>案例名称</span><span>面积</span><span>户型</span><span>家庭结构</span><span>风格</span><span>浏览量</span><span>带来线索</span><span>状态</span><span>更新时间</span>
        </div>
        {cases.map((item, index) => {
          const views = activities.filter((activity) => activity.type === "case_view" && activity.caseId === item.id).length;
          const sourcedLeads = leads.filter((lead) => lead.viewedCases.includes(item.id)).length;
          return (
          <Link className="case-management-row" to={`/admin/cases/${item.id}`} key={item.id}>
            <img src={item.cover} alt={item.title} />
            <div><strong>{item.title}</strong><p>{item.city} · {item.community}</p></div>
            <span>{item.area}㎡</span>
            <span>{item.layoutDetail}</span>
            <span>{item.familyLabel}</span>
            <span>{item.style}</span>
            <span>{views}</span>
            <span>{sourcedLeads}</span>
            <span>{index % 4 === 0 ? "草稿" : "已发布"}</span>
            <span>2026-07-{String(8 - (index % 6)).padStart(2, "0")}</span>
          </Link>
          );
        })}
      </section>
    </div>
  );
}

export function AdminCaseDetailPage() {
  const { id } = useParams();
  const item = getCase(id);
  const { leads, activities } = useAdminDemo();
  const views = activities.filter((activity) => activity.type === "case_view" && activity.caseId === item.id).length;
  const sourcedLeads = leads.filter((lead) => lead.viewedCases.includes(item.id)).length;
  return (
    <div className="admin-main">
      <section className="admin-panel">
        <Link className="text-link" to="/admin/cases">返回案例管理</Link>
        <div className="case-edit-hero">
          <img src={item.cover} alt={item.title} />
          <div>
            <span className="eyebrow">CASE EDIT</span>
            <h2>{item.title}</h2>
            <p>{item.city} · {item.community} · {item.area}㎡ · {item.layoutDetail} · {item.style}</p>
            <div className="tag-row">{item.needs.map((need) => <span key={need}>{need}</span>)}</div>
          </div>
        </div>
      </section>
      <section className="admin-panel">
        <div className="lead-tabs">
          {["基础信息", "项目故事", "空间模块", "图片管理", "热点标注", "关联推荐", "数据表现"].map((tab) => <button key={tab}>{tab}</button>)}
        </div>
        <div className="profile-grid">
          <InfoBlock label="案例名称" value={item.title} />
          <InfoBlock label="家庭结构" value={item.familyLabel} />
          <InfoBlock label="核心亮点" value={item.highlight} />
          <InfoBlock label="数据表现" value={`浏览 ${views} / 线索 ${sourcedLeads}`} />
        </div>
      </section>
    </div>
  );
}

function AdminSettingsPage() {
  const { clearCurrentDeviceData } = useAdminDemo();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const merchant = getCurrentMerchant();
  const deviceId = getOrCreateDeviceId();
  const currentDiagnosis = getCurrentDiagnosis();
  const diagnosisCount = getDeviceDiagnosisRecords().length;
  const deviceLeadCount = getDeviceLeadRecords().length;
  const settingGroups = [
    { title: "品牌设置", fields: [["品牌名称", "叙间全屋定制"], ["前台 CTA", "预约免费空间诊断"], ["品牌定位", "高品质全屋定制与收纳规划"]] },
    { title: "联系方式", fields: [["咨询电话", "Demo 电话未启用"], ["微信", "xujian_demo"], ["客服时段", "演示用 09:30-20:00"]] },
    { title: "门店信息", fields: [["城市", "演示服务区域"], ["门店地址", "演示门店资料，正式上线前配置"], ["营业时间", "演示用 周一至周日 10:00-21:00"]] },
    { title: "线索设置", fields: [["高意向阈值", "80 分以上"], ["自动分配", "按城市与销售负载"], ["隐私展示", "手机号默认脱敏"]] },
    { title: "预算规则", fields: [["基础收纳", "3-6 万"], ["完整规划", "6-12 万"], ["高阶全案", "12 万以上"]] }
  ];

  return (
    <div className="admin-main">
      <section className="admin-panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">SETTINGS</span>
            <h2>系统设置</h2>
          </div>
          <button className="button dark">保存设置</button>
        </div>
        <div className="settings-grid">
          <article className="settings-card merchant-settings-card">
            <div>
              <span className="eyebrow">LOCAL DATA SCOPE</span>
              <h3>当前数据环境</h3>
            </div>
            <div className="merchant-meta">
              <p><span>merchantId</span><strong>{merchant.merchantId}</strong></p>
              <p><span>merchantName</span><strong>{merchant.merchantName}</strong></p>
              <p><span>deviceId</span><strong>{deviceId}</strong></p>
              <p><span>当前未完成诊断 session</span><strong>{currentDiagnosis && !currentDiagnosis.completed ? currentDiagnosis.diagnosisSessionId : "暂无"}</strong></p>
              <p><span>历史诊断数量</span><strong>{diagnosisCount}</strong></p>
              <p><span>本设备线索数量</span><strong>{deviceLeadCount}</strong></p>
            </div>
            <div className="merchant-switch-actions">
              <button className="button dark" onClick={() => { startNewDiagnosisSession(); navigate("/diagnosis"); }}>
                新建一次诊断测试
              </button>
            </div>
            <div className="merchant-switch-actions">
              {merchants.map((item) => (
                <button
                  className={item.merchantId === merchant.merchantId ? "button dark" : "button ghost"}
                  key={item.merchantId}
                  onClick={() => {
                    setCurrentMerchantId(item.merchantId);
                    window.location.reload();
                  }}
                >
                  {item.merchantName} Demo
                </button>
              ))}
            </div>
            <div className="merchant-danger-zone">
              <div>
                <strong>清空当前设备测试数据</strong>
                <p>仅删除当前 merchantId 与当前 deviceId 下的记录，其他商家和 mock 数据不受影响。</p>
              </div>
              <button
                className="button danger"
                onClick={() => {
                  if (!window.confirm(`确认清空 ${merchant.merchantName} 在当前设备上的测试数据？`)) return;
                  clearCurrentDeviceData();
                  setMessage("当前商家在本机产生的测试数据已清空，mock 数据仍保留。");
                }}
              >
                清空当前设备测试数据
              </button>
            </div>
            {message && <p className="demo-action-message" role="status">{message}</p>}
          </article>
          {settingGroups.map((group) => (
            <article className="settings-card" key={group.title}>
              <h3>{group.title}</h3>
              {group.fields.map(([label, value]) => (
                <label key={label}>
                  <span>{label}</span>
                  <input defaultValue={value} />
                </label>
              ))}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function DiagnosisStartRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    startNewDiagnosisSession();
    navigate("/diagnosis", { replace: true });
  }, [navigate]);
  return null;
}

function PageHero({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <header className="page-hero">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{body}</p>
    </header>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminShell />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="leads" element={<AdminLeadsPage />} />
        <Route path="leads/:id" element={<AdminLeadDetailPage />} />
        <Route path="follow-ups" element={<AdminFollowUpsPage />} />
        <Route path="content" element={<AdminContentCenterPage />} />
        <Route path="influencers" element={<AdminInfluencersPage />} />
        <Route path="case-requests" element={<AdminCaseRequestsPage />} />
        <Route path="cases/*" element={<Navigate to="/admin/case-requests" replace />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/diagnosis" element={<DiagnosisPage />} />
        <Route path="/diagnosis/result" element={<DiagnosisResultPage />} />
        <Route path="/find-solution" element={<DiagnosisStartRedirect />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/cases/:id" element={<CaseDetailPage />} />
        <Route path="/inspiration" element={<InspirationPage />} />
        <Route path="/inspiration/:id" element={<InspirationDetailPage />} />
        <Route path="/lifestyle" element={<LifestylePage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
