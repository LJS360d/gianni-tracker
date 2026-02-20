// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";
import { getRequestEvent } from "solid-js/web";
import { getServerLocale, getServerMeta } from "~/i18n/server";

export default createHandler(() => {
  return (
    <StartServer
      document={({ assets, children, scripts }) => {
        const event = getRequestEvent();
        const acceptLanguage = event?.request.headers.get("Accept-Language") ?? null;
        const locale = getServerLocale(acceptLanguage);
        const { title, description } = getServerMeta(locale);
        return (
          <html lang={locale}>
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <meta name="theme-color" content="#0d0d0d" />
              <title>{title}</title>
              <meta name="description" content={description} />
              <meta property="og:type" content="website" />
              <meta property="og:title" content={title} />
              <meta property="og:description" content={description} />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content={title} />
              <meta name="twitter:description" content={description} />
              <link rel="icon" href="/favicon.ico" />
              {assets}
            </head>
            <body>
              <div id="app">{children}</div>
              {scripts}
            </body>
          </html>
        );
      }} />
  );
});
