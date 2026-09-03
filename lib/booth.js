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
    bg: "/assets/camera-operator.webp",
    prompt:
      "Use the reference image as the strict identity, physical-build and outfit reference. Preserve the face exactly: facial structure, features, skin tone, age, expression, hairstyle, facial hair and eyewear if present. Preserve the reference outfit as closely as possible, naturally extending unseen portions.\n\nCreate the same person as a professional CAMERA OPERATOR on an outdoor movie set, standing naturally and looking directly into the camera while operating/holding a professional cinema camera rig.\n\nReconstruct a realistic body using visible head, neck, shoulders, frame and body cues from the reference. Maintain natural height, shoulder width, head-to-body ratio, limbs and realistic hands.\n\nBackground: active outdoor film production in Kashmir with crew naturally working, cinema equipment, lights and stands, softly blurred. Crew must remain candid and secondary, not posing. Photorealistic cinematic photography with consistent natural lighting, shadows, skin and fabric detail.\n\nExact reference identity → reference outfit → reference-derived physical build → profession/equipment → natural pose → authentic working movie set.",
  },

  {
    id: "director",
    label: "Director",
    icon: "/figma/role-director.svg",
    bg: "/assets/director.webp",
    prompt:
      "Use the reference image as the strict identity, physical-build and outfit reference. Preserve the face exactly: facial structure, features, skin tone, age, expression, hairstyle, facial hair and eyewear if present. Preserve the reference outfit as closely as possible, naturally extending unseen portions.\n\nCreate the same person as a professional FILM DIRECTOR actively working on an outdoor movie set in Kashmir. The director is standing naturally beside a professional cinema camera/monitor setup, wearing monitoring headphones, holding a script or shot sheet naturally in one hand while the other arm rests relaxed at the side, looking directly into the camera as if briefly photographed during filming.\n\nReconstruct a realistic body using the person’s head, neck, shoulders, frame and visible body cues. Maintain natural height, shoulder width, head-to-body proportions, limbs and realistic hands.\n\nBackground: scenic Kashmir outdoor film location with mountains and natural landscape, professional cinema cameras, lights, monitors and crew actively working. Crew remain secondary, candid, softly blurred and do not pose or look at the camera. Photorealistic cinematic photography with natural outdoor lighting, consistent shadows, realistic skin and fabric texture.\n\nExact reference identity → reference outfit → reference-derived physical build → profession/equipment → natural pose → authentic working movie set.",
  },

  {
    id: "sound-mixer",
    label: "Sound Mixer",
    icon: "/figma/role-sound-mixer.svg",
    bg: "/assets/sound-mixer.webp",
    prompt:
      "Use the reference image as the strict identity, physical-build and outfit reference. Preserve the exact face, skin tone, age, expression, hairstyle, facial hair and eyewear if present. Preserve the reference outfit as closely as possible.\n\nCreate the same person as a professional PRODUCTION SOUND MIXER on an indoor movie set, standing naturally, looking directly into the camera, with professional headphones and a portable production sound mixer/recorder.\n\nBuild the complete body naturally from visible head, neck, shoulder, frame and body cues. Maintain realistic height, shoulder width, head-to-body proportions, limbs and hands.\n\nBackground: active indoor film production with cinema equipment, lights, cables and crew working naturally, softly blurred and not posing. Photorealistic, cinematic, consistent lighting and realistic skin/fabric texture.\n\nExact reference identity → reference outfit → reference-derived physical build → profession/equipment → natural pose → authentic working movie set.",
  },

  {
    id: "key-grip",
    label: "Key Grip",
    icon: "/figma/role-key-grip.svg",
    bg: "/assets/key-grip.webp",
    prompt:
      "Use the reference image as the strict identity, physical-build and outfit reference. Preserve the exact face, facial structure, skin tone, age, expression, hairstyle, facial hair and eyewear if present. Preserve the reference outfit as closely as possible.\n\nCreate the same person as a professional KEY GRIP on an outdoor movie set, naturally holding and operating a professional C-Stand/light stand, looking directly into the camera.\n\nReconstruct realistic full-body anatomy from the reference person’s head, neck, shoulders, frame and visible body cues. Maintain believable height, shoulder width, head-to-body proportions, arms and realistic hands.\n\nBackground: active outdoor film production in Kashmir with professional cinema cameras, lighting equipment, stands and crew working naturally, softly blurred and not posing. Photorealistic cinematic photography with consistent natural lighting, realistic shadows, skin and fabric texture.\n\nExact reference identity → reference outfit → reference-derived physical build → profession/equipment → natural pose → authentic working movie set.",
  },

  {
    id: "boom-operator",
    label: "Boom Operator",
    icon: "/figma/role-boom-operator.svg",
    bg: "/assets/boom-operator.webp",
    prompt:
      "Use the reference image as the strict identity, physical-build and outfit reference. Preserve the exact face, facial structure, skin tone, age, expression, hairstyle, facial hair and eyewear if present. Preserve the reference outfit as closely as possible.\n\nCreate the same person as a professional BOOM OPERATOR on an outdoor movie set, naturally holding a professional boom pole with shotgun microphone, looking directly into the camera.\n\nReconstruct realistic full-body anatomy from the reference person’s head, neck, shoulders, frame and visible body cues. Maintain believable height, shoulder width, head-to-body proportions, arms and realistic hands.\n\nBackground: active outdoor film production with cinema camera, sound/lighting equipment and crew working naturally, softly blurred and not posing. Photorealistic with consistent cinematic lighting, shadows and natural skin texture.\n\nExact reference identity → reference outfit → reference-derived physical build → profession/equipment → natural pose → authentic working movie set.",
  },

  {
    id: "hair-makeup",
    label: "Hair & Makeup",
    icon: "/figma/role-hair-makeup.svg",
    bg: "/assets/hair-makeup.webp",
    prompt:
      "Use the reference image as the strict identity, physical-build and outfit reference. Preserve the exact face, facial structure, skin tone, age, expression, hairstyle, facial hair and eyewear if present. Preserve the reference outfit as closely as possible.\n\nCreate the same person as a professional HAIR & MAKEUP ARTIST on an indoor movie set, standing naturally, holding a professional comb and appropriate hair/makeup tools, looking directly into the camera.\n\nReconstruct the complete body naturally using visible head, neck, shoulders, frame and body cues from the reference. Maintain realistic height, build, head-to-body proportions, limbs and natural hands.\n\nBackground: active indoor film production/makeup area with professional equipment and movie crew working naturally, softly blurred and not posing. Photorealistic cinematic lighting with natural skin, hair and fabric detail.\n\nExact reference identity → reference outfit → reference-derived physical build → profession/equipment → natural pose → authentic working movie set.",
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
