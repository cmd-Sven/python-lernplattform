import type { CSSProperties } from "react";
import { assetUrl } from "@/lib/assetUrl";

export const WALL_TEXTURE = assetUrl("/images/boden/wallTexture.jpg");

export function getLevelFloorTexture(levelId: number): string {
  const index = Math.min(Math.max(levelId, 1), 4);
  return assetUrl(`/images/boden/kachel_boden${index}.jpg`);
}

/** Eine Texturdatei = genau ein Rasterfeld (kein Atlas über das ganze Grid). */
const TILE_BACKGROUND: Pick<
  CSSProperties,
  "backgroundSize" | "backgroundPosition" | "backgroundRepeat"
> = {
  backgroundSize: "100% 100%",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};

export function getFloorBackgroundStyle(levelId: number): CSSProperties {
  return {
    backgroundImage: `url(${getLevelFloorTexture(levelId)})`,
    ...TILE_BACKGROUND,
  };
}

export function getWallBackgroundStyle(): CSSProperties {
  return {
    backgroundImage: `url(${WALL_TEXTURE})`,
    ...TILE_BACKGROUND,
  };
}
