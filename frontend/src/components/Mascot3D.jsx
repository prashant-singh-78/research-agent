import React from "react";

/**
 * 3D Glossy Blue Smiling Mascot for PALLU
 * Pure vector SVG + CSS animation with 0 external network dependencies.
 * Features:
 * - Spherical 3D blue orb face with specular highlights and rim lighting
 * - Expressive glowing cyan eyes with natural blinking
 * - Warm, friendly 3D smile with soft inner neon luminescence
 * - Floating holographic pedestal platform with rotating laser grid & light rays
 * - Smooth idle floating & responsive thinking states
 * - Accessible reduced-motion support
 */
export function Mascot3D({ isThinking = false, state = "idle", size = 180 }) {
  return (
    <div 
      className={`mascot-3d-root ${isThinking ? "is-thinking" : ""} state-${state}`}
      style={{ "--mascot-size": `${size}px` }}
      aria-label="PALLU 3D Blue Smiling Assistant Mascot"
      role="img"
    >
      <svg
        viewBox="0 0 240 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mascot-svg"
      >
        <defs>
          {/* Main 3D Sphere Radial Gradient: Glossy Electric Blue */}
          <radialGradient
            id="mascotBody3D"
            cx="38%"
            cy="32%"
            r="65%"
            fx="35%"
            fy="28%"
          >
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="18%" stopColor="#7DD3FC" />
            <stop offset="45%" stopColor="#38BDF8" />
            <stop offset="78%" stopColor="#1D4ED8" />
            <stop offset="95%" stopColor="#0B1120" />
            <stop offset="100%" stopColor="#030712" />
          </radialGradient>

          {/* Top-Right Neon Cyan Rim Light */}
          <linearGradient id="cyanRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#38BDF8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
          </linearGradient>

          {/* Bottom-Left Electric Purple Rim Bounce Light */}
          <linearGradient id="purpleBounceGrad" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#E9D5FF" stopOpacity="0.8" />
            <stop offset="45%" stopColor="#A855F7" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
          </linearGradient>

          {/* Glossy Specular Shine on Forehead */}
          <radialGradient
            id="glossHighlight"
            cx="32%"
            cy="26%"
            r="28%"
            fx="30%"
            fy="22%"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#E0F2FE" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>

          {/* Secondary Soft Crescent Specular */}
          <linearGradient id="secondaryCrescent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Eye Iris Gradient: Luminous Glowing Cyan */}
          <radialGradient id="eyeIrisGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#67E8F9" />
            <stop offset="75%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0284C7" />
          </radialGradient>

          {/* Holographic Platform Base Gradient */}
          <linearGradient id="hologramBeam" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0" />
            <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.4" />
          </linearGradient>

          {/* Holographic Ring Glowing Stroke */}
          <linearGradient id="holoRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="50%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          {/* Ear-cuff Cyber Nodes */}
          <linearGradient id="cyberPodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          {/* Drop Shadows & Glow Filters */}
          <filter id="cyanGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="softShadowFilter" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* ==============================================================
            1. HOLOGRAPHIC PEDESTAL / PLATFORM (UNDERNEATH)
            ============================================================== */}
        <g className="mascot-hologram-group">
          {/* Holographic Projector Light Cone */}
          <polygon
            points="120,135 60,250 180,250"
            fill="url(#hologramBeam)"
            className="holo-light-cone"
          />

          {/* Platform Floor Drop Shadow */}
          <ellipse
            cx="120"
            cy="252"
            rx="66"
            ry="18"
            fill="#050917"
            filter="url(#softShadowFilter)"
            opacity="0.85"
            className="mascot-ground-shadow"
          />

          {/* Outer Holographic Disc */}
          <ellipse
            cx="120"
            cy="250"
            rx="75"
            ry="20"
            fill="rgba(8, 14, 35, 0.7)"
            stroke="url(#holoRingGrad)"
            strokeWidth="1.8"
            className="holo-disc-outer"
          />

          {/* Mid Glowing Ring */}
          <ellipse
            cx="120"
            cy="250"
            rx="56"
            ry="14"
            fill="none"
            stroke="#22D3EE"
            strokeWidth="1.2"
            strokeDasharray="5 4"
            className="holo-ring-mid"
          />

          {/* Core Laser Ring */}
          <ellipse
            cx="120"
            cy="250"
            rx="32"
            ry="8"
            fill="rgba(56, 189, 248, 0.15)"
            stroke="#67E8F9"
            strokeWidth="1.5"
            className="holo-ring-core"
          />

          {/* Hologram Floating Particle Dots */}
          <circle cx="85" cy="242" r="1.5" fill="#67E8F9" className="holo-dot dot-1" />
          <circle cx="155" cy="244" r="1.5" fill="#C084FC" className="holo-dot dot-2" />
          <circle cx="100" cy="232" r="1.2" fill="#38BDF8" className="holo-dot dot-3" />
          <circle cx="140" cy="230" r="1.2" fill="#22D3EE" className="holo-dot dot-4" />
        </g>

        {/* ==============================================================
            2. FLOATING 3D BLUE ORB MASCOT BODY
            ============================================================== */}
        <g className="mascot-floating-body">
          {/* Ambient Glow Aura */}
          <circle
            cx="120"
            cy="115"
            r="70"
            fill="rgba(37, 99, 235, 0.28)"
            filter="url(#softShadowFilter)"
            className="mascot-ambient-aura"
          />

          {/* Floating Cyber Audio Pods / Ear Nodes (Left & Right) */}
          <g className="mascot-ears">
            {/* Left Pod */}
            <ellipse
              cx="45"
              cy="115"
              rx="7"
              ry="16"
              fill="url(#cyberPodGrad)"
              stroke="#38BDF8"
              strokeWidth="1.2"
            />
            <circle cx="45" cy="115" r="3.5" fill="#22D3EE" filter="url(#cyanGlowFilter)" />

            {/* Right Pod */}
            <ellipse
              cx="195"
              cy="115"
              rx="7"
              ry="16"
              fill="url(#cyberPodGrad)"
              stroke="#38BDF8"
              strokeWidth="1.2"
            />
            <circle cx="195" cy="115" r="3.5" fill="#22D3EE" filter="url(#cyanGlowFilter)" />
          </g>

          {/* Floating Cyber Halo / Crest on Top */}
          <path
            d="M 96,48 Q 120,40 144,48"
            stroke="url(#holoRingGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            className="mascot-halo-crest"
            filter="url(#cyanGlowFilter)"
          />

          {/* Main 3D Spherical Head Orb */}
          <circle
            cx="120"
            cy="115"
            r="68"
            fill="url(#mascotBody3D)"
            className="mascot-sphere-main"
          />

          {/* Top-Right Cyan Rim Lighting Overlay */}
          <path
            d="M 120,47 A 68,68 0 0,1 188,115 A 68,68 0 0,0 120,53 Z"
            fill="url(#cyanRimGrad)"
            className="mascot-cyan-rim"
          />

          {/* Bottom-Left Purple Bounce Rim Lighting */}
          <path
            d="M 120,183 A 68,68 0 0,1 52,115 A 68,68 0 0,0 120,177 Z"
            fill="url(#purpleBounceGrad)"
            className="mascot-purple-rim"
          />

          {/* Forehead Specular Gloss Highlight */}
          <ellipse
            cx="96"
            cy="82"
            rx="30"
            ry="18"
            transform="rotate(-24 96 82)"
            fill="url(#glossHighlight)"
            className="mascot-specular-primary"
          />

          {/* Secondary Tiny Crisp Highlight Point */}
          <circle
            cx="80"
            cy="72"
            r="4.5"
            fill="#FFFFFF"
            opacity="0.9"
            className="mascot-specular-pin"
          />

          {/* ============================================================
              3. FRIENDLY 3D SMILEY FACE
              ============================================================ */}
          <g className="mascot-face-features">
            {/* Glowing Soft Cheeks (Blush) */}
            <ellipse
              cx="78"
              cy="132"
              rx="12"
              ry="6"
              fill="rgba(34, 211, 238, 0.35)"
              filter="url(#cyanGlowFilter)"
            />
            <ellipse
              cx="162"
              cy="132"
              rx="12"
              ry="6"
              fill="rgba(34, 211, 238, 0.35)"
              filter="url(#cyanGlowFilter)"
            />

            {/* Left Eye Cluster */}
            <g className="mascot-eye mascot-eye-left">
              {/* Outer Deep Eye Socket */}
              <ellipse
                cx="92"
                cy="110"
                rx="14"
                ry="17"
                fill="#060F26"
                stroke="#1E3A8A"
                strokeWidth="1"
              />
              {/* Vibrant Cyan Glowing Iris */}
              <ellipse
                cx="93"
                cy="110"
                rx="11"
                ry="14"
                fill="url(#eyeIrisGrad)"
                className="eye-iris"
              />
              {/* Dark Inner Pupil */}
              <ellipse cx="94" cy="110" rx="6.5" ry="8.5" fill="#030712" />
              {/* Starry Specular Catchlight (Large) */}
              <circle cx="89" cy="104" r="3.8" fill="#FFFFFF" opacity="0.95" />
              {/* Specular Catchlight (Small Accent) */}
              <circle cx="97" cy="114" r="1.8" fill="#FFFFFF" opacity="0.8" />
            </g>

            {/* Right Eye Cluster */}
            <g className="mascot-eye mascot-eye-right">
              {/* Outer Deep Eye Socket */}
              <ellipse
                cx="148"
                cy="110"
                rx="14"
                ry="17"
                fill="#060F26"
                stroke="#1E3A8A"
                strokeWidth="1"
              />
              {/* Vibrant Cyan Glowing Iris */}
              <ellipse
                cx="147"
                cy="110"
                rx="11"
                ry="14"
                fill="url(#eyeIrisGrad)"
                className="eye-iris"
              />
              {/* Dark Inner Pupil */}
              <ellipse cx="146" cy="110" rx="6.5" ry="8.5" fill="#030712" />
              {/* Starry Specular Catchlight (Large) */}
              <circle cx="143" cy="104" r="3.8" fill="#FFFFFF" opacity="0.95" />
              {/* Specular Catchlight (Small Accent) */}
              <circle cx="151" cy="114" r="1.8" fill="#FFFFFF" opacity="0.8" />
            </g>

            {/* Warm Friendly 3D Smile */}
            <g className="mascot-mouth-group">
              {/* Mouth Glow Aura */}
              <path
                d="M 100,136 Q 120,160 140,136"
                stroke="rgba(56, 189, 248, 0.45)"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              {/* Mouth Depth (Dark Inside) */}
              <path
                d="M 101,136 Q 120,158 139,136 Q 120,140 101,136 Z"
                fill="#060F26"
              />
              {/* Crisp White Glowing Smile Curve */}
              <path
                d="M 100,136 Q 120,157 140,136"
                stroke="#F0FDFA"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
                className="mascot-smile-curve"
              />
              {/* Soft Cyan Tongue Glow */}
              <ellipse
                cx="120"
                cy="150"
                rx="8"
                ry="4"
                fill="rgba(34, 211, 238, 0.85)"
                filter="url(#cyanGlowFilter)"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
