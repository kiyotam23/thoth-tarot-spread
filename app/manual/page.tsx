"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Lang = "jp" | "en";

type Section = {
  title: string;
  body: string[];
};

function renderManualLine(line: string, key: string) {
  if (line.startsWith("【") || line.startsWith("[")) {
    return (
      <p key={key} className="pt-2 text-sm font-semibold tracking-wide text-indigo-100/95 sm:text-base">
        {line}
      </p>
    );
  }

  if (line.startsWith("Case ")) {
    return (
      <p key={key} className="pt-2 text-sm font-semibold leading-relaxed text-slate-100 sm:text-base">
        {line}
      </p>
    );
  }

  if (line.startsWith("Mode: ")) {
    return (
      <p key={key} className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium tracking-wide text-slate-200/92 sm:text-sm">
        {line}
      </p>
    );
  }

  if (line === "デバッガーの視点:" || line === "Debugger's viewpoint:") {
    return (
      <p key={key} className="pt-3 text-sm font-semibold text-indigo-100/95 sm:text-base">
        {line}
      </p>
    );
  }

  if (line.startsWith("・") || line.startsWith("•")) {
    return (
      <p key={key} className="pl-1 text-xs leading-relaxed text-slate-200/90 sm:text-sm">
        {line}
      </p>
    );
  }

  return (
    <p key={key} className="text-xs leading-7 text-slate-200/90 sm:text-sm sm:leading-7">
      {line}
    </p>
  );
}

const MANUAL_JP = {
  pageTitle: "ATHANOR 実践デバッグ・マニュアル",
  subtitle:
    "因果律エディタ『ATHANOR』を用いて、現実のバグを特定・修正するための実践ガイド。",
  protocolHeaders: ["モード", "プロトコル", "システムカラー", "役割", "概要"],
  protocols: [
    ["Descending (下降)", "WILL", "RED", "Creator", "意志を現実にデプロイする（攻め）"],
    ["Ascending (上昇)", "GAZE", "BLUE", "Debugger", "現実をソースへ遡行する（解析）"],
    ["Spectrum (非線形)", "FATE", "PURPLE", "Analyzer", "全方位サンプリング（相性・本質）"]
  ],
  sections: [
    {
      title: "1. プロトコル定義",
      body: [
        "モードごとの方向と役割を定義する。システムカラーはUI全体と直結する。"
      ]
    },
    {
      title: "2. SEED（第1カード）の決定",
      body: [
        "開始時、起点となるセフィラに置く最初の1枚を決定する。プロトコルごとに使用カード種は厳格に定義される。",
        "Manual Selection（指定）: 意図を持って解析する。",
        "・WILL: 四大元素（スート）をケテル(1)に置く。",
        "・GAZE: 惑星（Planets）をマルクト(10)に置く。",
        "・FATE: 星座（Zodiac）をティファレト(6)に置く。",
        "Full Random（委ねる）: 自己欺瞞を排除し、盲点を突く。"
      ]
    },
    {
      title: "3. 実践レシピ：因果律のトラブルシューティング",
      body: [
        "難解なシステムを日常の悩みへ翻訳するためのケーススタディ。GAZEモードでは現状の象徴として必ず「惑星」をSEEDに用いる。",
        "【ビジネス・制作】",
        "Case 01: プレゼン直前「この企画、通る気がしない」",
        "Mode: WILL (RED) / Seed: Swords (風のエース)",
        "論理（Swords）が現実（10）に降りるまでのパスを解析。途中に感情のノイズ（Cups）や過剰なこだわり（Fixed）が挟まっていないか。そこが「企画をボツにするバグ」です。",
        "Case 02: 新規事業立ち上げ「情熱はあるが、形にならない」",
        "Mode: WILL (RED) / Seed: Wands (火のエース)",
        "解析のツボ: 1.Ketherにセットした「火」の推進力が、現実（10）に届くまでにどこで「失速」しているかを確認。途中にSwords（理屈）が多すぎて火が消されていないか、あるいはCups（不安）が水を差していないか。動けない原因となっている「冷却バグ」を特定します。",
        "Case 03: クライアントワーク「要件定義がまとまらない」",
        "Mode: FATE (PURPLE) / Seed: Mutable (柔軟宮の星座)",
        "「調整」をハブにした際、どの階層が不協和音を起こしているかを確認。2.Chokmah（着想）と3.Binah（構造）のバランスが崩れている場合、設計そのものに無理があります。",
        "【自己管理・メンタル】",
        "Case 04: 謎の体調不良やメンタル低下「何が原因か不明」",
        "Mode: GAZE (BLUE) / Seed: Moon (月)",
        "身体・バイオリズムを司る「月」を10.Malkuthにセット。そこから1.Ketherへ遡り、どの階層でリズムを乱すノイズが混入したか、または自分へのケアを忘れたかを特定します。",
        "Case 05: 新しい習慣が「三日坊主で終わる」",
        "Mode: GAZE (BLUE) / Seed: Saturn (土星)",
        "「継続・習慣化の不全」という制限（土星）を10.Malkuthにセット。理想（1）からこの制限（10）に至るまでのルートを逆行解析し、意志を挫いているバグを特定します。",
        "【対人関係・育児】",
        "Case 06: 難しい相手との「距離感がわからない」",
        "Mode: FATE (PURPLE) / Seed: 相手の星座",
        "その人を宇宙の中心に据えた時、自分（特定のセフィラ）との間にどんなカードが出ているか。反発しているなら、別の役割（セフィラ）経由で接するルートを探ります。",
        "Case 07: 息子との「対話が噛み合わない」",
        "Mode: GAZE (BLUE) / Seed: Mercury (水星)",
        "コミュニケーションの象徴である「水星」を10.Malkuthにセット。情報の伝達がどの階層でブロックされているか遡行デバッグ。5.Geburah（厳格さ）の過剰などが浮き彫りになります。",
        "デバッガーの視点:",
        "・RED (WILL): 意志(1)を現実(10)へ。Seedは四大元素。",
        "・BLUE (GAZE): 現実(10)を根源(1)へ。Seedは惑星。",
        "・PURPLE (FATE): 中心(6)から全方位へ。Seedは星座。"
      ]
    }
  ],
  footer: "ATHANOR Operational Manual v0.1 - 2026.04.28"
};

const MANUAL_EN = {
  pageTitle: "ATHANOR Practical Debug Manual",
  subtitle:
    "A practical guide to identify and fix reality-level bugs with the causality editor ATHANOR.",
  protocolHeaders: ["Mode", "Protocol", "System Color", "Role", "Summary"],
  protocols: [
    ["Descending", "WILL", "RED", "Creator", "Deploy intent into reality (offense)"],
    ["Ascending", "GAZE", "BLUE", "Debugger", "Trace reality back to source (analysis)"],
    ["Spectrum", "FATE", "PURPLE", "Analyzer", "Omnidirectional sampling (compatibility and essence)"]
  ],
  sections: [
    {
      title: "1. Protocol Definition",
      body: [
        "Defines directional behavior and role per mode. System colors are directly mapped to UI semantics."
      ]
    },
    {
      title: "2. SEED (First Card) Decision",
      body: [
        "At initialization, determine the first card to be placed on the starting Sephirah. Card families are strictly defined by protocol.",
        "Manual Selection: Analyze with explicit intent.",
        "• WILL: Place the four-element suit at Kether (1).",
        "• GAZE: Place a planet at Malkuth (10).",
        "• FATE: Place a zodiac sign at Tiphareth (6).",
        "Full Random: Remove self-deception and expose blind spots."
      ]
    },
    {
      title: "3. Practical Recipes: Causality Troubleshooting",
      body: [
        "Case studies that translate a complex system into everyday concerns. In GAZE mode, use a planet as the SEED to represent the present condition.",
        "[Business / Creative Work]",
        "Case 01: Right before a presentation - \"I feel like this proposal will not pass.\"",
        "Mode: WILL (RED) / Seed: Swords (Ace of Air)",
        "Trace the path until logic (Swords) descends into reality (10). Check for emotional noise (Cups) or excessive fixation (Fixed) in between. That is the bug that kills the proposal.",
        "Case 02: New venture launch - \"We have passion, but it will not take form.\"",
        "Mode: WILL (RED) / Seed: Wands (Ace of Fire)",
        "Analysis focus: check where the fire impulse placed at 1.Kether loses momentum before reaching reality (10). Is excessive Swords (over-logic) extinguishing fire, or are Cups (anxiety) damping it? Identify the cooling bug that blocks execution.",
        "Case 03: Client work - \"We cannot converge on requirements.\"",
        "Mode: FATE (PURPLE) / Seed: Mutable",
        "When 'adjustment' is used as the hub, identify which layer produces dissonance. If the balance between 2.Chokmah (ideation) and 3.Binah (structure) collapses, the design itself is overstrained.",
        "[Self-Management / Mental]",
        "Case 04: Unclear physical or mental decline - \"I do not know the cause.\"",
        "Mode: GAZE (BLUE) / Seed: Moon",
        "Set the Moon at 10.Malkuth as the bodily/biorythmic marker. Trace back to 1.Kether to locate where disruptive noise entered, or where self-care was dropped.",
        "Case 05: A new habit dies within three days.",
        "Mode: GAZE (BLUE) / Seed: Saturn",
        "Set Saturn at 10.Malkuth as the symbol of limitation in continuity. Reverse-analyze the route from ideal (1) to this constraint (10) and identify the bug that breaks willpower.",
        "[Relationships / Parenting]",
        "Case 06: \"I cannot find the right distance\" with a difficult person.",
        "Mode: FATE (PURPLE) / Seed: Their zodiac",
        "When that person is centered as the system core, inspect which cards appear between them and your Sephirah. If direct contact causes friction, route through another role (Sephirah).",
        "Case 07: \"Conversation does not connect\" with my son.",
        "Mode: GAZE (BLUE) / Seed: Mercury",
        "Set Mercury at 10.Malkuth as the communication symbol. Trace where transmission is blocked across layers. Excess 5.Geburah (strictness) often becomes visible as a root factor.",
        "Debugger's viewpoint:",
        "• RED (WILL): From intent (1) to reality (10). Seed = Four elements.",
        "• BLUE (GAZE): From reality (10) to root (1). Seed = Planets.",
        "• PURPLE (FATE): From center (6) to all directions. Seed = Zodiac."
      ]
    }
  ],
  footer: "ATHANOR Operational Manual v0.1 - 2026.04.28"
};

export default function ManualPage() {
  const [lang, setLang] = useState<Lang>("jp");
  const t = useMemo(() => (lang === "jp" ? MANUAL_JP : MANUAL_EN), [lang]);

  return (
    <main className="min-h-screen bg-[#070b14] px-4 py-6 text-slate-100 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-wide sm:text-2xl">{t.pageTitle}</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-100/90 transition hover:bg-white/10 sm:text-sm"
            >
              {lang === "jp" ? "アプリへ戻る" : "Back to App"}
            </Link>
            <div className="inline-flex overflow-hidden rounded-md border border-white/20">
              <button
                type="button"
                onClick={() => setLang("jp")}
                className={`px-3 py-1.5 text-xs sm:text-sm ${lang === "jp" ? "bg-indigo-500/40" : "bg-transparent"}`}
              >
                JP
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-3 py-1.5 text-xs sm:text-sm ${lang === "en" ? "bg-indigo-500/40" : "bg-transparent"}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-slate-200/90">{t.subtitle}</p>

        <section className="mb-6 overflow-hidden rounded-lg border border-white/15">
          <div
            className="grid bg-white/5 text-[11px] font-semibold tracking-wide text-slate-200/90 sm:text-xs"
            style={{ gridTemplateColumns: `repeat(${t.protocolHeaders.length}, minmax(0, 1fr))` }}
          >
            {t.protocolHeaders.map((h) => (
              <div key={h} className="border-b border-white/10 px-2 py-2 sm:px-3">
                {h}
              </div>
            ))}
          </div>
          {t.protocols.map((row) => (
            <div
              key={`${row[0]}-${row[1]}`}
              className="grid text-[11px] sm:text-xs"
              style={{ gridTemplateColumns: `repeat(${t.protocolHeaders.length}, minmax(0, 1fr))` }}
            >
              {row.map((cell, i) => (
                <div key={`${row[0]}-${i}`} className="border-t border-white/10 px-2 py-2 leading-relaxed text-slate-200/90 sm:px-3">
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </section>

        <div className="space-y-4">
          {t.sections.map((section) => (
            <section key={section.title} className="rounded-lg border border-white/10 bg-black/20 p-3 sm:p-4">
              <h2 className="mb-2 text-sm font-semibold text-indigo-100 sm:text-base">{section.title}</h2>
              <div className="space-y-2.5">
                {section.body.map((line, idx) => renderManualLine(line, `${section.title}-${idx}`))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-6 text-[11px] text-slate-300/70">{t.footer}</p>
      </div>
    </main>
  );
}
