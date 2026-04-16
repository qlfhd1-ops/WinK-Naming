"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { createClient } from "@/lib/supabase/browser";
import { AppLang, isSupportedLang } from "@/lib/lang-config";
import { addCartItem } from "@/lib/cart";
import NameGenerationScene from "@/components/NameGenerationScene";
import { PRICING, PACKAGES, CATEGORY_PRICING, SHOW_SEAL, SHOW_NAMEPLATE } from "@/lib/pricing";
import { trackEvent } from "@/components/GoogleAnalytics";
import UpgradeModal from "@/components/UpgradeModal";
import PrivacyConsentModal from "@/components/PrivacyConsentModal";
import SealStamp from "@/components/SealStamp";
import type { PlanId } from "@/lib/pricing";
import { Sound, playClick, playTab, playReveal } from "@/lib/sound";

// ─── Types ────────────────────────────────────────────────
type RiskLevel = "low" | "medium" | "high";
type PackageType = "stamp" | "doorplate" | "giftcard";
type TrackType = "safe" | "refined" | "creative";

type BriefPayload = {
  category: string;
  targetName: string;
  familyName: string;
  purpose: string;
  styleKeywords: string;
  avoidKeywords: string;
  targetCountry: string;
  preferredScript: string;
  memo: string;
  needsGlobalPronunciation: boolean;
  needsStampPackage: boolean;
  needsDoorplatePackage: boolean;
  needsGiftCardPackage: boolean;
  lang: "ko" | "en" | "ja" | "zh" | "es" | "ru" | "fr" | "ar" | "hi";
};

type NameResult = {
  rank_order: number;
  track: TrackType;
  name: string;
  hanja?: string;
  hanja_meaning?: string;
  hanja_strokes?: string;
  five_elements?: string;
  phonetic_harmony?: string;
  english: string;
  chinese: string;
  chinese_pinyin: string;
  japanese_kana: string;
  japanese_reading: string;
  meaning: string;
  story: string;
  fit_reason: string;
  teasing_risk: RiskLevel;
  similarity_risk: RiskLevel;
  pronunciation_risk: RiskLevel;
  caution: string;
  connection_analysis?: string;
  score: number;
};

// ─── COPY (ko / en / zh / ja) ────────────────────────────

const BRAND_NAME = "윙크 네이밍";

const COPY = {
  ko: {
    chip: `${BRAND_NAME} Report`,
    title: "이름 설계 보고서",
    sub: "입력하신 목적·분위기·성씨와의 조화·사용성을 함께 검토해 정리한 설계 결과입니다.",
    generatingTitle: "이름을 설계하고 있습니다",
    generatingSub: "성씨 음운 조화, 한자 오행 획수, 발음·의미·인상을 함께 반영하고 있습니다.",
    empty: "저장된 브리프가 없습니다. 설계 페이지에서 다시 입력해 주세요.",
    goDesign: "설계 페이지로 이동",
    saving: "설계 결과를 저장하는 중입니다...",
    saveDone: "브리프와 결과를 저장했습니다.",
    saveFailed: "저장에 실패했습니다.",
    packageDone: "패키지를 선택했고 장바구니에 담았습니다.",
    packageFailed: "패키지 저장에 실패했습니다.",
    errorTitle: "이름 설계 중 오류가 발생했습니다.",
    errorRetry: "다시 시도",
    summaryTitle: "설계 해석 요약",
    summaryBody1: "이번 결과는 단순히 이름을 나열한 것이 아니라, 입력하신 목적과 분위기, 성씨와의 연결감, 실제 사용성을 함께 고려해 정리한 설계안입니다.",
    summaryBody2: "추천안은 역할이 겹치지 않도록 안정형·세련형·창의형 세 방향으로 나누어 구성했습니다.",
    summaryBody3Family: "특히 성씨와 함께 불렸을 때의 리듬과 인상을 우선 확인하는 방식으로 정리했습니다.",
    summaryBody3NoFamily: "현재는 성씨 없이도 자연스럽게 느껴지는 방향을 기준으로 정리했으며, 성을 입력하면 다음 설계에서 더 정교하게 반영할 수 있습니다.",
    brief: "고객 입력 요약",
    top3: "최종 설계안 3가지",
    topPick: "가장 먼저 추천드리는 설계 방향",
    meaning: "설계 의미",
    hanja: "한자 표기",
    hanjaMeaning: "한자 풀이",
    hanjaStrokes: "획수 조합",
    fiveElements: "오행 균형",
    phoneticHarmony: "성씨·음운 조화",
    story: "설계 설명",
    fitReason: "선정 이유",
    globalPron: "표기 / 글로벌 발음",
    firstCheck: "1차 검토 결과",
    teasingRisk: "놀림감 위험",
    similarityRisk: "유사 이름 위험",
    pronunciationRisk: "발음 난이도",
    caution: "최종 확인 메모",
    score: "설계 점수",
    packageTitle: "패키지 선택",
    packageSub: "설계 결과가 마음에 드는 경우에만 아래 패키지를 선택해 주세요.",
    packageNoticeTitle: "패키지 안내",
    packageNoticeBody: "이름 설계 결과 확인은 무료입니다. 아래 패키지는 선택하실 때만 추가 비용이 발생합니다.",
    packageNoticeBody2: "마음에 드는 이름이 없으면 패키지를 선택하지 않고 다시 설계하셔도 됩니다.",
    stamp: "인장 / 도장",
    stampDesc: "이름의 상징성과 소장 가치를 높이는 패키지",
    doorplate: "문패",
    doorplateDesc: "공간에 이름의 의미를 담는 패키지",
    giftCard: "이름 선물 카드",
    giftCardDesc: "이름을 선물처럼 전달하는 카드형 결과물",
    trustTitle: "마지막 확인",
    trustBody1: "이 결과는 고객님이 입력하신 내용을 바탕으로 설계한 추천안입니다. 이름이 마음에 들지 않으면 패키지를 선택하지 않고 다시 설계하실 수 있습니다.",
    trustBody2: "브랜드명·상호명으로 확정하실 경우에는 최종 상표, 도메인, 법률 검토가 별도로 필요합니다.",
    trustBody3: "입력하신 정보는 이름 설계 흐름 안에서 최소 범위로만 사용됩니다.",
    trustPill1: "결과 먼저 무료 확인",
    trustPill2: "패키지는 선택 시에만 과금",
    trustPill3: "최종 검토는 별도 필요",
    startAgain: "다시 설계하기",
    backBrief: "브리프로 돌아가기",
    goCart: "장바구니 보기",
    noneSelected: "마음에 드는 이름이 없어요",
    noneSelectedToast: "고객님의 마음에 드는 이름을 설계하지 못했다면, 한 번 더 설계할 수 있게 해드릴게요.",
    addMoreGenerating: "추가 이름 3개 생성 중...",
    addMoreTitle: "추가 제안 이름",
    selected: "선택됨",
    freeView: "결과 먼저 확인",
    chooseIfLiked: "마음에 들 때만 선택",
    category: "설계 대상",
    purpose: "목적",
    style: "원하는 분위기",
    avoid: "피하고 싶은 느낌",
    country: "주 사용 국가",
    script: "표기 방향",
    targetName: "이름 대상",
    familyName: "성씨",
    memo: "추가 메모",
    trackSafe: "안정형 설계안",
    trackRefined: "세련형 설계안",
    trackCreative: "창의형 설계안",
    trackSafeDesc: "오래 불러도 질리지 않도록 안정성과 호감도를 우선한 방향",
    trackRefinedDesc: "고급감과 확장성을 함께 고려해 정제된 인상을 살린 방향",
    trackCreativeDesc: "흔한 패턴을 피하면서도 실제 사용에서 무리 없도록 설계한 방향",
    connectionAnalysis: "연관성 분석",
    connectionAnalysisDesc: "입력하신 정보와 이 이름의 연관성",
    freeUsageAvailable: "이번 달 무료 체험 가능",
    freeUsageUsed: "이번 달 무료 체험을 사용하셨습니다. 다음 달 1일에 다시 무료로 체험하실 수 있어요.",
    sendCard: "나에게 이름카드 전송",
    sendCardDesc: "이름 카드를 이메일로 받아보세요",
    sendCardEmail: "이메일 주소",
    sendCardSubmit: "이름카드 전송",
    sendCardSending: "전송 중...",
    sendCardDone: "이메일로 전송했습니다.",
    sendCardFailed: "전송에 실패했습니다.",
    purchaseTitle: "원하시는 패키지를 선택해 주세요",
    purchaseSingle: "단품",
    purchasePackage: "패키지 (10% 할인)",
    purchaseReport: "이름 생성 리포트 PDF",
    purchaseStamp: "도장 (인장)",
    purchaseDoorplate: "문패/명패",
    socialMsg: "고객님이 선물하신 이름을 통해\n이름 없이 버려진 아이에게 선물을 줄 수 있게 되었습니다.\n윙크 네이밍은 소외된 아이들이 웃을 수 있게 돕고 있습니다. 🤍",
    arsTitle: "마음에 들지 않으세요?",
    arsDesc: "비용을 지불하신 경우 A/S 차원에서 1회 무료로 재설계해 드립니다.",
    arsBtn: "A/S 재설계 신청",
    arsUsed: "A/S를 이미 사용하셨습니다.",
    giftCardCreate: "이름 선물 카드 만들기",
    giftCardSelectName: "선물할 이름 선택",
    giftCardSender: "보내는 분 이름",
    giftCardRecipient: "받는 분 이름",
    giftCardEmail: "받는 분 이메일 (선물 발송)",
    giftCardEmailPlaceholder: "이메일 주소 입력 시 자동 발송됩니다",
    giftCardMessage: "전하고 싶은 메시지",
    giftCardSubmit: "선물 카드 생성 (₩9,900)",
    giftCardGenerating: "카드 생성 중...",
    giftCardShareTitle: "선물 카드가 준비됐습니다",
    giftCardCopyLink: "링크 복사",
    giftCardCopied: "복사됨",
    giftCardShareSMS: "문자로 보내기",
    giftCardShareKakao: "카카오톡 공유",
    giftCardShareNative: "공유하기",
    giftCardViewCard: "카드 보기",
    selectThisName: "이 이름 선택하기",
    nameSelectedBadge: "✓ 선택한 이름",
    selectionPrompt: "마음에 드는 이름 하나를 선택해 주세요. 패키지와 선물 카드는 선택 후 이용하실 수 있습니다.",
    selectionTrustTitle: "윙크 네이밍은 당신의 선택을 존중합니다",
    selectionTrustBody: "선택하신 이름이 다수로 사용되지 않도록 철저히 관리하며, 동일한 조건에서도 가급적 같은 이름이 추천되지 않도록 관리하겠습니다.",
    level: { low: "낮음", medium: "보통", high: "높음" },
    categoryMap: {
      child: "아이 이름",
      brand: "브랜드",
      pet: "반려동물",
      stage: "활동명·예명",
      korean_to_foreign: "한국이름 → 외국이름",
      foreign_to_korean: "외국이름 → 한국이름",
    },
    giftCreate: "결과 선물하기",
    giftCreating: "링크 생성 중...",
    giftLinkReady: "공유 링크가 준비됐습니다",
    giftCopyLink: "링크 복사",
    giftCopied: "복사됨",
    giftShareKakao: "카카오톡 공유",
    giftShareNative: "공유하기",
    downloadCard: "이미지 저장",
    downloadingCard: "저장 중...",
  },
  en: {
    chip: `${BRAND_NAME} Report`,
    title: "Name Design Report",
    sub: "Results designed by analyzing your purpose, mood, family name harmony, and real-world usability.",
    generatingTitle: "Designing your name",
    generatingSub: "Analyzing phonetic harmony, five elements, stroke count, and your brief.",
    empty: "No brief found. Please go back and fill in the design form.",
    goDesign: "Go to Design",
    saving: "Saving results...",
    saveDone: "Brief and results saved.",
    saveFailed: "Failed to save.",
    packageDone: "Package selected and added to cart.",
    packageFailed: "Failed to save package.",
    errorTitle: "An error occurred during name design.",
    errorRetry: "Retry",
    summaryTitle: "Design Interpretation Summary",
    summaryBody1: "These results are not a simple list of names — they are design proposals considering your purpose, mood, family name flow, and real usability.",
    summaryBody2: "The three proposals cover distinct directions: Stable, Refined, and Creative — with no overlap in role.",
    summaryBody3Family: "Special attention was given to rhythm and impression when called together with the family name.",
    summaryBody3NoFamily: "Designed to feel natural without a family name for now — adding one will allow more precise refinement.",
    brief: "Brief Summary",
    top3: "3 Final Design Proposals",
    topPick: "Top Recommended Direction",
    meaning: "Name Meaning",
    hanja: "Hanja (Chinese Characters)",
    hanjaMeaning: "Character Analysis",
    hanjaStrokes: "Stroke Combination",
    fiveElements: "Five Elements Balance",
    phoneticHarmony: "Phonetic Harmony",
    story: "Design Story",
    fitReason: "Why This Track",
    globalPron: "Script / Global Pronunciation",
    firstCheck: "Risk Assessment",
    teasingRisk: "Teasing Risk",
    similarityRisk: "Similarity Risk",
    pronunciationRisk: "Pronunciation Difficulty",
    caution: "Final Caution Note",
    score: "Design Score",
    packageTitle: "Choose a Package",
    packageSub: "Only select a package if you love the name.",
    packageNoticeTitle: "Package Info",
    packageNoticeBody: "Viewing the name design results is always free. Packages are charged only when selected.",
    packageNoticeBody2: "If no name fits, feel free to redesign without selecting any package.",
    stamp: "Name Seal",
    stampDesc: "A package that elevates the symbolic value of the name",
    doorplate: "Door Plate",
    doorplateDesc: "A package that brings the name's meaning into your space",
    giftCard: "Name Gift Card",
    giftCardDesc: "A card-format result to gift the name",
    trustTitle: "Final Notes",
    trustBody1: "These are design proposals based on your inputs. If none feel right, you can redesign without choosing any package.",
    trustBody2: "For brand or business use, separate trademark, domain, and legal review is required.",
    trustBody3: "Your information is used only within the minimal scope of this naming session.",
    trustPill1: "Review first, free",
    trustPill2: "Package only if chosen",
    trustPill3: "Separate legal review needed",
    startAgain: "Design Again",
    backBrief: "Back to Brief",
    goCart: "View Cart",
    noneSelected: "None of these feel right",
    noneSelectedToast: "If we didn't design the name you were hoping for, we'll give you one more chance to find the right one.",
    addMoreGenerating: "Generating 3 more names...",
    addMoreTitle: "Additional Name Proposals",
    selected: "Selected",
    freeView: "View Results First",
    chooseIfLiked: "Choose Only If You Like It",
    category: "Design Target",
    purpose: "Purpose",
    style: "Desired Mood",
    avoid: "Avoid",
    country: "Primary Country",
    script: "Script Direction",
    targetName: "Name Recipient",
    familyName: "Family Name",
    memo: "Additional Notes",
    trackSafe: "Stable Design",
    trackRefined: "Refined Design",
    trackCreative: "Creative Design",
    trackSafeDesc: "Prioritizing stability and likability for long-term use",
    trackRefinedDesc: "Balancing premium feel and expandability",
    trackCreativeDesc: "Avoiding common patterns while remaining usable",
    connectionAnalysis: "Connection Analysis",
    connectionAnalysisDesc: "How your inputs are reflected in this name",
    freeUsageAvailable: "Free name trial available this month",
    freeUsageUsed: "You've used your free trial this month. You can try again on the 1st of next month.",
    sendCard: "Send Name Card to Me",
    sendCardDesc: "Receive your name card by email",
    sendCardEmail: "Email address",
    sendCardSubmit: "Send Name Card",
    sendCardSending: "Sending...",
    sendCardDone: "Sent to your email.",
    sendCardFailed: "Failed to send.",
    purchaseTitle: "Choose Your Package",
    purchaseSingle: "Individual",
    purchasePackage: "Bundle (10% off)",
    purchaseReport: "Name Design Report PDF",
    purchaseStamp: "Seal Stamp",
    purchaseDoorplate: "Door Plate",
    socialMsg: "Through the name you gifted,\na child who was once nameless can now receive a gift.\n윙크 네이밍 helps neglected children smile. 🤍",
    arsTitle: "Not satisfied?",
    arsDesc: "If you've paid, we offer one free redesign as after-service.",
    arsBtn: "Request A/S Redesign",
    arsUsed: "You've already used A/S.",
    giftCardCreate: "Create Name Gift Card",
    giftCardSelectName: "Select a name to gift",
    giftCardSender: "Sender name",
    giftCardRecipient: "Recipient name",
    giftCardEmail: "Recipient email (auto-send gift)",
    giftCardEmailPlaceholder: "Enter email to send gift automatically",
    giftCardMessage: "Personal message",
    giftCardSubmit: "Create Gift Card (₩9,900)",
    giftCardGenerating: "Generating card...",
    giftCardShareTitle: "Your gift card is ready",
    giftCardCopyLink: "Copy link",
    giftCardCopied: "Copied",
    giftCardShareSMS: "Send via SMS",
    giftCardShareKakao: "Share via KakaoTalk",
    giftCardShareNative: "Share",
    giftCardViewCard: "View card",
    selectThisName: "Select this name",
    nameSelectedBadge: "✓ Selected",
    selectionPrompt: "Please select one name. Packages and gift cards are available after selection.",
    selectionTrustTitle: "윙크 네이밍 respects your choice",
    selectionTrustBody: "The name you selected will be carefully managed to avoid widespread use. Even under similar conditions, we strive to avoid recommending the same name to others.",
    level: { low: "Low", medium: "Medium", high: "High" },
    categoryMap: {
      child: "Child Name",
      brand: "Brand",
      pet: "Pet",
      stage: "Stage Name",
      korean_to_foreign: "Korean Name → Foreign",
      foreign_to_korean: "Foreign Name → Korean",
    },
    giftCreate: "Gift Results",
    giftCreating: "Creating link...",
    giftLinkReady: "Share link is ready",
    giftCopyLink: "Copy link",
    giftCopied: "Copied",
    giftShareKakao: "KakaoTalk",
    giftShareNative: "Share",
    downloadCard: "Save image",
    downloadingCard: "Saving...",
  },
  zh: {
    chip: `${BRAND_NAME} Report`,
    title: "姓名设计报告",
    sub: "综合您的目的、氛围、姓氏协调性与实用性，整理出以下设计方案。",
    generatingTitle: "正在设计名字",
    generatingSub: "正在分析音韵和谐、五行笔画与您的要求。",
    empty: "未找到简报，请返回设计页面重新填写。",
    goDesign: "前往设计页面",
    saving: "正在保存结果...",
    saveDone: "简报与结果已保存。",
    saveFailed: "保存失败。",
    packageDone: "已选择配套并加入购物车。",
    packageFailed: "配套保存失败。",
    errorTitle: "姓名设计时发生错误。",
    errorRetry: "重试",
    summaryTitle: "设计解读摘要",
    summaryBody1: "本次结果不是简单的名字列表，而是综合考虑您的目的、氛围、姓氏流畅感与实际使用性后整理出的设计方案。",
    summaryBody2: "三个方案分别对应稳重型、精致型与创意型，方向各不重叠。",
    summaryBody3Family: "特别注重与姓氏合称时的节奏感与印象。",
    summaryBody3NoFamily: "当前按无姓氏的自然感进行设计，输入姓氏后下次可更精准地体现。",
    brief: "客户输入摘要",
    top3: "最终设计方案 3 个",
    topPick: "首要推荐方向",
    meaning: "名字含义",
    hanja: "汉字写法",
    hanjaMeaning: "汉字解析",
    hanjaStrokes: "笔画组合",
    fiveElements: "五行平衡",
    phoneticHarmony: "音韵和谐",
    story: "设计说明",
    fitReason: "选定理由",
    globalPron: "写法 / 全球发音",
    firstCheck: "初步审核结果",
    teasingRisk: "嘲笑风险",
    similarityRisk: "相似名风险",
    pronunciationRisk: "发音难度",
    caution: "最终确认备注",
    score: "设计评分",
    packageTitle: "选择配套",
    packageSub: "只有满意时才选择以下配套。",
    packageNoticeTitle: "配套说明",
    packageNoticeBody: "查看姓名设计结果完全免费，配套仅在选择时收费。",
    packageNoticeBody2: "若无满意名字，可不选配套，直接重新设计。",
    stamp: "印章",
    stampDesc: "提升名字象征价值的配套",
    doorplate: "门牌",
    doorplateDesc: "将名字意义融入空间的配套",
    giftCard: "姓名礼品卡",
    giftCardDesc: "以卡片形式赠送名字的产品",
    trustTitle: "最终确认",
    trustBody1: "本结果是基于您输入内容设计的推荐方案，若不满意可不选配套，重新设计。",
    trustBody2: "若作为品牌或商号名称，需另行进行商标、域名及法律审查。",
    trustBody3: "您的信息仅在本次命名范围内最小限度使用。",
    trustPill1: "结果先免费查看",
    trustPill2: "选择时才收费",
    trustPill3: "需要单独法律审查",
    startAgain: "重新设计",
    backBrief: "返回简报",
    goCart: "查看购物车",
    noneSelected: "没有满意的名字",
    noneSelectedToast: "如果我们没能设计出您满意的名字，可以再为您设计一次。",
    addMoreGenerating: "正在生成3个额外名字...",
    addMoreTitle: "额外名字提案",
    selected: "已选",
    freeView: "先查看结果",
    chooseIfLiked: "满意后再选择",
    category: "设计对象",
    purpose: "目的",
    style: "期望氛围",
    avoid: "避免感觉",
    country: "主要国家",
    script: "书写方向",
    targetName: "命名对象",
    familyName: "姓氏",
    memo: "补充备注",
    trackSafe: "稳重型方案",
    trackRefined: "精致型方案",
    trackCreative: "创意型方案",
    trackSafeDesc: "优先考虑稳定性与好感度，经久不衰的方向",
    trackRefinedDesc: "兼顾高级感与延展性，提炼出精致印象的方向",
    trackCreativeDesc: "避免常见模式，同时确保实际使用无障碍的方向",
    connectionAnalysis: "关联分析",
    connectionAnalysisDesc: "您的输入与此名字的关联",
    arsTitle: "不满意？",
    arsDesc: "已付费用户可享受一次免费重新设计服务。",
    arsBtn: "申请售后重新设计",
    arsUsed: "您已使用过售后服务。",
    giftCardCreate: "创建姓名礼品卡",
    giftCardSelectName: "选择要赠送的名字",
    giftCardSender: "发送者姓名",
    giftCardRecipient: "接收者姓名",
    giftCardEmail: "接收者邮箱（自动发送礼品）",
    giftCardEmailPlaceholder: "输入邮箱地址自动发送",
    giftCardMessage: "留言",
    giftCardSubmit: "创建礼品卡 (₩9,900)",
    giftCardGenerating: "正在生成...",
    giftCardShareTitle: "礼品卡已准备好",
    giftCardCopyLink: "复制链接",
    giftCardCopied: "已复制",
    giftCardShareSMS: "短信发送",
    giftCardShareKakao: "KakaoTalk 分享",
    giftCardShareNative: "分享",
    giftCardViewCard: "查看卡片",
    selectThisName: "选择此名字",
    nameSelectedBadge: "✓ 已选择",
    selectionPrompt: "请选择一个名字。选择后可使用套餐和礼品卡。",
    selectionTrustTitle: "윙크 네이밍 尊重您的选择",
    selectionTrustBody: "我们将严格管理您所选择的名字，确保不被大量推荐给他人。即使在相似条件下，也尽量避免推荐相同的名字。",
    level: { low: "低", medium: "中", high: "高" },
    categoryMap: {
      child: "孩子姓名",
      brand: "品牌",
      pet: "宠物",
      stage: "艺名/活动名",
      korean_to_foreign: "韩语 → 外语",
      foreign_to_korean: "外语 → 韩语",
    },
    giftCreate: "赠送结果",
    giftCreating: "正在生成链接...",
    giftLinkReady: "分享链接已生成",
    giftCopyLink: "复制链接",
    giftCopied: "已复制",
    giftShareKakao: "KakaoTalk 分享",
    giftShareNative: "分享",
    downloadCard: "保存图片",
    downloadingCard: "保存中...",
    freeUsageAvailable: "本月可免费体验",
    freeUsageUsed: "您已使用本月免费体验。下月1日可再次免费体验。",
    sendCard: "将名字卡发送给我",
    sendCardDesc: "通过电子邮件接收您的名字卡",
    sendCardEmail: "电子邮件地址",
    sendCardSubmit: "发送名字卡",
    sendCardSending: "发送中...",
    sendCardDone: "已发送至您的邮箱。",
    sendCardFailed: "发送失败。",
    purchaseTitle: "选择您的套餐",
    purchaseSingle: "单品",
    purchasePackage: "套餐 (优惠10%)",
    purchaseReport: "姓名设计报告 PDF",
    purchaseStamp: "印章",
    purchaseDoorplate: "门牌",
    socialMsg: "通过您赠送的名字，\n一个曾经没有名字的孩子可以收到礼物。\n윙크 네이밍正在帮助被忽视的孩子微笑。🤍",
  },
  ja: {
    chip: `${BRAND_NAME} Report`,
    title: "ネーミングデザインレポート",
    sub: "入力いただいた目的・雰囲気・姓との調和・使用性を総合的に検討した設計結果です。",
    generatingTitle: "名前を設計しています",
    generatingSub: "音韻調和・五行画数・お客様のご要望を反映しています。",
    empty: "ブリーフが見つかりません。設計ページに戻ってください。",
    goDesign: "設計ページへ",
    saving: "結果を保存中...",
    saveDone: "ブリーフと結果を保存しました。",
    saveFailed: "保存に失敗しました。",
    packageDone: "パッケージを選択してカートに追加しました。",
    packageFailed: "パッケージの保存に失敗しました。",
    errorTitle: "ネーミング設計中にエラーが発生しました。",
    errorRetry: "再試行",
    summaryTitle: "設計解釈サマリー",
    summaryBody1: "今回の結果は単なる名前の羅列ではなく、入力いただいた目的・雰囲気・姓との流れ・実際の使いやすさを総合的に考慮した設計案です。",
    summaryBody2: "3つの提案は安定型・洗練型・創意型として、それぞれ異なる方向性で構成しています。",
    summaryBody3Family: "特に姓と合わせて呼ばれたときのリズムと印象を優先的に確認しました。",
    summaryBody3NoFamily: "現在は姓なしでも自然に感じる方向で整理しており、姓を入力すると次回はより精緻に反映できます。",
    brief: "お客様入力サマリー",
    top3: "最終設計案 3つ",
    topPick: "最優先推奨の設計方向",
    meaning: "名前の意味",
    hanja: "漢字表記",
    hanjaMeaning: "漢字解説",
    hanjaStrokes: "画数の組み合わせ",
    fiveElements: "五行バランス",
    phoneticHarmony: "音韻調和",
    story: "設計説明",
    fitReason: "選定理由",
    globalPron: "表記 / グローバル発音",
    firstCheck: "一次審査結果",
    teasingRisk: "からかいリスク",
    similarityRisk: "類似名リスク",
    pronunciationRisk: "発音難易度",
    caution: "最終確認メモ",
    score: "設計スコア",
    packageTitle: "パッケージ選択",
    packageSub: "結果が気に入った場合のみ、以下のパッケージをお選びください。",
    packageNoticeTitle: "パッケージについて",
    packageNoticeBody: "ネーミング設計結果の確認は無料です。パッケージは選択時のみ費用が発生します。",
    packageNoticeBody2: "気に入る名前がない場合は、パッケージを選ばずに再設計できます。",
    stamp: "印鑑",
    stampDesc: "名前の象徴的価値を高めるパッケージ",
    doorplate: "表札",
    doorplateDesc: "空間に名前の意味を込めるパッケージ",
    giftCard: "ネーミングギフトカード",
    giftCardDesc: "名前をギフトとして贈るカード型商品",
    trustTitle: "最終確認",
    trustBody1: "これはお客様の入力に基づいて設計した提案です。気に入らない場合はパッケージを選ばずに再設計できます。",
    trustBody2: "ブランド名・商号として確定する場合は、商標・ドメイン・法的審査が別途必要です。",
    trustBody3: "入力情報はネーミング設計の範囲内で最小限のみ使用されます。",
    trustPill1: "結果先に無料確認",
    trustPill2: "選択時のみ課金",
    trustPill3: "最終審査は別途必要",
    startAgain: "再設計する",
    backBrief: "ブリーフに戻る",
    goCart: "カートを見る",
    noneSelected: "気に入った名前がない",
    noneSelectedToast: "ご希望の名前を設計できなかった場合、もう一度設計させていただきます。",
    addMoreGenerating: "追加の名前3つを生成中...",
    addMoreTitle: "追加の名前提案",
    selected: "選択済み",
    freeView: "結果を先に確認",
    chooseIfLiked: "気に入ったときだけ選択",
    category: "設計対象",
    purpose: "目的",
    style: "希望する雰囲気",
    avoid: "避けたいイメージ",
    country: "主な使用国",
    script: "表記方向",
    targetName: "命名対象",
    familyName: "姓",
    memo: "追加メモ",
    trackSafe: "安定型設計案",
    trackRefined: "洗練型設計案",
    trackCreative: "創意型設計案",
    trackSafeDesc: "長く呼んでも飽きないよう安定性と好感度を優先した方向",
    trackRefinedDesc: "高級感と拡張性を考慮し、洗練された印象を活かした方向",
    trackCreativeDesc: "ありがちなパターンを避けながら、実際の使用に支障のない方向",
    connectionAnalysis: "関連分析",
    connectionAnalysisDesc: "入力内容とこの名前の関連性",
    arsTitle: "気に入らない場合は？",
    arsDesc: "お支払い済みの方は、アフターサービスとして1回無料で再設計いたします。",
    arsBtn: "A/S 再設計を申請",
    arsUsed: "A/Sはすでに使用されています。",
    giftCardCreate: "ネーミングギフトカードを作成",
    giftCardSelectName: "贈る名前を選択",
    giftCardSender: "送り主のお名前",
    giftCardRecipient: "受取人のお名前",
    giftCardEmail: "受取人のメール（自動送信）",
    giftCardEmailPlaceholder: "メールアドレスを入力すると自動送信されます",
    giftCardMessage: "メッセージ",
    giftCardSubmit: "ギフトカード生成 (₩9,900)",
    giftCardGenerating: "カード生成中...",
    giftCardShareTitle: "ギフトカードの準備ができました",
    giftCardCopyLink: "リンクをコピー",
    giftCardCopied: "コピー済み",
    giftCardShareSMS: "SMSで送る",
    giftCardShareKakao: "KakaoTalkで共有",
    giftCardShareNative: "共有",
    giftCardViewCard: "カードを見る",
    selectThisName: "この名前を選ぶ",
    nameSelectedBadge: "✓ 選択済み",
    selectionPrompt: "気に入った名前を一つ選んでください。選択後にパッケージとギフトカードをご利用いただけます。",
    selectionTrustTitle: "윙크 네이밍 はあなたの選択を尊重します",
    selectionTrustBody: "選ばれた名前が多数に使用されないよう徹底管理し、同じ条件でも可能な限り同じ名前が推薦されないよう管理いたします。",
    level: { low: "低", medium: "中", high: "高" },
    categoryMap: {
      child: "子どもの名前",
      brand: "ブランド",
      pet: "ペット",
      stage: "活動名・芸名",
      korean_to_foreign: "韓国語 → 外国語",
      foreign_to_korean: "外国語 → 韓国語",
    },
    giftCreate: "結果を贈る",
    giftCreating: "リンクを生成中...",
    giftLinkReady: "共有リンクが準備できました",
    giftCopyLink: "リンクをコピー",
    giftCopied: "コピー済み",
    giftShareKakao: "KakaoTalkで共有",
    giftShareNative: "共有する",
    downloadCard: "画像を保存",
    downloadingCard: "保存中...",
    freeUsageAvailable: "今月の無料体験が利用可能",
    freeUsageUsed: "今月の無料体験を使いました。翌月1日から再び無料で体験できます。",
    sendCard: "名前カードを自分に送る",
    sendCardDesc: "名前カードをメールで受け取る",
    sendCardEmail: "メールアドレス",
    sendCardSubmit: "名前カードを送る",
    sendCardSending: "送信中...",
    sendCardDone: "メールに送りました。",
    sendCardFailed: "送信に失敗しました。",
    purchaseTitle: "パッケージを選択してください",
    purchaseSingle: "単品",
    purchasePackage: "パッケージ (10%割引)",
    purchaseReport: "名前設計レポート PDF",
    purchaseStamp: "印鑑",
    purchaseDoorplate: "表札",
    socialMsg: "あなたが贈った名前を通じて、\n名もなく捨てられた子どもに贈り物ができます。\n윙크 네이밍は恵まれない子どもたちが笑顔になれるよう支援しています。🤍",
  },
  es: {
    chip: `${BRAND_NAME} Report`,
    title: "Informe de diseño de nombre",
    sub: "Resultados diseñados analizando su propósito, ambiente, armonía del apellido y usabilidad real.",
    generatingTitle: "Diseñando su nombre",
    generatingSub: "Analizando armonía fonética, elementos, trazos y su brief.",
    empty: "No se encontró ningún brief. Por favor, regrese y complete el formulario.",
    goDesign: "Ir al diseño",
    saving: "Guardando resultados...",
    saveDone: "Brief y resultados guardados.",
    saveFailed: "Error al guardar.",
    packageDone: "Paquete seleccionado y añadido al carrito.",
    packageFailed: "Error al guardar el paquete.",
    errorTitle: "Ocurrió un error durante el diseño de nombre.",
    errorRetry: "Reintentar",
    summaryTitle: "Resumen de interpretación del diseño",
    summaryBody1: "Estos resultados no son una simple lista de nombres — son propuestas de diseño que consideran su propósito, ambiente, armonía del apellido y usabilidad real.",
    summaryBody2: "Las tres propuestas cubren direcciones distintas: Estable, Refinada y Creativa.",
    summaryBody3Family: "Se prestó especial atención al ritmo e impresión al pronunciarse junto al apellido.",
    summaryBody3NoFamily: "Diseñado para sonar natural sin apellido por ahora — agregarlo permitirá un refinamiento más preciso.",
    brief: "Resumen del brief",
    top3: "3 propuestas finales de diseño",
    topPick: "Dirección más recomendada",
    meaning: "Significado del nombre",
    hanja: "Caracteres chinos (Hanja)",
    hanjaMeaning: "Análisis de caracteres",
    hanjaStrokes: "Combinación de trazos",
    fiveElements: "Balance de los cinco elementos",
    phoneticHarmony: "Armonía fonética",
    story: "Historia del diseño",
    fitReason: "Por qué esta dirección",
    globalPron: "Escritura / Pronunciación global",
    firstCheck: "Evaluación de riesgos",
    teasingRisk: "Riesgo de burla",
    similarityRisk: "Riesgo de similitud",
    pronunciationRisk: "Dificultad de pronunciación",
    caution: "Nota final de precaución",
    score: "Puntuación de diseño",
    packageTitle: "Elige un paquete",
    packageSub: "Solo selecciona un paquete si te encanta el nombre.",
    packageNoticeTitle: "Info del paquete",
    packageNoticeBody: "Ver los resultados del diseño de nombre es gratuito. Los paquetes se cobran solo al seleccionarlos.",
    packageNoticeBody2: "Si ningún nombre encaja, puedes rediseñar sin seleccionar ningún paquete.",
    stamp: "Sello de nombre",
    stampDesc: "Un paquete que eleva el valor simbólico del nombre",
    doorplate: "Placa de puerta",
    doorplateDesc: "Un paquete que lleva el significado del nombre a tu espacio",
    giftCard: "Tarjeta regalo de nombre",
    giftCardDesc: "Un resultado en formato tarjeta para regalar el nombre",
    trustTitle: "Notas finales",
    trustBody1: "Estas son propuestas de diseño basadas en sus entradas. Si ninguna le convence, puede rediseñar sin elegir ningún paquete.",
    trustBody2: "Para uso como marca o nombre comercial, se requiere revisión separada de marcas, dominios y aspectos legales.",
    trustBody3: "Su información se utiliza solo en el ámbito mínimo de esta sesión de naming.",
    trustPill1: "Revisa primero, gratis",
    trustPill2: "Paquete solo si se elige",
    trustPill3: "Revisión legal separada necesaria",
    startAgain: "Diseñar de nuevo",
    backBrief: "Volver al brief",
    goCart: "Ver carrito",
    noneSelected: "Ninguno me convence",
    noneSelectedToast: "Si no hemos diseñado el nombre que esperabas, te daremos otra oportunidad para encontrar el indicado.",
    addMoreGenerating: "Generando 3 nombres más...",
    addMoreTitle: "Propuestas adicionales",
    selected: "Seleccionado",
    freeView: "Ver resultados primero",
    chooseIfLiked: "Elige solo si te gusta",
    category: "Objetivo del diseño",
    purpose: "Propósito",
    style: "Ambiente deseado",
    avoid: "Evitar",
    country: "País principal",
    script: "Dirección de escritura",
    targetName: "Destinatario del nombre",
    familyName: "Apellido",
    memo: "Notas adicionales",
    trackSafe: "Diseño estable",
    trackRefined: "Diseño refinado",
    trackCreative: "Diseño creativo",
    trackSafeDesc: "Priorizando estabilidad y simpatía para uso a largo plazo",
    trackRefinedDesc: "Equilibrando elegancia y expansibilidad",
    trackCreativeDesc: "Evitando patrones comunes mientras se mantiene usable",
    connectionAnalysis: "Análisis de conexión",
    connectionAnalysisDesc: "Cómo sus entradas se reflejan en este nombre",
    arsTitle: "¿No está satisfecho?",
    arsDesc: "Si ha pagado, ofrecemos un rediseño gratuito como servicio posventa.",
    arsBtn: "Solicitar rediseño A/S",
    arsUsed: "Ya ha usado el servicio A/S.",
    giftCardCreate: "Crear tarjeta regalo de nombre",
    giftCardSelectName: "Seleccionar nombre para regalar",
    giftCardSender: "Nombre del remitente",
    giftCardRecipient: "Nombre del destinatario",
    giftCardEmail: "Email del destinatario (envío automático)",
    giftCardEmailPlaceholder: "Ingresa el email para envío automático",
    giftCardMessage: "Mensaje personal",
    giftCardSubmit: "Crear tarjeta regalo (₩9,900)",
    giftCardGenerating: "Generando tarjeta...",
    giftCardShareTitle: "Tu tarjeta regalo está lista",
    giftCardCopyLink: "Copiar enlace",
    giftCardCopied: "Copiado",
    giftCardShareSMS: "Enviar por SMS",
    giftCardShareKakao: "Compartir por KakaoTalk",
    giftCardShareNative: "Compartir",
    giftCardViewCard: "Ver tarjeta",
    selectThisName: "Seleccionar este nombre",
    nameSelectedBadge: "✓ Seleccionado",
    selectionPrompt: "Por favor seleccione un nombre. Los paquetes y tarjetas regalo están disponibles después de la selección.",
    selectionTrustTitle: "윙크 네이밍 respeta su elección",
    selectionTrustBody: "El nombre que seleccione será cuidadosamente gestionado para evitar su uso generalizado. Incluso en condiciones similares, nos esforzamos por no recomendarlo a otros.",
    level: { low: "Bajo", medium: "Medio", high: "Alto" },
    categoryMap: {
      child: "Nombre de niño",
      brand: "Marca",
      pet: "Mascota",
      stage: "Nombre artístico",
      korean_to_foreign: "Coreano → Extranjero",
      foreign_to_korean: "Extranjero → Coreano",
    },
    giftCreate: "Regalar resultados",
    giftCreating: "Creando enlace...",
    giftLinkReady: "El enlace está listo",
    giftCopyLink: "Copiar enlace",
    giftCopied: "Copiado",
    giftShareKakao: "KakaoTalk",
    giftShareNative: "Compartir",
    downloadCard: "Guardar imagen",
    downloadingCard: "Guardando...",
    freeUsageAvailable: "Prueba gratuita disponible este mes",
    freeUsageUsed: "Has usado tu prueba gratuita este mes. Puedes volver a probar el 1 del próximo mes.",
    sendCard: "Enviarme la tarjeta de nombre",
    sendCardDesc: "Recibe tu tarjeta de nombre por correo",
    sendCardEmail: "Dirección de correo",
    sendCardSubmit: "Enviar tarjeta",
    sendCardSending: "Enviando...",
    sendCardDone: "Enviado a tu correo.",
    sendCardFailed: "Error al enviar.",
    purchaseTitle: "Elige tu paquete",
    purchaseSingle: "Individual",
    purchasePackage: "Paquete (10% dto.)",
    purchaseReport: "Informe PDF de nombre",
    purchaseStamp: "Sello",
    purchaseDoorplate: "Placa de puerta",
    socialMsg: "A través del nombre que regalaste,\nun niño sin nombre puede recibir un regalo.\n윙크 네이밍 ayuda a los niños olvidados a sonreír. 🤍",
  },
  ru: {
    chip: `${BRAND_NAME} Report`,
    title: "Отчёт по дизайну имени",
    sub: "Результаты, разработанные с учётом вашей цели, атмосферы, гармонии фамилии и практичности.",
    generatingTitle: "Разрабатываем ваше имя",
    generatingSub: "Анализируем фонетическую гармонию, пять элементов, черты и ваш бриф.",
    empty: "Бриф не найден. Пожалуйста, вернитесь и заполните форму.",
    goDesign: "Перейти к дизайну",
    saving: "Сохранение результатов...",
    saveDone: "Бриф и результаты сохранены.",
    saveFailed: "Ошибка сохранения.",
    packageDone: "Пакет выбран и добавлен в корзину.",
    packageFailed: "Ошибка сохранения пакета.",
    errorTitle: "Ошибка при разработке имени.",
    errorRetry: "Повторить",
    summaryTitle: "Сводка интерпретации дизайна",
    summaryBody1: "Эти результаты — не просто список имён, а дизайн-предложения с учётом вашей цели, атмосферы, гармонии фамилии и практичности.",
    summaryBody2: "Три предложения охватывают разные направления: Стабильное, Утончённое и Творческое.",
    summaryBody3Family: "Особое внимание уделено ритму и впечатлению при произношении вместе с фамилией.",
    summaryBody3NoFamily: "Разработано для естественного звучания без фамилии — добавление фамилии позволит уточнить результаты.",
    brief: "Краткое содержание брифа",
    top3: "3 финальных предложения",
    topPick: "Наиболее рекомендуемое направление",
    meaning: "Значение имени",
    hanja: "Китайские иероглифы (Ханджа)",
    hanjaMeaning: "Анализ иероглифов",
    hanjaStrokes: "Комбинация черт",
    fiveElements: "Баланс пяти элементов",
    phoneticHarmony: "Фонетическая гармония",
    story: "История дизайна",
    fitReason: "Почему это направление",
    globalPron: "Написание / Глобальное произношение",
    firstCheck: "Оценка рисков",
    teasingRisk: "Риск насмешек",
    similarityRisk: "Риск сходства",
    pronunciationRisk: "Сложность произношения",
    caution: "Финальное примечание",
    score: "Оценка дизайна",
    packageTitle: "Выберите пакет",
    packageSub: "Выбирайте пакет только если имя вам понравилось.",
    packageNoticeTitle: "Информация о пакете",
    packageNoticeBody: "Просмотр результатов дизайна имени всегда бесплатен. Пакеты оплачиваются только при выборе.",
    packageNoticeBody2: "Если ни одно имя не подходит, можно перепроектировать без выбора пакета.",
    stamp: "Печать имени",
    stampDesc: "Пакет, повышающий символическую ценность имени",
    doorplate: "Табличка на дверь",
    doorplateDesc: "Пакет, привносящий смысл имени в ваше пространство",
    giftCard: "Подарочная карточка с именем",
    giftCardDesc: "Результат в формате карточки для подарка",
    trustTitle: "Финальные заметки",
    trustBody1: "Это дизайн-предложения на основе ваших данных. Если ни одно не подходит, можно перепроектировать без выбора пакета.",
    trustBody2: "Для использования как бренд или торговое наименование требуется отдельная проверка товарного знака, домена и юридических аспектов.",
    trustBody3: "Ваша информация используется только в минимальном объёме в рамках этой сессии.",
    trustPill1: "Сначала просмотр бесплатно",
    trustPill2: "Пакет только при выборе",
    trustPill3: "Требуется отдельная правовая проверка",
    startAgain: "Перепроектировать",
    backBrief: "Вернуться к брифу",
    goCart: "Просмотр корзины",
    noneSelected: "Ни одно имя не подходит",
    noneSelectedToast: "Если мы не смогли разработать имя вашей мечты, дадим ещё одну попытку.",
    addMoreGenerating: "Генерация ещё 3 имён...",
    addMoreTitle: "Дополнительные предложения",
    selected: "Выбрано",
    freeView: "Сначала просмотр",
    chooseIfLiked: "Выбирайте только если понравилось",
    category: "Объект дизайна",
    purpose: "Цель",
    style: "Желаемая атмосфера",
    avoid: "Избегать",
    country: "Основная страна",
    script: "Направление написания",
    targetName: "Получатель имени",
    familyName: "Фамилия",
    memo: "Дополнительные заметки",
    trackSafe: "Стабильный дизайн",
    trackRefined: "Утончённый дизайн",
    trackCreative: "Творческий дизайн",
    trackSafeDesc: "Приоритет стабильности и симпатии для долгосрочного использования",
    trackRefinedDesc: "Баланс премиальности и расширяемости",
    trackCreativeDesc: "Избегание общих паттернов при сохранении практичности",
    connectionAnalysis: "Анализ связи",
    connectionAnalysisDesc: "Как ваши данные отражены в этом имени",
    arsTitle: "Не удовлетворены?",
    arsDesc: "Если вы заплатили, мы предлагаем одно бесплатное перепроектирование.",
    arsBtn: "Запросить повторный дизайн",
    arsUsed: "Вы уже использовали услугу A/S.",
    giftCardCreate: "Создать подарочную карточку",
    giftCardSelectName: "Выбрать имя для подарка",
    giftCardSender: "Имя отправителя",
    giftCardRecipient: "Имя получателя",
    giftCardEmail: "Email получателя (автоотправка)",
    giftCardEmailPlaceholder: "Введите email для автоматической отправки",
    giftCardMessage: "Личное сообщение",
    giftCardSubmit: "Создать подарочную карточку (₩9,900)",
    giftCardGenerating: "Создание карточки...",
    giftCardShareTitle: "Ваша подарочная карточка готова",
    giftCardCopyLink: "Копировать ссылку",
    giftCardCopied: "Скопировано",
    giftCardShareSMS: "Отправить по SMS",
    giftCardShareKakao: "Поделиться в KakaoTalk",
    giftCardShareNative: "Поделиться",
    giftCardViewCard: "Просмотр карточки",
    selectThisName: "Выбрать это имя",
    nameSelectedBadge: "✓ Выбрано",
    selectionPrompt: "Пожалуйста, выберите одно имя. Пакеты и подарочные карточки доступны после выбора.",
    selectionTrustTitle: "윙크 네이밍 уважает ваш выбор",
    selectionTrustBody: "Выбранное вами имя будет тщательно управляться, чтобы избежать широкого использования. Даже в похожих условиях мы стараемся не рекомендовать одно и то же имя другим.",
    level: { low: "Низкий", medium: "Средний", high: "Высокий" },
    categoryMap: {
      child: "Имя ребёнка",
      brand: "Бренд",
      pet: "Питомец",
      stage: "Сценическое имя",
      korean_to_foreign: "Корейский → Иностранный",
      foreign_to_korean: "Иностранный → Корейский",
    },
    giftCreate: "Подарить результаты",
    giftCreating: "Создание ссылки...",
    giftLinkReady: "Ссылка для sharing готова",
    giftCopyLink: "Копировать ссылку",
    giftCopied: "Скопировано",
    giftShareKakao: "KakaoTalk",
    giftShareNative: "Поделиться",
    downloadCard: "Сохранить изображение",
    downloadingCard: "Сохранение...",
    freeUsageAvailable: "Бесплатное испытание доступно в этом месяце",
    freeUsageUsed: "Вы использовали бесплатное испытание в этом месяце. Попробуйте снова 1-го числа следующего месяца.",
    sendCard: "Отправить карточку имени мне",
    sendCardDesc: "Получите карточку имени по email",
    sendCardEmail: "Адрес email",
    sendCardSubmit: "Отправить карточку",
    sendCardSending: "Отправка...",
    sendCardDone: "Отправлено на ваш email.",
    sendCardFailed: "Ошибка отправки.",
    purchaseTitle: "Выберите пакет",
    purchaseSingle: "Отдельно",
    purchasePackage: "Пакет (скидка 10%)",
    purchaseReport: "Отчёт PDF об имени",
    purchaseStamp: "Печать",
    purchaseDoorplate: "Табличка на дверь",
    socialMsg: "Через подаренное вами имя\nребёнок, у которого не было имени, получает подарок.\n윙크 네이밍 помогает обездоленным детям улыбаться. 🤍",
  },
  fr: {
    chip: `${BRAND_NAME} Report`,
    title: "Rapport de conception de nom",
    sub: "Résultats conçus en analysant votre objectif, ambiance, harmonie du nom de famille et utilisabilité.",
    generatingTitle: "Conception de votre nom en cours",
    generatingSub: "Analyse de l'harmonie phonétique, des cinq éléments, des traits et de votre brief.",
    empty: "Aucun brief trouvé. Veuillez retourner remplir le formulaire.",
    goDesign: "Aller à la conception",
    saving: "Enregistrement des résultats...",
    saveDone: "Brief et résultats enregistrés.",
    saveFailed: "Échec de l'enregistrement.",
    packageDone: "Forfait sélectionné et ajouté au panier.",
    packageFailed: "Échec de l'enregistrement du forfait.",
    errorTitle: "Une erreur s'est produite lors de la conception du nom.",
    errorRetry: "Réessayer",
    summaryTitle: "Résumé de l'interprétation du design",
    summaryBody1: "Ces résultats ne sont pas une simple liste de noms — ce sont des propositions de design tenant compte de votre objectif, ambiance, harmonie du nom de famille et utilisabilité réelle.",
    summaryBody2: "Les trois propositions couvrent des directions distinctes : Stable, Raffinée et Créative.",
    summaryBody3Family: "Une attention particulière a été portée au rythme et à l'impression lors de la prononciation avec le nom de famille.",
    summaryBody3NoFamily: "Conçu pour sonner naturellement sans nom de famille pour l'instant — l'ajouter permettra un raffinement plus précis.",
    brief: "Résumé du brief",
    top3: "3 propositions finales de design",
    topPick: "Direction la plus recommandée",
    meaning: "Signification du nom",
    hanja: "Caractères chinois (Hanja)",
    hanjaMeaning: "Analyse des caractères",
    hanjaStrokes: "Combinaison de traits",
    fiveElements: "Équilibre des cinq éléments",
    phoneticHarmony: "Harmonie phonétique",
    story: "Histoire du design",
    fitReason: "Pourquoi cette direction",
    globalPron: "Écriture / Prononciation mondiale",
    firstCheck: "Évaluation des risques",
    teasingRisk: "Risque de moquerie",
    similarityRisk: "Risque de similarité",
    pronunciationRisk: "Difficulté de prononciation",
    caution: "Note finale de précaution",
    score: "Score de design",
    packageTitle: "Choisir un forfait",
    packageSub: "Ne sélectionnez un forfait que si vous aimez le nom.",
    packageNoticeTitle: "Info forfait",
    packageNoticeBody: "La consultation des résultats de conception est toujours gratuite. Les forfaits sont facturés uniquement lors de la sélection.",
    packageNoticeBody2: "Si aucun nom ne convient, vous pouvez reconcevoir sans sélectionner de forfait.",
    stamp: "Sceau de nom",
    stampDesc: "Un forfait qui élève la valeur symbolique du nom",
    doorplate: "Plaque de porte",
    doorplateDesc: "Un forfait qui apporte la signification du nom dans votre espace",
    giftCard: "Carte cadeau de nom",
    giftCardDesc: "Un résultat en format carte pour offrir le nom",
    trustTitle: "Notes finales",
    trustBody1: "Ce sont des propositions de design basées sur vos saisies. Si aucune ne convient, vous pouvez reconcevoir sans choisir de forfait.",
    trustBody2: "Pour une utilisation comme marque ou raison sociale, une vérification séparée des marques, domaines et aspects juridiques est requise.",
    trustBody3: "Vos informations sont utilisées uniquement dans le cadre minimal de cette session de naming.",
    trustPill1: "Consultez d'abord gratuitement",
    trustPill2: "Forfait uniquement si choisi",
    trustPill3: "Vérification juridique séparée requise",
    startAgain: "Reconcevoir",
    backBrief: "Retour au brief",
    noneSelected: "Aucun nom ne me convient",
    noneSelectedToast: "Si nous n'avons pas conçu le nom que vous espériez, nous vous donnons une autre chance.",
    addMoreGenerating: "Génération de 3 noms supplémentaires...",
    addMoreTitle: "Propositions supplémentaires",
    goCart: "Voir le panier",
    selected: "Sélectionné",
    freeView: "Voir les résultats d'abord",
    chooseIfLiked: "Choisir seulement si ça vous plaît",
    category: "Cible du design",
    purpose: "Objectif",
    style: "Ambiance souhaitée",
    avoid: "Éviter",
    country: "Pays principal",
    script: "Direction d'écriture",
    targetName: "Destinataire du nom",
    familyName: "Nom de famille",
    memo: "Notes supplémentaires",
    trackSafe: "Design stable",
    trackRefined: "Design raffiné",
    trackCreative: "Design créatif",
    trackSafeDesc: "Priorité à la stabilité et la sympathie pour une utilisation à long terme",
    trackRefinedDesc: "Équilibrant prestige et extensibilité",
    trackCreativeDesc: "Évitant les schémas courants tout en restant utilisable",
    connectionAnalysis: "Analyse de connexion",
    connectionAnalysisDesc: "Comment vos saisies se reflètent dans ce nom",
    arsTitle: "Pas satisfait ?",
    arsDesc: "Si vous avez payé, nous offrons une reconception gratuite en service après-vente.",
    arsBtn: "Demander une reconception A/S",
    arsUsed: "Vous avez déjà utilisé le service A/S.",
    giftCardCreate: "Créer une carte cadeau de nom",
    giftCardSelectName: "Sélectionner un nom à offrir",
    giftCardSender: "Nom de l'expéditeur",
    giftCardRecipient: "Nom du destinataire",
    giftCardEmail: "Email du destinataire (envoi auto)",
    giftCardEmailPlaceholder: "Entrez l'email pour un envoi automatique",
    giftCardMessage: "Message personnel",
    giftCardSubmit: "Créer la carte cadeau (₩9,900)",
    giftCardGenerating: "Génération de la carte...",
    giftCardShareTitle: "Votre carte cadeau est prête",
    giftCardCopyLink: "Copier le lien",
    giftCardCopied: "Copié",
    giftCardShareSMS: "Envoyer par SMS",
    giftCardShareKakao: "Partager sur KakaoTalk",
    giftCardShareNative: "Partager",
    giftCardViewCard: "Voir la carte",
    selectThisName: "Sélectionner ce nom",
    nameSelectedBadge: "✓ Sélectionné",
    selectionPrompt: "Veuillez sélectionner un nom. Les forfaits et cartes cadeaux sont disponibles après la sélection.",
    selectionTrustTitle: "윙크 네이밍 respecte votre choix",
    selectionTrustBody: "Le nom que vous avez sélectionné sera soigneusement géré pour éviter une utilisation généralisée. Même dans des conditions similaires, nous nous efforçons de ne pas recommander le même nom à d'autres.",
    level: { low: "Faible", medium: "Moyen", high: "Élevé" },
    categoryMap: {
      child: "Prénom d'enfant",
      brand: "Marque",
      pet: "Animal de compagnie",
      stage: "Nom de scène",
      korean_to_foreign: "Coréen → Étranger",
      foreign_to_korean: "Étranger → Coréen",
    },
    giftCreate: "Offrir les résultats",
    giftCreating: "Création du lien...",
    giftLinkReady: "Le lien de partage est prêt",
    giftCopyLink: "Copier le lien",
    giftCopied: "Copié",
    giftShareKakao: "KakaoTalk",
    giftShareNative: "Partager",
    downloadCard: "Enregistrer l'image",
    downloadingCard: "Enregistrement...",
    freeUsageAvailable: "Essai gratuit disponible ce mois",
    freeUsageUsed: "Vous avez utilisé votre essai gratuit ce mois. Réessayez le 1er du mois prochain.",
    sendCard: "M'envoyer la carte de nom",
    sendCardDesc: "Recevez votre carte de nom par email",
    sendCardEmail: "Adresse email",
    sendCardSubmit: "Envoyer la carte",
    sendCardSending: "Envoi...",
    sendCardDone: "Envoyé à votre email.",
    sendCardFailed: "Échec de l'envoi.",
    purchaseTitle: "Choisissez votre forfait",
    purchaseSingle: "Individuel",
    purchasePackage: "Forfait (10% de réduction)",
    purchaseReport: "Rapport PDF de nom",
    purchaseStamp: "Tampon",
    purchaseDoorplate: "Plaque de porte",
    socialMsg: "Grâce au nom que vous avez offert,\nun enfant sans nom peut recevoir un cadeau.\n윙크 네이밍 aide les enfants négligés à sourire. 🤍",
  },
  ar: {
    chip: `${BRAND_NAME} Report`,
    title: "تقرير تصميم الاسم",
    sub: "نتائج مصممة بتحليل هدفك وأجواءك وانسجام اسم العائلة وسهولة الاستخدام.",
    generatingTitle: "جارٍ تصميم اسمك",
    generatingSub: "تحليل الانسجام الصوتي والعناصر الخمسة والخطوط وبريفك.",
    empty: "لم يتم العثور على بريف. الرجاء العودة وملء النموذج.",
    goDesign: "الذهاب إلى التصميم",
    saving: "جارٍ حفظ النتائج...",
    saveDone: "تم حفظ البريف والنتائج.",
    saveFailed: "فشل الحفظ.",
    packageDone: "تم اختيار الحزمة وإضافتها إلى السلة.",
    packageFailed: "فشل حفظ الحزمة.",
    errorTitle: "حدث خطأ أثناء تصميم الاسم.",
    errorRetry: "إعادة المحاولة",
    summaryTitle: "ملخص تفسير التصميم",
    summaryBody1: "هذه النتائج ليست مجرد قائمة أسماء — بل مقترحات تصميم تأخذ في الاعتبار هدفك وأجواءك وانسجام اسم العائلة وسهولة الاستخدام.",
    summaryBody2: "المقترحات الثلاثة تغطي اتجاهات مختلفة: مستقر، ومصقول، وإبداعي.",
    summaryBody3Family: "أُولي اهتمام خاص للإيقاع والانطباع عند النطق مع اسم العائلة.",
    summaryBody3NoFamily: "صُمِّم ليبدو طبيعياً دون اسم عائلة في الوقت الحالي — إضافته ستتيح تحسيناً أكثر دقة.",
    brief: "ملخص البريف",
    top3: "3 مقترحات تصميم نهائية",
    topPick: "الاتجاه الأكثر توصية",
    meaning: "معنى الاسم",
    hanja: "الأحرف الصينية (هانجا)",
    hanjaMeaning: "تحليل الأحرف",
    hanjaStrokes: "تركيبة الخطوط",
    fiveElements: "توازن العناصر الخمسة",
    phoneticHarmony: "الانسجام الصوتي",
    story: "قصة التصميم",
    fitReason: "لماذا هذا الاتجاه",
    globalPron: "الكتابة / النطق العالمي",
    firstCheck: "تقييم المخاطر",
    teasingRisk: "خطر السخرية",
    similarityRisk: "خطر التشابه",
    pronunciationRisk: "صعوبة النطق",
    caution: "ملاحظة تحذيرية نهائية",
    score: "نقاط التصميم",
    packageTitle: "اختر حزمة",
    packageSub: "اختر الحزمة فقط إذا أعجبك الاسم.",
    packageNoticeTitle: "معلومات الحزمة",
    packageNoticeBody: "مشاهدة نتائج تصميم الاسم مجانية دائماً. يتم الدفع مقابل الحزم عند الاختيار فقط.",
    packageNoticeBody2: "إذا لم يناسبك أي اسم، يمكنك إعادة التصميم دون اختيار أي حزمة.",
    stamp: "ختم الاسم",
    stampDesc: "حزمة ترفع القيمة الرمزية للاسم",
    doorplate: "لوحة الباب",
    doorplateDesc: "حزمة تجلب معنى الاسم إلى مساحتك",
    giftCard: "بطاقة هدية الاسم",
    giftCardDesc: "نتيجة بصيغة بطاقة لإهداء الاسم",
    trustTitle: "ملاحظات نهائية",
    trustBody1: "هذه مقترحات تصميم بناءً على مدخلاتك. إذا لم تناسبك أي منها، يمكنك إعادة التصميم دون اختيار حزمة.",
    trustBody2: "للاستخدام كعلامة تجارية أو اسم تجاري، يلزم إجراء مراجعة منفصلة للعلامات التجارية والنطاقات والجوانب القانونية.",
    trustBody3: "تُستخدم معلوماتك فقط في النطاق الأدنى لهذه الجلسة.",
    trustPill1: "مشاهدة مجانية أولاً",
    trustPill2: "الحزمة عند الاختيار فقط",
    trustPill3: "مراجعة قانونية منفصلة مطلوبة",
    startAgain: "إعادة التصميم",
    backBrief: "العودة إلى البريف",
    goCart: "عرض السلة",
    noneSelected: "لا يوجد اسم يعجبني",
    noneSelectedToast: "إذا لم نتمكن من تصميم الاسم الذي تتمناه، سنمنحك فرصة أخرى للعثور عليه.",
    addMoreGenerating: "جارٍ إنشاء 3 أسماء إضافية...",
    addMoreTitle: "مقترحات إضافية",
    selected: "محدد",
    freeView: "عرض النتائج أولاً",
    chooseIfLiked: "اختر فقط إذا أعجبك",
    category: "هدف التصميم",
    purpose: "الغرض",
    style: "الأجواء المطلوبة",
    avoid: "تجنب",
    country: "البلد الرئيسي",
    script: "اتجاه الكتابة",
    targetName: "المستفيد من الاسم",
    familyName: "اسم العائلة",
    memo: "ملاحظات إضافية",
    trackSafe: "تصميم مستقر",
    trackRefined: "تصميم مصقول",
    trackCreative: "تصميم إبداعي",
    trackSafeDesc: "الأولوية للاستقرار والمحبوبية للاستخدام طويل الأمد",
    trackRefinedDesc: "موازنة الفخامة والتوسعية",
    trackCreativeDesc: "تجنب الأنماط الشائعة مع الحفاظ على قابلية الاستخدام",
    connectionAnalysis: "تحليل الارتباط",
    connectionAnalysisDesc: "كيف تنعكس مدخلاتك في هذا الاسم",
    arsTitle: "غير راضٍ؟",
    arsDesc: "إذا دفعت، نقدم إعادة تصميم مجانية واحدة كخدمة ما بعد البيع.",
    arsBtn: "طلب إعادة تصميم",
    arsUsed: "لقد استخدمت خدمة A/S بالفعل.",
    giftCardCreate: "إنشاء بطاقة هدية اسم",
    giftCardSelectName: "اختر اسماً للإهداء",
    giftCardSender: "اسم المرسل",
    giftCardRecipient: "اسم المستلم",
    giftCardEmail: "بريد المستلم (إرسال تلقائي)",
    giftCardEmailPlaceholder: "أدخل البريد للإرسال التلقائي",
    giftCardMessage: "رسالة شخصية",
    giftCardSubmit: "إنشاء بطاقة الهدية (₩9,900)",
    giftCardGenerating: "جارٍ إنشاء البطاقة...",
    giftCardShareTitle: "بطاقة هديتك جاهزة",
    giftCardCopyLink: "نسخ الرابط",
    giftCardCopied: "تم النسخ",
    giftCardShareSMS: "إرسال عبر SMS",
    giftCardShareKakao: "مشاركة عبر KakaoTalk",
    giftCardShareNative: "مشاركة",
    giftCardViewCard: "عرض البطاقة",
    selectThisName: "اختر هذا الاسم",
    nameSelectedBadge: "✓ محدد",
    selectionPrompt: "الرجاء اختيار اسم واحد. الحزم وبطاقات الهدايا متاحة بعد الاختيار.",
    selectionTrustTitle: "윙크 네이밍 يحترم اختيارك",
    selectionTrustBody: "سيتم إدارة الاسم الذي اخترته بعناية لتجنب الاستخدام الواسع. حتى في ظروف مماثلة، نسعى لعدم التوصية بنفس الاسم للآخرين.",
    level: { low: "منخفض", medium: "متوسط", high: "مرتفع" },
    categoryMap: {
      child: "اسم طفل",
      brand: "علامة تجارية",
      pet: "حيوان أليف",
      stage: "اسم فني",
      korean_to_foreign: "كوري → أجنبي",
      foreign_to_korean: "أجنبي → كوري",
    },
    giftCreate: "إهداء النتائج",
    giftCreating: "إنشاء الرابط...",
    giftLinkReady: "رابط المشاركة جاهز",
    giftCopyLink: "نسخ الرابط",
    giftCopied: "تم النسخ",
    giftShareKakao: "KakaoTalk",
    giftShareNative: "مشاركة",
    downloadCard: "حفظ الصورة",
    downloadingCard: "جارٍ الحفظ...",
    freeUsageAvailable: "التجربة المجانية متاحة هذا الشهر",
    freeUsageUsed: "لقد استخدمت تجربتك المجانية هذا الشهر. يمكنك المحاولة مجدداً في الأول من الشهر القادم.",
    sendCard: "إرسال بطاقة الاسم إليّ",
    sendCardDesc: "احصل على بطاقة اسمك عبر البريد",
    sendCardEmail: "عنوان البريد الإلكتروني",
    sendCardSubmit: "إرسال البطاقة",
    sendCardSending: "جارٍ الإرسال...",
    sendCardDone: "تم الإرسال إلى بريدك.",
    sendCardFailed: "فشل الإرسال.",
    purchaseTitle: "اختر باقتك",
    purchaseSingle: "فردي",
    purchasePackage: "باقة (خصم 10%)",
    purchaseReport: "تقرير PDF للاسم",
    purchaseStamp: "ختم",
    purchaseDoorplate: "لوحة الباب",
    socialMsg: "من خلال الاسم الذي أهديته،\nيمكن لطفل بلا اسم أن يتلقى هدية.\n윙크 네이밍 يساعد الأطفال المهملين على الابتسام. 🤍",
  },
  hi: {
    chip: `${BRAND_NAME} Report`,
    title: "नाम डिज़ाइन रिपोर्ट",
    sub: "आपके उद्देश्य, माहौल, उपनाम सामंजस्य और व्यावहारिकता के विश्लेषण के आधार पर डिज़ाइन किए गए परिणाम।",
    generatingTitle: "आपका नाम डिज़ाइन हो रहा है",
    generatingSub: "ध्वन्यात्मक सामंजस्य, पांच तत्व, रेखाएं और आपके ब्रीफ का विश्लेषण हो रहा है।",
    empty: "कोई ब्रीफ नहीं मिला। कृपया वापस जाएं और फॉर्म भरें।",
    goDesign: "डिज़ाइन पर जाएं",
    saving: "परिणाम सहेजे जा रहे हैं...",
    saveDone: "ब्रीफ और परिणाम सहेजे गए।",
    saveFailed: "सहेजने में विफल।",
    packageDone: "पैकेज चुना गया और कार्ट में जोड़ा गया।",
    packageFailed: "पैकेज सहेजने में विफल।",
    errorTitle: "नाम डिज़ाइन के दौरान त्रुटि हुई।",
    errorRetry: "पुनः प्रयास करें",
    summaryTitle: "डिज़ाइन व्याख्या सारांश",
    summaryBody1: "ये परिणाम केवल नामों की सूची नहीं हैं — ये आपके उद्देश्य, माहौल, उपनाम प्रवाह और व्यावहारिकता को ध्यान में रखते हुए बनाए गए डिज़ाइन प्रस्ताव हैं।",
    summaryBody2: "तीन प्रस्ताव अलग-अलग दिशाओं को कवर करते हैं: स्थिर, परिष्कृत और रचनात्मक।",
    summaryBody3Family: "उपनाम के साथ बोले जाने पर लय और प्रभाव पर विशेष ध्यान दिया गया।",
    summaryBody3NoFamily: "अभी उपनाम के बिना स्वाभाविक लगने के लिए डिज़ाइन किया गया — इसे जोड़ने से अधिक सटीक परिणाम मिलेंगे।",
    brief: "ब्रीफ सारांश",
    top3: "3 अंतिम डिज़ाइन प्रस्ताव",
    topPick: "सबसे अनुशंसित दिशा",
    meaning: "नाम का अर्थ",
    hanja: "चीनी अक्षर (हांजा)",
    hanjaMeaning: "अक्षर विश्लेषण",
    hanjaStrokes: "रेखा संयोजन",
    fiveElements: "पांच तत्वों का संतुलन",
    phoneticHarmony: "ध्वन्यात्मक सामंजस्य",
    story: "डिज़ाइन कहानी",
    fitReason: "यह दिशा क्यों",
    globalPron: "लिखावट / वैश्विक उच्चारण",
    firstCheck: "जोखिम मूल्यांकन",
    teasingRisk: "चिढ़ाने का जोखिम",
    similarityRisk: "समानता का जोखिम",
    pronunciationRisk: "उच्चारण कठिनाई",
    caution: "अंतिम सावधानी नोट",
    score: "डिज़ाइन स्कोर",
    packageTitle: "पैकेज चुनें",
    packageSub: "केवल तभी पैकेज चुनें जब नाम पसंद आए।",
    packageNoticeTitle: "पैकेज जानकारी",
    packageNoticeBody: "नाम डिज़ाइन परिणाम देखना हमेशा मुफ़्त है। पैकेज केवल चुनने पर चार्ज होते हैं।",
    packageNoticeBody2: "यदि कोई नाम पसंद न आए तो बिना पैकेज चुने पुनः डिज़ाइन कर सकते हैं।",
    stamp: "नाम मुहर",
    stampDesc: "नाम की प्रतीकात्मक मूल्य बढ़ाने वाला पैकेज",
    doorplate: "दरवाजे की पट्टिका",
    doorplateDesc: "नाम का अर्थ आपके स्थान में लाने वाला पैकेज",
    giftCard: "नाम उपहार कार्ड",
    giftCardDesc: "नाम उपहार देने के लिए कार्ड प्रारूप में परिणाम",
    trustTitle: "अंतिम नोट्स",
    trustBody1: "ये आपके इनपुट के आधार पर डिज़ाइन प्रस्ताव हैं। यदि कोई पसंद न आए तो बिना पैकेज चुने पुनः डिज़ाइन कर सकते हैं।",
    trustBody2: "ब्रांड या व्यवसाय नाम के रूप में उपयोग के लिए अलग ट्रेडमार्क, डोमेन और कानूनी समीक्षा आवश्यक है।",
    trustBody3: "आपकी जानकारी केवल इस नामकरण सत्र के न्यूनतम दायरे में उपयोग की जाती है।",
    trustPill1: "पहले मुफ़्त देखें",
    trustPill2: "पैकेज केवल चुनने पर",
    trustPill3: "अलग कानूनी समीक्षा आवश्यक",
    startAgain: "पुनः डिज़ाइन करें",
    backBrief: "ब्रीफ पर वापस",
    goCart: "कार्ट देखें",
    noneSelected: "कोई नाम पसंद नहीं आया",
    noneSelectedToast: "यदि हम आपकी पसंद का नाम नहीं बना पाए, तो हम आपको एक और मौका देंगे।",
    addMoreGenerating: "3 और नाम बन रहे हैं...",
    addMoreTitle: "अतिरिक्त नाम प्रस्ताव",
    selected: "चुना गया",
    freeView: "पहले परिणाम देखें",
    chooseIfLiked: "केवल पसंद आने पर चुनें",
    category: "डिज़ाइन लक्ष्य",
    purpose: "उद्देश्य",
    style: "वांछित माहौल",
    avoid: "बचें",
    country: "प्राथमिक देश",
    script: "लिपि दिशा",
    targetName: "नाम प्राप्तकर्ता",
    familyName: "उपनाम",
    memo: "अतिरिक्त नोट्स",
    trackSafe: "स्थिर डिज़ाइन",
    trackRefined: "परिष्कृत डिज़ाइन",
    trackCreative: "रचनात्मक डिज़ाइन",
    trackSafeDesc: "दीर्घकालिक उपयोग के लिए स्थिरता और पसंदीदाता को प्राथमिकता",
    trackRefinedDesc: "प्रीमियम और विस्तारयोग्यता का संतुलन",
    trackCreativeDesc: "सामान्य पैटर्न से बचते हुए व्यावहारिक रखना",
    connectionAnalysis: "संबंध विश्लेषण",
    connectionAnalysisDesc: "इस नाम में आपके इनपुट कैसे परिलक्षित हैं",
    arsTitle: "संतुष्ट नहीं हैं?",
    arsDesc: "यदि आपने भुगतान किया है तो हम बिक्री के बाद सेवा के रूप में एक मुफ़्त पुनः डिज़ाइन प्रदान करते हैं।",
    arsBtn: "A/S पुनः डिज़ाइन अनुरोध",
    arsUsed: "आप पहले ही A/S सेवा का उपयोग कर चुके हैं।",
    giftCardCreate: "नाम उपहार कार्ड बनाएं",
    giftCardSelectName: "उपहार देने के लिए नाम चुनें",
    giftCardSender: "प्रेषक का नाम",
    giftCardRecipient: "प्राप्तकर्ता का नाम",
    giftCardEmail: "प्राप्तकर्ता का ईमेल (स्वतः भेजें)",
    giftCardEmailPlaceholder: "स्वतः भेजने के लिए ईमेल दर्ज करें",
    giftCardMessage: "व्यक्तिगत संदेश",
    giftCardSubmit: "उपहार कार्ड बनाएं (₩9,900)",
    giftCardGenerating: "कार्ड बन रहा है...",
    giftCardShareTitle: "आपका उपहार कार्ड तैयार है",
    giftCardCopyLink: "लिंक कॉपी करें",
    giftCardCopied: "कॉपी हो गया",
    giftCardShareSMS: "SMS से भेजें",
    giftCardShareKakao: "KakaoTalk पर शेयर करें",
    giftCardShareNative: "शेयर करें",
    giftCardViewCard: "कार्ड देखें",
    selectThisName: "यह नाम चुनें",
    nameSelectedBadge: "✓ चुना गया",
    selectionPrompt: "कृपया एक नाम चुनें। चुनाव के बाद पैकेज और उपहार कार्ड उपलब्ध होंगे।",
    selectionTrustTitle: "윙크 네이밍 आपके चुनाव का सम्मान करता है",
    selectionTrustBody: "आपके द्वारा चुने गए नाम को व्यापक उपयोग से बचाने के लिए सावधानी से प्रबंधित किया जाएगा। समान परिस्थितियों में भी हम दूसरों को वही नाम सुझाने से बचते हैं।",
    level: { low: "कम", medium: "मध्यम", high: "अधिक" },
    categoryMap: {
      child: "बच्चे का नाम",
      brand: "ब्रांड",
      pet: "पालतू जानवर",
      stage: "मंच नाम",
      korean_to_foreign: "कोरियाई → विदेशी",
      foreign_to_korean: "विदेशी → कोरियाई",
    },
    giftCreate: "परिणाम उपहार दें",
    giftCreating: "लिंक बन रहा है...",
    giftLinkReady: "शेयर लिंक तैयार है",
    giftCopyLink: "लिंक कॉपी करें",
    giftCopied: "कॉपी हो गया",
    giftShareKakao: "KakaoTalk",
    giftShareNative: "शेयर करें",
    downloadCard: "छवि सहेजें",
    downloadingCard: "सहेजा जा रहा है...",
    freeUsageAvailable: "इस महीने मुफ़्त परीक्षण उपलब्ध",
    freeUsageUsed: "आपने इस महीने का मुफ़्त परीक्षण उपयोग किया। अगले महीने की 1 तारीख को फिर प्रयास करें।",
    sendCard: "मुझे नाम कार्ड भेजें",
    sendCardDesc: "अपना नाम कार्ड ईमेल पर प्राप्त करें",
    sendCardEmail: "ईमेल पता",
    sendCardSubmit: "नाम कार्ड भेजें",
    sendCardSending: "भेजा जा रहा है...",
    sendCardDone: "आपके ईमेल पर भेजा गया।",
    sendCardFailed: "भेजने में विफल।",
    purchaseTitle: "अपना पैकेज चुनें",
    purchaseSingle: "व्यक्तिगत",
    purchasePackage: "पैकेज (10% छूट)",
    purchaseReport: "नाम डिज़ाइन रिपोर्ट PDF",
    purchaseStamp: "मुहर",
    purchaseDoorplate: "दरवाज़े की पट्टिका",
    socialMsg: "आपके दिए नाम के ज़रिए,\nएक बेनाम बच्चे को उपहार मिल सकता है।\n윙크 네이밍 उपेक्षित बच्चों को मुस्कुराने में मदद करता है। 🤍",
  },
} as const;

type UiLang = keyof typeof COPY;
const VALID_UI_LANGS: UiLang[] = ["ko", "en", "zh", "ja", "es", "ru", "fr", "ar", "hi"];
function toUiLang(l: string): UiLang {
  return (VALID_UI_LANGS as string[]).includes(l) ? (l as UiLang) : "ko";
}

const VALID_CATEGORIES = ["child", "brand", "pet", "stage", "korean_to_foreign", "foreign_to_korean"];
function normalizeCategory(v: string | null | undefined) {
  const c = v ?? "child";
  return VALID_CATEGORIES.includes(c) ? c : "child";
}

// ─── Helpers ─────────────────────────────────────────────
function riskClass(level: RiskLevel) {
  if (level === "low") return "wink-risk-low";
  if (level === "medium") return "wink-risk-medium";
  return "wink-risk-high";
}
function packagePrice(type: PackageType, category?: string) {
  if (type === "stamp") return PRICING.stamp;
  if (type === "doorplate") return PRICING.doorplate;
  if (type === "giftcard") return CATEGORY_PRICING[category ?? "child"] ?? PRICING.giftCardShare;
  return PRICING.giftCardShare;
}
type AnyUi = (typeof COPY)[keyof typeof COPY];

function trackLabel(track: TrackType, ui: AnyUi) {
  if (track === "safe") return ui.trackSafe;
  if (track === "refined") return ui.trackRefined;
  return ui.trackCreative;
}
function trackDesc(track: TrackType, ui: AnyUi) {
  if (track === "safe") return ui.trackSafeDesc;
  if (track === "refined") return ui.trackRefinedDesc;
  return ui.trackCreativeDesc;
}

// ─── Sub-components ───────────────────────────────────────
function TrustPill({ text }: { text: string }) {
  return <div className="wink-score-pill">{text}</div>;
}

function PackageCard({
  title, desc, price, selected, disabled, onClick, selectedText,
}: {
  title: string; desc: string; price: number;
  selected: boolean; disabled: boolean;
  onClick: () => void; selectedText: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`wink-package-card ${selected ? "is-selected" : ""}`}
    >
      {selected && <span className="wink-category-badge">{selectedText}</span>}
      <div className="wink-card-title" style={{ marginBottom: 8 }}>{title}</div>
      <div className="wink-card-desc" style={{ marginBottom: 10 }}>{desc}</div>
      <div className="wink-score-pill">₩{price.toLocaleString()}</div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function ResultPage() {
  const router = useRouter();
  const params = useParams();

  const rawLang = String(params.lang || "ko");
  const lang: AppLang = isSupportedLang(rawLang) ? rawLang : "ko";
  const ui = COPY[toUiLang(rawLang)];

  const [brief, setBrief] = useState<BriefPayload | null>(null);
  const [briefLoaded, setBriefLoaded] = useState(false);
  const [results, setResults] = useState<NameResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showScene, setShowScene] = useState(false);
  const [sceneComplete, setSceneComplete] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<PackageType | "">("");
  const [message, setMessage] = useState("");
  const [briefId, setBriefId] = useState("");
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [isSavingPackage, setIsSavingPackage] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [freeUsage, setFreeUsage] = useState<{ used: boolean; usedCount: number; quota: number } | null>(null);
  const [userPlan, setUserPlan] = useState<PlanId>("free");
  const [planLoaded, setPlanLoaded] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const freeUsageRecordedRef = useRef(false);
  const [arsEligible, setArsEligible] = useState(false);
  const [arsUsed, setArsUsed] = useState(false);
  const [arsRemaining, setArsRemaining] = useState(2);
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [arsModalOpen, setArsModalOpen] = useState(false);
  // Name selection (from the 3 results)
  const [selectedNameIndex, setSelectedNameIndex] = useState<number | null>(null);

  // Gift card panel state
  const [giftCardOpen, setGiftCardOpen] = useState(false);
  const [giftCardNameIndex, setGiftCardNameIndex] = useState(0);
  const [giftCardSender, setGiftCardSender] = useState("");
  const [giftCardRecipient, setGiftCardRecipient] = useState("");
  const [giftCardRecipientEmail, setGiftCardRecipientEmail] = useState("");
  const [giftCardMessage, setGiftCardMessage] = useState("");
  const [giftCardLoading, setGiftCardLoading] = useState(false);
  const [giftCardToken, setGiftCardToken] = useState("");
  const [giftCardCopied, setGiftCardCopied] = useState(false);

  // 결과 선물하기 (무료 공유 링크)
  const [giftToken, setGiftToken] = useState("");
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftCopied, setGiftCopied] = useState(false);
  // 이미지 다운로드
  const [isDownloading, setIsDownloading] = useState(false);
  const topPickRef = useRef<HTMLElement | null>(null);

  // 추가 이름 생성 (선택하지 않음 → 3개 추가)
  const [extraResults, setExtraResults] = useState<NameResult[]>([]);
  const [isGeneratingExtra, setIsGeneratingExtra] = useState(false);
  const [noneToast, setNoneToast] = useState(false);

  // 이름카드 이메일 전송
  const [sendCardOpen, setSendCardOpen] = useState(false);
  const [sendCardEmail, setSendCardEmail] = useState("");
  const [sendCardLoading, setSendCardLoading] = useState(false);
  const [sendCardMsg, setSendCardMsg] = useState("");

  // 구매 패키지 탭
  const [purchaseTab, setPurchaseTab] = useState<"single" | "bundle">("single");

  const hasCalledGPT = useRef(false);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    try { supabaseRef.current = createClient(); } catch { supabaseRef.current = null; }
  }, []);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      if (!supabaseRef.current) return;
      try {
        const { data: { user } } = await supabaseRef.current.auth.getUser();
        setUserId(user?.id ?? null);
        setUserEmail(user?.email ?? undefined);
      } catch { /* ignore */ }
    };
    fetchUser();
  }, []);

  // Fetch free usage + plan once user is known
  useEffect(() => {
    if (userId === undefined) return;
    const uid = userId ?? "";
    const fetchUsageAndPlan = async () => {
      try {
        const [usageRes, planRes] = await Promise.all([
          fetch(`/api/free-usage?userId=${uid}`),
          fetch(`/api/user-plan?userId=${uid}`),
        ]);
        if (usageRes.ok) {
          const json = await usageRes.json();
          setFreeUsage({ used: json.used ?? false, usedCount: json.usedCount ?? 0, quota: json.quota ?? 3 });
        }
        if (planRes.ok) {
          const json = await planRes.json();
          setUserPlan((json.plan as PlanId) ?? "free");
        }
      } catch { /* ignore */ } finally {
        setPlanLoaded(true);
      }
    };
    fetchUsageAndPlan();
  }, [userId]);

  // Fetch A/S eligibility once briefId is known
  useEffect(() => {
    if (!briefId || !userId) return;
    const fetchArs = async () => {
      try {
        const res = await fetch(`/api/ars?userId=${userId}&briefId=${briefId}`);
        if (res.ok) {
          const json = await res.json();
          setArsEligible(json.eligible ?? false);
          setArsUsed(json.arsUsed ?? false);
          setArsRemaining(json.remaining ?? 2);
        }
      } catch { /* ignore */ }
    };
    fetchArs();
  }, [briefId, userId]);

  // Load brief from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("winkNamingBrief");
      if (!saved) { setBriefLoaded(true); return; }
      const parsed = JSON.parse(saved) as BriefPayload;
      setBrief({ ...parsed, category: normalizeCategory(parsed.category), lang: lang as BriefPayload["lang"] });
    } catch { /* ignore */ }
    setBriefLoaded(true);
  }, [lang]);

  // GPT streaming call
  useEffect(() => {
    if (!briefLoaded || !brief || !planLoaded || hasCalledGPT.current) return;

    // 무료 한도 초과 && 유료 플랜 없음 → 업그레이드 모달
    if (freeUsage?.used && userPlan === "free") {
      setShowUpgradeModal(true);
      return;
    }

    hasCalledGPT.current = true;

    // ── 진행 메시지 순환 ──────────────────────────────────────
    const PROGRESS_MSGS = [
      "이름을 설계하고 있습니다...",
      "한자 오행을 분석하고 있습니다...",
      "성씨와의 음운 조화를 검토하고 있습니다...",
      "최적의 이름을 선별하고 있습니다...",
    ];
    let msgIdx = 0;
    setProgressMsg(PROGRESS_MSGS[0]);
    const msgTimer = setInterval(() => {
      msgIdx = (msgIdx + 1) % PROGRESS_MSGS.length;
      setProgressMsg(PROGRESS_MSGS[msgIdx]);
    }, 3200);

    const callGPT = async () => {
      setIsGenerating(true);
      setShowScene(true);
      setSceneComplete(false);
      setIsError(false);

      let incrementalCount = 0; // 증분으로 받은 이름 수

      try {
        const res = await fetch("/api/naming", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brief, userId: userId ?? undefined }),
        });

        if (!res.ok || !res.body) throw new Error("Network error");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            let payload: Record<string, unknown>;
            try { payload = JSON.parse(line.slice(6)); } catch { continue; }

            if (payload.error) throw new Error(String(payload.error));

            // ── 이름 1개 완성 즉시 표시 ──────────────────────
            if (payload.name && typeof payload.index === "number") {
              const nameResult = payload.name as NameResult;
              incrementalCount++;
              setResults((prev) => [...prev, nameResult]);

              if (incrementalCount === 1) {
                // 첫 이름 도착 → 씬 완료 애니메이션 후 결과 표시
                clearInterval(msgTimer);
                setProgressMsg("");
                setSceneComplete(true);
                await new Promise((r) => setTimeout(r, 500));
                setShowScene(false);
                playReveal();
              }
            }

            // ── 전체 완료 (fallback + 확정) ───────────────────
            if (payload.done && Array.isArray(payload.results)) {
              clearInterval(msgTimer);
              setProgressMsg("");
              const nameResults = payload.results as NameResult[];

              if (incrementalCount === 0) {
                // 증분 없이 한꺼번에 완료된 경우 (기존 동작)
                setSceneComplete(true);
                await new Promise((r) => setTimeout(r, 800));
                setResults(nameResults);
                setShowScene(false);
                playReveal();
              } else {
                // 이미 증분으로 표시 중 → 전체 결과로 교체 (순서·완전성 보장)
                setResults(nameResults);
              }

              trackEvent("name_generated", {
                category: brief?.category ?? "unknown",
                result_count: nameResults.length,
                lang: brief?.lang ?? "ko",
              });
            }
          }
        }
      } catch (err) {
        clearInterval(msgTimer);
        setProgressMsg("");
        console.error("[GPT stream error]", err);
        setIsError(true);
        setShowScene(false);
      } finally {
        setIsGenerating(false);
      }
    };

    callGPT();
  }, [brief, briefLoaded, planLoaded, freeUsage, userPlan]);

  // Save results to DB
  useEffect(() => {
    if (!brief || results.length === 0 || briefId || isSavingResult) return;
    const save = async () => {
      setIsSavingResult(true);
      setMessage(ui.saving);
      let userId: string | null = null;
      try {
        if (supabaseRef.current) {
          const { data: { user } } = await supabaseRef.current.auth.getUser();
          userId = user?.id ?? null;
        }
      } catch { /* ignore */ }

      const resultRows = results.map((item) => ({
        rank_order: item.rank_order,
        name: item.name,
        english: item.english,
        chinese: item.chinese,
        chinese_pinyin: item.chinese_pinyin,
        japanese_kana: item.japanese_kana,
        japanese_reading: item.japanese_reading,
        meaning: item.meaning,
        story: item.story,
        fit_reason: item.fit_reason,
        teasing_risk: item.teasing_risk,
        similarity_risk: item.similarity_risk,
        pronunciation_risk: item.pronunciation_risk,
        brand_risk: null,
        caution: item.caution,
        score: item.score,
      }));

      try {
        const res = await fetch("/api/brief", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brief, results: resultRows, userId }),
        });
        const json = await res.json();
        if (!res.ok || !json?.ok) throw new Error(json?.error || ui.saveFailed);
        setBriefId(String(json.briefId ?? ""));
        setMessage(ui.saveDone);
      } catch {
        setMessage(ui.saveFailed);
      } finally {
        setIsSavingResult(false);
      }
    };
    save();
  }, [brief, results, briefId, isSavingResult, ui.saving, ui.saveDone, ui.saveFailed]);

  // Record free usage once briefId is saved, then show privacy → upgrade flow
  useEffect(() => {
    if (!briefId || !userId || userPlan !== "free" || freeUsageRecordedRef.current) return;
    freeUsageRecordedRef.current = true;

    const recordUsage = async () => {
      try {
        await fetch("/api/free-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, briefId }),
        });
        const res = await fetch(`/api/free-usage?userId=${userId}`);
        if (res.ok) {
          const json = await res.json();
          const updated = { used: json.used ?? false, usedCount: json.usedCount ?? 0, quota: json.quota ?? 1 };
          setFreeUsage(updated);
          if (updated.used) {
            setShowPrivacyModal(true);
          }
        }
      } catch { /* ignore */ }
    };
    recordUsage();
  }, [briefId, userId, userPlan]);

  // Package selection
  const handlePackageSelect = async (pkg: { id: PackageType; title: string; desc: string; price: number }) => {
    if (isSavingPackage) return;
    setSelectedPackage(pkg.id);
    if (!briefId) { setMessage(ui.packageFailed); return; }
    setIsSavingPackage(true);
    let userId: string | null = null;
    try {
      if (supabaseRef.current) {
        const { data: { user } } = await supabaseRef.current.auth.getUser();
        userId = user?.id ?? null;
      }
    } catch { /* ignore */ }

    try {
      const res = await fetch("/api/package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefId, packageType: pkg.id, userId }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || ui.packageFailed);
      const allResults = [...results, ...extraResults];
      const chosenName = selectedNameIndex !== null ? allResults[selectedNameIndex] : null;
      addCartItem({
        id: `${briefId}-${pkg.id}-${Date.now()}`,
        type: "naming-package",
        briefId,
        packageType: pkg.id,
        title: pkg.title,
        description: pkg.desc,
        price: pkg.price,
        quantity: 1,
        lang,
        createdAt: new Date().toISOString(),
        selectedName: chosenName?.name,
        selectedNameIndex: selectedNameIndex ?? undefined,
        category: brief?.category,
        meaning: chosenName?.meaning,
      });
      setMessage(ui.packageDone);
      trackEvent("package_selected", {
        package_type: pkg.id,
        price: pkg.price,
        category: brief?.category ?? "unknown",
      });
    } catch {
      setMessage(ui.packageFailed);
    } finally {
      setIsSavingPackage(false);
    }
  };

  const handleGiftCardSubmit = async () => {
    if (giftCardLoading || results.length === 0) return;
    const allResults = [...results, ...extraResults];
    const chosen = allResults[giftCardNameIndex] ?? allResults[0];
    setGiftCardLoading(true);
    try {
      const res = await fetch("/api/gift-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: chosen.name,
          hanja: chosen.hanja ?? "",
          hanjaMeaning: chosen.hanja_meaning ?? "",
          hanjaStrokes: chosen.hanja_strokes ?? "",
          fiveElements: chosen.five_elements ?? "",
          english: chosen.english,
          chinese: chosen.chinese,
          chinesePinyin: chosen.chinese_pinyin,
          japaneseKana: chosen.japanese_kana,
          japaneseReading: chosen.japanese_reading,
          phoneticHarmony: chosen.phonetic_harmony ?? "",
          meaning: chosen.meaning,
          story: chosen.story,
          categoryLabel: brief ? (ui.categoryMap[normalizeCategory(brief.category) as keyof typeof ui.categoryMap] ?? "") : "",
          senderName: giftCardSender,
          recipientName: giftCardRecipient,
          recipientEmail: giftCardRecipientEmail,
          giftMessage: giftCardMessage,
          userId,
          lang,
        }),
      });
      const json = await res.json();
      if (json.token) setGiftCardToken(json.token);
      else setMessage(json.error ?? ui.packageFailed);
    } catch {
      setMessage(ui.packageFailed);
    } finally {
      setGiftCardLoading(false);
    }
  };

  const giftCardUrl = giftCardToken ? `${typeof window !== "undefined" ? window.location.origin : ""}/${lang}/gift/${giftCardToken}` : "";

  const handleGiftCardShare = async (method: "native" | "sms" | "kakao" | "copy") => {
    if (!giftCardUrl) return;
    if (method === "native" && typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: ui.giftCardShareTitle, url: giftCardUrl }); } catch { /* cancelled */ }
      return;
    }
    if (method === "sms") {
      window.open(`sms:?body=${encodeURIComponent(giftCardUrl)}`);
      return;
    }
    if (method === "kakao") {
      const kakao = (window as unknown as { Kakao?: { isInitialized?: () => boolean; Share?: { sendScrap: (o: object) => void } } }).Kakao;
      if (kakao?.isInitialized?.() && kakao.Share?.sendScrap) {
        kakao.Share.sendScrap({ requestUrl: giftCardUrl });
        return;
      }
      try { await navigator.clipboard.writeText(giftCardUrl); } catch { /* ignore */ }
      return;
    }
    // copy
    try {
      await navigator.clipboard.writeText(giftCardUrl);
      setGiftCardCopied(true);
      setTimeout(() => setGiftCardCopied(false), 2000);
    } catch { /* ignore */ }
  };

  // ─── 결과 선물하기 (무료 공유 링크 생성) ─────────────────
  const handleGiftCreate = async () => {
    if (giftLoading || results.length === 0) return;
    setGiftLoading(true);
    try {
      const res = await fetch("/api/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results, brief, userId, lang }),
      });
      const json = await res.json();
      if (json.ok && json.token) setGiftToken(json.token);
    } catch { /* ignore */ } finally {
      setGiftLoading(false);
    }
  };

  const giftUrl = giftToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/gift/${giftToken}`
    : "";

  const handleGiftShare = async (method: "copy" | "kakao" | "native") => {
    if (!giftUrl) return;
    if (method === "native" && typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: ui.giftLinkReady, url: giftUrl }); } catch { /* cancelled */ }
      return;
    }
    if (method === "kakao") {
      const kakao = (window as unknown as { Kakao?: { isInitialized?: () => boolean; Share?: { sendScrap: (o: object) => void } } }).Kakao;
      if (kakao?.isInitialized?.() && kakao.Share?.sendScrap) {
        kakao.Share.sendScrap({ requestUrl: giftUrl });
        return;
      }
    }
    // copy (kakao fallback도 동일)
    try {
      await navigator.clipboard.writeText(giftUrl);
      setGiftCopied(true);
      setTimeout(() => setGiftCopied(false), 2000);
    } catch { /* ignore */ }
  };

  // ─── 이름카드 이메일 전송 (유료 사용자 전용) ──────────────
  const handleSendCard = async () => {
    if (!sendCardEmail.trim() || sendCardLoading || results.length === 0) return;
    setSendCardLoading(true);
    setSendCardMsg("");
    try {
      const idx = selectedNameIndex ?? 0;
      const allResults = [...results, ...extraResults];
      const item = allResults[idx];

      // Bearer 토큰 첨부 (유료 사용자 인증용)
      let token = "";
      if (supabaseRef.current) {
        const { data: { session } } = await supabaseRef.current.auth.getSession();
        token = session?.access_token ?? "";
      }

      const res = await fetch("/api/send-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email: sendCardEmail.trim(), item, lang, brief }),
      });
      if (res.ok) {
        setSendCardMsg(ui.sendCardDone);
        setSendCardOpen(false);
      } else {
        setSendCardMsg(ui.sendCardFailed);
      }
    } catch {
      setSendCardMsg(ui.sendCardFailed);
    } finally {
      setSendCardLoading(false);
    }
  };

  // ─── 이미지 다운로드 ─────────────────────────────────────
  const handleDownload = async () => {
    if (isDownloading || !topPickRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(topPickRef.current, {
        cacheBust: true,
        backgroundColor: "#0f1725",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      const dlName = topResult?.name ?? results[selectedNameIndex ?? 0]?.name ?? "result";
      link.download = `윙크네이밍_${dlName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("[download error]", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const category = normalizeCategory(brief?.category);
  const isFreeUser = userPlan === "free";
  const showSeal = !isFreeUser && (SHOW_SEAL[category] !== false);
  const showNameplate = SHOW_NAMEPLATE[category] !== false;
  const isPetCategory = category === "pet";

  // Package order: 이름 선물카드 → 인장/도장 → 문패 (카테고리에 따라 필터)
  const allPackageCards = [
    { id: "giftcard" as PackageType, title: ui.giftCard, desc: ui.giftCardDesc, price: packagePrice("giftcard", category) },
    { id: "stamp" as PackageType, title: ui.stamp, desc: ui.stampDesc, price: packagePrice("stamp") },
    { id: "doorplate" as PackageType, title: ui.doorplate, desc: ui.doorplateDesc, price: packagePrice("doorplate") },
  ];
  const packageCards = allPackageCards.filter((pkg) => {
    if (pkg.id === "stamp" && !SHOW_SEAL[category]) return false;
    if (pkg.id === "doorplate" && !showNameplate) return false;
    return true;
  });

  const catKey = category as keyof typeof ui.categoryMap;
  const categoryLabel = brief ? (ui.categoryMap[catKey] ?? brief.category) : "-";
  // selectedNameIndex 기준으로 표시 — 미선택 시 첫 번째 이름
  const allResultsForDisplay = [...results, ...extraResults];
  const topResult = (selectedNameIndex !== null
    ? allResultsForDisplay[selectedNameIndex]
    : results[0]) ?? null;

  // ── Render branches ────────────────────────────────────

  if (!briefLoaded) return null;

  if (!brief && !isGenerating) {
    return (
      <main className="wink-page">
        <div className="wink-container">
          <div className="wink-chip">{ui.chip}</div>
          <h1 className="wink-title">{ui.title}</h1>
          <div className="wink-panel" style={{ marginBottom: 20 }}>{ui.empty}</div>
          <div className="wink-actions">
            <button type="button" className="wink-primary-btn"
              onClick={() => router.push(`/${lang}/category`)}>
              {ui.goDesign}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (showScene) {
    return (
      <main className="wink-page">
        <div className="wink-container">
          <div className="wink-chip">{ui.chip}</div>
          <NameGenerationScene
            title={ui.generatingTitle}
            subtitle={ui.generatingSub}
            previewName={brief?.familyName ? `${brief.familyName}○○` : "　"}
            isComplete={sceneComplete}
            statusMessage={progressMsg}
          />
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="wink-page">
        <div className="wink-container">
          <div className="wink-chip">{ui.chip}</div>
          <h1 className="wink-title">{ui.title}</h1>
          <div className="wink-panel" style={{ marginBottom: 20 }}>{ui.errorTitle}</div>
          <div className="wink-actions">
            <button type="button" className="wink-primary-btn"
              onClick={() => {
                hasCalledGPT.current = false;
                setIsError(false);
                setResults([]);
                setSceneComplete(false);
                setBrief((b) => (b ? { ...b } : null));
              }}>
              {ui.errorRetry}
            </button>
            <button type="button" className="wink-secondary-btn"
              onClick={() => router.push(`/${lang}/category`)}>
              {ui.goDesign}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Main result view ──────────────────────────────────
  return (
    <>
    {showPrivacyModal && (
      <PrivacyConsentModal
        lang={lang}
        onAgree={() => {
          setShowPrivacyModal(false);
          setShowUpgradeModal(true);
        }}
        onCancel={() => setShowPrivacyModal(false)}
      />
    )}
    {showUpgradeModal && userId && (
      <UpgradeModal
        lang={lang}
        userId={userId}
        email={userEmail}
        usedCount={freeUsage?.usedCount ?? 0}
        category={category}
        onClose={() => {
          setShowUpgradeModal(false);
          router.push(`/${lang}/category`);
        }}
      />
    )}
    <main className="wink-page">
      <div className="wink-container">
        <div className="wink-chip">{ui.chip}</div>
        <h1 className="wink-title">{ui.title}</h1>
        <p className="wink-sub">{ui.sub}</p>

        {freeUsage && (
          <div className={`wink-score-pill`} style={{ marginBottom: 12, display: "inline-block" }}>
            {freeUsage.used ? ui.freeUsageUsed : ui.freeUsageAvailable}
          </div>
        )}

        {message && <div className="wink-success-banner">{message}</div>}

        {/* Design summary */}
        <section className="wink-panel" style={{ marginBottom: 24 }}>
          <div className="wink-section-title" style={{ marginBottom: 10 }}>{ui.summaryTitle}</div>
          <div className="wink-result-text" style={{ marginBottom: 8 }}>{ui.summaryBody1}</div>
          <div className="wink-result-text" style={{ marginBottom: 8 }}>{ui.summaryBody2}</div>
          <div className="wink-result-text">
            {brief?.familyName?.trim() ? ui.summaryBody3Family : ui.summaryBody3NoFamily}
          </div>
        </section>

        {/* Brief summary */}
        <section className="wink-panel" style={{ marginBottom: 24 }}>
          <div className="wink-section-title" style={{ marginBottom: 12 }}>{ui.brief}</div>
          <div className="wink-brief-grid">
            <div><strong>{ui.category}</strong>: {categoryLabel}</div>
            <div><strong>{ui.targetName}</strong>: {brief?.targetName || "-"}</div>
            <div><strong>{ui.familyName}</strong>: {brief?.familyName || "-"}</div>
            <div><strong>{ui.purpose}</strong>: {brief?.purpose || "-"}</div>
            <div><strong>{ui.style}</strong>: {brief?.styleKeywords || "-"}</div>
            <div><strong>{ui.avoid}</strong>: {brief?.avoidKeywords || "-"}</div>
            <div><strong>{ui.country}</strong>: {brief?.targetCountry || "-"}</div>
            <div><strong>{ui.script}</strong>: {brief?.preferredScript || "-"}</div>
            <div><strong>{ui.memo}</strong>: {brief?.memo || "-"}</div>
          </div>
        </section>

        {/* Package notice */}
        <section className="wink-panel" style={{ marginBottom: 24 }}>
          <div className="wink-section-title" style={{ marginBottom: 10 }}>{ui.packageNoticeTitle}</div>
          <div className="wink-result-text" style={{ marginBottom: 8 }}>{ui.packageNoticeBody}</div>
          <div className="wink-result-text">{ui.packageNoticeBody2}</div>
          <div className="wink-actions" style={{ marginTop: 16 }}>
            <TrustPill text={ui.freeView} />
            <TrustPill text={ui.chooseIfLiked} />
          </div>
        </section>

        {/* Top pick — selectedNameIndex 기준으로 업데이트 */}
        {topResult && (
          <section className="wink-top-pick" ref={topPickRef}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div className="wink-top-pick-label">{ui.topPick}</div>
                <div className="wink-top-pick-name">{topResult.name}</div>
                {topResult.hanja && (
                  <div className="wink-result-text" style={{ marginTop: 6, opacity: 0.75 }}>
                    {topResult.hanja}
                  </div>
                )}
                <div className="wink-top-pick-desc">{topResult.story}</div>
                <div className="wink-top-pick-score">{ui.score} {topResult.score}</div>
              </div>
              {/* 인장 — 명시적 선택 이후 + 유료 사용자 + 해당 카테고리에만 표시 */}
              {selectedNameIndex !== null && showSeal && (
                <div style={{ flexShrink: 0, paddingTop: 4 }}>
                  <SealStamp name={topResult.name} size={120} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* 3 design proposals */}
        <section style={{ marginTop: 28 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 8 }}>{ui.top3}</h2>
          <p className="wink-section-desc" style={{ marginBottom: 16 }}>{ui.selectionPrompt}</p>

          {/* ── 이름 선택 카드 (상단 요약) ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {results.map((item, idx) => {
              const isSelected = selectedNameIndex === idx;
              return (
                <button
                  key={`select-${item.name}`}
                  type="button"
                  onClick={() => { Sound.playTab(); Sound.playSeal(); setSelectedNameIndex(idx); setGiftCardNameIndex(idx); }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "18px 22px",
                    borderRadius: 16,
                    cursor: "pointer",
                    textAlign: "left",
                    border: isSelected
                      ? "2px solid rgba(201,168,76,0.75)"
                      : "1px solid var(--line-soft)",
                    background: isSelected
                      ? "linear-gradient(135deg, rgba(201,168,76,0.14), rgba(201,168,76,0.06))"
                      : "var(--bg-panel)",
                    boxShadow: isSelected ? "0 0 0 4px rgba(201,168,76,0.10)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {/* 선택 인디케이터 */}
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      border: isSelected ? "2px solid var(--gold-main)" : "2px solid var(--line-strong)",
                      background: isSelected ? "var(--gold-main)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isSelected && <span style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>✓</span>}
                    </div>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: isSelected ? "var(--gold-main)" : "var(--text-main)", lineHeight: 1.2 }}>
                        {item.name}
                      </div>
                      {item.hanja && (
                        <div style={{ fontSize: 13, opacity: 0.65, letterSpacing: 2, marginTop: 2 }}>{item.hanja}</div>
                      )}
                      <div style={{ fontSize: 12, opacity: 0.6, marginTop: 3 }}>{trackLabel(item.track, ui)}</div>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, fontSize: 13, fontWeight: 700,
                    color: isSelected ? "var(--gold-main)" : "var(--text-dim)",
                    padding: "7px 16px", borderRadius: 999,
                    border: isSelected ? "1px solid var(--line-gold)" : "1px solid var(--line-soft)",
                    background: isSelected ? "var(--gold-soft)" : "transparent",
                    whiteSpace: "nowrap",
                  }}>
                    {isSelected ? ui.nameSelectedBadge : ui.selectThisName}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── 선택하지 않음 버튼 ── */}
          {results.length > 0 && selectedNameIndex === null && extraResults.length === 0 && (
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <button
                type="button"
                onClick={async () => {
                  if (!brief || isGeneratingExtra) return;
                  setNoneToast(true);
                  setTimeout(() => setNoneToast(false), 5000);
                  setIsGeneratingExtra(true);
                  try {
                    const res = await fetch("/api/naming", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        brief,
                        userId: userId ?? undefined,
                        excludeNames: results.map((r) => r.name),
                      }),
                    });
                    if (!res.ok || !res.body) throw new Error();
                    const reader = res.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = "";
                    while (true) {
                      const { done, value } = await reader.read();
                      if (done) break;
                      buffer += decoder.decode(value, { stream: true });
                      const lines = buffer.split("\n\n");
                      buffer = lines.pop() ?? "";
                      for (const line of lines) {
                        if (!line.startsWith("data: ")) continue;
                        let payload: Record<string, unknown>;
                        try { payload = JSON.parse(line.slice(6)); } catch { continue; }
                        if (payload.done && Array.isArray(payload.results)) {
                          setExtraResults(payload.results as NameResult[]);
                        }
                      }
                    }
                  } catch { /* ignore */ } finally {
                    setIsGeneratingExtra(false);
                  }
                }}
                disabled={isGeneratingExtra}
                style={{
                  padding: "12px 28px",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isGeneratingExtra ? "not-allowed" : "pointer",
                  border: "1px dashed var(--line-strong)",
                  background: "transparent",
                  color: "var(--text-soft)",
                  opacity: isGeneratingExtra ? 0.6 : 1,
                  transition: "all 0.18s ease",
                }}
              >
                {isGeneratingExtra ? ui.addMoreGenerating : ui.noneSelected}
              </button>
            </div>
          )}

          {/* ── 토스트 메시지 ── */}
          {noneToast && (
            <div style={{
              position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
              maxWidth: 420, width: "calc(100% - 40px)",
              background: "var(--bg-panel-strong)", border: "1px solid var(--line-gold)",
              borderRadius: 16, padding: "16px 20px", zIndex: 9999,
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              fontSize: 14, lineHeight: 1.6, color: "var(--text-main)",
              textAlign: "center",
            }}>
              {ui.noneSelectedToast}
            </div>
          )}

          {/* ── 추가 제안 이름 (6개 비교) ── */}
          {extraResults.length > 0 && (
            <section style={{ marginTop: 32, marginBottom: 16 }}>
              <h2 className="wink-section-title" style={{ marginBottom: 8 }}>{ui.addMoreTitle}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {extraResults.map((item, idx) => {
                  const eIdx = results.length + idx;
                  const isSelected = selectedNameIndex === eIdx;
                  return (
                    <button
                      key={`extra-select-${item.name}`}
                      type="button"
                      onClick={() => { Sound.playTab(); Sound.playSeal(); setSelectedNameIndex(eIdx); setGiftCardNameIndex(eIdx); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                        gap: 16, padding: "18px 22px", borderRadius: 16, cursor: "pointer", textAlign: "left",
                        border: isSelected ? "2px solid rgba(201,168,76,0.75)" : "1px solid var(--line-soft)",
                        background: isSelected
                          ? "linear-gradient(135deg, rgba(201,168,76,0.14), rgba(201,168,76,0.06))"
                          : "var(--bg-panel)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text-main)" }}>{item.name}</span>
                      <span style={{ fontSize: 12, color: isSelected ? "var(--gold-main)" : "var(--text-dim)" }}>
                        {isSelected ? ui.nameSelectedBadge : ui.selectThisName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── 상세 분석 카드 ── */}
          <div className="wink-result-grid">
            {[...results, ...extraResults].map((item, idx) => (
              <article
                key={`${item.name}-${item.rank_order}`}
                className="wink-result-card"
                style={selectedNameIndex === idx ? {
                  border: "2px solid rgba(201,168,76,0.70)",
                  boxShadow: "0 0 0 4px rgba(201,168,76,0.12)",
                } : undefined}
              >

                {/* Card-level select button (상단) */}
                <button
                  type="button"
                  onClick={() => { Sound.playTab(); Sound.playSeal(); setSelectedNameIndex(idx); setGiftCardNameIndex(idx); }}
                  style={{
                    width: "100%",
                    marginBottom: 14,
                    padding: "10px 0",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: selectedNameIndex === idx
                      ? "2px solid rgba(201,168,76,0.75)"
                      : "1px solid var(--line-soft)",
                    background: selectedNameIndex === idx
                      ? "linear-gradient(135deg,rgba(201,168,76,0.20),rgba(201,168,76,0.08))"
                      : "transparent",
                    color: selectedNameIndex === idx ? "var(--gold-main)" : "var(--text-dim)",
                    transition: "all 0.18s ease",
                  }}
                >
                  {selectedNameIndex === idx ? `${ui.nameSelectedBadge} · ${item.name}` : ui.selectThisName}
                </button>

                {/* Track badge */}
                <div className="wink-panel" style={{ marginBottom: 14, padding: 16 }}>
                  <div className="wink-section-title" style={{ fontSize: 20, marginBottom: 6 }}>
                    {trackLabel(item.track, ui)}
                  </div>
                  <div className="wink-result-text">{trackDesc(item.track, ui)}</div>
                </div>

                {/* Name + score */}
                <div className="wink-result-head">
                  <div className="wink-card-title" style={{ fontSize: 30 }}>{item.name}</div>
                  <div className="wink-score-pill">{ui.score} {item.score}</div>
                </div>

                {/* Hanja */}
                {item.hanja && (
                  <div className="wink-result-section">
                    <div className="wink-result-label">{ui.hanja}</div>
                    <div className="wink-result-text" style={{ fontSize: 18, letterSpacing: 2 }}>
                      {item.hanja}
                    </div>
                    {item.hanja_meaning && (
                      <div className="wink-result-text" style={{ marginTop: 4, opacity: 0.8 }}>
                        {item.hanja_meaning}
                      </div>
                    )}
                    {item.hanja_strokes && (
                      <div className="wink-result-text" style={{ marginTop: 4, opacity: 0.7, fontSize: 13 }}>
                        {ui.hanjaStrokes}: {item.hanja_strokes}
                      </div>
                    )}
                  </div>
                )}

                {/* Five elements */}
                {item.five_elements && (
                  <div className="wink-result-section">
                    <div className="wink-result-label">{ui.fiveElements}</div>
                    <div className="wink-result-text">{item.five_elements}</div>
                  </div>
                )}

                {/* Phonetic harmony */}
                {item.phonetic_harmony && (
                  <div className="wink-result-section">
                    <div className="wink-result-label">{ui.phoneticHarmony}</div>
                    <div className="wink-result-text">{item.phonetic_harmony}</div>
                  </div>
                )}

                {/* Meaning */}
                <div className="wink-result-section">
                  <div className="wink-result-label">{ui.meaning}</div>
                  <div className="wink-result-text">{item.meaning}</div>
                </div>

                {/* Story */}
                <div className="wink-result-section">
                  <div className="wink-result-label">{ui.story}</div>
                  <div className="wink-result-text">{item.story}</div>
                </div>

                {/* Fit reason */}
                <div className="wink-result-section">
                  <div className="wink-result-label">{ui.fitReason}</div>
                  <div className="wink-result-text">{item.fit_reason}</div>
                </div>

                {/* Global script */}
                <div className="wink-result-section">
                  <div className="wink-result-label">{ui.globalPron}</div>
                  <div className="wink-global-grid">
                    <div className="wink-mini-card">
                      <div className="wink-mini-title">EN</div>
                      <div>{item.english}</div>
                    </div>
                    <div className="wink-mini-card">
                      <div className="wink-mini-title">中文</div>
                      <div>{item.chinese}</div>
                      <div className="wink-mini-sub">{item.chinese_pinyin}</div>
                    </div>
                    <div className="wink-mini-card">
                      <div className="wink-mini-title">日本語</div>
                      <div>{item.japanese_kana}</div>
                      <div className="wink-mini-sub">{item.japanese_reading}</div>
                    </div>
                  </div>
                </div>

                {/* Risk check */}
                <div className="wink-result-section">
                  <div className="wink-result-label">{ui.firstCheck}</div>
                  <div className="wink-risk-grid">
                    <div className={`wink-risk-chip ${riskClass(item.teasing_risk)}`}>
                      {ui.teasingRisk}: {ui.level[item.teasing_risk]}
                    </div>
                    <div className={`wink-risk-chip ${riskClass(item.similarity_risk)}`}>
                      {ui.similarityRisk}: {ui.level[item.similarity_risk]}
                    </div>
                    <div className={`wink-risk-chip ${riskClass(item.pronunciation_risk)}`}>
                      {ui.pronunciationRisk}: {ui.level[item.pronunciation_risk]}
                    </div>
                  </div>
                </div>

                {/* Caution */}
                <div className="wink-result-section">
                  <div className="wink-result-label">{ui.caution}</div>
                  <div className="wink-result-text">{item.caution || "-"}</div>
                </div>

                {/* Connection analysis */}
                {item.connection_analysis && (
                  <div className="wink-result-section" style={{ background: "rgba(201,168,76,0.08)", borderRadius: 10, padding: "12px 14px" }}>
                    <div className="wink-result-label" style={{ color: "#C9A84C" }}>{ui.connectionAnalysis}</div>
                    <div className="wink-result-text" style={{ marginTop: 4 }}>{item.connection_analysis}</div>
                  </div>
                )}

                {/* 인장 미리보기 — 선택된 이름 + 유료 + 카테고리 조건 */}
                {selectedNameIndex === idx && showSeal && (
                  <div
                    className="wink-result-section"
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0 8px" }}
                  >
                    <SealStamp name={item.name} size={160} />
                  </div>
                )}

                {/* Name selection button */}
                <div style={{ marginTop: 20 }}>
                  <button
                    type="button"
                    onClick={() => {
                      Sound.playTab();
                      Sound.playSeal();
                      setSelectedNameIndex(idx);
                      setGiftCardNameIndex(idx);
                    }}
                    style={{
                      width: "100%",
                      padding: "13px 0",
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: "pointer",
                      border: selectedNameIndex === idx
                        ? "2px solid rgba(201,168,76,0.80)"
                        : "1px solid var(--line-strong)",
                      background: selectedNameIndex === idx
                        ? "linear-gradient(135deg,rgba(201,168,76,0.22),rgba(201,168,76,0.12))"
                        : "transparent",
                      color: selectedNameIndex === idx ? "var(--gold-main)" : "var(--text-soft)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {selectedNameIndex === idx ? ui.nameSelectedBadge : ui.selectThisName}
                  </button>
                </div>

              </article>
            ))}
          </div>
        </section>

        {/* Selection trust banner */}
        {selectedNameIndex !== null && results[selectedNameIndex] && (
          <section
            style={{
              marginTop: 24,
              padding: "22px 24px",
              borderRadius: 16,
              border: "1px solid rgba(201,168,76,0.40)",
              background: "linear-gradient(160deg, rgba(201,168,76,0.10), rgba(11,22,52,0.70))",
              boxShadow: "0 8px 32px rgba(201,168,76,0.08)",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg,rgba(201,168,76,0.3),rgba(201,168,76,0.12))",
                border: "1px solid rgba(201,168,76,0.50)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, flexShrink: 0,
              }}>✦</div>
              <div>
                <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "rgba(201,168,76,0.85)", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>
                  선택 완료 · {results[selectedNameIndex].name}
                </div>
                <div className="wink-section-title" style={{ fontSize: 16 }}>
                  {ui.selectionTrustTitle}
                </div>
              </div>
            </div>
            <div className="wink-result-text" style={{ lineHeight: 1.85 }}>
              {ui.selectionTrustBody}
            </div>
          </section>
        )}

        {/* Package selection */}
        <section style={{ marginTop: 32, opacity: selectedNameIndex === null ? 0.45 : 1, transition: "opacity 0.3s" }}>
          <div className="wink-section-head">
            <h2 className="wink-section-title">{ui.packageTitle}</h2>
            <p className="wink-section-desc">
              {selectedNameIndex !== null && results[selectedNameIndex]
                ? `'${results[selectedNameIndex].name}' — ${ui.packageSub}`
                : ui.packageSub}
            </p>
          </div>
          <div className="wink-package-grid">
            {packageCards.map((pkg) => (
              <PackageCard
                key={pkg.id}
                title={pkg.title}
                desc={pkg.desc}
                price={pkg.price}
                selected={selectedPackage === pkg.id}
                selectedText={ui.selected}
                disabled={isSavingPackage || selectedNameIndex === null}
                onClick={() => { playClick(); selectedNameIndex !== null && handlePackageSelect(pkg); }}
              />
            ))}
          </div>
        </section>

        {/* A/S 섹션 */}
        {arsEligible && (
          <section className="wink-panel" style={{ marginTop: 24 }}>
            {nameConfirmed ? (
              /* 이름 확정 후 */
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", background: "rgba(201,168,76,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
                }}>✓</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gold-main)" }}>
                    {lang === "ko" ? "이름이 선택되었습니다" : "Name confirmed"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
                    {lang === "ko" ? "A/S 재설계는 더 이상 이용하실 수 없습니다." : "A/S redesign is no longer available."}
                  </div>
                </div>
              </div>
            ) : arsUsed ? (
              <div className="wink-score-pill">{ui.arsUsed}</div>
            ) : (
              /* 이름 미확정 + A/S 가능 */
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  {/* 이 이름으로 결정하기 */}
                  <button
                    type="button"
                    disabled={selectedNameIndex === null}
                    onClick={() => {
                      if (selectedNameIndex === null) return;
                      setNameConfirmed(true);
                      Sound.playNameComplete();
                    }}
                    style={{
                      flex: 1, padding: "13px 0", borderRadius: 12, border: "none",
                      cursor: selectedNameIndex !== null ? "pointer" : "not-allowed",
                      fontSize: 14, fontWeight: 700,
                      background: selectedNameIndex !== null
                        ? "linear-gradient(135deg, #C9A84C, #E8C870)"
                        : "rgba(201,168,76,0.2)",
                      color: selectedNameIndex !== null ? "#0a1228" : "var(--text-dim)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {lang === "ko" ? "이 이름으로 결정하기" : "Confirm This Name"}
                  </button>
                  {/* 다시 설계하기 (A/S) */}
                  <button
                    type="button"
                    onClick={() => setArsModalOpen(true)}
                    style={{
                      flex: 1, padding: "13px 0", borderRadius: 12,
                      cursor: "pointer", fontSize: 13, fontWeight: 600,
                      border: "1px solid var(--line-strong)", background: "transparent",
                      color: "var(--text-soft)",
                    }}
                  >
                    {lang === "ko" ? `다시 설계하기 (A/S)` : "Redesign (A/S)"}
                    {arsRemaining > 0 && (
                      <span style={{ display: "block", fontSize: 11, marginTop: 2, opacity: 0.7 }}>
                        {lang === "ko" ? `A/S ${arsRemaining}회 남음` : `${arsRemaining} redesign(s) left`}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* A/S 옵션 모달 */}
        {arsModalOpen && (
          <div
            style={{
              position: "fixed", inset: 0, zIndex: 9999,
              background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 16px",
            }}
            onClick={() => setArsModalOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 360, borderRadius: 20, padding: "28px 24px",
                background: "linear-gradient(160deg,#0e1a3d,#0a1228)",
                border: "1px solid rgba(201,168,76,0.25)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
                display: "flex", flexDirection: "column", gap: 14,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-main)" }}>
                {lang === "ko" ? "다시 설계해드릴게요" : "Let's Redesign"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  type="button"
                  onClick={async () => {
                    setArsModalOpen(false);
                    if (!briefId || !userId) return;
                    try {
                      await fetch("/api/ars", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId, briefId }),
                      });
                      setArsUsed(true);
                      setArsRemaining((r) => Math.max(0, r - 1));
                      hasCalledGPT.current = false;
                      setResults([]);
                      setExtraResults([]);
                      setSelectedNameIndex(null);
                      setSceneComplete(false);
                      setBrief((b) => (b ? { ...b } : null));
                    } catch { /* ignore */ }
                  }}
                  style={{
                    padding: "13px 0", borderRadius: 12,
                    border: "1px solid rgba(201,168,76,0.40)",
                    cursor: "pointer", fontSize: 14, fontWeight: 700,
                    background: "rgba(201,168,76,0.15)",
                    color: "var(--gold-main)",
                  }}
                >
                  {lang === "ko" ? "이전 정보 유지하고 설계" : "Keep Brief & Redesign"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setArsModalOpen(false);
                    router.push(`/${lang}/design?type=${brief?.category}&ars=1`);
                  }}
                  style={{
                    padding: "13px 0", borderRadius: 12,
                    cursor: "pointer", fontSize: 14, fontWeight: 600,
                    border: "1px solid var(--line-strong)", background: "transparent",
                    color: "var(--text-soft)",
                  }}
                >
                  {lang === "ko" ? "처음부터 다시 설계" : "Start Fresh"}
                </button>
                <button
                  type="button"
                  onClick={() => setArsModalOpen(false)}
                  style={{
                    padding: "10px 0", borderRadius: 12, border: "none",
                    cursor: "pointer", fontSize: 13, background: "transparent",
                    color: "var(--text-dim)",
                  }}
                >
                  {lang === "ko" ? "취소" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gift card creation panel — 유료 사용자만 표시 */}
        {!isFreeUser && <section className="wink-panel" style={{ marginTop: 24, opacity: selectedNameIndex === null ? 0.45 : 1, transition: "opacity 0.3s" }}>
          <div className="wink-section-title" style={{ marginBottom: 8 }}>{ui.giftCardCreate}</div>
          {selectedNameIndex !== null && results[selectedNameIndex] && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12, padding: "5px 12px", borderRadius: 999, background: "var(--gold-soft)", border: "1px solid var(--line-gold)" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-main)" }}>
                {results[selectedNameIndex].name}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{ui.nameSelectedBadge}</span>
            </div>
          )}
          {!giftCardToken ? (
            <>
              {/* ── 선물 카드 디자인 미리보기 ── */}
              {selectedNameIndex !== null && (() => {
                const allResults = [...results, ...extraResults];
                const previewItem = allResults[selectedNameIndex];
                return previewItem ? (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--text-dim)", marginBottom: 10, textTransform: "uppercase" }}>
                      Preview
                    </div>
                    <svg width="100%" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 12, maxWidth: 360, display: "block", margin: "0 auto" }}>
                      <defs>
                        <linearGradient id="cardBg" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#1B2A5E" />
                          <stop offset="100%" stopColor="#0D1A3E" />
                        </linearGradient>
                        <linearGradient id="cardGold" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#F0C84A" />
                          <stop offset="100%" stopColor="#C9A84C" />
                        </linearGradient>
                      </defs>
                      {/* 배경 */}
                      <rect width="320" height="180" rx="12" fill="url(#cardBg)" />
                      {/* 골드 상단 라인 */}
                      <rect x="0" y="0" width="320" height="4" rx="2" fill="url(#cardGold)" />
                      {/* 브랜드 */}
                      <text x="20" y="30" fill="rgba(201,168,76,0.7)" fontSize="9" fontWeight="600" letterSpacing="2">WINK NAMING</text>
                      {/* 이름 */}
                      <text x="20" y="80" fill="white" fontSize={previewItem.name.length <= 3 ? "42" : "32"} fontWeight="800" fontFamily="serif" letterSpacing="6">
                        {previewItem.name}
                      </text>
                      {/* 한자 */}
                      {previewItem.hanja && (
                        <text x="22" y="103" fill="rgba(201,168,76,0.65)" fontSize="13" letterSpacing="4">{previewItem.hanja}</text>
                      )}
                      {/* 골드 구분선 */}
                      <line x1="20" y1="116" x2="300" y2="116" stroke="rgba(201,168,76,0.25)" strokeWidth="0.8" />
                      {/* 의미 요약 */}
                      <text x="20" y="134" fill="rgba(201,214,240,0.55)" fontSize="9.5" fontFamily="sans-serif">
                        {(previewItem.meaning ?? "").slice(0, 48)}
                      </text>
                      {/* 수신자 */}
                      {giftCardRecipient && (
                        <text x="300" y="170" textAnchor="end" fill="rgba(201,168,76,0.5)" fontSize="9">For. {giftCardRecipient}</text>
                      )}
                    </svg>
                  </div>
                ) : null;
              })()}

              {!giftCardOpen ? (
                <button
                  type="button"
                  className="wink-secondary-btn"
                  disabled={selectedNameIndex === null}
                  onClick={() => selectedNameIndex !== null && setGiftCardOpen(true)}
                >
                  {ui.giftCardCreate}
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div className="wink-result-label" style={{ marginBottom: 4 }}>{ui.giftCardSender}</div>
                    <input
                      className="wink-input"
                      value={giftCardSender}
                      onChange={(e) => setGiftCardSender(e.target.value)}
                      placeholder={ui.giftCardSender}
                    />
                  </div>
                  <div>
                    <div className="wink-result-label" style={{ marginBottom: 4 }}>{ui.giftCardRecipient}</div>
                    <input
                      className="wink-input"
                      value={giftCardRecipient}
                      onChange={(e) => setGiftCardRecipient(e.target.value)}
                      placeholder={ui.giftCardRecipient}
                    />
                  </div>
                  <div>
                    <div className="wink-result-label" style={{ marginBottom: 4 }}>
                      {ui.giftCardEmail}
                      <span style={{ marginLeft: 6, fontSize: 10, color: "rgba(201,168,76,0.7)", fontWeight: 600 }}>선택</span>
                    </div>
                    <input
                      className="wink-input"
                      type="email"
                      value={giftCardRecipientEmail}
                      onChange={(e) => setGiftCardRecipientEmail(e.target.value)}
                      placeholder={ui.giftCardEmailPlaceholder}
                    />
                  </div>
                  <div>
                    <div className="wink-result-label" style={{ marginBottom: 4 }}>{ui.giftCardMessage}</div>
                    <textarea
                      className="wink-input"
                      rows={3}
                      value={giftCardMessage}
                      onChange={(e) => setGiftCardMessage(e.target.value)}
                      placeholder={ui.giftCardMessage}
                    />
                  </div>
                  <button
                    type="button"
                    className="wink-primary-btn"
                    disabled={giftCardLoading}
                    onClick={handleGiftCardSubmit}
                  >
                    {giftCardLoading ? ui.giftCardGenerating : ui.giftCardSubmit}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="wink-result-text" style={{ fontWeight: 600 }}>{ui.giftCardShareTitle}</div>
              <div className="wink-result-text" style={{ wordBreak: "break-all", opacity: 0.7 }}>{giftCardUrl}</div>
              <div className="wink-actions" style={{ flexWrap: "wrap" }}>
                <button type="button" className="wink-secondary-btn" onClick={() => handleGiftCardShare("copy")}>
                  {giftCardCopied ? ui.giftCardCopied : ui.giftCardCopyLink}
                </button>
                <button type="button" className="wink-secondary-btn" onClick={() => handleGiftCardShare("sms")}>
                  {ui.giftCardShareSMS}
                </button>
                <button type="button" className="wink-secondary-btn" onClick={() => handleGiftCardShare("kakao")}>
                  {ui.giftCardShareKakao}
                </button>
                {typeof navigator !== "undefined" && "share" in navigator && (
                  <button type="button" className="wink-primary-btn" onClick={() => handleGiftCardShare("native")}>
                    {ui.giftCardShareNative}
                  </button>
                )}
                <button type="button" className="wink-primary-btn"
                  onClick={() => router.push(giftCardUrl.replace(typeof window !== "undefined" ? window.location.origin : "", ""))}>
                  {ui.giftCardViewCard}
                </button>
              </div>
            </div>
          )}
        </section>}

        {/* ── 구매 패키지 옵션 ── */}
        {results.length > 0 && (
          <section className="wink-panel" style={{ marginTop: 24 }}>
            <div className="wink-section-title" style={{ marginBottom: 12 }}>{ui.purchaseTitle}</div>
            {/* 탭 */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {(["single", "bundle"] as const).map((tab) => (
                <button key={tab} type="button" onClick={() => setPurchaseTab(tab)} style={{
                  flex: 1, padding: "10px 0", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer",
                  border: purchaseTab === tab ? "2px solid var(--gold-main)" : "1px solid var(--line-strong)",
                  background: purchaseTab === tab ? "var(--gold-soft)" : "transparent",
                  color: purchaseTab === tab ? "var(--gold-main)" : "var(--text-soft)",
                  transition: "all 0.18s ease",
                }}>
                  {tab === "single" ? ui.purchaseSingle : ui.purchasePackage}
                </button>
              ))}
            </div>
            {purchaseTab === "single" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: ui.purchaseReport, price: PRICING.naming },
                  { label: ui.purchaseStamp, price: PRICING.stamp },
                  { label: ui.purchaseDoorplate, price: PRICING.doorplate },
                ].map((item) => (
                  <div key={item.label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 16px", borderRadius: 12, border: "1px solid var(--line-soft)",
                    background: "var(--bg-panel)",
                  }}>
                    <span style={{ fontSize: 14, color: "var(--text-main)" }}>{item.label}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "var(--gold-main)" }}>
                      ₩{item.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Object.values(PACKAGES).map((pkg) => (
                  <div key={pkg.label} style={{
                    padding: "16px 18px", borderRadius: 14,
                    border: "1px solid rgba(201,168,76,0.35)",
                    background: "linear-gradient(135deg, rgba(201,168,76,0.07), rgba(11,22,52,0.6))",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-main)", marginBottom: 3 }}>{pkg.label}</div>
                        <div style={{ fontSize: 12, color: "var(--text-dim)", textDecoration: "line-through" }}>
                          ₩{pkg.original.toLocaleString()}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--gold-main)" }}>₩{pkg.price.toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: "rgba(201,168,76,0.8)", fontWeight: 600 }}>10% OFF</div>
                      </div>
                    </div>
                  </div>
                ))}
                {/* 사회공헌 문구 */}
                <div style={{
                  marginTop: 4, padding: "16px 18px", borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  fontSize: 13, color: "var(--text-soft)", lineHeight: 1.9,
                  whiteSpace: "pre-line", textAlign: "center",
                }}>
                  {ui.socialMsg}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── 이름카드 이메일 전송 (유료 사용자 전용) ── */}
        {!isFreeUser && results.length > 0 && (
          <section className="wink-panel" style={{ marginTop: 24 }}>
            <div className="wink-section-title" style={{ marginBottom: 4 }}>{ui.sendCard}</div>
            <div className="wink-result-text" style={{ marginBottom: 12, opacity: 0.7 }}>{ui.sendCardDesc}</div>
            {sendCardMsg && (
              <div className="wink-success-banner" style={{ marginBottom: 12 }}>{sendCardMsg}</div>
            )}
            {!sendCardOpen ? (
              <button type="button" className="wink-secondary-btn" onClick={() => setSendCardOpen(true)}>
                ✉ {ui.sendCard}
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  className="wink-input"
                  type="email"
                  placeholder={ui.sendCardEmail}
                  value={sendCardEmail}
                  onChange={(e) => setSendCardEmail(e.target.value)}
                />
                <div className="wink-actions">
                  <button type="button" className="wink-primary-btn" disabled={sendCardLoading} onClick={handleSendCard}>
                    {sendCardLoading ? ui.sendCardSending : ui.sendCardSubmit}
                  </button>
                  <button type="button" className="wink-secondary-btn" onClick={() => setSendCardOpen(false)}>✕</button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 결과 공유 / 이미지 저장 */}
        {results.length > 0 && (
          <section className="wink-panel" style={{ marginTop: 24 }}>
            {isFreeUser ? (
              /* ── 무료 사용자: 텍스트 공유 버튼 3개 ── */
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="wink-section-title" style={{ marginBottom: 4, fontSize: 15 }}>
                  {lang === "ko" ? "이름 결과 받기" : "Receive Your Name Results"}
                </div>
                <div className="wink-result-text" style={{ marginBottom: 8, opacity: 0.75 }}>
                  {lang === "ko"
                    ? "선택하신 이름을 아래 방법으로 전송받으실 수 있습니다."
                    : "Receive your selected name via your preferred method."}
                </div>
                <button
                  type="button"
                  className="wink-secondary-btn"
                  onClick={() => setSendCardOpen(true)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  📧 {lang === "ko" ? "이메일로 받기" : "Receive by Email"}
                </button>
                <button
                  type="button"
                  className="wink-secondary-btn"
                  onClick={() => {
                    const name = topResult?.name ?? "";
                    const text = lang === "ko"
                      ? `윙크네이밍 결과: ${name}`
                      : `Wink Naming result: ${name}`;
                    window.open(`sms:?body=${encodeURIComponent(text)}`, "_blank");
                  }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  💬 {lang === "ko" ? "문자로 받기" : "Receive by SMS"}
                </button>
                <button
                  type="button"
                  className="wink-secondary-btn"
                  onClick={() => handleGiftShare("kakao")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  🟡 {lang === "ko" ? "카카오톡으로 받기" : "Receive via KakaoTalk"}
                </button>
              </div>
            ) : (
              /* ── 유료 사용자: 이미지 저장 + 선물하기 ── */
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button
                  type="button"
                  className="wink-secondary-btn"
                  disabled={isDownloading}
                  onClick={() => { playClick(); handleDownload(); }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  <span>🖼</span>
                  {isDownloading ? ui.downloadingCard : ui.downloadCard}
                </button>

                {!giftToken ? (
                  <button
                    type="button"
                    className="wink-secondary-btn"
                    disabled={giftLoading}
                    onClick={handleGiftCreate}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    <span>🎁</span>
                    {giftLoading ? ui.giftCreating : ui.giftCreate}
                  </button>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div className="wink-result-text" style={{ fontWeight: 600 }}>🎁 {ui.giftLinkReady}</div>
                    <div className="wink-result-text" style={{ wordBreak: "break-all", opacity: 0.65, fontSize: 13 }}>{giftUrl}</div>
                    <div className="wink-actions" style={{ flexWrap: "wrap" }}>
                      <button type="button" className="wink-secondary-btn" onClick={() => handleGiftShare("copy")}>
                        {giftCopied ? ui.giftCopied : ui.giftCopyLink}
                      </button>
                      <button type="button" className="wink-secondary-btn" onClick={() => handleGiftShare("kakao")}>
                        💬 {ui.giftShareKakao}
                      </button>
                      {typeof navigator !== "undefined" && "share" in navigator && (
                        <button type="button" className="wink-primary-btn" onClick={() => handleGiftShare("native")}>
                          {ui.giftShareNative}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── 무료 사용자 결제 유도 ── */}
        {isFreeUser && results.length > 0 && (
          <section
            style={{
              marginTop: 24, padding: "28px 24px", borderRadius: 20,
              border: "1px solid rgba(201,168,76,0.30)",
              background: "linear-gradient(160deg, rgba(201,168,76,0.07), rgba(11,22,52,0.65))",
              display: "flex", flexDirection: "column", gap: 12,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-main)", lineHeight: 1.35 }}>
              {lang === "ko" ? "어떠세요? 좀 아쉬운 마음이 드시나요?" : "Want more from your naming experience?"}
            </div>
            <div className="wink-result-text" style={{ lineHeight: 1.85 }}>
              {lang === "ko"
                ? "결제를 통해 만족스러운 결과와 차원이 다른 서비스를 만나보세요.\n한 번에 3개씩 작명되고, 선택받은 이름은 이름 선물카드와 이미지 다운로드가 가능해집니다.\n원하는 이름이 설계될 때까지 최선을 다하겠습니다."
                : "Upgrade to access 3 names at once, name gift cards, image downloads, and redesign support. We'll keep designing until you love your name."}
            </div>
            <button
              type="button"
              onClick={() => router.push(`/${lang}/category`)}
              style={{
                alignSelf: "flex-start", padding: "12px 24px", borderRadius: 12, border: "none",
                cursor: "pointer", fontSize: 15, fontWeight: 800,
                background: "linear-gradient(135deg, #C9A84C, #E8C870)",
                color: "#0a1228",
                boxShadow: "0 4px 16px rgba(201,168,76,0.35)",
              }}
            >
              {lang === "ko" ? "지금 바로 시작하기 →" : "Start Now →"}
            </button>
          </section>
        )}

        {/* Trust section */}
        <section className="wink-panel" style={{ marginTop: 32 }}>
          <div className="wink-section-title" style={{ marginBottom: 10 }}>{ui.trustTitle}</div>
          <div className="wink-result-text" style={{ marginBottom: 8 }}>{ui.trustBody1}</div>
          {brief?.category === "brand" && (
            <div className="wink-result-text" style={{ marginBottom: 8 }}>{ui.trustBody2}</div>
          )}
          <div className="wink-result-text">{ui.trustBody3}</div>
          <div className="wink-actions" style={{ marginTop: 16 }}>
            <TrustPill text={ui.trustPill1} />
            <TrustPill text={ui.trustPill2} />
            <TrustPill text={ui.trustPill3} />
          </div>
        </section>

        {/* Bottom actions */}
        <div className="wink-actions wink-actions-between" style={{ marginTop: 28 }}>
          <button type="button" className="wink-secondary-btn"
            onClick={() => router.push(`/${lang}/design?type=${brief?.category}`)}>
            {ui.backBrief}
          </button>
          <div className="wink-actions">
            <button type="button" className="wink-secondary-btn"
              onClick={() => router.push("/cart")}>
              {ui.goCart}
            </button>
            <button type="button" className="wink-primary-btn"
              onClick={() => router.push(`/${lang}/category`)}>
              {ui.startAgain}
            </button>
          </div>
        </div>

      </div>
    </main>
    </>
  );
}
