"use client";

import { useMemo, useState } from "react";

type Lang = "jp" | "en";

type Section = {
  title: string;
  body: string[];
};

const MANUAL_JP = {
  pageTitle: "ATHANOR 実践デバッグ・マニュアル",
  subtitle:
    "『ATHANOR』を用いた観測・解析手順の定義。",
  protocolHeaders: ["モード", "プロトコル", "システムカラー", "役割", "概要"],
  protocols: [
    ["Descending (下降)", "WILL", "RED", "Creator", "意志を現実にデプロイする。目標達成、攻めの戦略。"],
    ["Ascending (上昇)", "GAZE", "BLUE", "Debugger", "現実をソースへ遡行する。原因究明、トラブルの解読。"],
    ["Spectrum (非線形)", "FATE", "PURPLE", "Analyzer", "順序に縛られない全方位観測。本質や相性の分析。"]
  ],
  sections: [
    {
      title: "1. 3つの基本プロトコル",
      body: [
        "解析の目的に合わせて「方向」を選択する。これらはUIのシステムカラーと直結している。"
      ]
    },
    {
      title: "2. SEED（第1カード）の決定フロー",
      body: [
        "各モード開始時、起点となるセフィラに置く最初の1枚を決定する。",
        "A. シード選択: 特定の意図を持って解析を行う実践モード。",
        "・WILL (RED / 起点: 1.Kether): 使いたい「武器（スート）」を選び、その力がどう降りていくかを見る。",
        "・GAZE (BLUE / 起点: 10.Malkuth): 起きている「現象（惑星）」を選び、その根源がどこにあるかを探る。",
        "・FATE (PURPLE / 起点: 6.Tiphareth): 観測したい「人物・資質（星座）」を選び、周囲との共鳴を見る（日星座・月星座等）。",
        "B. フルランダム（Full Random）: 最初の一枚も含めて、すべてを偶然に委ねる。",
        "・実践的意義: 自己欺瞞の排除。盲点や主観を超えた宇宙の返答をダイレクトに観測する。"
      ]
    },
    {
      title: "3. FATE Protocol における三区分の活用",
      body: [
        "ティファレト（6）に固定した性質が、状況全体に対してどのような役割を果たしているかを解析する。",
        "・活動宮 (Cardinal): 牡羊・蟹・天秤・山羊。役割 = 始動・突破。物事を動かし始めるエネルギーの波及を解析。",
        "・固定宮 (Fixed): 牡牛・獅子・蠍・水瓶。役割 = 維持・固執。変わらない美学や停滞構造をデバッグ。",
        "・柔軟宮 (Mutable): 双子・乙女・射手・魚。役割 = 適応・調整。適応力や関係性の整合性を検証。"
      ]
    },
    {
      title: "4. 実践：デバッグの３ステップ",
      body: [
        "1) PROTO: 方向（RED / BLUE / PURPLE）を選ぶ。",
        "2) SEED: 意図を持ってカードを選ぶ（Manual）か、ランダム（Full Random）に委ねて開始。",
        "3) READ: 展開されたカードの流れを読み解く。",
        "・下降 (WILL): 具現化を阻むノイズを特定し、排除する。",
        "・上昇 (GAZE): 現状を作った元凶（バグ）を特定し、修正する。",
        "・非線形 (FATE): 全方位へのレゾナンス（共鳴）を確認し、調和させる。"
      ]
    }
  ],
  footer: "ATHANOR Operational Manual v3.3 - 2026.04.27"
};

const MANUAL_EN = {
  pageTitle: "ATHANOR Practical Debug Manual",
  subtitle:
    "This document defines practical observation and analysis procedures for the ATHANOR.",
  protocolHeaders: ["Mode", "Protocol", "System Color", "Role", "Summary"],
  protocols: [
    ["Descending", "WILL", "RED", "Creator", "Deploy intent into reality. Goal achievement and offensive strategy."],
    ["Ascending", "GAZE", "BLUE", "Debugger", "Trace reality back to source. Root-cause investigation and troubleshooting."],
    ["Spectrum", "FATE", "PURPLE", "Analyzer", "Omnidirectional observation beyond sequence. Analysis of essence and compatibility."]
  ],
  sections: [
    {
      title: "1. Three Core Protocols",
      body: [
        "Choose a directional mode based on your analysis objective. Each mode directly maps to the UI system color."
      ]
    },
    {
      title: "2. SEED (First Card) Decision Flow",
      body: [
        "At the start of each mode, determine the first card placed on the starting Sephirah.",
        "A. Manual Selection: A practical mode for analysis with explicit intent.",
        "• WILL (RED / Start: 1. Kether): Select the suit you want as your weapon and observe how that force descends.",
        "• GAZE (BLUE / Start: 10. Malkuth): Select the active phenomenon (planet) and trace its root source.",
        "• FATE (PURPLE / Start: 6. Tiphareth): Select a person/trait (zodiac) to observe surrounding resonance (e.g., Sun/Moon signs).",
        "B. Full Random: Leave everything, including the first card, to chance.",
        "• Practical meaning: Eliminates self-deception and directly reveals blind spots or responses beyond subjective bias."
      ]
    },
    {
      title: "3. Threefold Use in the FATE Protocol",
      body: [
        "Analyze how a fixed nature at Tiphareth (6) functions across the entire situation.",
        "• Cardinal: Aries, Cancer, Libra, Capricorn. Role = Initiation/Breakthrough. Analyze waves that start movement.",
        "• Fixed: Taurus, Leo, Scorpio, Aquarius. Role = Maintenance/Attachment. Debug static aesthetics and stalled structures.",
        "• Mutable: Gemini, Virgo, Sagittarius, Pisces. Role = Adaptation/Adjustment. Verify adaptability and relational coherence."
      ]
    },
    {
      title: "4. Practical Three-Step Debug Flow",
      body: [
        "1) PROTO: Choose direction (RED / BLUE / PURPLE).",
        "2) SEED: Start with intentional card selection (Manual) or Full Random.",
        "3) READ: Interpret the developed card flow.",
        "• Descending (WILL): Identify and remove noise that blocks manifestation.",
        "• Ascending (GAZE): Identify and fix the root bug that produced the current state.",
        "• Spectrum (FATE): Confirm omnidirectional resonance and harmonize it."
      ]
    }
  ],
  footer: "ATHANOR Operational Manual v3.3 - 2026.04.27"
};

export default function ManualPage() {
  const [lang, setLang] = useState<Lang>("jp");
  const t = useMemo(() => (lang === "jp" ? MANUAL_JP : MANUAL_EN), [lang]);

  return (
    <main className="min-h-screen bg-[#070b14] px-4 py-6 text-slate-100 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-wide sm:text-2xl">{t.pageTitle}</h1>
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
              <div className="space-y-1.5 text-xs leading-relaxed text-slate-200/90 sm:text-sm">
                {section.body.map((line, idx) => (
                  <p key={`${section.title}-${idx}`}>{line}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-6 text-[11px] text-slate-300/70">{t.footer}</p>
      </div>
    </main>
  );
}
