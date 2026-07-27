export const routes = {
  dashboard: {
    root: "/dashboard",
    properties: "/dashboard/properties",
    tenants: "/dashboard/tenants",
    inspections: "/dashboard/inspections",
    maintenance: "/dashboard/maintenance",
    certificates: "/dashboard/certificates",
    billing: "/dashboard/billing",
    howTo: "/dashboard/how-to",
    tips: "/dashboard/tips",
    news: "/dashboard/news",
    settings: "/dashboard/settings",
  },
  tenant: {
    root: "/tenant",
    reports: "/tenant/reports",
    maintenance: "/tenant/maintenance",
    documents: "/tenant/documents",
    meters: "/tenant/meters",
    settings: "/tenant/settings",
  },
  auth: {
    signIn: "/sign-in",
    signUp: "/sign-up",
  },
  public: {
    home: "/",
    terms: "/terms",
    privacy: "/privacy",
  },
} as const;
