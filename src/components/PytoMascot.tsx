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
    <div className={`pyto-mascot flex flex-col sm:flex-row items-center gap-4 ${className}`}>
      <div className="pyto-bubble relative order-2 sm:order-1 flex-1">
        <div
          className={`bg-base-100 border-2 border-base-300 rounded-2xl rounded-br-sm px-5 py-4 shadow-md ${bubble}`}
        >
          <p className="text-sm leading-relaxed font-medium">{message}</p>
          <span className="text-xs opacity-50 mt-2 block">— Pyto, dein Lerntutor</span>
        </div>
        <div
          className="absolute -bottom-2 left-6 sm:left-auto sm:-right-2 sm:bottom-4 w-4 h-4 bg-base-100 border-r-2 border-b-2 border-base-300 rotate-45 sm:rotate-[225deg]"
          aria-hidden
        />
      </div>

      <div className="pyto-image order-1 sm:order-2 shrink-0">
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
