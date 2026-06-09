"use client";

import Image from "next/image";
import { PYTO_IMAGES, type PytoVariant } from "@/lib/pyto";

interface PytoMascotProps {
  variant: PytoVariant;
  message: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: { img: 120, bubble: "max-w-xs" },
  md: { img: 160, bubble: "max-w-sm" },
  lg: { img: 200, bubble: "max-w-md" },
};

export default function PytoMascot({
  variant,
  message,
  size = "md",
  className = "",
}: PytoMascotProps) {
  const { img, bubble } = SIZES[size];

  return (
    <div
      className={`pyto-mascot flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 ${className}`}
    >
      <div className="pyto-bubble relative order-2 sm:order-1">
        <div
          className={`bg-base-100 border-2 border-base-300 rounded-2xl rounded-br-sm px-5 py-4 shadow-md ${bubble}`}
        >
          <p className="text-sm leading-relaxed font-medium">{message}</p>
          <span className="text-xs opacity-50 mt-2 block">— Pyto, dein Lerntutor</span>
        </div>
        <div
          className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-base-300 bg-base-100 sm:hidden"
          aria-hidden
        />
        <div
          className="absolute top-1/2 -right-1.5 hidden h-3 w-3 -translate-y-1/2 rotate-[225deg] border-r-2 border-b-2 border-base-300 bg-base-100 sm:block"
          aria-hidden
        />
      </div>

      <div className="pyto-image order-1 shrink-0 sm:order-2">
        <Image
          src={PYTO_IMAGES[variant]}
          alt="Pyto – Python Lerntutor"
          width={img}
          height={img}
          className="drop-shadow-lg object-contain"
          priority
        />
      </div>
    </div>
  );
}
