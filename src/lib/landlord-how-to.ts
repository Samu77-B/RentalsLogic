import { routes } from "@/config/routes";

export type HowToSection = {
  title: string;
  summary: string;
  steps: string[];
  href?: string;
  hrefLabel?: string;
};

export const landlordHowToSections: HowToSection[] = [
  {
    title: "Overview",
    summary:
      "See your plan, property count, open maintenance jobs, and certificates due in the next 30 days.",
    steps: [
      "Open Overview from the sidebar for a quick health check.",
      "Use the cards to jump straight into Properties, Maintenance, or Certificates.",
      "Recent activity lists the latest changes across your account.",
    ],
    href: routes.dashboard.root,
    hrefLabel: "Go to Overview",
  },
  {
    title: "Properties",
    summary:
      "Add properties, upload a cover photo, and organise rooms, inventory, and room photos.",
    steps: [
      "Create a property from Properties → Add Property (optional photo at create time).",
      "Open a property to add or change the cover photo above the tabs anytime.",
      "Use Inventory to add rooms, room photos, and inventory items with condition notes.",
      "Open maintenance jobs on a property show a badge on the property list card.",
    ],
    href: routes.dashboard.properties,
    hrefLabel: "Manage properties",
  },
  {
    title: "Tenants",
    summary:
      "Invite tenants to a specific property and manage their tenancy details.",
    steps: [
      "Open a property → Tenants tab → Add Tenant.",
      "Share the invite link from the property Tenants tab so they can join the tenant portal.",
      "The sidebar Tenants page lists everyone across your portfolio once they are added.",
      "Tenants cannot self-register from the homepage — invitation only.",
    ],
    href: routes.dashboard.tenants,
    hrefLabel: "View tenants",
  },
  {
    title: "Inspections",
    summary:
      "Create check-in and check-out reports tenants can review, comment on, and e-sign.",
    steps: [
      "Create reports from Inspections or from a property workflow.",
      "Capture room and item condition with photos where needed.",
      "Share the report so tenants can review and sign in their portal.",
    ],
    href: routes.dashboard.inspections,
    hrefLabel: "Open inspections",
  },
  {
    title: "Maintenance",
    summary: "Log jobs, set priority, attach photos, and track status to completion.",
    steps: [
      "Add requests from Maintenance or from a property’s Maintenance tab.",
      "Use Start / Complete to move jobs from open to done.",
      "Open jobs appear on the property list so you can spot work at a glance.",
    ],
    href: routes.dashboard.maintenance,
    hrefLabel: "Open maintenance",
  },
  {
    title: "Meters & documents",
    summary: "Record meter readings and store leases, certificates, and other files.",
    steps: [
      "On a property, use Meters to add readings (with optional photos).",
      "Use Documents to upload leases and other files for that property.",
      "Keep certificates under Certificates so expiry stays visible on Overview.",
    ],
    href: routes.dashboard.certificates,
    hrefLabel: "Certificates",
  },
  {
    title: "Billing & settings",
    summary: "Manage your RentalsLogic plan and account profile.",
    steps: [
      "Billing shows your current plan and upgrade options.",
      "Use the profile menu (top right) for account details.",
      "Settings explains how landlord vs tenant accounts are created.",
    ],
    href: routes.dashboard.billing,
    hrefLabel: "View billing",
  },
  {
    title: "Tips & news",
    summary:
      "Read practical landlord tips and UK rental law / sector news curated by RentalsLogic staff.",
    steps: [
      "Tips are short, practical notes staff can update any time.",
      "News covers landlord law, tenant law, and wider UK rental updates.",
      "Check back regularly — content is published by the RentalsLogic team.",
    ],
    href: routes.dashboard.tips,
    hrefLabel: "Browse tips",
  },
];
