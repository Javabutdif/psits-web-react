export const contribution_types = Object.freeze({
  DEVELOPER: "developer",
  MEDIA: "media",
  VOLUNTEER: "volunteer",
} as const);

export type ContributionType =
  (typeof contribution_types)[keyof typeof contribution_types];