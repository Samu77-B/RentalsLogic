export const ENGLAND_CHECKLIST = {
  regions: ["england", "wales", "scotland", "northern_ireland"],
  sections: [
    {
      title: "Smoke & Carbon Monoxide",
      items: [
        "Smoke alarms tested and working on each floor",
        "CO alarm present in rooms with solid fuel appliances",
      ],
    },
    {
      title: "Gas Safety",
      items: [
        "Gas Safety Certificate valid and displayed",
        "All gas appliances visually inspected",
      ],
    },
    {
      title: "Electrical Safety",
      items: [
        "EICR valid and no C1/C2 outstanding",
        "All sockets and switches functioning",
      ],
    },
    {
      title: "General Condition",
      items: [
        "Property clean and habitable",
        "Windows and doors secure",
        "Heating system operational",
      ],
    },
  ],
};

export const REPORT_TYPE_LABELS: Record<string, string> = {
  INVENTORY: "Inventory",
  CHECK_IN: "Check-in",
  INTERIM: "Interim Visit",
  CHECK_OUT: "Check-out",
};

export const CERTIFICATE_TYPE_LABELS: Record<string, string> = {
  GAS_SAFETY: "Gas Safety (CP12)",
  EPC: "Energy Performance (EPC)",
  EICR: "Electrical (EICR)",
  OTHER: "Other",
};

export const ROOM_TYPE_LABELS: Record<string, string> = {
  BEDROOM: "Bedroom",
  LOUNGE: "Living Room",
  KITCHEN: "Kitchen",
  BATHROOM: "Bathroom",
  DINING_ROOM: "Dining Room",
  HALLWAY: "Hallway",
  GARAGE: "Garage",
  GARDEN: "Garden",
  OTHER: "Other",
};

export const CONDITION_OPTIONS = [
  "Excellent",
  "Good",
  "Fair",
  "Poor",
  "Damaged",
  "Not Present",
];

export const CLEANLINESS_OPTIONS = [
  "Clean",
  "Acceptable",
  "Needs Cleaning",
  "Poor",
];
