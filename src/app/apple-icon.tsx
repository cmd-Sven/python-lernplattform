import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#3776AB",
          borderRadius: 36,
        }}
      >
        <svg
          viewBox="0 0 32 32"
          width="128"
          height="128"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 22V10h5.4c3.1 0 5.1 1.7 5.1 4.3S17.5 18.6 14.4 18.6H13V22"
            stroke="#FFD43B"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="22.2" cy="9.2" r="1.9" fill="#FFD43B" />
        </svg>
      </div>
    ),
    size,
  );
}
