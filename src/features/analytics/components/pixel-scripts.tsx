"use client";

import Script from "next/script";

export function PixelScripts() {
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const tikTokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

  return (
    <>
      {metaPixelId && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
              (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init','${metaPixelId}');
              fbq('track','PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}
      {tikTokPixelId && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function(w,d,t){w.TiktokAnalyticsObject=t;var tt=w[t]=w[t]||[];tt.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie','hold','callMethod','getMethods','getContext','set','setUserProperties','setOnce','clearContext','getContext','page','track','log','reset','is','add','remove','getContext','getContext','getContext'];
            tt.setAndDefer=function(t,e){t[e]=function(){t[e].apply(t,arguments)}};for(var i=0;i<tt.methods.length;i++)tt.setAndDefer(tt,tt.methods[i]);
            tt.instance=function(t){for(var e=tt._i[t]||[],n=0;n<tt.methods.length;n++)tt.setAndDefer(e,n);return tt._i[t]=tt._i[t]||{},tt};tt.load=function(e,n){var r='https://analytics.tiktok.com/i18n/pixel/events.js';tt._i=tt._i||{};tt._i[e]=[];tt._i[e].s=new Date;tt._i[e].ns='${tikTokPixelId}';var i=d.createElement('script');i.async=!0;i.src=r;var s=d.getElementsByTagName('script')[0];s.parentNode.insertBefore(i,s)};
            tt.load('${tikTokPixelId}');tt.page();
          }(window,document,'ttq');
          `}
        </Script>
      )}
    </>
  );
}
