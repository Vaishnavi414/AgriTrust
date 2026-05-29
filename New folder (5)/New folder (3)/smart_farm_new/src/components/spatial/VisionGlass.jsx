export const visionGlass = "bg-white/20 backdrop-blur-2xl border border-white/30 shadow-2xl";

export const visionGlassStrong = "bg-black/30 backdrop-blur-3xl border border-white/20 shadow-2xl";

export const glassRefraction = `
  relative overflow-hidden
  before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-50
  after:absolute after:inset-0 after:bg-gradient-to-tl after:from-white/5 after:via-transparent after:to-transparent
`;

export const edgeGlow = `
  shadow-[0_0_30px_rgba(34,197,94,0.2),0_0_60px_rgba(34,197,94,0.1)]
`;

export const innerGlow = `
  relative
  before:absolute before:inset-0
  before:bg-gradient-to-b before:from-white/10 before:to-transparent before:rounded-inherit
`;

export const applyVisionGlass = (baseClasses) => {
  return `${baseClasses} ${visionGlass} ${glassRefraction} ${edgeGlow}`;
};

export default {
  visionGlass,
  visionGlassStrong,
  glassRefraction,
  edgeGlow,
  innerGlow,
};