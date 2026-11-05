/**
 * 이름 생성 중 표시되는 6단계 분석 과정 — 사이트 지원 9개 언어.
 * NameGenerationScene의 statusMessage 영역에서 일정 간격으로 순환 표시된다.
 */
import type { AppLang } from "@/lib/lang-config";

export interface GenerationStep {
  n: string; // "STEP 1 · 音靈"
  label: string;
  sub: string;
}

export const GENERATION_STEPS: Record<AppLang, GenerationStep[]> = {
  ko: [
    { n: "STEP 1 · 音靈", label: "음령오행 분석 중", sub: "초성 자음의 오행 배속을 확인합니다" },
    { n: "STEP 2 · 字源", label: "자원오행 분석 중", sub: "한자 부수의 오행 속성을 매칭합니다" },
    { n: "STEP 3 · 數理", label: "수리성명학 계산 중", sub: "획수로 원·형·이·정 4격을 계산합니다" },
    { n: "STEP 4 · 四柱", label: "사주 보완 분석 중", sub: "부족한 오행을 이름으로 보완합니다" },
    { n: "STEP 5 · 人名", label: "인명용 한자 검증 중", sub: "대법원 공인 목록과 불용한자를 확인합니다" },
    { n: "STEP 6 · 發音", label: "글로벌 발음 검증 중", sub: "모국어 발음과 의미를 최종 확인합니다" },
  ],
  en: [
    { n: "STEP 1 · 音靈", label: "Analyzing Sound Elements", sub: "Mapping initial consonants to the Five Elements" },
    { n: "STEP 2 · 字源", label: "Analyzing Character Origins", sub: "Matching hanja radicals to elemental properties" },
    { n: "STEP 3 · 數理", label: "Calculating Stroke Numerology", sub: "Computing the four fortunes from stroke counts" },
    { n: "STEP 4 · 四柱", label: "Balancing Birth Chart", sub: "Compensating missing elements through your name" },
    { n: "STEP 5 · 人名", label: "Verifying Official Hanja", sub: "Checking against Supreme Court approved list" },
    { n: "STEP 6 · 發音", label: "Checking Global Pronunciation", sub: "Final review of meaning in your native language" },
  ],
  ja: [
    { n: "STEP 1 · 音靈", label: "音靈五行を分析中", sub: "初声子音の五行配属を確認します" },
    { n: "STEP 2 · 字源", label: "字源五行を分析中", sub: "漢字部首の五行属性をマッチングします" },
    { n: "STEP 3 · 數理", label: "数理姓名学を計算中", sub: "画数で元・亨・利・貞の四格を計算します" },
    { n: "STEP 4 · 四柱", label: "四柱補完を分析中", sub: "不足する五行を名前で補完します" },
    { n: "STEP 5 · 人名", label: "人名用漢字を検証中", sub: "大法院公認リストと不用漢字を確認します" },
    { n: "STEP 6 · 發音", label: "グローバル発音を検証中", sub: "母国語の発音と意味を最終確認します" },
  ],
  zh: [
    { n: "STEP 1 · 音靈", label: "分析音灵五行", sub: "确认初声辅音的五行归属" },
    { n: "STEP 2 · 字源", label: "分析字源五行", sub: "匹配汉字部首的五行属性" },
    { n: "STEP 3 · 數理", label: "计算数理姓名学", sub: "用笔画数计算元·亨·利·贞四格" },
    { n: "STEP 4 · 四柱", label: "分析四柱补完", sub: "用名字补充不足的五行" },
    { n: "STEP 5 · 人名", label: "验证人名用汉字", sub: "检查大法院认证名单及禁用汉字" },
    { n: "STEP 6 · 發音", label: "验证全球发音", sub: "最终确认母语发音和含义" },
  ],
  es: [
    { n: "STEP 1 · 音靈", label: "Analizando los Elementos del Sonido", sub: "Asignando las consonantes iniciales a los Cinco Elementos" },
    { n: "STEP 2 · 字源", label: "Analizando el Origen de los Caracteres", sub: "Vinculando los radicales hanja con sus propiedades elementales" },
    { n: "STEP 3 · 數理", label: "Calculando la Numerología de Trazos", sub: "Calculando las cuatro fortunas según el número de trazos" },
    { n: "STEP 4 · 四柱", label: "Equilibrando la Carta Natal", sub: "Compensando los elementos faltantes a través del nombre" },
    { n: "STEP 5 · 人名", label: "Verificando Hanja Oficiales", sub: "Comprobando la lista aprobada por la Corte Suprema" },
    { n: "STEP 6 · 發音", label: "Verificando la Pronunciación Global", sub: "Revisión final del significado en su idioma natal" },
  ],
  ru: [
    { n: "STEP 1 · 音靈", label: "Анализ звуковых элементов", sub: "Сопоставление начальных согласных с Пятью Элементами" },
    { n: "STEP 2 · 字源", label: "Анализ происхождения иероглифов", sub: "Сопоставление радикалов ханча с элементными свойствами" },
    { n: "STEP 3 · 數理", label: "Расчёт нумерологии черт", sub: "Вычисление четырёх показателей по количеству черт" },
    { n: "STEP 4 · 四柱", label: "Балансировка натальной карты", sub: "Компенсация недостающих элементов через имя" },
    { n: "STEP 5 · 人名", label: "Проверка официальных ханча", sub: "Сверка со списком, утверждённым Верховным судом" },
    { n: "STEP 6 · 發音", label: "Проверка глобального произношения", sub: "Финальная проверка смысла на родном языке" },
  ],
  fr: [
    { n: "STEP 1 · 音靈", label: "Analyse des Éléments Sonores", sub: "Attribution des consonnes initiales aux Cinq Éléments" },
    { n: "STEP 2 · 字源", label: "Analyse de l'Origine des Caractères", sub: "Correspondance des radicaux hanja avec leurs propriétés élémentaires" },
    { n: "STEP 3 · 數理", label: "Calcul de la Numérologie des Traits", sub: "Calcul des quatre fortunes à partir du nombre de traits" },
    { n: "STEP 4 · 四柱", label: "Équilibrage du Thème Natal", sub: "Compensation des éléments manquants par le nom" },
    { n: "STEP 5 · 人名", label: "Vérification des Hanja Officiels", sub: "Contrôle par rapport à la liste approuvée par la Cour suprême" },
    { n: "STEP 6 · 發音", label: "Vérification de la Prononciation Mondiale", sub: "Révision finale du sens dans votre langue maternelle" },
  ],
  ar: [
    { n: "STEP 1 · 音靈", label: "تحليل العناصر الصوتية", sub: "مطابقة الحروف الساكنة الأولى بالعناصر الخمسة" },
    { n: "STEP 2 · 字源", label: "تحليل أصل الأحرف", sub: "مطابقة جذور الهانجا بخصائصها العنصرية" },
    { n: "STEP 3 · 數理", label: "حساب علم الأعداد للحروف", sub: "حساب الحظوظ الأربعة من عدد الحروف" },
    { n: "STEP 4 · 四柱", label: "موازنة الخريطة الفلكية", sub: "تعويض العناصر الناقصة من خلال الاسم" },
    { n: "STEP 5 · 人名", label: "التحقق من الهانجا الرسمية", sub: "المطابقة مع القائمة المعتمدة من المحكمة العليا" },
    { n: "STEP 6 · 發音", label: "التحقق من النطق العالمي", sub: "المراجعة النهائية للمعنى بلغتك الأم" },
  ],
  hi: [
    { n: "STEP 1 · 音靈", label: "ध्वनि तत्वों का विश्लेषण", sub: "आरंभिक व्यंजनों को पंच तत्वों से जोड़ना" },
    { n: "STEP 2 · 字源", label: "अक्षर मूल का विश्लेषण", sub: "हानजा के मूल भागों को तात्विक गुणों से मिलाना" },
    { n: "STEP 3 · 數理", label: "स्ट्रोक अंकशास्त्र की गणना", sub: "स्ट्रोक गिनती से चार भाग्यों की गणना" },
    { n: "STEP 4 · 四柱", label: "जन्म कुंडली संतुलन", sub: "नाम के माध्यम से कमी वाले तत्वों की पूर्ति" },
    { n: "STEP 5 · 人名", label: "आधिकारिक हानजा सत्यापन", sub: "सर्वोच्च न्यायालय द्वारा अनुमोदित सूची की जांच" },
    { n: "STEP 6 · 發音", label: "वैश्विक उच्चारण की जांच", sub: "आपकी मातृभाषा में अर्थ की अंतिम समीक्षा" },
  ],
};
