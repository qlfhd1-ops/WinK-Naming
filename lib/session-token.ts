/**
 * 비로그인(게스트) 상태에서 생성한 작명 데이터(naming_briefs/naming_results/
 * naming_orders, user_id=NULL)를 매직링크 로그인 완료 후 로그인한 계정으로
 * 병합하기 위한 익명 세션 토큰.
 *
 * - 게스트 상태에서 데이터를 저장할 때 이 토큰을 함께 저장해 둔다.
 * - 로그인 완료 시(app/auth/confirm) 이 토큰으로 /api/auth/merge-session을
 *   호출해 user_id=NULL인 행을 로그인한 사용자에게 연결한 뒤 토큰을 삭제한다.
 */

const SESSION_TOKEN_KEY = "wink_session_token";

export function getSessionToken(): string {
  if (typeof window === "undefined") return "";
  try {
    let token = localStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem(SESSION_TOKEN_KEY, token);
    }
    return token;
  } catch {
    return "";
  }
}

export function clearSessionToken() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}
