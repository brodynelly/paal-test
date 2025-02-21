export const siteConfig = {
  name: "yourname",
  url: "https://yoururl.com",
  description: "IoT-based pig monitoring and health tracking system",
  baseLinks: {
    home: "/",
    overview: "/overview",
    details: "/details",
    support: "/support", 
    settings: {
      general: "/settings/general",
      devices: "/settings/devices",
      alerts: "/settings/alerts",
    },
  },
}

export type SiteConfig = typeof siteConfig