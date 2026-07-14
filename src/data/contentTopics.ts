export type ContentTopicPlatform = "douyin" | "xiaohongshu" | "shipinhao";
export type ContentTopicType = "获客型" | "案例型" | "预算型" | "避坑型" | "材料型" | "空间型" | "信任型" | "本地型";
export type ContentTopicPriority = "本月重点" | "可选补充" | "长期可用";

export interface ContentTopic {
  id: string;
  month: string;
  platform: ContentTopicPlatform;
  topicType: ContentTopicType;
  priority: ContentTopicPriority;
  title: string;
  hook: string;
  painPoints: string[];
  angles: string[];
  titleIdeas: string[];
  contentPoints: string[];
  relatedCases: string[];
  relatedEntry: string[];
  cta: string;
  riskNote: string;
}

export const contentRiskNote = "以上为内容选题与表达方向建议，实际发布效果受账号基础、内容质量、发布时间、平台推荐机制等因素影响。";

export const contentMonthOptions = [
  { value: "2026-07", label: "2026年7月" },
  { value: "2026-08", label: "2026年8月" },
  { value: "2026-09", label: "2026年9月" }
] as const;

export const contentPlatformOptions: { value: "all" | ContentTopicPlatform; label: string }[] = [
  { value: "all", label: "全部平台" },
  { value: "douyin", label: "抖音" },
  { value: "xiaohongshu", label: "小红书" },
  { value: "shipinhao", label: "视频号" }
];

export const contentTypeOptions: { value: "all" | ContentTopicType; label: string }[] = [
  { value: "all", label: "全部类型" },
  { value: "获客型", label: "获客型" },
  { value: "案例型", label: "案例型" },
  { value: "预算型", label: "预算型" },
  { value: "避坑型", label: "避坑型" },
  { value: "材料型", label: "材料型" },
  { value: "空间型", label: "空间型" },
  { value: "信任型", label: "信任型" },
  { value: "本地型", label: "本地型" }
];

export function getContentPlatformLabel(platform: ContentTopicPlatform) {
  return contentPlatformOptions.find((option) => option.value === platform)?.label ?? platform;
}

export const contentTopics: ContentTopic[] = [
  {
    id: "topic-douyin-202607-01",
    month: "2026-07",
    platform: "douyin",
    topicType: "避坑型",
    priority: "本月重点",
    title: "为什么柜子做满了，家里还是乱？",
    hook: "很多客户以为收纳就是多做柜子，但真正影响使用体验的是物品动线和柜内结构。",
    painPoints: ["收纳焦虑", "柜子不好用", "入住后杂乱"],
    angles: ["从柜子数量不等于收纳效率切入，引出空间诊断的重要性。", "对比玄关、餐厅和卧室各自缺少归位路径时的常见问题。"],
    titleIdeas: ["柜子越多，家里就越整洁吗？", "为什么你家做了满墙柜，还是乱？", "全屋定制真正该先规划的不是柜子"],
    contentPoints: ["柜子数量不等于收纳效率", "玄关、餐厅、卧室要形成完整归位路径", "柜内结构比外观更影响长期使用", "不同家庭成员需要不同收纳高度"],
    relatedCases: ["万科翡翠东方 128㎡", "89㎡小户型收纳案例"],
    relatedEntry: ["空间诊断"],
    cta: "如果你也不确定家里到底该先解决哪个空间，可以先做一次空间诊断，再看相似户型案例。",
    riskNote: contentRiskNote
  },
  {
    id: "topic-douyin-202607-02",
    month: "2026-07",
    platform: "douyin",
    topicType: "避坑型",
    priority: "本月重点",
    title: "小户型全屋定制最容易踩的 3 个坑",
    hook: "面积越紧凑，越不能照搬大户型的柜深、转角和满墙布局。",
    painPoints: ["小户型压抑", "过道变窄", "收纳利用率低"],
    angles: ["以 89㎡真实空间为参照，拆解柜体过深、转角封死和只看容量三个误区。"],
    titleIdeas: ["89㎡做全屋定制，先避开这 3 个坑", "小户型柜子别照着大户型抄", "柜子做完家反而小了，问题出在哪？"],
    contentPoints: ["柜深要结合过道净宽", "转角空间要保证拿取顺手", "连续满墙柜容易放大压迫感", "高频物品优先安排在顺手区域"],
    relatedCases: ["89㎡小户型收纳案例"],
    relatedEntry: ["89㎡小户型案例"],
    cta: "想看小户型如何兼顾容量和通透感，可以进入 89㎡案例查看具体分区。",
    riskNote: contentRiskNote
  },
  {
    id: "topic-douyin-202607-03",
    month: "2026-07",
    platform: "douyin",
    topicType: "预算型",
    priority: "本月重点",
    title: "预算 5 万，应该优先把钱花在哪些柜子上？",
    hook: "预算有限时不必平均分配，先解决每天使用频率最高的空间。",
    painPoints: ["预算有限", "不知道取舍", "担心后期增项"],
    angles: ["按玄关、餐边和主卧的使用频率建立预算优先级。", "说明基础五金与装饰造型的取舍逻辑。"],
    titleIdeas: ["5 万柜体预算，先做哪三个地方？", "全屋定制预算有限，千万别平均花", "同样 5 万，怎么把柜子做得更值？"],
    contentPoints: ["先保障玄关日常归位", "餐边区解决小家电和囤货", "主卧优先满足衣物分类", "减少低频造型，把预算留给关键五金"],
    relatedCases: ["观澜公馆 118㎡", "89㎡小户型收纳案例"],
    relatedEntry: ["预算规划"],
    cta: "输入面积和重点空间，先用预算规划了解适合自己的投入区间。",
    riskNote: contentRiskNote
  },
  {
    id: "topic-douyin-202607-04",
    month: "2026-07",
    platform: "douyin",
    topicType: "空间型",
    priority: "可选补充",
    title: "儿童房不要只看现在，要看 3 年后",
    hook: "孩子的衣物、书本和活动范围变化很快，柜体需要给成长留下余量。",
    painPoints: ["儿童房很快过时", "书本玩具混放", "二次改造成本高"],
    angles: ["从幼儿期到入学后的物品变化切入，说明可调结构的价值。"],
    titleIdeas: ["儿童房这样做，三年后不用全部重来", "别把儿童房一次做死", "儿童房柜子要提前留出的 3 个变化"],
    contentPoints: ["层板高度应允许后期调整", "低龄阶段保留开放玩具区", "入学后需要连续书桌与书本区", "衣柜内部要适应衣物长度变化"],
    relatedCases: ["松湖家园成长型儿童房"],
    relatedEntry: ["儿童房成长型案例"],
    cta: "进入成长型儿童房案例，查看不同年龄阶段如何共用一套柜体结构。",
    riskNote: contentRiskNote
  },
  {
    id: "topic-douyin-202607-05",
    month: "2026-07",
    platform: "douyin",
    topicType: "空间型",
    priority: "长期可用",
    title: "餐边柜不是越大越好，先想清楚这 6 样东西",
    hook: "先盘点小家电、杯具、酒水、零食、纸巾和清洁用品，再决定尺寸与插座。",
    painPoints: ["餐桌堆满杂物", "插座不够", "柜内空间浪费"],
    angles: ["从六类常用物品反推餐边柜的台面、插座、层板和抽屉。"],
    titleIdeas: ["做餐边柜前，先把这 6 样东西列出来", "餐边柜越大越好？多数人第一步就错了", "餐边柜尺寸应该由什么决定？"],
    contentPoints: ["台面高度要匹配常用小家电", "插座位置应避开柜体侧板", "杯具和零食需要不同层高", "囤货区要兼顾可见与易取"],
    relatedCases: ["云栖雅居餐厨一体案例", "观澜公馆餐边柜案例"],
    relatedEntry: ["餐厅/餐边柜案例"],
    cta: "查看餐边柜案例，对照自家的物品清单再确定尺寸和分区。",
    riskNote: contentRiskNote
  },
  {
    id: "topic-douyin-202607-06",
    month: "2026-07",
    platform: "douyin",
    topicType: "获客型",
    priority: "本月重点",
    title: "全屋定制前，为什么一定要先做空间诊断？",
    hook: "先弄清家庭成员、生活习惯和收纳问题，方案才不会只停留在柜子外观。",
    painPoints: ["需求说不清", "方案千篇一律", "担心设计不适合生活"],
    angles: ["用户型相同但家庭需求不同的对比，解释诊断如何帮助建立设计优先级。"],
    titleIdeas: ["做全屋定制前，先别急着选颜色", "为什么同户型不能直接照搬方案？", "一份空间诊断，能帮你提前想清什么？"],
    contentPoints: ["户型只是空间基础", "家庭成员决定分区方式", "生活习惯影响柜内结构", "未来变化会改变方案优先级"],
    relatedCases: ["云栖雅居 128㎡", "松湖家园三口之家案例"],
    relatedEntry: ["空间诊断"],
    cta: "先完成一次空间诊断，系统会根据家庭情况匹配更接近的案例方向。",
    riskNote: contentRiskNote
  },
  {
    id: "topic-xiaohongshu-202607-01",
    month: "2026-07",
    platform: "xiaohongshu",
    topicType: "避坑型",
    priority: "本月重点",
    title: "入住后才发现，玄关柜真的不能随便做",
    hook: "玄关好不好用，不只看鞋柜容量，更取决于进门后的动作顺序。",
    painPoints: ["进门杂乱", "换鞋不方便", "钥匙包袋无处放"],
    angles: ["按回家后的放包、换鞋、挂衣、收快递顺序拆解玄关分区。"],
    titleIdeas: ["玄关柜最容易后悔的不是颜色", "入住半年后，我才看懂玄关动线", "好用的玄关柜，先安排回家这 4 步"],
    contentPoints: ["常穿鞋与换季鞋分开", "随手台高度要方便放小物", "临时挂衣区不宜过深", "底部留空要结合扫地设备尺寸"],
    relatedCases: ["云栖雅居玄关案例", "89㎡小户型玄关案例"],
    relatedEntry: ["案例详情", "空间诊断"],
    cta: "先看看相似户型的玄关案例，再用空间诊断梳理自己的回家动线。",
    riskNote: contentRiskNote
  },
  {
    id: "topic-xiaohongshu-202607-02",
    month: "2026-07",
    platform: "xiaohongshu",
    topicType: "案例型",
    priority: "本月重点",
    title: "我家 118㎡，靠这几个柜子多出一间储物间",
    hook: "不是额外挤出一个房间，而是把分散杂物放回最顺手的几个节点。",
    painPoints: ["杂物分散", "储物间不足", "公共区域容易乱"],
    angles: ["用 118㎡案例串联玄关、餐边、家政和走廊四个收纳节点。"],
    titleIdeas: ["118㎡没有储物间，我把杂物藏在这 4 处", "靠几个关键柜子，家里像多了一间储物间", "全屋收纳不是一面大柜子，而是一条动线"],
    contentPoints: ["玄关吸收外出物品", "餐边柜承担公共囤货", "家政区集中清洁工具", "走廊薄柜利用低价值墙面"],
    relatedCases: ["观澜公馆 118㎡"],
    relatedEntry: ["118㎡整家案例", "案例详情"],
    cta: "进入 118㎡案例，查看四个收纳节点如何连接成完整归位路径。",
    riskNote: contentRiskNote
  },
  {
    id: "topic-xiaohongshu-202607-03",
    month: "2026-07",
    platform: "xiaohongshu",
    topicType: "预算型",
    priority: "本月重点",
    title: "全屋定制预算怎么分配才不后悔？",
    hook: "先按使用频率分配，再决定材料和造型，预算会比平均摊到每个房间更清楚。",
    painPoints: ["报价看不懂", "预算分配失衡", "担心增项"],
    angles: ["把预算拆成必要空间、关键五金、材料等级和装饰项四层。"],
    titleIdeas: ["全屋定制预算表，别再按房间平均分", "预算不超支，先把柜体分成这 4 类", "哪些柜子值得多花钱，哪些可以后做？"],
    contentPoints: ["高频空间优先投入", "关键五金按使用强度选择", "同一套房可分材料等级", "造型与开放格要评估维护成本"],
    relatedCases: ["观澜公馆 118㎡", "万科翡翠东方 128㎡"],
    relatedEntry: ["预算规划"],
    cta: "先做预算规划，得到面积与配置对应的参考区间，再进一步比较方案。",
    riskNote: contentRiskNote
  },
  {
    id: "topic-xiaohongshu-202607-04",
    month: "2026-07",
    platform: "xiaohongshu",
    topicType: "空间型",
    priority: "可选补充",
    title: "儿童房收纳这样做，两年后也不重做",
    hook: "固定的是柜体边界，可变化的是层板、书桌和开放区。",
    painPoints: ["成长变化快", "玩具书本混乱", "家具反复更换"],
    angles: ["围绕可调层板、活动书桌和分阶段开放区说明成长型结构。"],
    titleIdeas: ["两年后不用重做的儿童房收纳", "儿童房柜子，固定和可变要这样分", "从玩具到课本，一套柜子怎么跟着长大？"],
    contentPoints: ["柜体边界保持稳定", "层板随物品高度调整", "低龄开放区后期可转书本区", "桌面和插座提前考虑学习需求"],
    relatedCases: ["松湖家园成长型儿童房"],
    relatedEntry: ["儿童房成长型案例"],
    cta: "查看成长型儿童房案例，了解结构如何从玩具收纳过渡到学习收纳。",
    riskNote: contentRiskNote
  },
  {
    id: "topic-xiaohongshu-202607-05",
    month: "2026-07",
    platform: "xiaohongshu",
    topicType: "空间型",
    priority: "长期可用",
    title: "餐边柜这样规划，小家电终于不用堆桌上",
    hook: "把常用电器集中到顺手的台面，并提前处理散热、插座和进深。",
    painPoints: ["餐桌堆小家电", "电线杂乱", "台面不够用"],
    angles: ["从咖啡机、饮水机、电饭煲等实际尺寸反推台面和电源布局。"],
    titleIdeas: ["餐桌清爽的关键，是先安顿好小家电", "餐边柜台面怎么留，才不会越用越挤？", "小家电集中区要提前确认的 4 个尺寸"],
    contentPoints: ["统计电器宽高和开盖空间", "插座数量预留增长余量", "发热设备考虑通风", "重物放在稳定且易取的高度"],
    relatedCases: ["云栖雅居餐厨一体案例", "观澜公馆餐边柜案例"],
    relatedEntry: ["餐厅/餐边柜案例"],
    cta: "进入餐边柜案例，对照家里常用电器确认台面、插座和储物分区。",
    riskNote: contentRiskNote
  },
  {
    id: "topic-xiaohongshu-202607-06",
    month: "2026-07",
    platform: "xiaohongshu",
    topicType: "信任型",
    priority: "长期可用",
    title: "全屋定制不是选颜色，而是选生活方式",
    hook: "同样的外观背后，独居、三口之家和父母同住需要完全不同的内部逻辑。",
    painPoints: ["只关注颜值", "需求表达模糊", "方案缺少个性"],
    angles: ["用不同家庭的一天说明柜体如何服务动作、关系和长期变化。"],
    titleIdeas: ["定制柜真正定制的，应该是你的生活", "别从颜色开始做全屋定制", "同一个户型，三种家庭为什么方案完全不同？"],
    contentPoints: ["家庭结构决定公共与私密收纳", "生活习惯决定拿取顺序", "审美要与空间比例共同考虑", "未来成员变化需要预留弹性"],
    relatedCases: ["云栖雅居 128㎡", "松湖家园三口之家案例", "观澜公馆 118㎡"],
    relatedEntry: ["空间诊断", "案例详情"],
    cta: "先通过空间诊断梳理生活方式，再看与自己家庭结构接近的案例。",
    riskNote: contentRiskNote
  },
  {
    id: "topic-shipinhao-202607-01",
    month: "2026-07",
    platform: "shipinhao",
    topicType: "信任型",
    priority: "本月重点",
    title: "全屋定制真正重要的不是柜子数量",
    hook: "重要的是每件常用物品能否在正确的位置被轻松放回去。",
    painPoints: ["柜子多却不好用", "空间压抑", "整理负担重"],
    angles: ["从家庭日常动作出发，解释收纳效率、空间尺度和柜体数量的关系。"],
    titleIdeas: ["柜子数量为什么不是全屋定制的核心？", "好收纳的标准，是东西能顺手回家", "少一点柜子，生活反而更有秩序"],
    contentPoints: ["归位路径比容量更重要", "柜体尺度不能挤压活动空间", "高频物品应缩短拿取动作", "长期留白能适应家庭变化"],
    relatedCases: ["万科翡翠东方 128㎡", "89㎡小户型收纳案例"],
    relatedEntry: ["空间诊断", "案例详情"],
    cta: "做一次空间诊断，先找到家里最需要改善的归位路径。",
    riskNote: contentRiskNote
  },
  {
    id: "topic-shipinhao-202607-02",
    month: "2026-07",
    platform: "shipinhao",
    topicType: "获客型",
    priority: "本月重点",
    title: "一套 120㎡三口之家，应该先规划哪些空间？",
    hook: "先抓住玄关、餐厅、主卧和儿童房四个高频空间，再讨论全屋统一。",
    painPoints: ["规划没有顺序", "家庭收纳冲突", "预算分散"],
    angles: ["以三口之家一天的动线串联四个优先空间。"],
    titleIdeas: ["120㎡三口之家，定制先做哪四处？", "别一上来就规划全屋，先抓高频空间", "三口之家的柜体优先级怎么排？"],
    contentPoints: ["玄关承接出入物品", "餐厅承担家庭公共储物", "主卧解决衣物分类", "儿童房兼顾当前与成长"],
    relatedCases: ["松湖家园三口之家案例", "观澜公馆 118㎡"],
    relatedEntry: ["空间诊断", "案例详情"],
    cta: "完成空间诊断，按家庭成员和户型匹配更接近的规划顺序。",
    riskNote: contentRiskNote
  },
  {
    id: "topic-shipinhao-202607-03",
    month: "2026-07",
    platform: "shipinhao",
    topicType: "空间型",
    priority: "可选补充",
    title: "为什么同样面积，有人家看起来更大？",
    hook: "决定通透感的常常不是面积，而是柜体连续长度、留白和动线宽度。",
    painPoints: ["空间显小", "柜体压迫", "动线拥挤"],
    angles: ["对比柜体比例、门板分缝、开放区和过道净宽对视觉尺度的影响。"],
    titleIdeas: ["同样 100㎡，为什么别人家更显大？", "柜子颜色很浅，家里为什么还是压抑？", "让定制柜不显堵的 4 个空间比例"],
    contentPoints: ["控制连续满墙柜长度", "保留必要视觉停顿", "门板分缝影响立面节奏", "过道净宽优先于局部容量"],
    relatedCases: ["云栖雅居 128㎡", "89㎡小户型收纳案例"],
    relatedEntry: ["案例详情"],
    cta: "查看不同面积案例，对比柜体比例和留白如何影响空间感受。",
    riskNote: contentRiskNote
  },
  {
    id: "topic-shipinhao-202607-04",
    month: "2026-07",
    platform: "shipinhao",
    topicType: "预算型",
    priority: "本月重点",
    title: "预算有限，全屋定制先做哪里？",
    hook: "先做最影响日常秩序的空间，其余区域可以根据入住节奏分阶段完善。",
    painPoints: ["预算不足", "项目取舍困难", "怕少做后悔"],
    angles: ["按使用频率、替代难度和后期改造成本建立选择标准。"],
    titleIdeas: ["预算有限，哪些柜子必须先做？", "全屋定制可以分阶段吗？先看这三条", "少花冤枉钱，先排柜体优先级"],
    contentPoints: ["高频空间优先", "后期难补的嵌入结构优先", "可用成品家具替代的区域后置", "预算中保留安装和收口余量"],
    relatedCases: ["89㎡小户型收纳案例", "观澜公馆 118㎡"],
    relatedEntry: ["预算规划"],
    cta: "进入预算规划，先测算重点空间与配置等级对应的参考区间。",
    riskNote: contentRiskNote
  },
  {
    id: "topic-shipinhao-202607-05",
    month: "2026-07",
    platform: "shipinhao",
    topicType: "本地型",
    priority: "可选补充",
    title: "父母同住的房子，柜子要注意什么？",
    hook: "三代同住时，顺手、安全和各自边界比统一外观更重要。",
    painPoints: ["代际习惯不同", "拿取不便", "公共区域容易冲突"],
    angles: ["结合本地多代家庭常见生活方式，说明高度、照明和分区边界。"],
    titleIdeas: ["父母同住，柜体高度别只按年轻人设计", "三代同堂的家，收纳边界怎么分？", "给父母用的柜子，要少做这几个费力动作"],
    contentPoints: ["常用物品避开过高过低区域", "柜内照明提升辨识度", "公共囤货区明确家庭边界", "减少需要弯腰和踮脚的动作"],
    relatedCases: ["云栖雅居三代共居案例", "靖江理想家 126㎡"],
    relatedEntry: ["空间诊断", "三代同堂案例"],
    cta: "先在空间诊断中勾选家庭成员，再查看更接近三代同住需求的案例。",
    riskNote: contentRiskNote
  },
  {
    id: "topic-shipinhao-202607-06",
    month: "2026-07",
    platform: "shipinhao",
    topicType: "获客型",
    priority: "长期可用",
    title: "全屋定制前，先问自己这 5 个问题",
    hook: "先想清谁在住、东西有多少、哪里最乱、预算多少和未来会不会变化。",
    painPoints: ["需求不清楚", "容易被外观带偏", "沟通效率低"],
    angles: ["用五个问题帮助客户在咨询前建立清晰的家庭需求清单。"],
    titleIdeas: ["找全屋定制前，先回答这 5 个问题", "你的家适合什么方案？先别急着看效果图", "定制需求说不清，从这五件事开始"],
    contentPoints: ["确认长期居住成员", "盘点高频与换季物品", "找出最影响生活的混乱空间", "设定可接受预算范围", "考虑未来三年的家庭变化"],
    relatedCases: ["云栖雅居 128㎡", "观澜公馆 118㎡"],
    relatedEntry: ["空间诊断"],
    cta: "通过空间诊断逐步回答这五类问题，再获得适合自己的案例方向。",
    riskNote: contentRiskNote
  }
];
