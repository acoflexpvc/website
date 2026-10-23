const MAX_IMAGES = 4;

export interface BannerImage {
  id: string;
  desktop_image: string;
  mobile_image: string | null;
  alt: string;
}

export interface HeroCta {
  label?: string;
  to?: string;
}

const isImageUrl = (value: unknown): value is string =>
  typeof value === "string" && /^https?:\/\//.test(value);

/**
 * Banner images from published page_content (home).content.hero. The admin and
 * the database (validate_home_hero_banner) only allow 1–4 validated images, but
 * this still ignores anything malformed so the static hero is the worst case.
 */
export function readBannerImages(hero: unknown): BannerImage[] {
  if (!hero || typeof hero !== "object") return [];
  const { banner_enabled: enabled, banner_images: raw } = hero as Record<string, unknown>;
  if (enabled !== true || !Array.isArray(raw)) return [];
  return raw
    .filter(
      (item: unknown): item is Record<string, unknown> =>
        !!item &&
        typeof item === "object" &&
        isImageUrl((item as Record<string, unknown>)["desktop_image"]),
    )
    .slice(0, MAX_IMAGES)
    .map((item, index) => ({
      id: typeof item["id"] === "string" ? item["id"] : String(index),
      desktop_image: item["desktop_image"] as string,
      mobile_image: isImageUrl(item["mobile_image"]) ? item["mobile_image"] : null,
      alt: typeof item["alt"] === "string" ? item["alt"] : "",
    }));
}
