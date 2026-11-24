import { type Lang } from "./lang";

// 실제 제출된 후기(naming_reviews) — /api/reviews/featured 응답 형태
export type RealReview = {
  id: string;
  name_used: string | null;
  rating: number;
  content: string;
  display_name: string | null;
  country: string | null;
  lang: string;
  category: string | null;
  created_at: string;
  reply: { content: string; created_at: string } | null;
};

export const REVIEWS_UI_BY_LANG: Record<Lang, {
  bestBadge: string;
  teamReply: string;
  loadMore: string;
  emptyTitle: string;
  emptyDesc: string;
  emptyCta: string;
  guestFallback: string;
}> = {
  ko: { bestBadge: "베스트 후기", teamReply: "운영자 답변", loadMore: "더보기", emptyTitle: "첫 번째 후기의 주인공이 되어보세요!", emptyDesc: "아직 등록된 후기가 없어요. 이름을 만들고 가장 먼저 이야기를 들려주세요.", emptyCta: "이름 만들기 시작", guestFallback: "게스트" },
  en: { bestBadge: "Best Reviews", teamReply: "Team Reply", loadMore: "Load More", emptyTitle: "Be the first to share your story!", emptyDesc: "No reviews yet. Create your name and be the first to tell your story.", emptyCta: "Start Naming", guestFallback: "Guest" },
  ja: { bestBadge: "ベストレビュー", teamReply: "運営者からの返信", loadMore: "もっと見る", emptyTitle: "最初のレビューを投稿してみましょう！", emptyDesc: "まだレビューがありません。名前を作って最初のストーリーを共有してください。", emptyCta: "名前を作る", guestFallback: "ゲスト" },
  zh: { bestBadge: "精选评价", teamReply: "官方回复", loadMore: "加载更多", emptyTitle: "成为第一个留下评价的人吧！", emptyDesc: "目前还没有评价。创建您的名字，成为第一个分享故事的人。", emptyCta: "开始起名", guestFallback: "客户" },
  es: { bestBadge: "Mejores reseñas", teamReply: "Respuesta del equipo", loadMore: "Cargar más", emptyTitle: "¡Sé el primero en compartir tu historia!", emptyDesc: "Aún no hay reseñas. Crea tu nombre y sé el primero en contar tu historia.", emptyCta: "Empezar", guestFallback: "Invitado" },
  ru: { bestBadge: "Лучшие отзывы", teamReply: "Ответ команды", loadMore: "Показать ещё", emptyTitle: "Будьте первым, кто поделится своей историей!", emptyDesc: "Пока нет отзывов. Создайте имя и поделитесь своей историей первым.", emptyCta: "Начать", guestFallback: "Гость" },
  fr: { bestBadge: "Meilleurs avis", teamReply: "Réponse de l'équipe", loadMore: "Charger plus", emptyTitle: "Soyez le premier à partager votre histoire !", emptyDesc: "Pas encore d'avis. Créez votre prénom et soyez le premier à raconter votre histoire.", emptyCta: "Commencer", guestFallback: "Invité" },
  ar: { bestBadge: "أفضل التقييمات", teamReply: "رد الفريق", loadMore: "عرض المزيد", emptyTitle: "كن أول من يشارك قصته!", emptyDesc: "لا توجد تقييمات حتى الآن. أنشئ اسمك وكن أول من يروي قصته.", emptyCta: "ابدأ الآن", guestFallback: "ضيف" },
  hi: { bestBadge: "सर्वश्रेष्ठ समीक्षाएं", teamReply: "टीम का जवाब", loadMore: "और देखें", emptyTitle: "सबसे पहले अपनी कहानी साझा करें!", emptyDesc: "अभी तक कोई समीक्षा नहीं है। अपना नाम बनाएं और सबसे पहले अपनी कहानी बताएं।", emptyCta: "शुरू करें", guestFallback: "अतिथि" },
};

export const REVIEWS_GENERAL_PAGE_SIZE = 6;
