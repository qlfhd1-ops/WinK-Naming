import { type Lang } from "./lang";

export const INFO_TABS_BY_LANG: Record<Lang, { id: string; label: string }[]> = {
  ko: [
    { id: "rank",    label: "📊 인기순위" },
    { id: "saju",    label: "☯ 성명학·사주" },
    { id: "sejong",  label: "👑 세종대왕·한글" },
    { id: "culture", label: "🌍 한국이름문화" },
    { id: "tips",    label: "💡 이름선택팁" },
  ],
  en: [
    { id: "rank",    label: "📊 Name Rankings" },
    { id: "saju",    label: "☯ Saju & Ohaeng" },
    { id: "sejong",  label: "👑 King Sejong" },
    { id: "culture", label: "🌍 Korean Name Culture" },
    { id: "tips",    label: "💡 Naming Tips" },
  ],
  ja: [
    { id: "rank",    label: "📊 人気ランキング" },
    { id: "saju",    label: "☯ 四柱·五行" },
    { id: "sejong",  label: "👑 世宗大王·ハングル" },
    { id: "culture", label: "🌍 韓国名文化" },
    { id: "tips",    label: "💡 命名のヒント" },
  ],
  zh: [
    { id: "rank",    label: "📊 热门排名" },
    { id: "saju",    label: "☯ 四柱·五行" },
    { id: "sejong",  label: "👑 世宗大王·韩文" },
    { id: "culture", label: "🌍 韩国名字文化" },
    { id: "tips",    label: "💡 起名技巧" },
  ],
  es: [
    { id: "rank",    label: "📊 Rankings" },
    { id: "saju",    label: "☯ Saju & Ohaeng" },
    { id: "sejong",  label: "👑 Rey Sejong" },
    { id: "culture", label: "🌍 Cultura de Nombres" },
    { id: "tips",    label: "💡 Consejos de Nombre" },
  ],
  fr: [
    { id: "rank",    label: "📊 Classements" },
    { id: "saju",    label: "☯ Saju & Ohaeng" },
    { id: "sejong",  label: "👑 Roi Sejong" },
    { id: "culture", label: "🌍 Culture des Prénoms" },
    { id: "tips",    label: "💡 Conseils de Prénom" },
  ],
  ru: [
    { id: "rank",    label: "📊 Рейтинги" },
    { id: "saju",    label: "☯ Саджу·Оhэн" },
    { id: "sejong",  label: "👑 Король Сечжон" },
    { id: "culture", label: "🌍 Культура имён" },
    { id: "tips",    label: "💡 Советы по именам" },
  ],
  ar: [
    { id: "rank",    label: "📊 تصنيفات الأسماء" },
    { id: "saju",    label: "☯ ساجو وأوهيج" },
    { id: "sejong",  label: "👑 الملك سيجونغ" },
    { id: "culture", label: "🌍 ثقافة الأسماء الكورية" },
    { id: "tips",    label: "💡 نصائح التسمية" },
  ],
  hi: [
    { id: "rank",    label: "📊 नाम रैंकिंग" },
    { id: "saju",    label: "☯ साजू·ओहेंग" },
    { id: "sejong",  label: "👑 राजा सेजोंग" },
    { id: "culture", label: "🌍 कोरियाई नाम संस्कृति" },
    { id: "tips",    label: "💡 नामकरण टिप्स" },
  ],
};

export const INFO_TABS = INFO_TABS_BY_LANG.ko;

export type InfoTabId = "rank" | "saju" | "sejong" | "culture" | "tips";

export type InfoCard = { title: string; body: string; highlight?: string };

export type InfoCardSet = Record<InfoTabId, InfoCard[]>;

export const INFO_CARDS_BY_LANG: Record<Lang, InfoCardSet> = {
  ko: {
    saju: [
      { title: "음양오행(陰陽五行)", body: "목(木)·화(火)·토(土)·금(金)·수(水) 다섯 기운의 균형. 이름 획수와 오행이 사주와 조화를 이루어야 생동감 있는 이름이 됩니다.", highlight: "木 火 土 金 水" },
      { title: "발음오행(發音五行)", body: "이름 첫 자음의 발음 기운. ㄱ·ㅋ=목, ㄴ·ㄹ=화, ㅇ·ㅎ=토, ㅅ·ㅈ=금, ㅁ·ㅂ=수. 성씨 오행과 균형이 필요합니다.", highlight: "초성별 오행 분류" },
      { title: "자원오행(字源五行)", body: "한자 자체가 지닌 오행 기운. 水(물 수)=수, 木(나무 목)=목 처럼 한자의 의미와 오행이 일치해야 이름이 더 강해집니다.", highlight: "한자 의미 오행" },
      { title: "수리오행(數理五行)", body: "이름 획수의 합산으로 보는 기운. 성씨 획수+이름 획수의 조합이 길수(吉數)인지 확인합니다. 81수리가 기준입니다.", highlight: "81수리 기준" },
    ],
    sejong: [
      { title: "👑 세종대왕 한글 창제 (1443)", body: "조선 4대 왕 세종대왕이 1443년 창제한 한글. 당시 백성들이 어려운 한자를 배우지 못해 글을 모르는 현실을 안타깝게 여겨 만들었습니다.", highlight: "1443년 훈민정음" },
      { title: "🔬 세계 가장 과학적인 문자", body: "한글은 자음 14자·모음 10자 총 24자로 구성. 발음기관의 모양을 본떠 만든 세계 유일의 과학적 문자입니다.", highlight: "자음 14자 + 모음 10자" },
      { title: "📜 UNESCO 세계기록유산", body: "1997년 훈민정음 해례본이 UNESCO 세계기록유산에 등재. 현존하는 유일한 문자 창제 해설서로 세계적 가치를 인정받았습니다.", highlight: "UNESCO 1997년 등재" },
      { title: "🌐 한글의 우수성", body: "영국 언어학자 Geoffrey Sampson은 한글을 '인류의 가장 위대한 지적 업적'으로 평가. 24개 자모로 11,172가지 음절 표현이 가능합니다.", highlight: "11,172가지 음절 표현" },
    ],
    rank: [
      { title: "🏆 남아 1위 · 도윤", body: "2026년 가장 많이 지어진 남자 이름. 밝은 빛(도)과 윤택함(윤)의 조화.", highlight: "도윤 · 道潤" },
      { title: "🌸 여아 1위 · 서윤", body: "2026년 가장 인기 있는 여자 이름. 상서로운(서) 윤택함(윤)을 담은 이름.", highlight: "서윤 · 瑞潤" },
      { title: "📈 트렌드 키워드", body: "2026년 이름 트렌드: '윤·준·하·서'가 가장 많이 쓰인 음절. 밝고 개방적인 느낌 선호.", highlight: "윤 · 준 · 하 · 서" },
      { title: "🔤 순우리말 부활", body: "하늘, 가온, 봄, 누리 등 순우리말 이름이 2026년 꾸준히 증가세.", highlight: "하늘 · 가온 · 봄" },
    ],
    culture: [
      { title: "한국 이름의 구조", body: "성(姓) 1자 + 이름 2자가 일반적. 총 3자. 이름에 돌림자(항렬자)를 넣는 전통이 있습니다.", highlight: "성 1자 + 이름 2자" },
      { title: "한자 문화권", body: "한국 이름의 80% 이상은 한자에 기원합니다. 같은 이름도 한자가 다르면 뜻이 다릅니다.", highlight: "漢字 기반" },
      { title: "외국인 한국 이름", body: "원래 이름의 발음·의미·느낌을 분석해 한국어로 재설계합니다. 단순 음역이 아닌 진짜 '한국 이름'입니다.", highlight: "음역 → 의역 → 창작" },
      { title: "이름과 인상", body: "한국에서는 이름이 첫인상에 큰 영향을 미칩니다. 발음의 강약, 한자의 의미, 획수까지 모두 고려됩니다.", highlight: "이름 = 첫인상" },
    ],
    tips: [
      { title: "부르기 좋은 이름", body: "2음절 이름이 부르기 가장 편합니다. 받침이 너무 많으면 답답하게 들릴 수 있으니 개방형 음절을 활용하세요.", highlight: "2음절 · 개방형 음절" },
      { title: "미래를 고려하세요", body: "어릴 때뿐 아니라 어른이 됐을 때도 어울리는 이름이 좋습니다. 너무 유아적이거나 시대적인 이름은 피하세요.", highlight: "평생 쓰는 이름" },
      { title: "다국어 발음 확인", body: "글로벌 시대에는 영어권·중국어권에서 이름이 어떻게 발음되는지 미리 확인하는 것이 좋습니다.", highlight: "영어 · 중국어 · 일본어" },
      { title: "가족과 함께 결정", body: "이름은 혼자 고르는 것보다 가족이 함께 여러 후보를 두고 불러보며 결정하는 것을 권장합니다.", highlight: "3개 후보 비교" },
    ],
  },
  en: {
    saju: [
      { title: "Five Elements (陰陽五行)", body: "Balance of Wood·Fire·Earth·Metal·Water. The name's stroke count and elements must harmonize with the saju chart for a vibrant name.", highlight: "Wood Fire Earth Metal Water" },
      { title: "Phonetic Elements (發音五行)", body: "The elemental energy of the first consonant. ㄱ·ㅋ=Wood, ㄴ·ㄹ=Fire, ㅇ·ㅎ=Earth, ㅅ·ㅈ=Metal, ㅁ·ㅂ=Water. Balance with the family name element is essential.", highlight: "Initial consonant classification" },
      { title: "Hanja Elements (字源五行)", body: "The elemental energy within the hanja itself. 水 (water)=Water, 木 (wood)=Wood — the hanja meaning and element should align to strengthen the name.", highlight: "Hanja meaning element" },
      { title: "Numerological Elements (數理五行)", body: "Energy derived from the sum of stroke counts. We check whether the combination of family+given name strokes forms a lucky number (吉數). Based on the 81-number system.", highlight: "81-number system" },
    ],
    sejong: [
      { title: "👑 King Sejong Creates Hangul (1443)", body: "King Sejong, the 4th king of Joseon, created Hangul in 1443. He was saddened that ordinary people couldn't read because Chinese characters were too difficult.", highlight: "1443 Hunminjeongeum" },
      { title: "🔬 The World's Most Scientific Script", body: "Hangul consists of 14 consonants and 10 vowels — 24 letters total. It is the world's only writing system modeled after the shape of the human speech organs.", highlight: "14 consonants + 10 vowels" },
      { title: "📜 UNESCO Memory of the World", body: "In 1997, the Hunminjeongeum Haeryebon was inscribed on UNESCO's Memory of the World Register as the only existing explanatory document of a script's creation.", highlight: "UNESCO 1997" },
      { title: "🌐 Excellence of Hangul", body: "British linguist Geoffrey Sampson called Hangul 'the greatest intellectual achievement in human history.' With 24 letters, it can express 11,172 distinct syllables.", highlight: "11,172 syllable expressions" },
    ],
    rank: [
      { title: "🏆 Boys #1 · Doyun", body: "The most given boy's name in 2026. A harmony of bright light (Do) and abundance (Yun).", highlight: "도윤 · 道潤" },
      { title: "🌸 Girls #1 · Seoyun", body: "The most popular girl's name in 2026. A name carrying auspiciousness (Seo) and abundance (Yun).", highlight: "서윤 · 瑞潤" },
      { title: "📈 Trend Keywords", body: "2026 name trends: 'Yun·Jun·Ha·Seo' are the most-used syllables. Bright and open-feeling names are preferred.", highlight: "Yun · Jun · Ha · Seo" },
      { title: "🔤 Pure Korean Revival", body: "Pure Korean names like Haneul (sky), Gaon, Bom (spring), Nuri are steadily growing in 2026.", highlight: "Haneul · Gaon · Bom" },
    ],
    culture: [
      { title: "Structure of Korean Names", body: "Typically 1 surname + 2 given name characters = 3 total. There is a tradition of including a generation character (돌림자) shared among siblings.", highlight: "1 surname + 2 given" },
      { title: "Hanja (Chinese Character) Culture", body: "Over 80% of Korean names originate from hanja. Even the same name can have different meanings depending on which hanja characters are used.", highlight: "漢字 based" },
      { title: "Korean Names for Foreigners", body: "We analyze the phonetics, meaning, and feel of the original name to redesign it in Korean. Not mere transliteration — a true Korean name.", highlight: "Transliteration → Meaning → Creation" },
      { title: "Names & First Impressions", body: "In Korea, a name has a significant impact on first impressions. The strength of pronunciation, meaning of hanja, and stroke count are all considered.", highlight: "Name = First Impression" },
    ],
    tips: [
      { title: "Names That Are Easy to Call", body: "2-syllable names are the easiest to call. Too many final consonants can sound cramped, so open syllables are recommended.", highlight: "2 syllables · open syllables" },
      { title: "Think About the Future", body: "A name that suits both childhood and adulthood is ideal. Avoid names that sound too childish or too tied to a specific era.", highlight: "A name for life" },
      { title: "Check Multilingual Pronunciation", body: "In the global era, it's wise to check how the name sounds in English and Chinese before deciding.", highlight: "English · Chinese · Japanese" },
      { title: "Decide Together as a Family", body: "Rather than choosing alone, we recommend that the whole family tries calling several candidates aloud together before deciding.", highlight: "Compare 3 candidates" },
    ],
  },
  ja: {
    saju: [
      { title: "陰陽五行", body: "木·火·土·金·水の五つの気の均衡。名前の画数と五行が四柱と調和することで、生き生きとした名前になります。", highlight: "木 火 土 金 水" },
      { title: "発音五行", body: "名前の最初の子音の発音の気。ㄱ·ㅋ=木、ㄴ·ㄹ=火、ㅇ·ㅎ=土、ㅅ·ㅈ=金、ㅁ·ㅂ=水。姓の五行とのバランスが必要です。", highlight: "初声別五行分類" },
      { title: "字源五行", body: "漢字自体が持つ五行の気。水(水)=水、木(木)=木のように、漢字の意味と五行が一致することで名前がより強くなります。", highlight: "漢字意味五行" },
      { title: "数理五行", body: "名前の画数の合計で見る気。姓の画数+名前の画数の組み合わせが吉数かどうかを確認します。81数理が基準です。", highlight: "81数理基準" },
    ],
    sejong: [
      { title: "👑 世宗大王ハングル創制 (1443)", body: "朝鮮第4代王・世宗大王が1443年に創制したハングル。当時の民が難しい漢字を学べず文字を知らない現実を憂い作りました。", highlight: "1443年 訓民正音" },
      { title: "🔬 世界最も科学的な文字", body: "ハングルは子音14字·母音10字、計24字で構成。発音器官の形を模した世界唯一の科学的文字です。", highlight: "子音14字 + 母音10字" },
      { title: "📜 UNESCO世界記録遺産", body: "1997年、訓民正音解例本がUNESCO世界記録遺産に登録。現存する唯一の文字創制解説書として世界的価値を認められました。", highlight: "UNESCO 1997年登録" },
      { title: "🌐 ハングルの優秀性", body: "英国の言語学者Geoffrey Sampsonはハングルを「人類最大の知的業績」と評価。24字母で11,172種類の音節表現が可能です。", highlight: "11,172種類の音節" },
    ],
    rank: [
      { title: "🏆 男の子1位 · 도윤", body: "2026年最も多く付けられた男の子の名前。明るい光(도)と潤い(윤)の調和。", highlight: "도윤 · 道潤" },
      { title: "🌸 女の子1位 · 서윤", body: "2026年最も人気のある女の子の名前。縁起良い(서)潤い(윤)を込めた名前。", highlight: "서윤 · 瑞潤" },
      { title: "📈 トレンドキーワード", body: "2026年の名前トレンド：「윤·준·하·서」が最も多く使われた音節。明るく開放的な印象が好まれます。", highlight: "윤 · 준 · 하 · 서" },
      { title: "🔤 純韓国語の復活", body: "하늘(空)、가온、봄(春)、누리など純韓国語の名前が2026年着実に増加中。", highlight: "하늘 · 가온 · 봄" },
    ],
    culture: [
      { title: "韓国名の構造", body: "姓1字+名2字が一般的。計3字。名前に通し字（항렬자）を入れる伝統があります。", highlight: "姓1字 + 名2字" },
      { title: "漢字文化圏", body: "韓国名の80%以上は漢字に由来します。同じ名前でも漢字が違えば意味が異なります。", highlight: "漢字ベース" },
      { title: "外国人の韓国名", body: "元の名前の発音·意味·印象を分析して韓国語で再設計します。単なる音訳ではなく本物の「韓国名」です。", highlight: "音訳 → 意訳 → 創作" },
      { title: "名前と第一印象", body: "韓国では名前が第一印象に大きく影響します。発音の強弱、漢字の意味、画数まで全て考慮されます。", highlight: "名前 = 第一印象" },
    ],
    tips: [
      { title: "呼びやすい名前", body: "2音節の名前が最も呼びやすいです。パッチムが多すぎると詰まって聞こえるので、開放型音節の活用をお勧めします。", highlight: "2音節 · 開放型音節" },
      { title: "将来を考えてください", body: "子どもの頃だけでなく、大人になっても似合う名前が良いです。幼すぎたり時代的すぎる名前は避けましょう。", highlight: "一生使う名前" },
      { title: "多言語発音の確認", body: "グローバル時代には英語圏·中国語圏でどう発音されるか事前に確認することをお勧めします。", highlight: "英語 · 中国語 · 日本語" },
      { title: "家族で決める", body: "一人で選ぶより、家族で複数の候補を声に出して呼んでみて決めることをお勧めします。", highlight: "3候補を比較" },
    ],
  },
  zh: {
    saju: [
      { title: "阴阳五行", body: "木·火·土·金·水五种气的平衡。名字的笔画数和五行需要与四柱相协调，才能成为充满生命力的名字。", highlight: "木 火 土 金 水" },
      { title: "发音五行", body: "名字第一个声母的发音之气。ㄱ·ㅋ=木，ㄴ·ㄹ=火，ㅇ·ㅎ=土，ㅅ·ㅈ=金，ㅁ·ㅂ=水。需要与姓氏五行保持平衡。", highlight: "声母五行分类" },
      { title: "字源五行", body: "汉字本身所含的五行之气。水(水)=水，木(木)=木，汉字含义与五行一致才能使名字更加有力。", highlight: "汉字含义五行" },
      { title: "数理五行", body: "由名字笔画总数看出的气。确认姓氏笔画+名字笔画的组合是否为吉数。以81数理为基准。", highlight: "81数理基准" },
    ],
    sejong: [
      { title: "👑 世宗大王创制韩文 (1443)", body: "朝鲜第4代国王世宗大王于1443年创制了韩文。他对当时百姓因无法学习艰涩汉字而不识字的现实深感痛心。", highlight: "1443年 训民正音" },
      { title: "🔬 世界最科学的文字", body: "韩文由14个辅音·10个元音共24个字母组成。是世界上唯一以发音器官形状为基础创制的科学文字。", highlight: "辅音14个 + 元音10个" },
      { title: "📜 UNESCO世界记忆遗产", body: "1997年，《训民正音》解例本被列入UNESCO世界记忆遗产。作为现存唯一的文字创制解说书，获得了全球认可。", highlight: "UNESCO 1997年入选" },
      { title: "🌐 韩文的优越性", body: "英国语言学家Geoffrey Sampson将韩文评为「人类最伟大的智识成就」。24个字母可以表达11,172种音节。", highlight: "11,172种音节表达" },
    ],
    rank: [
      { title: "🏆 男孩第1名 · 도윤", body: "2026年取名最多的男孩名字。明亮之光（도）与润泽（윤）的和谐。", highlight: "도윤 · 道潤" },
      { title: "🌸 女孩第1名 · 서윤", body: "2026年最受欢迎的女孩名字。承载吉祥（서）与润泽（윤）的名字。", highlight: "서윤 · 瑞潤" },
      { title: "📈 流行关键词", body: "2026年名字趋势：「윤·준·하·서」是使用最多的音节。偏爱明亮开朗的感觉。", highlight: "윤 · 준 · 하 · 서" },
      { title: "🔤 纯韩语复兴", body: "하늘(天空)、가온、봄(春天)、누리等纯韩语名字在2026年持续增长。", highlight: "하늘 · 가온 · 봄" },
    ],
    culture: [
      { title: "韩国名字的结构", body: "通常为姓1字+名2字，共3字。名字中有放入「字辈字」（항렬자）的传统。", highlight: "姓1字 + 名2字" },
      { title: "汉字文化圈", body: "韩国名字80%以上源自汉字。即使是相同的名字，使用不同汉字意义也会不同。", highlight: "漢字为基础" },
      { title: "外国人的韩国名字", body: "分析原名的发音·含义·感觉后用韩语重新设计。不是简单的音译，而是真正的「韩国名字」。", highlight: "音译 → 意译 → 创作" },
      { title: "名字与第一印象", body: "在韩国，名字对第一印象有很大影响。发音的强弱、汉字的含义、笔画数都会被考虑。", highlight: "名字 = 第一印象" },
    ],
    tips: [
      { title: "容易呼唤的名字", body: "2个音节的名字最容易呼唤。尾音太多会显得沉闷，建议使用开放型音节。", highlight: "2音节 · 开放型音节" },
      { title: "考虑未来", body: "适合童年也适合成年的名字才是好名字。避免过于幼稚或过于时代性的名字。", highlight: "一生使用的名字" },
      { title: "确认多语言发音", body: "在全球化时代，建议提前确认名字在英语圈·中文圈如何发音。", highlight: "英语 · 中文 · 日语" },
      { title: "与家人共同决定", body: "比起一个人选择，建议全家人一起大声呼唤几个候选名字后再做决定。", highlight: "比较3个候选" },
    ],
  },
  es: {
    saju: [
      { title: "Cinco Elementos (陰陽五行)", body: "Equilibrio de Madera·Fuego·Tierra·Metal·Agua. Los trazos del nombre y los elementos deben armonizar con el saju para un nombre vibrante.", highlight: "Madera Fuego Tierra Metal Agua" },
      { title: "Elementos Fonéticos (發音五行)", body: "La energía elemental de la primera consonante. ㄱ·ㅋ=Madera, ㄴ·ㄹ=Fuego, ㅇ·ㅎ=Tierra, ㅅ·ㅈ=Metal, ㅁ·ㅂ=Agua. Balance con el apellido es esencial.", highlight: "Clasificación por consonante" },
      { title: "Elementos Hanja (字源五行)", body: "La energía elemental dentro del hanja mismo. 水=Agua, 木=Madera — el significado del hanja y el elemento deben alinearse.", highlight: "Elemento de significado hanja" },
      { title: "Elementos Numerológicos (數理五行)", body: "Energía derivada de la suma de trazos. Verificamos si la combinación apellido+nombre forma un número auspicioso. Sistema de 81 números.", highlight: "Sistema 81 números" },
    ],
    sejong: [
      { title: "👑 Rey Sejong Crea Hangul (1443)", body: "El Rey Sejong, 4° rey de Joseon, creó el Hangul en 1443. Le entristecía que el pueblo no pudiera leer porque los caracteres chinos eran demasiado difíciles.", highlight: "1443 Hunminjeongeum" },
      { title: "🔬 El Alfabeto Más Científico", body: "Hangul consta de 14 consonantes y 10 vocales — 24 letras. Es el único sistema de escritura del mundo modelado según los órganos del habla.", highlight: "14 consonantes + 10 vocales" },
      { title: "📜 UNESCO Memoria del Mundo", body: "En 1997, el Hunminjeongeum Haeryebon fue inscrito en la Memoria del Mundo de la UNESCO como único documento explicativo existente de un alfabeto.", highlight: "UNESCO 1997" },
      { title: "🌐 Excelencia del Hangul", body: "El lingüista británico Geoffrey Sampson llamó al Hangul 'el mayor logro intelectual de la historia humana.' Con 24 letras expresa 11,172 sílabas.", highlight: "11,172 expresiones silábicas" },
    ],
    rank: [
      { title: "🏆 Niños #1 · Doyun", body: "El nombre de niño más dado en 2026. Armonía de luz brillante (Do) y abundancia (Yun).", highlight: "도윤 · 道潤" },
      { title: "🌸 Niñas #1 · Seoyun", body: "El nombre de niña más popular en 2026. Nombre que lleva auspicio (Seo) y abundancia (Yun).", highlight: "서윤 · 瑞潤" },
      { title: "📈 Palabras Clave de Tendencia", body: "Tendencias de nombres en 2026: 'Yun·Jun·Ha·Seo' son las sílabas más usadas. Se prefieren nombres brillantes y abiertos.", highlight: "Yun · Jun · Ha · Seo" },
      { title: "🔤 Renacimiento del Coreano Puro", body: "Nombres en coreano puro como Haneul (cielo), Gaon, Bom (primavera), Nuri crecen constantemente en 2026.", highlight: "Haneul · Gaon · Bom" },
    ],
    culture: [
      { title: "Estructura de Nombres Coreanos", body: "Típicamente 1 apellido + 2 caracteres de nombre dado = 3 en total. Hay tradición de incluir un carácter generacional compartido entre hermanos.", highlight: "1 apellido + 2 nombre" },
      { title: "Cultura Hanja", body: "Más del 80% de los nombres coreanos tienen origen en hanja. Incluso el mismo nombre puede tener diferentes significados según qué hanja se use.", highlight: "Basado en 漢字" },
      { title: "Nombres Coreanos para Extranjeros", body: "Analizamos la fonética, el significado y el sentido del nombre original para rediseñarlo en coreano. No es mera transliteración — es un nombre coreano real.", highlight: "Transliteración → Significado → Creación" },
      { title: "Nombres y Primera Impresión", body: "En Corea, el nombre tiene un gran impacto en la primera impresión. Se considera la fuerza de pronunciación, el significado del hanja y los trazos.", highlight: "Nombre = Primera Impresión" },
    ],
    tips: [
      { title: "Nombres Fáciles de Llamar", body: "Los nombres de 2 sílabas son los más fáciles de llamar. Demasiadas consonantes finales pueden sonar atiborradas; se recomiendan sílabas abiertas.", highlight: "2 sílabas · sílabas abiertas" },
      { title: "Piensa en el Futuro", body: "Un nombre que se adapte tanto a la infancia como a la adultez es ideal. Evita nombres demasiado infantiles o ligados a una era específica.", highlight: "Un nombre para toda la vida" },
      { title: "Verifica la Pronunciación Multilingüe", body: "En la era global, es prudente verificar cómo suena el nombre en inglés y chino antes de decidir.", highlight: "Inglés · Chino · Japonés" },
      { title: "Decide en Familia", body: "En lugar de elegir solo, recomendamos que toda la familia pruebe llamar varios candidatos en voz alta antes de decidir.", highlight: "Compara 3 candidatos" },
    ],
  },
  fr: {
    saju: [
      { title: "Cinq Éléments (陰陽五行)", body: "Équilibre entre Bois·Feu·Terre·Métal·Eau. Les traits du prénom et les éléments doivent s'harmoniser avec le saju pour un prénom vibrant.", highlight: "Bois Feu Terre Métal Eau" },
      { title: "Éléments Phonétiques (發音五行)", body: "L'énergie élémentale de la première consonne. ㄱ·ㅋ=Bois, ㄴ·ㄹ=Feu, ㅇ·ㅎ=Terre, ㅅ·ㅈ=Métal, ㅁ·ㅂ=Eau. L'équilibre avec le nom de famille est essentiel.", highlight: "Classification par consonne" },
      { title: "Éléments Hanja (字源五行)", body: "L'énergie élémentale dans le hanja lui-même. 水=Eau, 木=Bois — le sens du hanja et l'élément doivent s'aligner.", highlight: "Élément de sens hanja" },
      { title: "Éléments Numériques (數理五行)", body: "Énergie dérivée de la somme des traits. Nous vérifions si la combinaison nom de famille+prénom forme un nombre auspicieux. Système à 81 nombres.", highlight: "Système 81 nombres" },
    ],
    sejong: [
      { title: "👑 Le Roi Sejong Crée Hangul (1443)", body: "Le Roi Sejong, 4e roi de Joseon, a créé le Hangul en 1443. Il était attristé que le peuple ne puisse pas lire car les caractères chinois étaient trop difficiles.", highlight: "1443 Hunminjeongeum" },
      { title: "🔬 L'Alphabet le Plus Scientifique", body: "Hangul se compose de 14 consonnes et 10 voyelles — 24 lettres. C'est le seul système d'écriture au monde modélisé sur les organes de la parole.", highlight: "14 consonnes + 10 voyelles" },
      { title: "📜 UNESCO Mémoire du Monde", body: "En 1997, le Hunminjeongeum Haeryebon a été inscrit au Registre Mémoire du Monde de l'UNESCO comme unique document explicatif existant d'un alphabet.", highlight: "UNESCO 1997" },
      { title: "🌐 Excellence du Hangul", body: "Le linguiste britannique Geoffrey Sampson a qualifié Hangul de « la plus grande réalisation intellectuelle de l'histoire humaine ». Avec 24 lettres, il exprime 11 172 syllabes.", highlight: "11 172 expressions syllabiques" },
    ],
    rank: [
      { title: "🏆 Garçons #1 · Doyun", body: "Le prénom de garçon le plus donné en 2026. Une harmonie de lumière vive (Do) et d'abondance (Yun).", highlight: "도윤 · 道潤" },
      { title: "🌸 Filles #1 · Seoyun", body: "Le prénom de fille le plus populaire en 2026. Un prénom portant la chance (Seo) et l'abondance (Yun).", highlight: "서윤 · 瑞潤" },
      { title: "📈 Mots-Clés Tendance", body: "Tendances des prénoms en 2026 : « Yun·Jun·Ha·Seo » sont les syllabes les plus utilisées. Les prénoms lumineux et ouverts sont préférés.", highlight: "Yun · Jun · Ha · Seo" },
      { title: "🔤 Renaissance du Coréen Pur", body: "Les prénoms en coréen pur comme Haneul (ciel), Gaon, Bom (printemps), Nuri croissent régulièrement en 2026.", highlight: "Haneul · Gaon · Bom" },
    ],
    culture: [
      { title: "Structure des Prénoms Coréens", body: "Typiquement 1 nom de famille + 2 caractères de prénom = 3 au total. Il y a une tradition d'inclure un caractère de génération partagé entre frères et sœurs.", highlight: "1 nom + 2 prénom" },
      { title: "Culture Hanja", body: "Plus de 80% des prénoms coréens ont une origine en hanja. Même le même prénom peut avoir des significations différentes selon les hanja utilisés.", highlight: "Basé sur 漢字" },
      { title: "Prénoms Coréens pour Étrangers", body: "Nous analysons la phonétique, le sens et l'impression du prénom original pour le reconcevoir en coréen. Pas de simple translittération — un vrai prénom coréen.", highlight: "Translittération → Sens → Création" },
      { title: "Prénoms et Première Impression", body: "En Corée, le prénom a un impact significatif sur la première impression. La force de prononciation, le sens du hanja et le nombre de traits sont tous considérés.", highlight: "Prénom = Première Impression" },
    ],
    tips: [
      { title: "Prénoms Faciles à Appeler", body: "Les prénoms de 2 syllabes sont les plus faciles à appeler. Trop de consonnes finales peuvent sonner étouffées ; des syllabes ouvertes sont recommandées.", highlight: "2 syllabes · syllabes ouvertes" },
      { title: "Pensez à l'Avenir", body: "Un prénom qui convient à la fois à l'enfance et à l'âge adulte est idéal. Évitez les prénoms trop enfantins ou trop liés à une époque spécifique.", highlight: "Un prénom pour la vie" },
      { title: "Vérifiez la Prononciation Multilingue", body: "À l'ère mondiale, il est judicieux de vérifier comment le prénom sonne en anglais et en chinois avant de décider.", highlight: "Anglais · Chinois · Japonais" },
      { title: "Décidez en Famille", body: "Plutôt que de choisir seul, nous recommandons que toute la famille essaie d'appeler plusieurs candidats à voix haute avant de décider.", highlight: "Comparez 3 candidats" },
    ],
  },
  ru: {
    saju: [
      { title: "Пять элементов (陰陽五行)", body: "Баланс Дерева·Огня·Земли·Металла·Воды. Черты имени и элементы должны гармонировать с саджу для живого имени.", highlight: "Дерево Огонь Земля Металл Вода" },
      { title: "Фонетические элементы (發音五行)", body: "Стихийная энергия первой согласной. ㄱ·ㅋ=Дерево, ㄴ·ㄹ=Огонь, ㅇ·ㅎ=Земля, ㅅ·ㅈ=Металл, ㅁ·ㅂ=Вода. Баланс с фамильным элементом обязателен.", highlight: "Классификация по согласной" },
      { title: "Элементы Ханджа (字源五行)", body: "Стихийная энергия в самом ханджа. 水=Вода, 木=Дерево — значение ханджа и элемент должны совпадать для усиления имени.", highlight: "Элемент значения ханджа" },
      { title: "Числовые элементы (數理五行)", body: "Энергия, получаемая из суммы черт. Проверяем, образует ли сочетание фамилия+имя счастливое число. Система 81 числа.", highlight: "Система 81 числа" },
    ],
    sejong: [
      { title: "👑 Король Сечжон создаёт Хангыль (1443)", body: "Король Сечжон, 4-й король Чосон, создал Хангыль в 1443 году. Его печалило, что простой народ не мог читать из-за сложности китайских иероглифов.", highlight: "1443 Хунминчонъым" },
      { title: "🔬 Самое научное письмо в мире", body: "Хангыль состоит из 14 согласных и 10 гласных — 24 буквы. Это единственная в мире система письма, созданная по форме речевых органов.", highlight: "14 согласных + 10 гласных" },
      { title: "📜 Память мира ЮНЕСКО", body: "В 1997 году Хунминчонъым Хэрэбон был внесён в реестр «Память мира» ЮНЕСКО как единственный существующий пояснительный документ создания алфавита.", highlight: "ЮНЕСКО 1997" },
      { title: "🌐 Превосходство Хангыля", body: "Британский лингвист Джеффри Сэмпсон назвал Хангыль «величайшим интеллектуальным достижением в истории человечества». 24 буквы выражают 11 172 слога.", highlight: "11 172 слоговых выражений" },
    ],
    rank: [
      { title: "🏆 Мальчики #1 · Доюн", body: "Самое популярное имя для мальчиков в 2026 году. Гармония яркого света (До) и изобилия (Юн).", highlight: "도윤 · 道潤" },
      { title: "🌸 Девочки #1 · Союн", body: "Самое популярное имя для девочек в 2026 году. Имя, несущее удачу (Со) и изобилие (Юн).", highlight: "서윤 · 瑞潤" },
      { title: "📈 Ключевые слова тренда", body: "Тенденции имён в 2026 году: «Юн·Джун·Ха·Со» — наиболее используемые слоги. Предпочтение отдаётся светлым и открытым именам.", highlight: "Юн · Джун · Ха · Со" },
      { title: "🔤 Возрождение чистокорейских имён", body: "Чистокорейские имена как Ханыль (небо), Гаон, Бом (весна), Нури неуклонно растут в 2026 году.", highlight: "Ханыль · Гаон · Бом" },
    ],
    culture: [
      { title: "Структура корейских имён", body: "Обычно 1 фамилия + 2 иероглифа имени = 3 всего. Существует традиция включать поколенческий иероглиф, общий для братьев и сестёр.", highlight: "1 фамилия + 2 имени" },
      { title: "Культура ханджа", body: "Более 80% корейских имён происходят из ханджа. Даже одно и то же имя может иметь разные значения в зависимости от используемых ханджа.", highlight: "Основано на 漢字" },
      { title: "Корейские имена для иностранцев", body: "Мы анализируем фонетику, значение и ощущение исходного имени, чтобы переосмыслить его по-корейски. Не просто транслитерация — настоящее корейское имя.", highlight: "Транслит. → Значение → Создание" },
      { title: "Имена и первое впечатление", body: "В Корее имя оказывает значительное влияние на первое впечатление. Учитывается сила произношения, значение ханджа и количество черт.", highlight: "Имя = Первое впечатление" },
    ],
    tips: [
      { title: "Имена, которые легко произносить", body: "Двусложные имена самые удобные. Слишком много финальных согласных может звучать громоздко; рекомендуются открытые слоги.", highlight: "2 слога · открытые слоги" },
      { title: "Думайте о будущем", body: "Идеально имя, подходящее и в детстве, и во взрослой жизни. Избегайте слишком детских или слишком привязанных к эпохе имён.", highlight: "Имя на всю жизнь" },
      { title: "Проверьте многоязычное произношение", body: "В глобальную эпоху разумно заранее проверить, как имя звучит по-английски и по-китайски.", highlight: "Английский · Китайский · Японский" },
      { title: "Решайте вместе с семьёй", body: "Вместо того чтобы выбирать в одиночку, мы рекомендуем всей семьёй вслух называть нескольких кандидатов перед принятием решения.", highlight: "Сравните 3 кандидата" },
    ],
  },
  ar: {
    saju: [
      { title: "العناصر الخمسة (陰陽五行)", body: "توازن الخشب·النار·الأرض·المعدن·الماء. يجب أن تتناسب خطوط الاسم وعناصره مع ساجو لاسم نابض بالحياة.", highlight: "خشب نار أرض معدن ماء" },
      { title: "العناصر الصوتية (發音五行)", body: "الطاقة العنصرية للحرف الأول. ㄱ·ㅋ=خشب، ㄴ·ㄹ=نار، ㅇ·ㅎ=أرض، ㅅ·ㅈ=معدن، ㅁ·ㅂ=ماء. التوازن مع عنصر اسم العائلة ضروري.", highlight: "تصنيف الحروف الساكنة" },
      { title: "عناصر الهانجا (字源五行)", body: "الطاقة العنصرية في الهانجا نفسه. 水=ماء، 木=خشب — يجب أن يتوافق معنى الهانجا والعنصر لتقوية الاسم.", highlight: "عنصر معنى الهانجا" },
      { title: "العناصر العددية (數理五行)", body: "طاقة مشتقة من مجموع الخطوط. نتحقق مما إذا كان مجموع خطوط العائلة+الاسم يشكل رقماً مباركاً. نظام 81 رقماً.", highlight: "نظام 81 رقماً" },
    ],
    sejong: [
      { title: "👑 الملك سيجونغ يبتكر الهانغول (1443)", body: "الملك سيجونغ، رابع ملوك جوسون، ابتكر الهانغول عام 1443. كان حزيناً لأن الشعب لم يستطع القراءة بسبب صعوبة الحروف الصينية.", highlight: "1443 هونمينجونغيوم" },
      { title: "🔬 أكثر الأبجديات علمية في العالم", body: "يتكون الهانغول من 14 حرفاً ساكناً و10 حروف متحركة — 24 حرفاً. إنه نظام الكتابة الوحيد في العالم المنمذج على شكل أعضاء النطق.", highlight: "14 ساكن + 10 متحرك" },
      { title: "📜 ذاكرة العالم لليونسكو", body: "عام 1997، سُجّل هونمينجونغيوم هيريبون في سجل ذاكرة العالم لليونسكو باعتباره الوثيقة التفسيرية الوحيدة الموجودة لإنشاء أبجدية.", highlight: "اليونسكو 1997" },
      { title: "🌐 تفوق الهانغول", body: "وصف عالم اللغويات البريطاني جيفري سامبسون الهانغول بأنه «أعظم إنجاز فكري في تاريخ البشرية». بـ24 حرفاً يمكن التعبير عن 11,172 مقطعاً.", highlight: "11,172 تعبيراً مقطعياً" },
    ],
    rank: [
      { title: "🏆 أولاد #1 · دويون", body: "الاسم الأكثر إعطاءً للأولاد في 2026. تناسق بين الضوء الساطع (دو) والوفرة (يون).", highlight: "도윤 · 道潤" },
      { title: "🌸 بنات #1 · سيويون", body: "الاسم الأكثر شعبية للبنات في 2026. اسم يحمل اليمن (سيو) والوفرة (يون).", highlight: "서윤 · 瑞潤" },
      { title: "📈 كلمات مفتاحية للاتجاهات", body: "اتجاهات الأسماء في 2026: «يون·جون·ها·سيو» هي المقاطع الأكثر استخداماً. يُفضّل الأسماء المشرقة والمفتوحة.", highlight: "يون · جون · ها · سيو" },
    ],
    culture: [
      { title: "بنية الأسماء الكورية", body: "عادةً 1 اسم عائلة + 2 حرف اسم مُعطى = 3 إجمالاً. هناك تقليد بتضمين حرف جيلي مشترك بين الأشقاء.", highlight: "1 عائلة + 2 اسم" },
      { title: "ثقافة الهانجا", body: "أكثر من 80% من الأسماء الكورية لها أصل في الهانجا. حتى نفس الاسم قد يحمل معاني مختلفة حسب الهانجا المستخدم.", highlight: "مبني على 漢字" },
      { title: "الأسماء الكورية للأجانب", body: "نحلل الصوتيات والمعنى والإحساس بالاسم الأصلي لإعادة تصميمه بالكورية. ليس مجرد نقل صوتي — اسم كوري حقيقي.", highlight: "نقل صوتي → معنى → إبداع" },
      { title: "الأسماء والانطباع الأول", body: "في كوريا، يؤثر الاسم تأثيراً كبيراً على الانطباع الأول. يُراعى قوة النطق ومعنى الهانجا وعدد الخطوط.", highlight: "الاسم = الانطباع الأول" },
    ],
    tips: [
      { title: "أسماء سهلة النداء", body: "الأسماء المكونة من مقطعين هي الأسهل في النداء. كثرة الحروف الساكنة الأخيرة قد تبدو مكتظة؛ يُنصح بالمقاطع المفتوحة.", highlight: "مقطعان · مقاطع مفتوحة" },
      { title: "فكّر في المستقبل", body: "الاسم المناسب للطفولة والنضج على حد سواء هو الأمثل. تجنب الأسماء الطفولية جداً أو المرتبطة بحقبة معينة.", highlight: "اسم لمدى الحياة" },
      { title: "تحقق من النطق متعدد اللغات", body: "في العصر العالمي، من الحكمة التحقق من كيفية نطق الاسم بالإنجليزية والصينية قبل اتخاذ القرار.", highlight: "إنجليزي · صيني · ياباني" },
      { title: "قرر مع العائلة", body: "بدلاً من الاختيار منفرداً، نوصي أن تقوم العائلة بالجهر بعدة مرشحين قبل اتخاذ القرار.", highlight: "قارن 3 مرشحين" },
    ],
  },
  hi: {
    saju: [
      { title: "पाँच तत्व (陰陽五行)", body: "लकड़ी·अग्नि·पृथ्वी·धातु·जल का संतुलन। नाम के स्ट्रोक और तत्व साजू के साथ सामंजस्य में होने चाहिए।", highlight: "लकड़ी अग्नि पृथ्वी धातु जल" },
      { title: "ध्वन्यात्मक तत्व (發音五行)", body: "पहले व्यंजन की तत्वीय ऊर्जा। ㄱ·ㅋ=लकड़ी, ㄴ·ㄹ=अग्नि, ㅇ·ㅎ=पृथ्वी, ㅅ·ㅈ=धातु, ㅁ·ㅂ=जल। उपनाम तत्व के साथ संतुलन आवश्यक है।", highlight: "व्यंजन वर्गीकरण" },
      { title: "हांजा तत्व (字源五行)", body: "हांजा में स्वयं की तत्वीय ऊर्जा। 水=जल, 木=लकड़ी — नाम को मजबूत करने के लिए हांजा का अर्थ और तत्व एक होने चाहिए।", highlight: "हांजा अर्थ तत्व" },
      { title: "संख्यात्मक तत्व (數理五行)", body: "स्ट्रोक के योग से प्राप्त ऊर्जा। जाँचते हैं कि उपनाम+नाम का संयोजन शुभ संख्या बनाता है या नहीं। 81-संख्या प्रणाली।", highlight: "81-संख्या प्रणाली" },
    ],
    sejong: [
      { title: "👑 राजा सेजोंग ने हानगुल बनाया (1443)", body: "जोसेन के चौथे राजा सेजोंग ने 1443 में हानगुल बनाया। उन्हें दुख था कि लोग चीनी अक्षरों की कठिनाई के कारण पढ़ नहीं सकते थे।", highlight: "1443 हुनमिनजेओंगेउम" },
      { title: "🔬 दुनिया की सबसे वैज्ञानिक लिपि", body: "हानगुल में 14 व्यंजन और 10 स्वर — कुल 24 अक्षर हैं। यह दुनिया की एकमात्र लिपि है जो वाक् अंगों के आकार पर आधारित है।", highlight: "14 व्यंजन + 10 स्वर" },
      { title: "📜 यूनेस्को विश्व स्मृति", body: "1997 में हुनमिनजेओंगेउम हेरयेबोन को यूनेस्को की विश्व स्मृति में दर्ज किया गया — किसी लिपि निर्माण का एकमात्र उपलब्ध व्याख्यात्मक दस्तावेज।", highlight: "यूनेस्को 1997" },
      { title: "🌐 हानगुल की श्रेष्ठता", body: "ब्रिटिश भाषाविद Geoffrey Sampson ने हानगुल को 'मानव इतिहास की सबसे महान बौद्धिक उपलब्धि' कहा। 24 अक्षरों से 11,172 अक्षरांश व्यक्त होते हैं।", highlight: "11,172 अक्षरांश अभिव्यक्तियाँ" },
    ],
    rank: [
      { title: "🏆 लड़के #1 · दोयुन", body: "2026 में सबसे अधिक दिया गया लड़के का नाम। उज्ज्वल प्रकाश (दो) और समृद्धि (युन) का सामंजस्य।", highlight: "도윤 · 道潤" },
      { title: "🌸 लड़कियाँ #1 · सेओयुन", body: "2026 में सबसे लोकप्रिय लड़की का नाम। शुभता (सेओ) और समृद्धि (युन) वाला नाम।", highlight: "서윤 · 瑞潤" },
      { title: "📈 ट्रेंड कीवर्ड", body: "2026 में नाम ट्रेंड: 'युन·जुन·हा·सेओ' सर्वाधिक उपयोग किए गए अक्षरांश। उज्ज्वल और खुले नामों को प्राथमिकता।", highlight: "युन · जुन · हा · सेओ" },
      { title: "🔤 शुद्ध कोरियाई नामों का पुनरुद्धार", body: "हानेउल (आकाश), गाओन, बोम (वसंत), नुरी जैसे शुद्ध कोरियाई नाम 2026 में लगातार बढ़ रहे हैं।", highlight: "हानेउल · गाओन · बोम" },
    ],
    culture: [
      { title: "कोरियाई नामों की संरचना", body: "आमतौर पर 1 उपनाम + 2 नाम अक्षर = कुल 3। भाई-बहनों के बीच साझा पीढ़ी अक्षर शामिल करने की परंपरा है।", highlight: "1 उपनाम + 2 नाम" },
      { title: "हांजा संस्कृति", body: "80% से अधिक कोरियाई नामों की उत्पत्ति हांजा से है। एक ही नाम में अलग-अलग हांजा से अर्थ भिन्न हो सकता है।", highlight: "漢字 आधारित" },
      { title: "विदेशियों के लिए कोरियाई नाम", body: "मूल नाम की ध्वनि, अर्थ और भाव का विश्लेषण करके कोरियाई में पुनर्डिज़ाइन करते हैं। केवल ध्वन्यानुवाद नहीं — असली कोरियाई नाम।", highlight: "ध्वन्यानुवाद → अर्थ → सृजन" },
      { title: "नाम और पहली छाप", body: "कोरिया में नाम का पहली छाप पर बड़ा प्रभाव पड़ता है। उच्चारण की शक्ति, हांजा का अर्थ और स्ट्रोक काउंट सभी पर विचार किया जाता है।", highlight: "नाम = पहली छाप" },
    ],
    tips: [
      { title: "पुकारने में आसान नाम", body: "2-अक्षर वाले नाम सबसे आसान होते हैं। बहुत अधिक अंतिम व्यंजन भारी लग सकते हैं; खुले अक्षरांश की सिफारिश की जाती है।", highlight: "2 अक्षर · खुले अक्षरांश" },
      { title: "भविष्य के बारे में सोचें", body: "बचपन और वयस्कता दोनों में उपयुक्त नाम आदर्श है। बहुत बचकाने या किसी युग से जुड़े नाम से बचें।", highlight: "जीवन भर का नाम" },
      { title: "बहुभाषी उच्चारण जाँचें", body: "वैश्विक युग में निर्णय से पहले अंग्रेजी और चीनी में नाम का उच्चारण जाँचना उचित है।", highlight: "अंग्रेजी · चीनी · जापानी" },
      { title: "परिवार के साथ निर्णय लें", body: "अकेले चुनने की बजाय, परिवार के साथ कई उम्मीदवारों को ज़ोर से पुकारकर निर्णय लेने की सिफारिश है।", highlight: "3 उम्मीदवारों की तुलना" },
    ],
  },
};

export const INFO_CARDS = INFO_CARDS_BY_LANG.ko;
