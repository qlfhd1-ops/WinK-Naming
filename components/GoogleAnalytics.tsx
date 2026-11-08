/**
 * GA4는 Google Tag Manager(GTM-MWLC54CZ) 안에서 연결되므로,
 * 여기서는 별도의 gtag.js를 직접 로드하지 않고 GTM의 dataLayer에
 * 커스텀 이벤트만 push한다. GTM 쪽에 해당 이벤트를 트리거로 등록하면
 * GA4로 전달된다.
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined") return;
  const w = window as typeof window & { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event: eventName, ...params });
}
