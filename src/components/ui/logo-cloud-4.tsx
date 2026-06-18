import React from 'react';
import { InfiniteSlider } from "./infinite-slider";
import { ProgressiveBlur } from "./progressive-blur";

type Logo = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

type LogoCloudProps = React.ComponentProps<"div"> & {
  logos: Logo[];
};

export function LogoCloud({ logos, className, ...props }: LogoCloudProps) {
  return (
    <div className={`relative mx-auto max-w-5xl py-6 md:border-x border-white/[0.06] overflow-hidden ${className || ''}`} {...props}>
      <div className="-translate-x-1/2 -top-px pointer-events-none absolute left-1/2 w-screen border-t border-white/[0.06]" />

      <InfiniteSlider gap={42} reverse duration={60} durationOnHover={150}>
        {logos.map((logo) => (
          <img
            alt={logo.alt}
            className="pointer-events-none h-6 sm:h-8 select-none brightness-0 invert opacity-70 hover:opacity-100 transition-opacity"
            height="auto"
            key={`logo-${logo.alt}`}
            loading="lazy"
            src={logo.src}
            width="auto"
          />
        ))}
      </InfiniteSlider>

      <ProgressiveBlur
        blurIntensity={2}
        className="pointer-events-none absolute top-0 left-0 h-full w-[80px] sm:w-[160px]"
        direction="left"
      />
      <ProgressiveBlur
        blurIntensity={2}
        className="pointer-events-none absolute top-0 right-0 h-full w-[80px] sm:w-[160px]"
        direction="right"
      />

      <div className="-translate-x-1/2 -bottom-px pointer-events-none absolute left-1/2 w-screen border-b border-white/[0.06]" />
    </div>
  );
}
