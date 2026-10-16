import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";

type Weapon = {
  name: string;
  level: string;
  power: number;
  color: string;
  maxDurability: number;
};

type Weed = {
  id: number;
  name: string;
  points: number;
  hits: number;
  left: number;
  top: number;
  size: "sm" | "md" | "lg";
  tone: string;
};

type Level = {
  name: string;
  note: string;
  description: string;
  mood: "morning" | "day" | "noon" | "evening" | "night" | "moody" | "bright";
};

type GrassRecord = {
  id: string;
  weed: string;
  level: number;
  scene: string;
  points: number;
  time: string;
};

type DailyProgress = {
  date: string;
  count: number;
  claimedSnack: boolean;
};

const levels: Level[] = [
  { name: "放学后的田埂", note: "书包还在肩上，棍子已经握在手里", description: "放学铃一响，我沿着熟悉的田埂往家走。路边的狗尾巴草迎风摇晃，正好陪我消磨回家前的最后一点自由时光。", mood: "evening" },
  { name: "赶早的上学路", note: "晨雾没散，今天也不能迟到", description: "天刚蒙蒙亮，远处学校的屋顶还藏在晨雾里。我一边赶路，一边顺手挥向路旁的野草，脚步却一刻也不敢慢。", mood: "morning" },
  { name: "送饭归途", note: "空饭盒在竹篮里轻轻作响", description: "刚给地里的爸妈送完午饭，竹篮已经空了。回程没有大人催促，长长的田间小路都成了我的游乐场。", mood: "day" },
  { name: "邻居家的后院", note: "柴门、瓦房，还有风里的花床单", description: "邻居家后院的柴门半开着，晾衣绳上的花床单被风吹得鼓鼓的。墙根长满了草，我站在院外悄悄挥了几棍。", mood: "day" },
  { name: "风吹小山坡", note: "站得越高，棍子挥得越远", description: "小山坡不高，却能看见大半个村子。风从坡顶一路吹下来，野草伏下又抬头，像是在向我发起挑战。", mood: "evening" },
  { name: "竹林边的空地", note: "竹影沙沙，叶缝里漏下细碎阳光", description: "竹林深处有些阴凉，我只敢站在边上的空地。竹叶摩擦的沙沙声和棍子划过空气的声音混在了一起。", mood: "day" },
  { name: "清凉小溪边", note: "石头缝里流着夏天最凉的水", description: "溪水从脚边绕过，几块扁石头刚好可以踩着过河。岸边的野草沾着水珠，每挥一下都会溅起细小的亮光。", mood: "morning" },
  { name: "弯弯乡间路", note: "土路拐过稻田，一直通向村口", description: "这条路没有名字，却记得每一个脚印。路旁有稻田、草垛和被车轮压出的浅沟，也有永远打不完的野草。", mood: "day" },
  { name: "村镇马路旁", note: "小卖部门口，自行车铃偶尔响起", description: "水泥路比村里的土路宽得多，小卖部的玻璃罐里装满了糖。我要避开经过的自行车，只挑路沿下的草来打。", mood: "noon" },
  { name: "长满草的河沟", note: "窄木桥下，河水慢慢流向远方", description: "河沟不深，两岸却长满了高草。脚下的木桥会吱呀作响，我站在安全的岸边，把伸到路上的草一棵棵打倒。", mood: "day" },
  { name: "荒了的自留地", note: "太久没人锄地，田垄都快看不见了", description: "自家的这块地荒了很久，野草比庄稼还神气。今天这里没有大人，我决定替家里来一次痛痛快快的大扫除。", mood: "day" },
  { name: "月光下的野草", note: "今晚月亮很亮，影子也格外长", description: "白天熟悉的田野到了夜里变得安静又神秘。月光照亮草尖，我握紧棍子，听着虫鸣慢慢向前。", mood: "night" },
  { name: "烈日当头", note: "蝉叫得响，空气都像在发烫", description: "正午的太阳晒得人睁不开眼，连风都是热的。只有把草打倒时扬起的那一点风，能让我觉得稍微凉快些。", mood: "noon" },
  { name: "橡皮筋圈外", note: "他们玩得热闹，我就在旁边打草", description: "小伙伴们围在一起跳橡皮筋，好像谁也没注意到我。我假装一点也不在乎，转身把旁边的草打得比平时更远。", mood: "evening" },
  { name: "草丛里的动静", note: "我只顾着打草，没发现旁边藏着蛇", description: "草叶深处传来轻微的沙沙声，我却以为只是风。那条蛇悄悄绕过石头，而我还在自顾自地挥着棍子。", mood: "moody" },
  { name: "小坡上的秘密", note: "各忙各的，千万别回头看", description: "小伙伴跑到坡后解决内急，还大声提醒我不许回头。我就在坡下继续打草，假装什么都没有听见。", mood: "evening" },
  { name: "打架后的空地", note: "一肚子的气，全都朝野草挥出去", description: "刚和同学打了一架，衣服上还沾着灰。那些没来得及说出口的话，全变成一棍又一棍，落在无辜的野草上。", mood: "moody" },
  { name: "操场后的坏心情", note: "老师的话还在耳边，先一个人静一静", description: "老师当着全班说我烂泥扶不上墙，我低着头熬到放学。操场后面没有人，我只想把委屈和不服气都挥出去。", mood: "moody" },
  { name: "夕阳里的酸涩", note: "夕阳很长，心事也跟着变得很长", description: "喜欢的女同学今天和另一个男生笑得很开心。我说不清心里是什么滋味，只知道回家路上的草格外碍眼。", mood: "evening" },
  { name: "满分后的狂欢", note: "一百分在书包里，今天每一棍都带着风", description: "试卷右上角写着鲜红的 100 分，走路都觉得比平时轻快。我要一路打着草回家，把这个好消息带给所有人。", mood: "bright" },
];

const weapons: Weapon[] = [
  { name: "竹竿", level: "初始装备", power: 1, color: "bamboo", maxDurability: 45 },
  { name: "晾衣杆", level: "等级 3", power: 2, color: "wood", maxDurability: 60 },
  { name: "枣木棍", level: "等级 6", power: 3, color: "redwood", maxDurability: 80 },
  { name: "金箍棒", level: "通关奖励", power: 5, color: "gold", maxDurability: 100 },
];

const initialWeeds: Weed[] = [
  { id: 1, name: "狗尾巴草", points: 20, hits: 1, left: 8, top: 30, size: "md", tone: "light" },
  { id: 2, name: "苍耳", points: 35, hits: 2, left: 28, top: 55, size: "sm", tone: "round" },
  { id: 3, name: "牛筋草", points: 50, hits: 3, left: 49, top: 30, size: "lg", tone: "wide" },
  { id: 4, name: "刺儿菜", points: 80, hits: 4, left: 71, top: 54, size: "md", tone: "purple" },
  { id: 5, name: "霸王草", points: 120, hits: 5, left: 86, top: 25, size: "lg", tone: "dark" },
];

function arrangeWeeds(level: number) {
  const positions: Array<{ left: number; top: number }> = [];

  return initialWeeds.map((weed) => {
    let candidate = { left: 50, top: 65 };
    for (let attempt = 0; attempt < 60; attempt += 1) {
      candidate = {
        left: Math.round(9 + Math.random() * 79),
        top: Math.round(54 + Math.random() * 24),
      };
      const hasRoom = positions.every((position) => {
        const horizontalGap = Math.abs(candidate.left - position.left);
        const verticalGap = Math.abs(candidate.top - position.top);
        return horizontalGap > 17 || verticalGap > 15;
      });
      if (hasRoom) break;
    }
    positions.push(candidate);
    return {
      ...weed,
      ...candidate,
      hits: weed.hits + Math.floor(level / 5),
    };
  });
}

function loadGrassRecords(): GrassRecord[] {
  try {
    const saved = window.localStorage.getItem("wild-grass-records");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function loadTotalStrikes() {
  const saved = Number(window.localStorage.getItem("wild-grass-strikes"));
  return Number.isFinite(saved) ? saved : 0;
}

function loadDurability() {
  try {
    const saved = JSON.parse(window.localStorage.getItem("wild-grass-durability") ?? "[]");
    return weapons.map((weapon, index) =>
      typeof saved[index] === "number" ? Math.max(0, Math.min(saved[index], weapon.maxDurability)) : weapon.maxDurability,
    );
  } catch {
    return weapons.map((weapon) => weapon.maxDurability);
  }
}

function loadCompletedLevels(): number[] {
  try {
    const saved = JSON.parse(window.localStorage.getItem("wild-grass-completed-levels") ?? "[]");
    return Array.isArray(saved) ? saved.filter((level) => Number.isInteger(level) && level >= 0 && level < levels.length) : [];
  } catch {
    return [];
  }
}

function todayKey() {
  return new Date().toLocaleDateString("en-CA");
}

function loadDailyProgress(): DailyProgress {
  try {
    const saved = JSON.parse(window.localStorage.getItem("wild-grass-daily-progress") ?? "{}");
    if (saved.date === todayKey()) {
      return {
        date: saved.date,
        count: Math.max(0, Math.min(1000, Number(saved.count) || 0)),
        claimedSnack: Boolean(saved.claimedSnack),
      };
    }
  } catch {
    // Start a fresh daily record if saved data is unavailable.
  }
  return { date: todayKey(), count: 0, claimedSnack: false };
}

type PlayerProfile = { name: string; school: string; avatar: number };
const DEFAULT_PROFILE: PlayerProfile = { name: "田野小霸王", school: "红星小学 · 三年级二班", avatar: 0 };
const AVATARS = [
  { label: "小淘气", hair: "boy", glasses: false, bg: "#a9bf7c" },
  { label: "小书虫", hair: "boy", glasses: true, bg: "#9cc3d9" },
  { label: "羊角辫", hair: "pigtails", glasses: false, bg: "#e8b7a0" },
  { label: "齐耳发", hair: "bob", glasses: false, bg: "#d8c48a" },
];

function loadProfile(): PlayerProfile {
  try {
    const saved = JSON.parse(window.localStorage.getItem("wild-grass-profile") ?? "{}");
    return {
      name: typeof saved.name === "string" && saved.name ? saved.name : DEFAULT_PROFILE.name,
      school: typeof saved.school === "string" && saved.school ? saved.school : DEFAULT_PROFILE.school,
      avatar: Number.isInteger(saved.avatar) && saved.avatar >= 0 && saved.avatar < AVATARS.length ? saved.avatar : 0,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function StudentFace({ className, avatar = 0 }: { className?: string; avatar?: number }) {
  const { hair, glasses } = AVATARS[avatar] ?? AVATARS[0];
  return (
    <svg className={className} viewBox="0 0 200 240" role="img" aria-label="戴红领巾的小学生">
      <path d="M26 240C28 192 62 174 100 174s72 18 74 66Z" fill="#f6f1e3" />
      <rect x="85" y="146" width="30" height="36" rx="10" fill="#d9a77c" />
      <path d="M72 172l28 16 28-16 6 8-34 22-34-22Z" fill="#e4dcc6" />
      <path d="M70 176l30 40 30-40-14-8-16 16-16-16Z" fill="#cf3a2e" />
      <path d="M92 190h16l-3 14h-10Z" fill="#b02c22" />
      {hair === "bob" && <path d="M38 118C30 50 66 22 102 24c40 0 68 28 60 94 0 18-6 32-14 34V96H52v56c-8-2-14-16-14-34Z" fill="#2a2321" />}
      {hair === "pigtails" && (
        <>
          <circle cx="34" cy="128" r="17" fill="#2a2321" />
          <circle cx="166" cy="128" r="17" fill="#2a2321" />
          <rect x="30" y="94" width="14" height="9" rx="3" fill="#cf3a2e" />
          <rect x="156" y="94" width="14" height="9" rx="3" fill="#cf3a2e" />
        </>
      )}
      <ellipse cx="47" cy="114" rx="9" ry="13" fill="#e8b88e" />
      <ellipse cx="153" cy="114" rx="9" ry="13" fill="#e8b88e" />
      <ellipse cx="100" cy="110" rx="53" ry="57" fill="#f3cda4" />
      <path d="M44 112C34 54 70 22 104 24c42 0 62 36 52 88-5-18-12-32-22-40-18 10-48 10-68 0-12 8-18 22-22 40Z" fill="#2a2321" />
      <path d="M98 26c-6-10 4-18 12-14-6 2-6 8-2 14Z" fill="#2a2321" />
      <path d="M68 96q9-7 18-1M114 95q9-6 18 1" stroke="#2a2321" strokeWidth="4" strokeLinecap="round" fill="none" />
      <ellipse cx="78" cy="113" rx="6" ry="8" fill="#2a2321" />
      <ellipse cx="122" cy="113" rx="6" ry="8" fill="#2a2321" />
      {glasses && <path d="M60 113a18 16 0 1 0 36 0 18 16 0 1 0-36 0ZM104 113a18 16 0 1 0 36 0 18 16 0 1 0-36 0ZM96 111q4-4 8 0" stroke="#3b2f2a" strokeWidth="3.5" fill="rgba(255,255,255,.18)" />}
      <circle cx="80" cy="110" r="2.4" fill="#fff" />
      <circle cx="124" cy="110" r="2.4" fill="#fff" />
      <circle cx="66" cy="132" r="9" fill="#ee8f7c" opacity=".55" />
      <circle cx="134" cy="132" r="9" fill="#ee8f7c" opacity=".55" />
      <path d="M97 126q3 4 6 0" stroke="#c98f66" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M80 140q20 26 40 0Z" fill="#8a3a2c" />
      <path d="M92 142h8v6q-4 1-8 0Z" fill="#fff" />
    </svg>
  );
}

function Button({
  children,
  className = "",
  onClick,
  disabled,
  label,
  style,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  label?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-disabled={disabled}
      aria-label={label}
      className={`button ${disabled ? "is-disabled" : ""} ${className}`}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(event) => {
        if (!disabled && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick?.();
        }
      }}
      role="button"
      style={style}
      tabIndex={disabled ? -1 : 0}
    >
      {children}
    </div>
  );
}

function Stick({ color, active = false }: { color: string; active?: boolean }) {
  return (
    <div className={`stick stick-${color} ${active ? "is-swinging" : ""}`}>
      <span className="stick-shine" />
    </div>
  );
}

function WeedPlant({ weed, damaged, breaking }: { weed: Weed; damaged: boolean; breaking: boolean }) {
  const blades = weed.size === "lg" ? 9 : weed.size === "md" ? 7 : 5;
  return (
    <div className={`weed-plant weed-${weed.tone} weed-${weed.size} ${damaged ? "is-hit" : ""} ${breaking ? "is-breaking" : ""}`}>
      <span className="plant-shadow" />
      <span className="core-stem" />
      {Array.from({ length: blades }).map((_, index) => (
        <span className={`blade blade-${index + 1}`} key={index} />
      ))}
      {breaking && <><span className="grass-chip chip-one" /><span className="grass-chip chip-two" /><span className="grass-chip chip-three" /></>}
      {weed.tone === "purple" && <><span className="flower"><i /><i /><i /><i /></span><span className="thorn thorn-left" /><span className="thorn thorn-right" /></>}
      {weed.tone === "light" && <><span className="seed-stem" /><span className="seed-head">{Array.from({ length: 7 }).map((_, index) => <i key={index} />)}</span></>}
      {weed.tone === "round" && <span className="burr-cluster"><i /><i /><i /></span>}
      {weed.tone === "wide" && <span className="finger-seeds"><i /><i /><i /><i /><i /></span>}
      {weed.tone === "dark" && <span className="wild-branches"><i /><i /><i /><i /></span>}
    </div>
  );
}

function SceneBackdrop({ level }: { level: number }) {
  const isSchoolRoad = level === 1 || level === 2;
  return (
    <div className={`scene-backdrop scene-${level}`}>
      <div className="scene-sky">
        <div className="scene-sun" />
        <div className="scene-moon" />
        <span className="scene-cloud cloud-a" />
        <span className="scene-cloud cloud-b" />
        <div className="far-hills" />
      </div>
      <div className="scene-ground" />
      {(isSchoolRoad || level === 18) && (
        <div className={`school-building ${level === 1 ? "school-detailed" : ""}`}>
          {Array.from({ length: level === 1 ? 8 : 3 }).map((_, index) => <i key={index} />)}
          <span>{level === 1 ? "红星小学" : "学校"}</span>
          {level === 1 && (
            <>
              <div className="school-clock"><b /></div>
              <div className="school-door" />
              <div className="school-side-wing" />
              <div className="school-wall wall-left" />
              <div className="school-wall wall-right" />
              <div className="school-gate"><b /><b /></div>
              <div className="school-flag"><b /></div>
              <div className="school-bicycle"><b /><b /><b /></div>
              <div className="school-students"><b /><b /><b /></div>
            </>
          )}
        </div>
      )}
      {(level === 3 || level === 11) && <><div className="field-furrows" /><div className="basket"><i /></div></>}
      {level === 4 && <><div className="village-house"><i /><span /></div><div className="clothes-line"><i /><i /><i /></div></>}
      {level === 5 && <><div className="big-hill" /><div className="lone-tree" /></>}
      {level === 6 && <div className="bamboo-grove">{Array.from({ length: 7 }).map((_, index) => <i key={index} />)}</div>}
      {(level === 7 || level === 10) && <><div className={`waterway ${level === 10 ? "ditch" : ""}`} /><div className="stepping-stones"><i /><i /><i /></div></>}
      {(level === 1 || level === 2 || level === 8) && <div className="country-road" />}
      {level === 9 && <><div className="town-road" /><div className="small-shop"><span>小卖部</span></div><div className="power-pole" /></>}
      {level === 10 && <div className="wood-bridge" />}
      {level === 11 && <div className="old-fence"><i /><i /><i /><i /></div>}
      {level === 14 && <div className="rope-game"><i className="kid kid-a" /><i className="kid kid-b" /><i className="kid kid-c" /><span /></div>}
      {level === 15 && <div className="hidden-snake"><i /><i /><i /></div>}
      {level === 16 && <div className="slope-friend"><i /><span>喂，别回头！</span></div>}
      {level === 17 && <div className="after-fight"><i /><i /><span /></div>}
      {level === 18 && <div className="memory-board"><span>烂泥扶不上墙</span></div>}
      {level === 19 && <div className="laughing-pair"><i /><i /><span>哈哈</span></div>}
      {level === 20 && <div className="exam-paper"><span>100</span><i>优秀</i></div>}
      {(isSchoolRoad || level === 3) && <div className={`walking-child ${level === 2 ? "toward-school" : ""}`}><i /><span /></div>}
      <div className="scene-vignette" />
    </div>
  );
}

function HomeScreen({
  currentLevel,
  bestCombo,
  onStart,
  onRestart,
  onProfile,
  onSnackPreview,
  onLogo,
  onAppStore,
  discoveredCount,
  hiddenUnlocked,
  onHiddenLevel,
}: {
  currentLevel: number;
  bestCombo: number;
  onStart: () => void;
  onRestart: () => void;
  onProfile: () => void;
  onSnackPreview: () => void;
  onLogo: () => void;
  onAppStore: () => void;
  discoveredCount: number;
  hiddenUnlocked: boolean;
  onHiddenLevel: () => void;
}) {
  const level = levels[currentLevel];
  const [bannerIndex, setBannerIndex] = useState(0);
  const banners = [
    { kicker: "基础玩法", title: "点击野草，挥棍出击", copy: "瞄准不同野草，让手里的棍子飞过去。" },
    { kicker: "进阶技巧", title: "保持连击，点亮图鉴", copy: "连续命中获得额外分数，收集田野里的草种。" },
    { kicker: "通关秘密", title: "通过 20 关，秘境开启", copy: "完成全部童年场景，解锁整株商陆隐藏关卡。" },
  ];

  useEffect(() => {
    const timer = window.setInterval(() => setBannerIndex((current) => (current + 1) % banners.length), 3600);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  const banner = banners[bannerIndex];
  return (
    <main className="home-shell">
      <section className="home-screen">
        <div className="home-top">
          <div className="home-brand-mini">
            <div className="brand-mark"><span /></div>
            <div><strong>童年田野计划</strong><small>80 / 90 后限定回忆</small></div>
          </div>
          <div className="home-top-actions">
            <div className="home-sound" aria-label="声音已开启"><i /><i /><i /></div>
            <Button className="home-profile-button" label="打开个人中心" onClick={onProfile}>田</Button>
          </div>
        </div>

        <div className="home-hero">
          <div className="home-sun" />
          <div className="home-cloud home-cloud-a" />
          <div className="home-cloud home-cloud-b" />
          <div className="home-mountain home-mountain-back" />
          <div className="home-mountain home-mountain-front" />
          <div className="home-copy">
            <div className="home-kicker">放学后的秘密基地</div>
            <div className="home-title"><span>野草</span><strong>大作战</strong></div>
            <div className="home-slogan">用一根棍子，把今天的烦恼都打出去</div>
          </div>
          <div className="home-child">
            <span className="child-head" />
            <span className="child-body" />
            <span className="child-arm" />
            <span className="child-leg leg-left" />
            <span className="child-leg leg-right" />
            <span className="child-stick" />
          </div>
          <div className="home-grass grass-left"><i /><i /><i /><i /><i /></div>
          <div className="home-grass grass-right"><i /><i /><i /><i /><i /><i /></div>
          <div className="home-ground" />
        </div>

        <div className="home-content">
          <div className="continue-card">
            <div className="continue-head">
              <span>上次玩到</span>
              <strong>{String(currentLevel + 1).padStart(2, "0")} / 20</strong>
            </div>
            <div className="continue-level">{level.name}</div>
            <div className="continue-note">{level.note}</div>
            <div className="home-progress"><span style={{ width: `${((currentLevel + 1) / 20) * 100}%` }} /></div>
          </div>

          <Button className="home-start" onClick={onStart}>
            <span>{currentLevel === 0 ? "开始游戏" : "继续游戏"}</span>
            <i>挥棍出发</i>
            <strong>›</strong>
          </Button>

          <div className="home-meta">
            <div><span>今日最佳</span><strong>{Math.max(bestCombo, 12)} 连击</strong></div>
            <div><span>小草图鉴</span><strong>{discoveredCount} / {initialWeeds.length}</strong></div>
            <Button className="new-game-button" onClick={onRestart}>从第一关开始</Button>
          </div>
          <Button className="snack-preview-button" onClick={onSnackPreview}>
            <span>测试入口</span>
            <strong>预览“要辣条”补给动画</strong>
            <b>›</b>
          </Button>
          <Button className="logo-design-entry" onClick={onLogo}>
            <span>品牌设计</span>
            <strong>查看《野草大作战》专属 Logo</strong>
            <b>›</b>
          </Button>
          <Button className="app-store-entry" onClick={onAppStore}>
            <span>APP STORE</span>
            <strong>查看 4 张商店宣传截图</strong>
            <b>›</b>
          </Button>
          {(hiddenUnlocked || import.meta.env.DEV) && (
            <Button className={`hidden-level-entry ${hiddenUnlocked ? "unlocked" : "debug"}`} onClick={onHiddenLevel}>
              <div className="hidden-entry-plant"><i /><i /><i /><span /></div>
              <div>
                <span>{hiddenUnlocked ? "隐藏关卡已解锁" : "DEBUG 测试入口"}</span>
                <strong>闯入商陆秘境</strong>
                <small>{hiddenUnlocked ? "全部场景通关奖励" : "无需通关，直接测试整株商陆"}</small>
              </div>
              <b>›</b>
            </Button>
          )}
          <div className={`home-banner banner-theme-${bannerIndex}`}>
            <div className="banner-copy" key={bannerIndex}>
              <span>{banner.kicker}</span>
              <strong>{banner.title}</strong>
              <small>{banner.copy}</small>
            </div>
            <div className="banner-art" aria-hidden="true">
              {bannerIndex === 0 && <><i className="banner-stick" /><i className="banner-grass grass-a" /><i className="banner-grass grass-b" /><i className="banner-flight" /></>}
              {bannerIndex === 1 && <><i className="banner-combo combo-one">3</i><i className="banner-combo combo-two">8</i><i className="banner-book" /></>}
              {bannerIndex === 2 && <><i className="banner-poke-stem" /><i className="banner-poke-leaf leaf-a" /><i className="banner-poke-leaf leaf-b" /><i className="banner-poke-fruit" /><i className="banner-lock" /></>}
            </div>
            <div className="banner-dots">
              {banners.map((item, index) => (
                <Button
                  className={`banner-dot ${index === bannerIndex ? "active" : ""}`}
                  key={item.title}
                  label={`查看${item.title}`}
                  onClick={() => setBannerIndex(index)}
                />
              ))}
            </div>
          </div>
          <div className="home-footer">风吹过田野，也吹回了小时候</div>
        </div>
      </section>
    </main>
  );
}

function LogoDesign({ onBack }: { onBack: () => void }) {
  return (
    <main className="logo-design-shell">
      <Button className="logo-back" label="返回首页" onClick={onBack}>‹</Button>
      <svg className="game-logo" viewBox="0 0 720 720" role="img" aria-label="野草大作战游戏 Logo">
        <rect width="720" height="720" rx="156" fill="#173f2c" />
        <path d="M97 112C173 54 555 46 625 122c58 63 54 399-7 477-65 83-427 91-515 18-79-65-81-448-6-505Z" fill="none" stroke="#f5e7ba" strokeWidth="18" />
        <path d="M113 126C187 74 539 69 607 136" fill="none" stroke="#c95a35" strokeWidth="9" strokeLinecap="round" />

        <g transform="translate(360 240)">
          <path d="M-8 141C-27 91-29 32-12-97-3-164 9-182 19-101 35 32 31 91 8 141Z" fill="#f2d776" />
          <path d="M0 120C-4 32 2-73 11-143" fill="none" stroke="#8b6a38" strokeWidth="7" strokeLinecap="round" />
          <path d="M-8 91C-70 48-105 2-122-55-61-43-20-13 3 42Z" fill="#87aa59" stroke="#f5e7ba" strokeWidth="8" strokeLinejoin="round" />
          <path d="M8 80C68 32 99-12 115-70 58-53 19-23-4 30Z" fill="#a3bd62" stroke="#f5e7ba" strokeWidth="8" strokeLinejoin="round" />
          <path d="M-5 38C-54 4-77-34-82-79-35-63-7-38 7-3Z" fill="#5f8d4d" stroke="#f5e7ba" strokeWidth="7" strokeLinejoin="round" />
          <path d="M6 20C49-14 70-49 75-91 35-73 10-49-4-17Z" fill="#739d51" stroke="#f5e7ba" strokeWidth="7" strokeLinejoin="round" />
        </g>

        <g transform="rotate(-42 360 282)">
          <rect x="330" y="34" width="60" height="488" rx="30" fill="#9a613d" stroke="#f5e7ba" strokeWidth="12" />
          <path d="M344 55v443M376 54v444" stroke="#c88a50" strokeWidth="7" strokeLinecap="round" opacity=".65" />
          <path d="M333 148h54M333 364h54" stroke="#6f432e" strokeWidth="9" />
        </g>

        <path d="M85 333c126-35 432-34 552 3l-25 122c-140-28-375-26-504 2Z" fill="#f4e4b5" />
        <path d="M104 446c128-24 381-25 508-1l-10 43c-143-20-350-18-490 3Z" fill="#c85734" />
        <g transform="rotate(-3 360 390)">
          <text x="360" y="420" fill="#173f2c" fontFamily="'Noto Sans SC', sans-serif" fontSize="134" fontWeight="900" letterSpacing="10" textAnchor="middle">野草</text>
        </g>
        <g transform="rotate(2 360 535)">
          <text x="360" y="564" fill="#f7e8ba" fontFamily="'Noto Sans SC', sans-serif" fontSize="120" fontWeight="900" letterSpacing="4" textAnchor="middle" stroke="#173f2c" strokeWidth="18" paintOrder="stroke">大作战</text>
        </g>
        <path d="M177 611c93 22 270 21 365-3" fill="none" stroke="#e3a457" strokeWidth="11" strokeLinecap="round" />
        <text x="360" y="654" fill="#f2d987" fontFamily="'Noto Sans SC', sans-serif" fontSize="23" fontWeight="800" letterSpacing="14" textAnchor="middle">挥 棍 出 发</text>
      </svg>
    </main>
  );
}

const APP_STORE_URL = "";

const STORE_SCREENSHOTS = [
  { file: "01-childhood-field.png", alt: "野草大作战宣传截图：一挥棍，回到那年夏天", label: "重返童年田野" },
  { file: "02-combo-gameplay.png", alt: "野草大作战宣传截图：一棍接一棍，快乐连成击", label: "挥棍连击闯关" },
  { file: "03-pokeweed-secret.png", alt: "野草大作战宣传截图：田野的尽头，还有一个秘密", label: "解锁商陆秘境" },
  { file: "04-growth-profile.png", alt: "野草大作战宣传截图：每一次撒野，都值得一朵红花", label: "收藏成长档案" },
];

function screenshotSrc(file: string) {
  return `${import.meta.env.BASE_URL}app-store-screenshots/${file}`;
}

function OfficialWebsite({
  onPlay,
  onPrivacy,
}: {
  onPlay: () => void;
  onPrivacy: () => void;
}) {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="official-site">
      <nav className="official-nav">
        <Button className="official-brand" label="返回官网顶部" onClick={() => scrollTo("official-top")}>
          <i><b /></i>
          <span><strong>野草大作战</strong><small>WILD GRASS BATTLE</small></span>
        </Button>
        <div className="official-nav-links">
          <Button onClick={() => scrollTo("features")}>玩法</Button>
          <Button onClick={() => scrollTo("showcase")}>游戏画面</Button>
          <Button onClick={onPrivacy}>隐私政策</Button>
        </div>
        <Button className="official-play-nav" onClick={() => scrollTo("download")}>开始游戏 <b>›</b></Button>
      </nav>

      <section className="official-hero" id="official-top">
        <div className="official-sun" />
        <div className="official-cloud official-cloud-a" />
        <div className="official-cloud official-cloud-b" />
        <div className="official-hero-copy">
          <span className="official-kicker">献给 80、90 后的童年</span>
          <div className="official-title">
            <span>野草</span>
            <strong>大作战</strong>
          </div>
          <div className="official-tagline">用一根棍子，把今天的烦恼都打出去</div>
          <div className="official-hero-actions">
            <Button className="official-primary" onClick={() => scrollTo("download")}><span>立即挥棍</span><svg className="official-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.2 11.2 8 6 12.8" /></svg></Button>
            <Button className="official-secondary" onClick={() => scrollTo("showcase")}>看看小时候</Button>
          </div>
          <div className="official-meta"><span>20 个童年场景</span><i /><span>5 种野草</span><i /><span>隐藏秘境</span></div>
        </div>
        <div className="official-hero-art">
          <div className="official-photo-ring">
            <StudentFace className="official-student" />
          </div>
          <i className="official-big-stick" />
          <div className="official-score-tag"><span>连击</span><strong>× 12</strong></div>
          <div className="official-weed-silhouette"><i /><i /><i /><i /><i /><i /></div>
        </div>
        <div className="official-hill hill-far" />
        <div className="official-hill hill-near" />
        <div className="official-grass-edge"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
      </section>

      <section className="official-memory-strip">
        <span>放学铃响</span><i>01</i><span>捡根木棍</span><i>02</i><span>一路打草回家</span><i>03</i><span>天黑前到家</span>
      </section>

      <section className="official-features" id="features">
        <div className="official-section-head">
          <span>CHILDHOOD, REPLAYED</span>
          <strong>这一次，认真玩完小时候</strong>
          <small>不是宏大的冒险，只是每个孩子都走过的那条回家路。</small>
        </div>
        <div className="official-feature-grid">
          <article className="official-feature-card feature-strike">
            <div className="feature-number">01</div>
            <div className="feature-art feature-stick-art"><i /><b /></div>
            <span>飞棍打草</span>
            <strong>点击，瞄准，挥出去</strong>
            <small>不同野草拥有不同耐力，保持连续命中，打出属于你的最高连击。</small>
          </article>
          <article className="official-feature-card feature-map">
            <div className="feature-number">02</div>
            <div className="feature-art feature-road-art"><i /><b /><em /></div>
            <span>童年地图</span>
            <strong>20 段熟悉的回家路</strong>
            <small>田埂、小溪、竹林、操场与夕阳，每一关都藏着一段熟悉的记忆。</small>
          </article>
          <article className="official-feature-card feature-secret">
            <div className="feature-number">03</div>
            <div className="feature-art feature-poke-art"><i /><b /><em /></div>
            <span>收集与秘境</span>
            <strong>集齐图鉴，解锁商陆</strong>
            <small>发现全部小草，通关 20 个场景，让金箍棒带你进入最后的隐藏关卡。</small>
          </article>
        </div>
      </section>

      <section className="official-showcase" id="showcase">
        <div className="official-section-head light">
          <span>REAL GAME SCENES</span>
          <strong>四张图，回到那个夏天</strong>
          <small>所有画面均来自《野草大作战》的真实视觉与玩法。</small>
        </div>
        <div className="official-screenshot-track">
          {STORE_SCREENSHOTS.map((shot, index) => (
            <figure className={`official-shot shot-offset-${index}`} key={shot.file}>
              <div className="official-shot-number">0{index + 1}</div>
              <img src={screenshotSrc(shot.file)} alt={shot.alt} />
              <figcaption>{shot.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="official-cta">
        <div className="official-cta-copy">
          <span>放学后的秘密基地</span>
          <strong>小时候没打完的草<br />这次一棵都不留</strong>
          <small>拿起棍子，沿着那条熟悉的路，再走一次。</small>
          <Button className="official-primary" onClick={onPlay}><span>进入野草大作战</span><svg className="official-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.2 11.2 8 6 12.8" /></svg></Button>
        </div>
        <div className="official-cta-scene">
          <div className="cta-sun" />
          <div className="cta-road" />
          <div className="cta-child"><i /><b /><em /></div>
          <div className="cta-grass"><i /><i /><i /><i /><i /><i /></div>
        </div>
      </section>

      <section className="official-download" id="download">
        <div className="official-download-card">
          <span>APP STORE</span>
          <strong>下载《野草大作战》</strong>
          <small>在 iPhone 或 iPad 上打开 App Store，把这根棍子装进书包。</small>
          <a
            className="official-download-button"
            href={APP_STORE_URL || undefined}
            role="link"
            tabIndex={0}
            target={APP_STORE_URL ? "_blank" : undefined}
            rel={APP_STORE_URL ? "noopener noreferrer" : undefined}
            onClick={(event) => {
              if (!APP_STORE_URL) event.preventDefault();
            }}
          >
            <span>前往 App Store 下载</span>
            <svg className="official-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.2 11.2 8 6 12.8" /></svg>
          </a>
        </div>
      </section>

      <footer className="official-footer">
        <div className="official-footer-brand"><strong>野草大作战</strong><span>风吹过田野，也吹回了小时候</span></div>
        <div className="official-footer-links">
          <Button onClick={onPrivacy}>隐私政策</Button>
          <span>© 2026 童年田野计划</span>
        </div>
      </footer>
    </main>
  );
}

function PrivacyPolicy({ onBack, onPlay }: { onBack: () => void; onPlay: () => void }) {
  return (
    <main className="privacy-site">
      <nav className="privacy-nav">
        <Button className="privacy-back" onClick={onBack}>‹ 返回官网</Button>
        <div className="privacy-brand"><strong>野草大作战</strong><span>隐私政策</span></div>
        <Button className="privacy-play" onClick={onPlay}>进入游戏</Button>
      </nav>
      <article className="privacy-paper">
        <header className="privacy-heading">
          <span>PRIVACY POLICY</span>
          <strong>野草大作战隐私政策</strong>
          <dl className="privacy-meta">
            <div><dt>更新日期</dt><dd>2026 年 10 月 15 日</dd></div>
            <div><dt>生效日期</dt><dd>2026 年 10 月 16 日</dd></div>
            <div><dt>开发者／运营主体</dt><dd>Hubei Linfengxing Network Technology Co., Ltd.</dd></div>
            <div><dt>隐私联系邮箱</dt><dd><a href="mailto:crownjishu666@outlook.com">crownjishu666@outlook.com</a></dd></div>
          </dl>
        </header>

        <div className="privacy-intro">
          <p>野草大作战是一款以日常放松、释放压力为主要用途的应用，通过挥棍打草、场景探索等互动提供轻松体验。我们承诺本应用永久免费开放使用，不设置付费下载、订阅或应用内购买。</p>
          <p>我们重视你的隐私。本政策说明使用本应用时，哪些数据会保存在设备上、这些数据的用途，以及你如何管理和删除它们。本政策适用于野草大作战 iOS 应用及你通过上述联系渠道向我们提出的隐私问题。</p>
        </div>
        <aside className="privacy-highlight">
          本应用无需注册或登录，应用功能可离线使用。正常使用时，应用不会将你的资料和使用记录上传给我们。当前版本不接入广告、第三方统计或用户追踪 SDK。
        </aside>

        <section>
          <span>一</span>
          <div>
            <strong>本地保存的数据和用途</strong>
            <p>为保留你的个性化设置和使用进度，本应用使用 iOS 提供的本地存储机制，在设备上保存以下内容：</p>
            <div className="privacy-table-wrap">
              <table className="privacy-table">
                <thead>
                  <tr>
                    <th scope="col">数据类别</th>
                    <th scope="col">具体内容</th>
                    <th scope="col">使用目的</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td data-label="数据类别">角色资料</td>
                    <td data-label="具体内容">你设置的名字、学校／班级文字，以及选择的内置头像编号</td>
                    <td data-label="使用目的">在个人中心展示你的角色资料</td>
                  </tr>
                  <tr>
                    <td data-label="数据类别">使用进度</td>
                    <td data-label="具体内容">当前关卡、已完成关卡、所选棍子、棍子耐久度及奖励领取状态</td>
                    <td data-label="使用目的">恢复进度，提供装备和关卡功能</td>
                  </tr>
                  <tr>
                    <td data-label="数据类别">互动记录</td>
                    <td data-label="具体内容">累计挥棍次数、最高连击，以及打草记录中的草种、场景、关卡、得分和时间</td>
                    <td data-label="使用目的">展示使用记录、成就、图鉴及进度</td>
                  </tr>
                  <tr>
                    <td data-label="数据类别">每日状态</td>
                    <td data-label="具体内容">当日日期、互动次数和补给领取状态</td>
                    <td data-label="使用目的">更新每日计数和补给状态</td>
                  </tr>
                  <tr>
                    <td data-label="数据类别">偏好设置</td>
                    <td data-label="具体内容">音效开关</td>
                    <td data-label="使用目的">保留你的声音偏好</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>上述内容仅用于本应用的本地功能，不会通过本应用发送至我们的服务器，也不会向其他用户公开。</p>
            <p className="privacy-callout"><strong>角色资料可以保留默认内容，也可以填写虚构的昵称和学校／班级文字。我们不要求填写真实姓名、真实学校或班级，不进行身份或学籍验证。</strong>不修改角色资料，也可以正常使用本应用。头像仅从应用提供的图案中选择，无需上传照片。</p>
          </div>
        </section>

        <section>
          <span>二</span>
          <div>
            <strong>我们不主动获取的信息和权限</strong>
            <p>本应用不主动获取你的手机号、电子邮箱、身份证件、通讯录、精确位置、照片、录音、健康数据、支付信息或广告标识符，不开展跨应用或跨网站追踪，也不建立用于广告推荐的用户画像。</p>
            <p>当前版本不申请相机、麦克风、照片图库、通讯录、定位或跟踪权限。应用播放的是随应用提供的音效，不会录制你的声音。</p>
          </div>
        </section>

        <section>
          <span>三</span>
          <div>
            <strong>你主动联系我们时的信息</strong>
            <p>如果你通过本政策中的邮箱联系我们，我们会收到你的邮箱地址、邮件内容，以及你主动提供的附件等信息。这些信息用于答复咨询、处理反馈或协助你行使隐私权利，不作为使用应用的前提，也不用于营销或广告。</p>
            <p>请只提供处理问题所必需的信息，避免发送身份证件、账号密码、真实学校班级等无关资料。如需提供截图，请先遮挡无关的个人信息。</p>
            <p>我们仅在处理问题及必要复核期间保留相关联系信息，目的完成后删除或匿名化处理；法律法规要求继续保存的，按法定要求处理。</p>
          </div>
        </section>

        <section>
          <span>四</span>
          <div>
            <strong>数据存储和保存期限</strong>
            <p>应用内的资料、设置和进度保存在你的设备上，我们不建立用于接收这些本地存档的服务器，也无法远程查看或修改这些存档。</p>
            <p>本地数据用于持续保留你的设置和进度，通常保存至你修改、覆盖或删除相应数据。打草记录最多保留最近 50 条，超过后自动移除更早的记录。每日状态会在日期变化、应用更新每日状态时被新状态替换。</p>
            <p>如果你开启了 iCloud 云备份或使用设备备份、迁移功能，系统可能将本应用的数据纳入备份或迁移。这属于你使用的系统服务，并非本应用主动上传存档给我们；我们无法访问或控制你的系统备份。你可以根据系统提供的选项管理备份，具体可参阅 <a href="https://support.apple.com/zh-cn/108770" target="_blank" rel="noreferrer">Apple 关于 iCloud 云备份的说明</a>。</p>
            <p>本应用不主动将上述本地存档传输至境外。系统备份服务中的数据处理，适用相应服务提供方的隐私规则和你的设置。</p>
          </div>
        </section>

        <section>
          <span>五</span>
          <div>
            <strong>第三方服务和信息提供</strong>
            <p>当前版本未接入第三方广告、统计分析、社交登录、支付或云端存档 SDK。应用使用 Apple 提供的系统框架实现界面、本地存储、音效和触觉反馈。</p>
            <p>我们不出售你的个人信息，不通过本应用向第三方共享、转让或公开你的本地资料和存档。</p>
            <p>对于你主动联系我们提供的信息，除处理你的请求所必要、依法取得相应授权，或者履行法定义务外，我们不会向其他主体提供。依法必须提供时，我们会核实请求的合法性，并将提供范围限制在必要限度内。</p>
            <p>App Store 分发、设备系统诊断及系统备份等服务由 Apple 按其规则提供。我们未在应用中加入自行上传设备日志或崩溃报告的功能。</p>
          </div>
        </section>

        <section>
          <span>六</span>
          <div>
            <strong>你如何管理和删除数据</strong>
            <p>你可以通过以下方式管理数据：</p>
            <ol className="privacy-steps">
              <li><strong>查看和修改角色资料。</strong>在个人中心进入“编辑个人资料”，修改名字、学校／班级文字及内置头像。你可以将文字改为虚构内容。</li>
              <li><strong>调整声音设置。</strong>通过应用提供的音效开关修改偏好。</li>
              <li><strong>删除本地数据。</strong>当前版本没有单独清空全部存档的按钮。你可以在 iPhone 或 iPad 的“设置 → 通用 → iPhone 储存空间／iPad 储存空间 → 野草大作战”中选择“删除 App”，删除应用及其本地数据。选择“卸载 App”会保留文稿和数据，不等于删除存档。</li>
              <li><strong>管理备份。</strong>删除设备上的应用不会自动删除已有的系统备份。若你希望一并移除备份中的数据，请通过系统备份管理功能操作；从旧备份恢复设备时，先前保存的数据可能被恢复。</li>
              <li><strong>提出隐私请求。</strong>你可以通过本政策中的邮箱，提出查阅、复制、更正或删除你主动提供给我们的信息等请求，也可以询问本政策的内容。我们会在收到请求后 15 个工作日内答复；需要核验身份时，仅要求与你的请求相称的必要信息。</li>
            </ol>
            <p>由于我们没有你的本地存档副本，无法代替你远程导出或清除设备内的存档。本应用没有用户账号，因此无需办理账号注销。</p>
          </div>
        </section>

        <section>
          <span>七</span>
          <div>
            <strong>未成年人信息保护</strong>
            <p>未成年人应在监护人的指导下了解本政策并使用本应用。不满十四周岁的用户，请在监护人的指导和同意下使用，并保留默认角色资料或使用虚构内容，避免输入真实姓名、学校、班级和联系方式。</p>
            <p>我们不以获取未成年人的真实身份、学校或联系方式作为提供应用功能的条件。如果通过联系渠道收到不满十四周岁未成年人的个人信息，我们会依法核实监护人同意情况，并在无需继续处理或未取得必要同意时及时删除。监护人可以通过本政策中的邮箱联系我们处理相关问题。</p>
          </div>
        </section>

        <section>
          <span>八</span>
          <div>
            <strong>数据安全</strong>
            <p>我们利用 iOS 的应用隔离和系统存储机制，限制其他应用对本应用本地数据的访问，并通过减少联网和第三方组件的使用，降低数据暴露的风险。</p>
            <p>请妥善管理设备、解锁密码和备份访问权限。如果发生涉及我们所处理个人信息的安全事件，我们会及时采取补救措施，并按法律法规要求履行通知、报告等义务。</p>
          </div>
        </section>

        <section>
          <span>九</span>
          <div>
            <strong>本政策的更新</strong>
            <p>如应用功能或数据处理方式发生变化，我们会更新本政策和更新日期，并通过应用更新说明或应用内提示等适当方式告知你。</p>
            <p>如果未来新增需要处理个人信息的功能，我们会在相关处理发生前说明其目的、方式、信息范围和保存期限，并在依法需要时取得你的同意。政策更新不会以你继续使用应用为由，替代依法需要单独取得的授权。</p>
          </div>
        </section>

        <section>
          <span>十</span>
          <div>
            <strong>联系我们</strong>
            <p>如对本政策有疑问，或需要提出个人信息保护相关请求，请联系：</p>
            <dl className="privacy-contact">
              <div><dt>开发者／运营主体</dt><dd>Hubei Linfengxing Network Technology Co., Ltd.</dd></div>
              <div><dt>隐私联系邮箱</dt><dd><a href="mailto:crownjishu666@outlook.com">crownjishu666@outlook.com</a></dd></div>
            </dl>
            <p>为便于识别，你可以将邮件主题写为“野草大作战 隐私问题”。</p>
          </div>
        </section>
      </article>
      <footer className="privacy-footer">野草大作战 · 童年田野计划</footer>
    </main>
  );
}

function AppStoreDesign({ onBack }: { onBack: () => void }) {
  return (
    <main className="app-store-design">
      <div className="store-design-top">
        <Button className="store-back" label="返回首页" onClick={onBack}>‹</Button>
        <div>
          <span>APP STORE</span>
          <strong>野草大作战 · 商店截图</strong>
          <small>4 张宣传截图</small>
        </div>
      </div>

      <div className="store-shot-grid">
        {STORE_SCREENSHOTS.map((shot) => (
          <figure className="store-shot-frame" key={shot.file}>
            <img src={screenshotSrc(shot.file)} alt={shot.alt} />
            <figcaption>{shot.label}</figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}

function ProfileScreen({
  records,
  totalStrikes,
  completedLevels,
  onBack,
  onHome,
  onGrassCatalog,
  onStickCatalog,
  onLevelMap,
  profile,
  onSaveProfile,
}: {
  profile: PlayerProfile;
  onSaveProfile: (profile: PlayerProfile) => void;
  records: GrassRecord[];
  totalStrikes: number;
  completedLevels: number[];
  onBack: () => void;
  onHome: () => void;
  onGrassCatalog: () => void;
  onStickCatalog: () => void;
  onLevelMap: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const openEdit = () => { setDraft(profile); setEditing(true); };
  const saveEdit = () => {
    onSaveProfile({ name: draft.name.trim() || DEFAULT_PROFILE.name, school: draft.school.trim() || DEFAULT_PROFILE.school, avatar: draft.avatar });
    setEditing(false);
  };
  const totalPoints = records.reduce((sum, record) => sum + record.points, 0);
  const discoveredWeeds = new Set(records.map((record) => record.weed));
  const title = records.length >= 50 ? "除草宗师" : records.length >= 20 ? "田野高手" : records.length >= 5 ? "打草能手" : "打草新手";
  const playerLevel = Math.floor(Math.sqrt(totalPoints / 60)) + 1;
  const levelFloor = 60 * (playerLevel - 1) ** 2;
  const levelCeil = 60 * playerLevel ** 2;
  const expPercent = Math.min(100, ((totalPoints - levelFloor) / (levelCeil - levelFloor)) * 100);
  return (
    <main className="profile-shell">
      <section className="profile-screen profile-game">
        <div className="profile-topbar is-overlay">
          <Button className="profile-back" label="返回游戏" onClick={onBack}>‹</Button>
          <div><strong>我的学生证</strong><span>成长档案</span></div>
          <Button className="profile-home" label="返回首页" onClick={onHome}>首页</Button>
        </div>

        <div className="profile-hero game-hero">
          <div className="home-sun" />
          <div className="home-cloud home-cloud-a" />
          <div className="home-cloud home-cloud-b" />
          <div className="home-mountain home-mountain-back" />
          <div className="home-mountain home-mountain-front" />
          <div className="player-frame" role="button" tabIndex={0} aria-label="编辑头像、名字和学校" onClick={openEdit} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") openEdit(); }}>
            <div className="player-photo" style={{ background: AVATARS[profile.avatar].bg }}><StudentFace className="player-face" avatar={profile.avatar} /></div>
            <b className="player-lv">LV.{playerLevel}</b>
            <i className="player-edit">编辑</i>
          </div>
          <div className="player-info">
            <div className="home-kicker">{title}</div>
            <div className="player-name">{profile.name}</div>
            <div className="profile-id">{profile.school}</div>
          </div>
          <div className="home-grass grass-left"><i /><i /><i /><i /><i /></div>
          <div className="home-grass grass-right"><i /><i /><i /><i /><i /><i /></div>
          <div className="home-ground" />
        </div>

        <div className="profile-body">
          <div className="continue-card exp-card">
            <div className="continue-head"><span>冒险等级 · 距下一级还差 {(levelCeil - totalPoints).toLocaleString("zh-CN")} 分</span><strong>LV.{playerLevel}</strong></div>
            <div className="home-progress"><span style={{ width: `${expPercent}%` }} /></div>
            <div className="exp-text"><span>EXP</span><b>{totalPoints.toLocaleString("zh-CN")} / {levelCeil.toLocaleString("zh-CN")}</b></div>
          </div>
          <div className="profile-stats">
            <div><i>草</i><strong>{records.length}</strong><span>斩草数</span></div>
            <div><i>棍</i><strong>{totalStrikes}</strong><span>挥棍数</span></div>
            <div><i>分</i><strong>{totalPoints.toLocaleString("zh-CN")}</strong><span>总积分</span></div>
          </div>

          <Button className="profile-card journey-card" onClick={onLevelMap}>
            <div className="profile-section-head"><div><span>闯关足迹</span><strong>童年地图</strong></div><b>{completedLevels.length} / 20</b></div>
            <div className="journey-progress"><span style={{ width: `${(completedLevels.length / 20) * 100}%` }} /></div>
            <div className="journey-levels">
              {levels.map((level, index) => <i className={completedLevels.includes(index) ? "reached" : ""} key={level.name}>{index + 1}</i>)}
            </div>
            <div className="journey-enter">查看全部关卡 <strong>›</strong></div>
          </Button>

          <div className="profile-card achievements-card">
            <div className="profile-section-head"><div><span>老师的表扬</span><strong>小红花奖状</strong></div><b>{records.length >= 20 ? 3 : records.length >= 5 ? 2 : records.length >= 1 ? 1 : 0} / 3</b></div>
            <div className="achievement-list">
              <div className={`achievement ${totalStrikes >= 1 ? "unlocked" : ""}`}><i>初</i><span><strong>初试身手</strong><small>完成第一次挥棍</small></span></div>
              <div className={`achievement ${records.length >= 5 ? "unlocked" : ""}`}><i>五</i><span><strong>斩草五棵</strong><small>累计清除 5 棵野草</small></span></div>
              <div className={`achievement ${records.length >= 20 ? "unlocked" : ""}`}><i>廿</i><span><strong>田野高手</strong><small>累计清除 20 棵野草</small></span></div>
            </div>
          </div>

          <div className="catalog-entry-list">
            <Button className="catalog-entry-card grass-entry" onClick={onGrassCatalog}>
              <div className="catalog-entry-icon"><i /><i /><i /></div>
              <div><span>田野收藏</span><strong>小草图鉴</strong><small>{discoveredWeeds.size} / {initialWeeds.length} 已发现</small></div>
              <b>›</b>
            </Button>
            <Button className="catalog-entry-card stick-entry" onClick={onStickCatalog}>
              <div className="catalog-entry-icon"><Stick color="bamboo" /></div>
              <div><span>装备收藏</span><strong>棍子图鉴</strong><small>{completedLevels.length === levels.length ? 4 : 3} / 4 已解锁</small></div>
              <b>›</b>
            </Button>
          </div>

          <div className="profile-card records-card">
            <div className="profile-section-head"><div><span>今日份快乐</span><strong>打草日记</strong></div><b>最近 {Math.min(records.length, 10)} 条</b></div>
            <div className="record-list">
              {records.length === 0 ? (
                <div className="empty-records"><div className="empty-grass"><i /><i /><i /></div><strong>还没有打草记录</strong><span>去田野里挥出第一棍吧</span></div>
              ) : records.slice(0, 10).map((record) => (
                <div className="record-row" key={record.id}>
                  <div className="record-icon"><i /><i /><i /></div>
                  <div className="record-copy"><strong>打倒了 {record.weed}</strong><span>第 {record.level} 关 · {record.scene}</span></div>
                  <div className="record-score"><strong>+{record.points}</strong><span>{record.time}</span></div>
                </div>
              ))}
            </div>
          </div>
          <Button className="profile-play" onClick={onBack}>继续去打草 <strong>★</strong></Button>
        </div>

        {editing && (
          <div className="profile-edit-mask" onClick={() => setEditing(false)}>
            <div className="profile-edit-sheet" role="dialog" aria-label="编辑学生证" onClick={(event) => event.stopPropagation()}>
              <div className="edit-handle" />
              <div className="edit-title"><span>学生证</span><strong>编辑个人资料</strong></div>
              <div className="avatar-options">
                {AVATARS.map((item, index) => (
                  <button type="button" key={item.label} className={index === draft.avatar ? "active" : ""} onClick={() => setDraft({ ...draft, avatar: index })}>
                    <span style={{ background: item.bg }}><StudentFace avatar={index} /></span>
                    <small>{item.label}</small>
                  </button>
                ))}
              </div>
              <label className="edit-field"><span>名字</span><input maxLength={10} value={draft.name} placeholder={DEFAULT_PROFILE.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
              <label className="edit-field"><span>学校 / 班级</span><input maxLength={16} value={draft.school} placeholder={DEFAULT_PROFILE.school} onChange={(event) => setDraft({ ...draft, school: event.target.value })} /></label>
              <div className="edit-actions">
                <button type="button" className="edit-cancel" onClick={() => setEditing(false)}>取消</button>
                <button type="button" className="edit-save" onClick={saveEdit}>保存</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function GrassCatalogScreen({ records, onBack }: { records: GrassRecord[]; onBack: () => void }) {
  const discoveredWeeds = new Set(records.map((record) => record.weed));
  return (
    <main className="profile-shell">
      <section className="profile-screen catalog-page">
        <div className="profile-topbar">
          <Button className="profile-back" label="返回个人中心" onClick={onBack}>‹</Button>
          <div><strong>小草图鉴</strong><span>田野植物档案</span></div>
          <div />
        </div>
        <div className="catalog-page-hero grass-catalog-hero">
          <div className="catalog-hero-grass"><i /><i /><i /><i /><i /></div>
          <span>已发现 {discoveredWeeds.size} 种</span>
          <strong>每一棵草，都藏着童年的名字</strong>
          <small>清除新的野草，就能点亮对应图鉴</small>
        </div>
        <div className="catalog-page-body">
          <div className="catalog-page-section"><span>田野草种</span><strong>{discoveredWeeds.size} / {initialWeeds.length}</strong></div>
          <div className="grass-catalog catalog-page-grid">
            {initialWeeds.map((weed) => {
              const discovered = discoveredWeeds.has(weed.name);
              return (
                <div className={`grass-catalog-item ${discovered ? "discovered" : "undiscovered"}`} key={weed.name}>
                  <div className="catalog-plant"><WeedPlant weed={weed} damaged={false} breaking={false} /></div>
                  <strong>{discovered ? weed.name : "未发现"}</strong>
                  <span>{discovered ? `基础价值 ${weed.points} 分` : "去关卡中寻找"}</span>
                </div>
              );
            })}
          </div>
          <div className="catalog-page-note">图鉴会根据你的打草记录自动更新</div>
        </div>
      </section>
    </main>
  );
}

function StickCatalogScreen({
  completedLevels,
  durability,
  onBack,
}: {
  completedLevels: number[];
  durability: number[];
  onBack: () => void;
}) {
  const unlockedCount = completedLevels.length === levels.length ? 4 : 3;
  return (
    <main className="profile-shell">
      <section className="profile-screen catalog-page">
        <div className="profile-topbar">
          <Button className="profile-back" label="返回个人中心" onClick={onBack}>‹</Button>
          <div><strong>棍子图鉴</strong><span>童年装备仓库</span></div>
          <div />
        </div>
        <div className="catalog-page-hero stick-catalog-hero">
          <div className="catalog-hero-stick"><Stick color="gold" /></div>
          <span>已解锁 {unlockedCount} 根</span>
          <strong>趁手的家伙，各有各的脾气</strong>
          <small>查看攻击力、耐久度与解锁条件</small>
        </div>
        <div className="catalog-page-body">
          <div className="catalog-page-section"><span>全部装备</span><strong>{unlockedCount} / {weapons.length}</strong></div>
          <div className="stick-catalog catalog-page-stick-grid">
            {weapons.map((weapon, index) => {
              const locked = index === 3 && completedLevels.length !== levels.length;
              return (
                <div className={`stick-catalog-item ${locked ? "catalog-locked" : ""}`} key={weapon.name}>
                  <div className="catalog-stick"><Stick color={weapon.color} /></div>
                  <div className="catalog-stick-copy">
                    <strong>{weapon.name}</strong>
                    <span>{locked ? "通关全部 20 关解锁" : `${weapon.level} · 攻击 ${weapon.power}×`}</span>
                    <div className="catalog-durability">
                      <i><b style={{ width: `${(durability[index] / weapon.maxDurability) * 100}%` }} /></i>
                      <small>{locked ? "未解锁" : `耐久 ${durability[index]}/${weapon.maxDurability}`}</small>
                    </div>
                  </div>
                  {locked && <div className="catalog-lock">锁</div>}
                </div>
              );
            })}
          </div>
          <div className="catalog-page-note">棍子耐久会随每次挥击减少 1 点</div>
        </div>
      </section>
    </main>
  );
}

function LevelMapScreen({
  completedLevels,
  currentLevel,
  onBack,
  onSelect,
}: {
  completedLevels: number[];
  currentLevel: number;
  onBack: () => void;
  onSelect: (index: number) => void;
}) {
  return (
    <main className="profile-shell">
      <section className="profile-screen level-map-page">
        <div className="profile-topbar">
          <Button className="profile-back" label="返回个人中心" onClick={onBack}>‹</Button>
          <div><strong>童年地图</strong><span>二十段田野记忆</span></div>
          <div />
        </div>
        <div className="level-map-hero">
          <span>闯关足迹</span>
          <strong>{completedLevels.length} / 20</strong>
          <small>完成上一关，才能继续走向下一段回忆</small>
          <div className="map-route"><i /><i /><i /><i /><i /></div>
        </div>
        <div className="level-map-list">
          {levels.map((level, index) => {
            const unlocked = index === 0 || completedLevels.includes(index - 1);
            const completed = completedLevels.includes(index);
            return (
              <Button
                className={`level-list-card mood-${level.mood} ${completed ? "completed" : ""} ${!unlocked ? "locked" : ""}`}
                disabled={!unlocked}
                key={level.name}
                label={unlocked ? `查看第${index + 1}关${level.name}` : `第${index + 1}关尚未解锁`}
                onClick={() => onSelect(index)}
              >
                <div className="level-list-number">{String(index + 1).padStart(2, "0")}</div>
                <div className="level-list-scene"><i /><span /></div>
                <div className="level-list-copy">
                  <span>{completed ? "已完成" : currentLevel === index ? "当前关卡" : unlocked ? "已解锁" : "尚未解锁"}</span>
                  <strong>{unlocked ? level.name : "未知的童年场景"}</strong>
                  <small>{unlocked ? level.note : "完成上一关后揭晓"}</small>
                </div>
                <div className="level-list-status">{!unlocked ? "锁" : completed ? "✓" : "›"}</div>
              </Button>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function LevelDetailScreen({
  levelIndex,
  completed,
  onBack,
  onEnter,
}: {
  levelIndex: number;
  completed: boolean;
  onBack: () => void;
  onEnter: () => void;
}) {
  const detail = levels[levelIndex];
  return (
    <main className="profile-shell">
      <section className="profile-screen level-detail-page">
        <div className="profile-topbar">
          <Button className="profile-back" label="返回关卡列表" onClick={onBack}>‹</Button>
          <div><strong>关卡详情</strong><span>童年地图</span></div>
          <div />
        </div>
        <div className={`level-detail-scene mood-${detail.mood}`}>
          <SceneBackdrop level={levelIndex + 1} />
          <div className="detail-chapter">第 {String(levelIndex + 1).padStart(2, "0")} 关</div>
          <div className="detail-status">{completed ? "已完成" : "等待挑战"}</div>
        </div>
        <div className="level-detail-body">
          <span>本关场景</span>
          <strong>{detail.name}</strong>
          <div className="detail-note">{detail.note}</div>
          <div className="detail-description">{detail.description}</div>
          <div className="detail-goals">
            <div><i>01</i><span><strong>清除全部野草</strong><small>观察不同草种需要的击数</small></span></div>
            <div><i>02</i><span><strong>保持连续挥击</strong><small>连击越高，额外得分越多</small></span></div>
            <div><i>03</i><span><strong>注意棍子耐久</strong><small>耐久耗尽前完成本关</small></span></div>
          </div>
          <Button className="detail-enter-button" onClick={onEnter}>
            {completed ? "再次挑战" : "进入关卡"} <b>›</b>
          </Button>
        </div>
      </section>
    </main>
  );
}

function PokeweedPlant({ hit, defeated, leafLoss, fruitBurst }: { hit: boolean; defeated: boolean; leafLoss: number; fruitBurst: boolean }) {
  return (
    <div className={`pokeweed-plant ${hit ? "is-hit" : ""} ${fruitBurst ? "fruit-burst" : ""} ${defeated ? "is-defeated" : ""}`}>
      <span className="pokeweed-shadow" />
      <span className="pokeweed-stalk" />
      <span className="poke-branch branch-one" />
      <span className="poke-branch branch-two" />
      <span className="poke-branch branch-three" />
      <span className="poke-branch branch-four" />
      {Array.from({ length: 10 }).map((_, index) => <span className={`poke-leaf poke-leaf-${index + 1} ${index < leafLoss ? "is-plucked" : ""}`} key={index}><i /></span>)}
      <span className="fruit-connector connector-main" />
      <span className="fruit-connector connector-left" />
      <span className="fruit-connector connector-right" />
      <span className="berry-stem berry-main">{Array.from({ length: 28 }).map((_, index) => <i key={index} />)}</span>
      <span className="berry-stem berry-left">{Array.from({ length: 12 }).map((_, index) => <i key={index} />)}</span>
      <span className="berry-stem berry-right">{Array.from({ length: 12 }).map((_, index) => <i key={index} />)}</span>
    </div>
  );
}

function HiddenLevelScreen({
  weapon,
  durability,
  energy,
  onBack,
  onUseWeapon,
}: {
  weapon: Weapon;
  durability: number;
  energy: number;
  onBack: () => void;
  onUseWeapon: () => boolean;
}) {
  const [health, setHealth] = useState(30);
  const [flying, setFlying] = useState(false);
  const [hit, setHit] = useState(false);
  const [defeated, setDefeated] = useState(false);
  const [impact, setImpact] = useState<"fruit" | "leaf" | null>(null);
  const [juiceSplats, setJuiceSplats] = useState<number[]>([]);
  const [fallenLeaves, setFallenLeaves] = useState<number[]>([]);

  const attack = (kind: "fruit" | "leaf") => {
    if (flying || defeated || !onUseWeapon()) return;
    setImpact(kind);
    setFlying(true);
    window.setTimeout(() => {
      setHit(true);
      if (kind === "fruit") {
        setJuiceSplats((current) => [...current, Date.now()].slice(-4));
      } else {
        setFallenLeaves((current) => [...current, Date.now()].slice(-10));
      }
      setHealth((value) => {
        const next = Math.max(0, value - weapon.power);
        if (next === 0) setDefeated(true);
        return next;
      });
    }, 330);
    window.setTimeout(() => setFlying(false), 470);
    window.setTimeout(() => {
      setHit(false);
      setImpact(null);
    }, 650);
  };

  return (
    <main className="hidden-level-shell">
      <section className="hidden-level-screen">
        <div className="hidden-level-top">
          <Button className="hidden-back" label="离开隐藏关卡" onClick={onBack}>‹</Button>
          <div><span>隐藏关卡</span><strong>商陆秘境</strong></div>
          <div className="hidden-weapon-mini"><Stick color={weapon.color} /><span>{durability}</span></div>
        </div>
        <div className="hidden-level-field">
          <div className="forest-light" />
          <div className="forest-trunks"><i /><i /><i /><i /></div>
          <div className="forest-floor" />
          <div className="hidden-level-copy"><span>全场景通关后解锁</span><strong>深紫果穗 · 商陆</strong><small>整株目标 · 生命 {health} / 30</small></div>
          <div className="poke-health"><i><b style={{ width: `${(health / 30) * 100}%` }} /></i><span>{health}</span></div>
          <div className="pokeweed-target">
            <PokeweedPlant defeated={defeated} fruitBurst={hit && impact === "fruit"} hit={hit} leafLoss={fallenLeaves.length} />
            <Button className="fruit-hit-zone" disabled={defeated} label="击打商陆果穗" onClick={() => attack("fruit")} />
            <Button className="leaf-hit-zone" disabled={defeated} label="击打商陆叶片" onClick={() => attack("leaf")} />
          </div>
          {juiceSplats.map((id, index) => (
            <div className={`juice-splatter splatter-${index % 4}`} key={id}>
              <i className="juice-blot" />
              {Array.from({ length: 9 }).map((_, drop) => <span className={`juice-drop drop-${drop + 1}`} key={drop} />)}
            </div>
          ))}
          <div className="fallen-leaf-layer">
            {fallenLeaves.map((id, index) => <i className={`falling-poke-leaf falling-leaf-${index % 6}`} key={id}><span /></i>)}
          </div>
          {flying && <div className="hidden-flying-stick"><Stick color={weapon.color} /></div>}
          {!defeated && <div className="hidden-instruction">{durability <= 0 ? "棍子耐久耗尽" : energy < 4 ? "体力不足，休息一下" : "点击整株商陆挥棍"}</div>}
          {defeated && (
            <div className="hidden-victory">
              <span>隐藏目标已清除</span>
              <strong>商陆倒下了！</strong>
              <small>完整观察到紫红茎、宽叶与深紫果穗</small>
              <Button onClick={onBack}>带着秘密离开</Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function SnackScreen({ complete, onDone }: { complete: boolean; onDone: () => void }) {
  return (
    <main className="snack-shell">
      <section className={`snack-screen ${complete ? "is-complete" : ""}`}>
        <div className="snack-top">
          <span>今日挥棍 · 1000 / 1000</span>
          <strong>体力补给事件</strong>
        </div>
        <div className="snack-scene">
          <div className="snack-sun" />
          <div className="snack-school"><i /><i /><i /><span>学校</span></div>
          <div className="snack-wall" />
          <div className="snack-ground" />
          <div className="senior-kid kid-figure"><i className="figure-head" /><i className="figure-body" /><i className="figure-arm" /><i className="figure-legs" /></div>
          <div className="junior-kid kid-figure"><i className="figure-head" /><i className="figure-body" /><i className="figure-arm" /><i className="figure-legs" /></div>
          <div className="snack-packet"><span>辣条</span><i /></div>
          <div className="energy-sparks"><i /><i /><i /><i /><i /></div>
          <div className="snack-dialog dialog-one">有辣条吗？</div>
          <div className="snack-dialog dialog-two">分你一包！</div>
        </div>
        <div className="snack-story">
          <div className="snack-kicker">{complete ? "补给完成" : "放学后 · 校墙边"}</div>
          <div className="snack-title">{complete ? "满血复活！" : "去要一包辣条"}</div>
          <div className="snack-description">
            {complete ? "熟悉的味道让体力恢复到了 100" : "低年级小伙伴从书包里摸出一包，掰下一半递了过来。"}
          </div>
          <div className="snack-energy">
            <div><span>体力</span><strong>{complete ? "100 / 100" : "补充中…"}</strong></div>
            <i><b /></i>
          </div>
          {complete ? (
            <Button className="snack-done" onClick={onDone}>满体力回家 <strong>›</strong></Button>
          ) : (
            <div className="snack-wait"><i /><i /><i /><span>正在接过辣条</span></div>
          )}
          <div className="daily-note">今天已经挥满 1000 次，明天再继续打草</div>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [screen, setScreen] = useState<"official" | "privacy" | "home" | "game" | "profile" | "grassCatalog" | "stickCatalog" | "levelMap" | "levelDetail" | "hiddenLevel" | "snack" | "logo" | "appStore">(
    () => new URLSearchParams(window.location.search).get("design") === "app-store" ? "appStore" : "official",
  );
  const [profile, setProfile] = useState<PlayerProfile>(loadProfile);
  const [introing, setIntroing] = useState(true);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [detailLevel, setDetailLevel] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedWeapon, setSelectedWeapon] = useState(0);
  const [weaponPanelOpen, setWeaponPanelOpen] = useState(false);
  const [durability, setDurability] = useState<number[]>(loadDurability);
  const [completedLevels, setCompletedLevels] = useState<number[]>(loadCompletedLevels);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>(loadDailyProgress);
  const [snackComplete, setSnackComplete] = useState(false);
  const [snackPreview, setSnackPreview] = useState(false);
  const [weeds, setWeeds] = useState(() => arrangeWeeds(0));
  const [score, setScore] = useState(0);
  const [energy, setEnergy] = useState(76);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(12);
  const [lastHit, setLastHit] = useState<number | null>(null);
  const [flyingTo, setFlyingTo] = useState<number | null>(null);
  const [breakingId, setBreakingId] = useState<number | null>(null);
  const [floating, setFloating] = useState<{ id: number; value: number } | null>(null);
  const [records, setRecords] = useState<GrassRecord[]>(loadGrassRecords);
  const [totalStrikes, setTotalStrikes] = useState(loadTotalStrikes);

  const remaining = useMemo(() => weeds.reduce((sum, weed) => sum + weed.hits, 0), [weeds]);
  const currentWeapon = weapons[selectedWeapon];
  const goldenStaffUnlocked = completedLevels.length === levels.length;
  const currentDurability = durability[selectedWeapon];
  const durabilityPercent = (currentDurability / currentWeapon.maxDurability) * 100;
  const level = levels[currentLevel];
  useEffect(() => {
    if (screen !== "game") return;
    setIntroing(true);
    const timer = window.setTimeout(() => setIntroing(false), 5600);
    return () => window.clearTimeout(timer);
  }, [currentLevel, screen]);

  const flyingWeed = flyingTo === null ? null : weeds.find((weed) => weed.id === flyingTo);
  const isLevelUnlocked = (index: number) => index === 0 || completedLevels.includes(index - 1);

  const strike = useCallback(
    (id: number) => {
      if (introing || energy < 4 || currentDurability <= 0 || dailyProgress.count >= 1000 || flyingTo !== null || breakingId !== null) return;
      const target = weeds.find((weed) => weed.id === id);
      if (!target) return;

      const damage = currentWeapon.power;
      const defeated = target.hits <= damage;
      const nextCombo = combo + 1;
      const gain = defeated ? target.points + Math.min(nextCombo, 10) * 2 : 5;

      setFlyingTo(id);
      setTotalStrikes((value) => value + 1);
      setDailyProgress((current) => ({ ...current, count: Math.min(1000, current.count + 1) }));
      setDurability((current) => current.map((value, index) => index === selectedWeapon ? Math.max(0, value - 1) : value));
      setEnergy((value) => Math.max(0, value - 4));
      window.setTimeout(() => {
        setLastHit(id);
        setScore((value) => value + gain);
        setCombo(nextCombo);
        setBestCombo((value) => Math.max(value, nextCombo));
        setFloating({ id, value: gain });

        if (defeated) {
          setBreakingId(id);
          setRecords((current) => [{
            id: `${Date.now()}-${id}`,
            weed: target.name,
            level: currentLevel + 1,
            scene: level.name,
            points: gain,
            time: "刚刚",
          }, ...current].slice(0, 50));
          window.setTimeout(() => {
            setWeeds((current) => {
              const nextWeeds = current.filter((weed) => weed.id !== id);
              if (nextWeeds.length === 0) {
                setCompletedLevels((completed) => {
                  if (completed.includes(currentLevel)) return completed;
                  const next = [...completed, currentLevel].sort((a, b) => a - b);
                  if (next.length === levels.length) {
                    window.setTimeout(() => setRewardOpen(true), 650);
                  }
                  return next;
                });
              }
              return nextWeeds;
            });
            setBreakingId(null);
          }, 620);
        } else {
          setWeeds((current) =>
            current.map((weed) => (weed.id === id ? { ...weed, hits: weed.hits - damage } : weed)),
          );
        }
      }, 330);
      window.setTimeout(() => setFlyingTo(null), 430);
      window.setTimeout(() => setLastHit(null), 570);
      window.setTimeout(() => setFloating(null), 950);
    },
    [breakingId, introing, combo, currentDurability, currentLevel, currentWeapon.power, dailyProgress.count, energy, flyingTo, level.name, selectedWeapon, weeds],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setEnergy((value) => Math.min(100, value + 1));
    }, 1200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("wild-grass-profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    window.localStorage.setItem("wild-grass-records", JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    window.localStorage.setItem("wild-grass-strikes", String(totalStrikes));
  }, [totalStrikes]);

  useEffect(() => {
    window.localStorage.setItem("wild-grass-durability", JSON.stringify(durability));
  }, [durability]);

  useEffect(() => {
    window.localStorage.setItem("wild-grass-completed-levels", JSON.stringify(completedLevels));
  }, [completedLevels]);

  useEffect(() => {
    window.localStorage.setItem("wild-grass-daily-progress", JSON.stringify(dailyProgress));
  }, [dailyProgress]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDailyProgress((current) =>
        current.date === todayKey() ? current : { date: todayKey(), count: 0, claimedSnack: false },
      );
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (screen !== "snack") return;
    setSnackComplete(false);
    const timer = window.setTimeout(() => {
      setEnergy(100);
      if (!snackPreview) {
        setDailyProgress((current) => ({ ...current, claimedSnack: true }));
      }
      setSnackComplete(true);
    }, 4300);
    return () => window.clearTimeout(timer);
  }, [screen, snackPreview]);

  const restart = () => {
    setWeeds(arrangeWeeds(currentLevel));
    setEnergy(100);
    setCombo(0);
    setScore(0);
    setFlyingTo(null);
    setBreakingId(null);
  };

  const changeLevel = (index: number) => {
    if (flyingTo !== null || breakingId !== null || !isLevelUnlocked(index)) return;
    setCurrentLevel(index);
    setWeeds(arrangeWeeds(index));
    setEnergy(100);
    setCombo(0);
    setScore(0);
    setLastHit(null);
    setFloating(null);
  };

  const startFromBeginning = () => {
    setCurrentLevel(0);
    setWeeds(arrangeWeeds(0));
    setEnergy(100);
    setCombo(0);
    setScore(0);
    setScreen("game");
  };

  const useHiddenWeapon = () => {
    if (energy < 4 || currentDurability <= 0 || dailyProgress.count >= 1000) return false;
    setEnergy((value) => Math.max(0, value - 4));
    setDurability((current) => current.map((value, index) => index === selectedWeapon ? Math.max(0, value - 1) : value));
    setTotalStrikes((value) => value + 1);
    setDailyProgress((current) => ({ ...current, count: Math.min(1000, current.count + 1) }));
    return true;
  };

  if (screen === "official") {
    return <OfficialWebsite onPlay={() => setScreen("home")} onPrivacy={() => setScreen("privacy")} />;
  }

  if (screen === "privacy") {
    return <PrivacyPolicy onBack={() => setScreen("official")} onPlay={() => setScreen("home")} />;
  }

  if (screen === "home") {
    return (
      <HomeScreen
        bestCombo={bestCombo}
        currentLevel={currentLevel}
        discoveredCount={new Set(records.map((record) => record.weed)).size}
        hiddenUnlocked={goldenStaffUnlocked}
        onRestart={startFromBeginning}
        onStart={() => setScreen("game")}
        onProfile={() => setScreen("profile")}
        onLogo={() => setScreen("logo")}
        onAppStore={() => setScreen("appStore")}
        onHiddenLevel={() => setScreen("hiddenLevel")}
        onSnackPreview={() => {
          setSnackPreview(true);
          setScreen("snack");
        }}
      />
    );
  }

  if (screen === "logo") {
    return <LogoDesign onBack={() => setScreen("home")} />;
  }

  if (screen === "appStore") {
    return <AppStoreDesign onBack={() => setScreen("home")} />;
  }

  if (screen === "profile") {
    return (
      <ProfileScreen
        completedLevels={completedLevels}
        onBack={() => setScreen("game")}
        onGrassCatalog={() => setScreen("grassCatalog")}
        onHome={() => setScreen("home")}
        onLevelMap={() => setScreen("levelMap")}
        onStickCatalog={() => setScreen("stickCatalog")}
        onSaveProfile={setProfile}
        profile={profile}
        records={records}
        totalStrikes={totalStrikes}
      />
    );
  }

  if (screen === "grassCatalog") {
    return <GrassCatalogScreen onBack={() => setScreen("profile")} records={records} />;
  }

  if (screen === "stickCatalog") {
    return <StickCatalogScreen completedLevels={completedLevels} durability={durability} onBack={() => setScreen("profile")} />;
  }

  if (screen === "levelMap") {
    return (
      <LevelMapScreen
        completedLevels={completedLevels}
        currentLevel={currentLevel}
        onBack={() => setScreen("profile")}
        onSelect={(index) => {
          setDetailLevel(index);
          setScreen("levelDetail");
        }}
      />
    );
  }

  if (screen === "levelDetail") {
    return (
      <LevelDetailScreen
        completed={completedLevels.includes(detailLevel)}
        levelIndex={detailLevel}
        onBack={() => setScreen("levelMap")}
        onEnter={() => {
          changeLevel(detailLevel);
          setScreen("game");
        }}
      />
    );
  }

  if (screen === "hiddenLevel") {
    return (
      <HiddenLevelScreen
        durability={currentDurability}
        energy={energy}
        onBack={() => setScreen("home")}
        onUseWeapon={useHiddenWeapon}
        weapon={currentWeapon}
      />
    );
  }

  if (screen === "snack") {
    return <SnackScreen complete={snackComplete} onDone={() => {
      setSnackPreview(false);
      setScreen("home");
    }} />;
  }

  return (
    <main className="app-shell">
      <nav className="topbar">
        <div className="brand">
          <div className="brand-mark"><span /></div>
          <div>
            <div className="brand-name">野草大作战</div>
            <div className="brand-subtitle">童年田野计划</div>
          </div>
        </div>
        <div className="memory-stamp">80 / 90 后限定回忆</div>
        <div className="top-actions">
          <div className="audio-icon" aria-label="声音已开启"><i /><i /><i /></div>
          <div className="avatar-menu-wrap">
            <Button className="avatar" label="打开菜单" onClick={() => setAvatarMenuOpen((open) => !open)}>田</Button>
            {avatarMenuOpen && (
              <>
                <div className="avatar-menu-mask" onClick={() => setAvatarMenuOpen(false)} />
                <div className="avatar-menu" role="menu">
                  <button type="button" role="menuitem" onClick={() => { setAvatarMenuOpen(false); setScreen("profile"); }}>个人中心</button>
                  <button type="button" role="menuitem" onClick={() => { setAvatarMenuOpen(false); setScreen("home"); }}>结束游戏</button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="page-grid">
        <aside className="side-panel">
          <Button className={`weapon-entry ${currentDurability <= 0 ? "is-broken" : ""}`} label="查看和更换棍子" onClick={() => setWeaponPanelOpen(true)}>
            <div className="entry-stick"><Stick color={currentWeapon.color} /></div>
            <div className="entry-weapon-copy">
              <span>当前棍子</span>
              <strong>{currentWeapon.name}</strong>
              <div className="entry-durability">
                <i><b style={{ width: `${durabilityPercent}%` }} /></i>
                <small>{currentDurability} / {currentWeapon.maxDurability}</small>
              </div>
            </div>
            <div className="entry-power"><span>攻击</span><strong>{currentWeapon.power}×</strong></div>
            <div className="entry-change">更换 <b>›</b></div>
          </Button>
        </aside>

        <section className="game-column">
          <div className="status-row">
            <div className="stat-card">
              <div className="stat-label">本局得分</div>
              <div className="stat-value">{score.toLocaleString("zh-CN")}</div>
            </div>
            <div className="energy-card">
              <div className="energy-copy"><span>体力</span><strong>{energy}/100</strong></div>
              <div className="energy-track"><span style={{ width: `${energy}%` }} /></div>
            </div>
            <div className="stat-card combo-card">
              <div className="stat-label">今日挥棍</div>
              <div className="stat-value daily-value">{dailyProgress.count}<small> / 1000</small></div>
            </div>
          </div>

          <div className={`game-field mood-${level.mood}`}>
            <SceneBackdrop level={currentLevel + 1} />
            <div className="mobile-level-nav">
              <Button
                className="level-arrow"
                disabled={currentLevel === 0}
                label="上一关"
                onClick={() => changeLevel(currentLevel - 1)}
              >
                ‹
              </Button>
              <div>
                <span>{String(currentLevel + 1).padStart(2, "0")} / 20</span>
                <strong>{level.name}</strong>
              </div>
              <Button
                className="level-arrow"
                disabled={currentLevel === 19 || !isLevelUnlocked(currentLevel + 1)}
                label="下一关"
                onClick={() => changeLevel(currentLevel + 1)}
              >
                ›
              </Button>
            </div>
            <div className="field-title">
              <span>第 {String(currentLevel + 1).padStart(2, "0")} 关</span>
              <strong>{level.name}</strong>
              <small>{level.note}</small>
            </div>
            {introing && <div className="level-intro" key={`intro-${currentLevel}`} aria-hidden="true">
              <div className="intro-task">
                <span>第 {String(currentLevel + 1).padStart(2, "0")} 关 · 任务</span>
                <strong>{level.name}</strong>
                <small>{level.note}</small>
              </div>
              <div className="intro-hero"><StudentFace className="intro-face" /></div>
            </div>}
            <div className="field-meta">剩余 {remaining} 击 · {combo} 连击</div>
            <div className="ground-lines" />

            {weeds.map((weed) => (
              <Button
                className={`weed-target target-${weed.size}`}
                key={weed.id}
                label={`打击${weed.name}，还需${weed.hits}击`}
                onClick={() => strike(weed.id)}
                style={{ left: `${weed.left}%`, top: `${weed.top}%` }}
              >
                <div className="hit-count">{weed.hits}</div>
                <WeedPlant weed={weed} damaged={lastHit === weed.id} breaking={breakingId === weed.id} />
                <div className="weed-tag">{weed.name}<span>+{weed.points}</span></div>
                {floating?.id === weed.id && <div className="floating-score">+{floating.value}</div>}
              </Button>
            ))}

            {flyingWeed && (
              <div
                className="flying-stick"
                style={{
                  "--flight-x": `${flyingWeed.left}%`,
                  "--flight-y": `${flyingWeed.top}%`,
                } as CSSProperties}
              >
                <Stick color={currentWeapon.color} />
                <span className="flight-trail" />
              </div>
            )}

            <div className={`player-stick ${introing ? "is-hidden" : ""}`}>
              <Stick color={currentWeapon.color} active={lastHit !== null} />
              <div className="hand" />
            </div>

            {weeds.length === 0 && (
              <div className="victory-card">
                <div className="victory-kicker">干得漂亮</div>
                <div className="victory-title">这一片，清爽了！</div>
                <div className="victory-score">本局得分 {score}</div>
                <Button className="primary-button" onClick={() => currentLevel < 19 ? changeLevel(currentLevel + 1) : restart()}>
                  {currentLevel < 19 ? "去下一关" : "再来一局"}
                </Button>
              </div>
            )}
            {dailyProgress.count >= 1000 ? (
              dailyProgress.claimedSnack ? (
                <div className="rest-tip daily-limit-reached">今日已挥满 1000 次</div>
              ) : (
                <Button className="rest-tip snack-tip" onClick={() => {
                  setSnackPreview(false);
                  setScreen("snack");
                }}>今日满额 · 去要辣条</Button>
              )
            ) : currentDurability <= 0 && weeds.length > 0 ? (
              <Button className="rest-tip broken-tip" onClick={() => setWeaponPanelOpen(true)}>棍子坏了，点击更换</Button>
            ) : energy < 4 && weeds.length > 0 && <div className="rest-tip">歇口气，体力正在恢复…</div>}
          </div>

          <div className="bottom-panel">
            <div>
              <span className="tip-number">01</span>
              <span className="tip-copy"><strong>点击野草挥棍</strong><small>不同野草需要不同击数</small></span>
            </div>
            <div>
              <span className="tip-number">02</span>
              <span className="tip-copy"><strong>保持连续挥击</strong><small>连击越高，额外得分越多</small></span>
            </div>
            <div className="best-record">
              <span>今日最佳</span>
              <strong>{Math.max(bestCombo, 12)} 连击</strong>
            </div>
          </div>
        </section>
      </div>
      {weaponPanelOpen && (
        <div className="weapon-sheet-layer" role="presentation" onClick={() => setWeaponPanelOpen(false)}>
          <div className="weapon-sheet" role="dialog" aria-modal="true" aria-label="棍子仓库" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-head">
              <div><span>装备仓库</span><strong>选根趁手的家伙</strong></div>
              <Button className="sheet-close" label="关闭" onClick={() => setWeaponPanelOpen(false)}>×</Button>
            </div>
            <div className="sheet-weapon-list">
              {weapons.map((weapon, index) => {
                const value = durability[index];
                const percent = (value / weapon.maxDurability) * 100;
                const locked = index === 3 && !goldenStaffUnlocked;
                return (
                  <Button
                    className={`sheet-weapon-card ${selectedWeapon === index ? "selected" : ""} ${value <= 0 ? "broken" : ""}`}
                    disabled={locked}
                    key={weapon.name}
                    label={`选择${weapon.name}`}
                    onClick={() => {
                      setSelectedWeapon(index);
                      setWeaponPanelOpen(false);
                    }}
                  >
                    <div className="sheet-stick"><Stick color={weapon.color} /></div>
                    <div className="sheet-weapon-copy"><strong>{weapon.name}</strong><span>{locked ? "通过全部 20 关解锁" : weapon.level} · 攻击 {weapon.power}×</span></div>
                    <div className="sheet-durability"><span>{value <= 0 ? "已损坏" : "耐久度"}</span><i><b style={{ width: `${percent}%` }} /></i><small>{value}/{weapon.maxDurability}</small></div>
                    {selectedWeapon === index && <div className="equipped-mark">使用中</div>}
                    {locked && <div className="sheet-lock">锁</div>}
                  </Button>
                );
              })}
            </div>
            <Button
              className="repair-button"
              onClick={() => setDurability(weapons.map((weapon) => weapon.maxDurability))}
            >
              <span>回村修理全部棍子</span><strong>免费</strong>
            </Button>
            <div className="sheet-note">每次挥棍消耗 1 点耐久，耐久归零后需要更换或修理</div>
          </div>
        </div>
      )}
      {rewardOpen && (
        <div className="reward-layer">
          <div className="reward-burst"><i /><i /><i /><i /><i /><i /></div>
          <div className="reward-card">
            <div className="reward-kicker">二十关全部完成</div>
            <div className="reward-title">童年英雄，凯旋而归</div>
            <div className="reward-stick"><Stick color="gold" /></div>
            <div className="reward-name">金箍棒</div>
            <div className="reward-desc">攻击 5× · 耐久 100<br />这是属于田野冠军的最终奖励</div>
            <Button
              className="reward-claim"
              onClick={() => {
                setDurability((current) => current.map((value, index) => index === 3 ? weapons[3].maxDurability : value));
                setSelectedWeapon(3);
                setRewardOpen(false);
              }}
            >
              收下金箍棒
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
