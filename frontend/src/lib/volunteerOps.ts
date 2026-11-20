/**
 * Volunteer operations content: station checklists per role and the SOP manual.
 * Checklist item ids are stored on the volunteer record; never rename an id once live (add new ones instead).
 */

export interface ChecklistGroup {
  title: string;
  items: { id: string; label: string }[];
}

const COMMON_START: ChecklistGroup = {
  title: "Before your shift",
  items: [
    { id: "gen-briefing", label: "Attended the volunteer briefing (or read this SOP manual)" },
    { id: "gen-kit", label: "Wearing volunteer jersey, cap and accreditation badge" },
    { id: "gen-phone", label: "Phone charged; race control and supervisor numbers saved" },
    { id: "gen-report", label: "Reported to supervisor at the station on time" },
  ],
};

const COMMON_END: ChecklistGroup = {
  title: "Close-out",
  items: [
    { id: "gen-incidents", label: "All incidents at my station logged on the dashboard" },
    { id: "gen-handover", label: "Handed over to supervisor and returned shared equipment" },
    { id: "gen-checkout", label: "Checked out of my shift on the dashboard" },
  ],
};

const ROLE_GROUPS: Record<string, ChecklistGroup[]> = {
  "Water Stations": [
    {
      title: "Station setup",
      items: [
        { id: "hyd-signage", label: "'Water ahead' sign placed about 200 m before the first table" },
        { id: "hyd-tables", label: "Tables set on the agreed side with a clear runner lane" },
        { id: "hyd-cups", label: "Cups pre-filled half to two-thirds (water first, electrolyte after)" },
        { id: "hyd-bins", label: "Cup-drop bins placed after the last table" },
        { id: "hyd-reserve", label: "Reserve water and ice stock counted; refill plan agreed" },
      ],
    },
    {
      title: "During the race",
      items: [
        { id: "hyd-arm", label: "Holding cups at arm's length, standing still, off the course line" },
        { id: "hyd-shout", label: "Calling out 'Water' / 'Electrolyte' clearly" },
        { id: "hyd-clear", label: "Slip hazards (cups, spills) cleared from the running lane" },
        { id: "hyd-sweep", label: "Station kept open until the sweep vehicle passed" },
      ],
    },
  ],
  "Course Marshals": [
    {
      title: "Position setup",
      items: [
        { id: "mar-position", label: "At assigned marshal point; turn/route direction confirmed" },
        { id: "mar-barriers", label: "Cones and barriers in place; vehicle access points closed" },
        { id: "mar-whistle", label: "Whistle and flag ready" },
      ],
    },
    {
      title: "During the race",
      items: [
        { id: "mar-direct", label: "Directing runners and keeping spectators off the course" },
        { id: "mar-watch", label: "Watching for runners in distress (wobbling, confusion, collapse)" },
        { id: "mar-sweep", label: "Held position until the sweep vehicle passed" },
      ],
    },
  ],
  "Baggage Drop": [
    {
      title: "Counter setup",
      items: [
        { id: "bag-racks", label: "Racks laid out by bib number range with signage" },
        { id: "bag-tags", label: "Bag tags and markers ready" },
      ],
    },
    {
      title: "During the event",
      items: [
        { id: "bag-tag-check", label: "Every bag tagged with a bib number before accepting" },
        { id: "bag-id-check", label: "Bags returned only against the matching bib" },
        { id: "bag-unclaimed", label: "Unclaimed bags logged and handed to the lost-and-found desk" },
      ],
    },
  ],
  "Medal Distribution": [
    {
      title: "Finish-area setup",
      items: [
        { id: "med-stock", label: "Medal stock counted per category and staged" },
        { id: "med-lanes", label: "Finish chute lanes clear; keep runners moving forward" },
      ],
    },
    {
      title: "During the finish",
      items: [
        { id: "med-category", label: "Matching the medal to the bib colour/category" },
        { id: "med-watch", label: "Watching finishers for collapse; medics alerted immediately" },
      ],
    },
  ],
  "Information Desk": [
    {
      title: "Desk setup",
      items: [
        { id: "inf-maps", label: "Route maps, schedule and FAQ sheets on the desk" },
        { id: "inf-lost", label: "Lost-and-found and lost-child procedure ready" },
      ],
    },
    {
      title: "During the event",
      items: [
        { id: "inf-log", label: "Lost persons / complaints logged as incidents" },
        { id: "inf-escalate", label: "Medical or security questions escalated to race control" },
      ],
    },
  ],
};

export function checklistFor(role: string): ChecklistGroup[] {
  return [COMMON_START, ...(ROLE_GROUPS[role] ?? []), COMMON_END];
}

export interface SopSection {
  id: string;
  title: string;
  summary: string;
  blocks: { heading?: string; points: string[]; tone?: "warning" | "error" }[];
}

export const SOP_SECTIONS: SopSection[] = [
  {
    id: "hydration-layout",
    title: "Hydration station layout",
    summary: "How a station is laid out, from the advance sign to the cup-drop zone.",
    blocks: [
      {
        heading: "Layout in running order",
        points: [
          "About 200 m before: 'Water ahead' sign so runners can choose a side.",
          "Tables 1-2: water. Tables 3-4: electrolyte. Any fruit or energy items last.",
          "Tables on the agreed side (both sides for large stations) with a clear running lane of at least 3 m.",
          "50-100 m after the last table: cup-drop zone with bins and a volunteer sweeping cups off the road.",
          "Medical point or first-aid kit within sight of the station.",
        ],
      },
      {
        heading: "Serving",
        points: [
          "Fill cups half to two-thirds: full cups spill and runners cannot drink from them on the move.",
          "Stand still and hold the cup out at arm's length; let runners take it. Never step into the running line.",
          "Call out what you hold ('Water!', 'Electrolyte!').",
          "Keep restocking from the back of the table; front-line servers do not leave the line.",
          "Stay open until the sweep vehicle passes, even if few runners are left.",
        ],
      },
    ],
  },
  {
    id: "heat-illness",
    title: "Heat exhaustion recognition",
    summary: "Spot heat illness early, act, and escalate the red flags immediately.",
    blocks: [
      {
        heading: "Signs of heat exhaustion",
        points: [
          "Heavy sweating with pale, cool or clammy skin",
          "Dizziness, headache, nausea or vomiting",
          "Muscle cramps, weakness, fast weak pulse",
          "Runner slowing sharply, wobbling or stopping",
        ],
      },
      {
        heading: "What to do",
        points: [
          "Stop the runner and move them to shade; lay them down with legs raised.",
          "Loosen tight clothing; cool with wet cloths or sponges and fanning.",
          "If fully alert and not vomiting: small sips of water or electrolyte.",
          "Call the medical team or race control. Stay with the runner; do not let them continue until a medic clears them.",
        ],
      },
      {
        heading: "Red flags: possible heat stroke. Press SOS and call 108",
        tone: "error",
        points: [
          "Confusion, slurred speech, strange behaviour or aggression",
          "Collapse, seizure or unconsciousness",
          "Very hot skin (it may be dry or still sweaty)",
          "Start cooling straight away (cold water, ice packs at neck, armpits and groin) while help comes. Give nothing to drink if the runner is not fully alert.",
        ],
      },
      {
        heading: "Also watch for",
        tone: "warning",
        points: [
          "A confused or vomiting runner who has been drinking a lot of plain water may have low blood sodium. Do not give more water; get a medic.",
          "Any runner with chest pain or breathlessness out of proportion to effort: SOS immediately.",
        ],
      },
    ],
  },
  {
    id: "radio",
    title: "Radio etiquette",
    summary: "Keep the channel clear so emergencies get through.",
    blocks: [
      {
        heading: "Every call",
        points: [
          "Listen first; never talk over another call.",
          "Press, wait one second, then speak. Hold the radio 5 cm from your mouth.",
          "Call format: 'Control, this is Water Point 4.' Wait for 'Go ahead.'",
          "Keep it short: location, bib number, what is happening, what you need.",
          "Repeat back instructions you receive ('Copy, sending runner to medical tent').",
          "Use 'Over' when you expect a reply and 'Out' when the call is finished.",
          "Spell bib letters with the phonetic alphabet (Alpha, Bravo, Charlie...).",
        ],
      },
      {
        heading: "Emergencies",
        tone: "error",
        points: [
          "Start with 'Emergency, emergency, emergency' so all other traffic stops.",
          "Then give location, bib number and the problem. Also press SOS on this dashboard.",
        ],
      },
      {
        heading: "Do not",
        points: [
          "Share names, phone numbers or medical details on an open channel: use the bib number.",
          "Use codes you were not briefed on, or chat on the channel.",
          "Let your battery run flat; tell your supervisor before it does.",
        ],
      },
    ],
  },
  {
    id: "lost-person",
    title: "Lost child or lost person",
    summary: "Keep them with you and safe; never hand a child to anyone unverified.",
    blocks: [
      {
        points: [
          "Stay with the person at your station; keep them visible and calm.",
          "Log a 'Lost person' incident with a description (age, clothing) and your location.",
          "Hand a child over only to the information desk or police, or to a guardian verified by race control.",
        ],
      },
    ],
  },
];
