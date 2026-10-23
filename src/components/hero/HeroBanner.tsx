// src/components/hero/HeroBanner.tsx
import { useEffect, useState, type FocusEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BannerImage, HeroCta } from "@/lib/hero-banner";

const AUTOPLAY_MS = 6000;

// Controls sit inside the hero (the section clips overflow) above the gold rule.
const controlClass =
  "pointer-events-auto size-10 rounded-full border-white/35 bg-forest/70 text-white hover:bg-white/10 hover:text-white";

/** Hero buttons; site paths use the router, https:// links a plain anchor. */
export function HeroCtas({ primary, secondary }: { primary: HeroCta; secondary: HeroCta }) {
  const link = (cta: HeroCta, fallbackTo: string, children: ReactNode) => {
    const to = cta.to || fallbackTo;
    return to.startsWith("/") ? <Link to={to}>{children}</Link> : <a href={to}>{children}</a>;
  };
  return (
    <div className="mt-9 flex flex-wrap gap-3">
      <Button asChild variant="gold" size="lg">
        {link(
          primary,
          "/products",
          <>
            {primary.label || "Explore products"} <ArrowRight />
          </>,
        )}
      </Button>
      <Button asChild variant="outlineLight" size="lg">
        {link(secondary, "/contact", secondary.label || "Contact sales")}
      </Button>
    </div>
  );
}

interface HeroBannerProps {
  /** Validated banner images; when empty, `fallback` (the static hero) is rendered. */
  images: BannerImage[];
  /** The shared kicker, heading, text and buttons, shown over every image. */
  children: ReactNode;
  fallback: ReactNode;
}

/**
 * HeroBanner – homepage hero with one shared block of text over 1–4 images that
 * cross-fade. Only the first image loads up front; each later image is mounted
 * just before it is shown. Autoplay stops for reduced motion, hover, keyboard
 * focus and the pause button. Timers only — no scroll listeners or rAF loops.
 */
export function HeroBanner({ images, children, fallback }: HeroBannerProps) {
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState<ReadonlySet<number>>(() => new Set([0]));
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const count = images.length;
  const canAutoplay = count > 1 && !reducedMotion;
  const autoplay = canAutoplay && !userPaused && !hovered && !focused;

  // Mount the current image and the next one so it has loaded before it fades in.
  useEffect(() => {
    if (count === 0) return;
    setMounted((prev) => {
      const next = (active + 1) % count;
      if (prev.has(active) && prev.has(next)) return prev;
      return new Set([...prev, active, next]);
    });
  }, [active, count]);

  useEffect(() => {
    if (!autoplay) return undefined;
    const timer = setTimeout(() => setActive((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [autoplay, active, count]);

  if (count === 0) {
    return <>{fallback}</>;
  }

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
  };
  const go = (delta: number) => setActive((i) => (i + delta + count) % count);

  return (
    <section
      className="relative overflow-hidden bg-forest text-white"
      aria-roledescription={count > 1 ? "carousel" : undefined}
      aria-label={count > 1 ? "Featured images" : undefined}
      // Mouse only: touch devices emit enter without leave, which would stop autoplay for good.
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(event) => event.pointerType === "mouse" && setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
    >
      {images.map((image, index) =>
        mounted.has(index) ? (
          <picture
            key={image.id}
            className={`absolute inset-x-0 bottom-1 top-0 transition-opacity duration-1000 ease-out ${
              index === active ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={index === active ? undefined : true}
          >
            {image.mobile_image && (
              <source media="(max-width: 1023px)" srcSet={image.mobile_image} />
            )}
            <img
              src={image.desktop_image}
              alt={index === active ? image.alt : ""}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "low"}
              decoding="async"
              className="photo"
            />
          </picture>
        ) : null,
      )}
      {/* Same forest overlays the static hero uses, so the copy stays legible on any photo. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-1 top-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--forest)_92%,transparent)_0%,color-mix(in_oklab,var(--forest)_78%,transparent)_60%,color-mix(in_oklab,var(--forest)_35%,transparent)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-1 top-0 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--forest)_55%,transparent)_0%,color-mix(in_oklab,var(--forest)_40%,transparent)_55%,transparent_80%)] lg:hidden"
      />
      <div className="site-container relative grid items-center pb-32 pt-12 sm:pb-40 sm:pt-16 lg:min-h-[38rem] lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-6">{children}</div>
      </div>
      {count > 1 && (
        <div className="site-container pointer-events-none absolute inset-x-0 bottom-6 flex items-center justify-end gap-2 sm:bottom-8">
          <span className="sr-only" aria-live={autoplay ? "off" : "polite"}>
            Image {active + 1} of {count}
          </span>
          {canAutoplay && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={controlClass}
              aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
              onClick={() => setUserPaused((paused) => !paused)}
            >
              {userPaused ? <Play /> : <Pause />}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={controlClass}
            aria-label="Previous image"
            onClick={() => go(-1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={controlClass}
            aria-label="Next image"
            onClick={() => go(1)}
          >
            <ChevronRight />
          </Button>
        </div>
      )}
      <div className="relative h-1 bg-gold" />
    </section>
  );
}

export default HeroBanner;
