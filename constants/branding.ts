export const APP_NAME = "Layr";

// Slug used for filenames and package name defaults
export const APP_SLUG = "layr";

export const APP_DESCRIPTION = "Layer text and imagery with precision";

export const getAcronym = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();


