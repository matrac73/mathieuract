import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // the site used to have four sections; keep the old links alive
  async redirects() {
    return [
      { source: "/:locale(en|fr)/profile", destination: "/:locale/pro", permanent: false },
      { source: "/:locale(en|fr)/projects", destination: "/:locale/pro#projects", permanent: false },
      { source: "/:locale(en|fr)/articles", destination: "/:locale/pro#career", permanent: false },
      { source: "/:locale(en|fr)/adventures", destination: "/:locale/perso#adventures", permanent: false },
    ];
  },
};

export default config;
