// LET is stored as a single target_licensure value ("LET") for backend compatibility,
// but it has two tracks with different subject coverage:
//   - Elementary: GenEd + ProfEd (no Specialization)
//   - Secondary: GenEd + ProfEd + Specialization
// The track is captured in the student's `let_track` field, and Specialization is
// added for Secondary in ProfileSetup. The base subjects below are track-neutral.
export const DEFAULT_TARGET_LICENSURE_OPTIONS = [
  {
    name: "LET",
    subjects: ["GenEd", "ProfEd"],
    passing_threshold: 75,
  },
  {
    name: "CPA",
    subjects: ["FAR", "AFAR", "Auditing", "MAS", "RFBT", "Taxation"],
    passing_threshold: 75,
  },
  {
    name: "Internal Certification",
    subjects: ["Core", "Applied", "Practicum"],
    passing_threshold: 80,
  },
];
