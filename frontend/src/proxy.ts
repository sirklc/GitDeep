import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

// Next 16'da middleware -> proxy olarak adlandırıldı; next-intl'in
// döndürdüğü handler aynı imzayla çalışır.
export default createMiddleware(routing);

export const config = {
  // api, _next ve statik dosyalar hariç her yol locale yönlendirmesinden geçer
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
