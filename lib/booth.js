const STORAGE_KEY = "festivalBoothState";

export const AGE_GROUPS = [
  { id: "young", label: "Young", range: "(18-30)", icon: "/figma/age-young.svg" },
  { id: "adult", label: "Adult", range: "(30-50)", icon: "/figma/age-adult.svg" },
  { id: "senior", label: "Senior", range: "(50+)", icon: "/figma/age-senior.svg" },
];

export const GENDERS = [
  { id: "male", label: "Male", icon: "/figma/gender-male.svg" },
  { id: "female", label: "Female", icon: "/figma/gender-female.svg" },
];

export const TIPS = [
  { icon: "/figma/tip-face-camera.svg", label: "Face the camera" },
  { icon: "/figma/tip-frame.svg", label: "Keep your body inside the frame" },
  { icon: "/figma/tip-smile.svg", label: "Smile naturally" },
];

export const CREW_ROLES = [
  {
    id: "camera-operator",
    label: "Camera Operator",
    icon: "/figma/role-cameraman.svg",
    prompt:
      "Use the reference image face exactly the same. The person is a professional Camera Operator on a movie set. Portrait image, looking at the camera. Background: simple film set with lights, camera equipment. Natural body anatomy and realistic hands.",
  },
  {
    id: "director",
    label: "Director",
    icon: "/figma/role-director.svg",
    prompt:
      "Use the reference image face exactly the same. DO NOT REDRAW OR CHANGE THE FACE. Treat the face as locked. Camera focus on reference image face. Create the body anatomy and environment around this unchanged face. Make the person a professional FILM DIRECTOR with headphones and a director chair. Portrait Image, looking at the camera. Background: simple movie set with a, cinema camera, lights, and a few crew members blurred as in portrait images. Natural body anatomy and realistic hands. Do not change the face. Do not beautify the face. Do not change expression. Do not change hairstyle. Do not add glasses. Do not cover any part of the face.",
  },
  {
    id: "sound-mixer",
    label: "Sound Mixer",
    icon: "/figma/role-sound-mixer.svg",
    prompt:
      "Use the reference image face exactly the same. The person is a Production Sound Mixer on a movie set. professional PRODUCTION SOUND MIXER with headphones around the neck and a portable sound mixer Portrait image, looking at the camera. Background: simple film set with lights, camera equipment. Natural body anatomy and realistic hands.",
  },
  {
    id: "key-grip",
    label: "Key Grip",
    icon: "/figma/role-key-grip.svg",
    prompt:
      "Use the reference image face exactly the same. The person is a professional Key Grip on a movie set holding a C-Stand. Portrait image, looking at the camera. Background: simple film set with lights, camera equipment. Natural body anatomy and realistic hands.",
  },
  {
    id: "boom-operator",
    label: "Boom Operator",
    icon: "/figma/role-boom-operator.svg",
    prompt:
      "Use the reference image face exactly the same. Preserve exact facial structure, features of the referene image. Highest focus on creating the same exact face. \nThe person is a professional BOOM OPERATOR on a movie set. Portrait image, looking at the camera. Background: simple film set, blur people, camera equipment. Natural body anatomy and realistic hands.",
  },
  {
    id: "hair-makeup",
    label: "Hair & Makeup",
    icon: "/figma/role-hair-makeup.svg",
    prompt:
      "Use the reference image face exactly the same. Preserve exact facial structure, features of the referene image. Highest focus on creating the same exact face. \nThe person is a professional Hair & Makeup Designer on a movie set holding a comb. Portrait image, looking at the camera. Background: simple film set, blur people, camera equipment. Natural body anatomy and realistic hands.",
  },
];

export function pickCrewOptions(count = 4) {
  const shuffled = [...CREW_ROLES];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export function readBooth() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function writeBooth(patch) {
  const next = { ...readBooth(), ...patch };
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearBooth() {
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function buildPrompt({ role }) {
  const crew = CREW_ROLES.find((option) => option.id === role) || CREW_ROLES[0];
  return crew.prompt;
}
