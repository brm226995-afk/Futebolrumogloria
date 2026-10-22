import React from 'react';
import { AvatarConfig } from '../types/game';

interface AvatarDisplayProps {
  config: AvatarConfig;
  className?: string;
  showBackdrop?: boolean;
  rotationY?: number; // In degrees, supports continuous rotation
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  config,
  className = 'w-full h-full',
  showBackdrop = true,
  rotationY = 0,
}) => {
  // Normalize angle to [0, 360)
  const normalizedAngle = ((rotationY % 360) + 360) % 360;
  // Facing back if turned between 90 and 270 degrees
  const isFacingBack = normalizedAngle >= 90 && normalizedAngle < 270;
  // Compute relative angle for smooth 3D tilt
  const rawAngle = isFacingBack
    ? normalizedAngle - 180
    : normalizedAngle > 180
    ? normalizedAngle - 360
    : normalizedAngle;
  // Smooth sinusoidal rotation angle clamped to +/- 48deg so the 2D/3D SVG figure NEVER flattens to zero width or disappears!
  const tiltAngle = Math.sin((rawAngle * Math.PI) / 180) * 48;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden select-none ${className}`}>
      {/* Stadium & Pitch Backdrop matching Screenshot 1 */}
      {showBackdrop && (
        <div className="absolute inset-0 pointer-events-none select-none">
          {/* Sky with stylized clouds */}
          <div className="absolute top-0 inset-x-0 h-2/5 bg-gradient-to-b from-[#1C7ED6] via-[#4DABF7] to-[#74C0FC]">
            {/* Soft cloud shapes */}
            <div className="absolute top-3 left-4 w-28 h-12 bg-white/40 rounded-full blur-[2px]" />
            <div className="absolute top-8 left-16 w-36 h-14 bg-white/50 rounded-full blur-[1px]" />
            <div className="absolute top-4 right-10 w-32 h-12 bg-white/35 rounded-full blur-[2px]" />
          </div>

          {/* Stadium Stands in middle ground */}
          <div className="absolute top-[28%] inset-x-0 h-[22%] bg-[#1E293B] border-t-2 border-amber-600/60 overflow-hidden">
            {/* Stadium seat rows with crowd dots */}
            <div className="w-full h-full flex flex-col justify-between py-1 px-2 opacity-85">
              {[...Array(6)].map((_, r) => (
                <div key={r} className="flex justify-around items-center h-2 border-b border-black/20">
                  {[...Array(24)].map((_, c) => (
                    <div
                      key={c}
                      className="w-1.5 h-1.5 rounded-sm"
                      style={{
                        backgroundColor: (r + c) % 3 === 0 ? '#F59E0B' : (r + c) % 2 === 0 ? '#111827' : '#EF4444',
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
            {/* Floodlight posts */}
            <div className="absolute top-0 left-4 w-2 h-full bg-slate-400/50" />
            <div className="absolute top-0 right-4 w-2 h-full bg-slate-400/50" />
          </div>

          {/* Green Grass Pitch in foreground */}
          <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-b from-[#2F9E44] to-[#237834]">
            {/* Mowed grass stripes */}
            <div className="w-full h-full flex flex-col">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-full flex-1"
                  style={{
                    backgroundColor: i % 2 === 0 ? 'rgba(0,0,0,0.06)' : 'transparent',
                  }}
                />
              ))}
            </div>
            {/* Subtle center circle / pitch markings */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-12 border-2 border-white/20 rounded-full" />
          </div>
        </div>
      )}

      {/* 3D Rotatable Character Container */}
      <div
        className="relative z-10 w-full max-w-[320px] h-full flex items-center justify-center transition-transform duration-100 ease-out"
        style={{
          transform: `perspective(750px) rotateY(${tiltAngle}deg)`,
          transformOrigin: '50% 65%',
        }}
      >
        {!isFacingBack ? (
          /* FRONT VIEW */
          <svg
            viewBox="0 0 280 440"
            className="w-full h-full object-contain filter drop-shadow-[0_12px_16px_rgba(0,0,0,0.45)]"
          >
            {/* Soft shadow under boots */}
            <ellipse cx="140" cy="416" rx="68" ry="14" fill="#000000" opacity="0.4" />

            {/* --- LEGS & CLEATS (Muscular Athletic Legs) --- */}
            {/* Left Leg */}
            <g id="left-leg">
              {/* Powerful Thigh */}
              <rect x="100" y="270" width="32" height="52" rx="8" fill={config.skinTone} />
              <path d="M 100 278 Q 97 296 102 316" stroke="#000000" strokeWidth="1.5" strokeOpacity="0.2" fill="none" />
              <circle cx="116" cy="318" r="11" fill={config.skinTone} />
              {/* Calf & Shin Guard */}
              <rect x="102" y="322" width="28" height="60" rx="6" fill={config.jerseyColor} />
              <rect x="102" y="325" width="28" height="4" fill="#111827" />
              <rect x="102" y="333" width="28" height="3" fill="#111827" />

              <path
                d="M 90 380 Q 95 374 116 374 Q 132 374 133 392 L 132 404 Q 128 410 114 410 L 90 408 Q 84 402 86 392 Z"
                fill={config.bootColor}
              />
              <path d="M 94 394 Q 110 392 126 399" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" />
              <rect x="90" y="407" width="5" height="4" rx="1" fill="#FACC15" />
              <rect x="104" y="408" width="5" height="4" rx="1" fill="#FACC15" />
              <rect x="120" y="407" width="6" height="4" rx="1" fill="#FACC15" />
            </g>

            {/* Right Leg */}
            <g id="right-leg">
              {/* Powerful Thigh */}
              <rect x="148" y="270" width="32" height="52" rx="8" fill={config.skinTone} />
              <path d="M 180 278 Q 183 296 178 316" stroke="#000000" strokeWidth="1.5" strokeOpacity="0.2" fill="none" />
              <circle cx="164" cy="318" r="11" fill={config.skinTone} />
              {/* Calf & Shin Guard */}
              <rect x="150" y="322" width="28" height="60" rx="6" fill={config.jerseyColor} />
              <rect x="150" y="325" width="28" height="4" fill="#111827" />
              <rect x="150" y="333" width="28" height="3" fill="#111827" />

              <path
                d="M 147 374 Q 164 374 190 380 Q 196 392 190 408 L 166 410 Q 150 410 147 404 L 147 392 Z"
                fill={config.bootColor}
              />
              <path d="M 154 399 Q 170 392 186 394" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" />
              <rect x="154" y="407" width="6" height="4" rx="1" fill="#FACC15" />
              <rect x="171" y="408" width="5" height="4" rx="1" fill="#FACC15" />
              <rect x="185" y="407" width="5" height="4" rx="1" fill="#FACC15" />
            </g>

            {/* --- SHORTS (Athletic Cut) --- */}
            <g id="shorts">
              <path
                d="M 94 226 Q 140 234 186 226 L 194 276 Q 166 282 147 276 L 140 258 L 133 276 Q 114 282 86 276 Z"
                fill={config.jerseyColor}
              />
              <path d="M 140 230 L 140 258" stroke="#000000" strokeWidth="2" strokeOpacity="0.3" />
              <text
                x="166"
                y="263"
                fill="#111827"
                fontSize="13"
                fontWeight="bold"
                fontFamily="Outfit, sans-serif"
                textAnchor="middle"
              >
                {config.number}
              </text>
            </g>

            {/* --- JERSEY / TORSO (Broad Athletic V-Taper Shoulders) --- */}
            <g id="torso">
              <path
                d="M 88 156 Q 140 150 192 156 L 186 230 Q 140 236 94 230 Z"
                fill={config.jerseyColor}
              />
              {/* Athletic collar */}
              <path d="M 120 155 Q 140 178 160 155" stroke="#111827" strokeWidth="4.5" fill="none" strokeLinecap="round" />
              {/* Chest / Pectoral contour lines */}
              <path d="M 106 182 Q 124 192 138 184" stroke="#000000" strokeWidth="1.5" strokeOpacity="0.15" fill="none" />
              <path d="M 174 182 Q 156 192 142 184" stroke="#000000" strokeWidth="1.5" strokeOpacity="0.15" fill="none" />

              {/* Club Crest / Shield on chest */}
              <g transform="translate(164, 172) scale(0.68)">
                <path d="M 0 0 L 16 0 L 16 12 Q 16 22 8 26 Q 0 22 0 12 Z" fill="#111827" stroke="#F59E0B" strokeWidth="1.5" />
                <circle cx="8" cy="11" r="5" fill="#F59E0B" />
                <polygon points="5,7 4,3 8,6 12,3 11,7" fill="#F59E0B" />
              </g>

              {/* Torso side contours */}
              <path d="M 94 230 L 88 156" stroke="#000000" strokeWidth="3" strokeOpacity="0.1" />
              <path d="M 186 230 L 192 156" stroke="#000000" strokeWidth="3" strokeOpacity="0.1" />
            </g>

            {/* --- ARMS & HANDS (Muscular Biceps & Deltoids) --- */}
            <g id="left-arm">
              {/* Deltoid shoulder sleeve */}
              <path d="M 94 158 L 68 188 L 88 206 L 104 176 Z" fill={config.jerseyColor} />
              {/* Muscular bicep & forearm */}
              <path d="M 72 194 L 68 244 Q 74 264 84 258 L 92 212 Z" fill={config.skinTone} />
              <circle cx="78" cy="254" r="9" fill={config.skinTone} />
              <path d="M 82 250 Q 88 252 86 258" stroke={config.skinTone} strokeWidth="3" strokeLinecap="round" />
            </g>

            <g id="right-arm">
              {/* Deltoid shoulder sleeve */}
              <path d="M 186 158 L 212 188 L 192 206 L 176 176 Z" fill={config.jerseyColor} />
              {/* Muscular bicep & forearm */}
              <path d="M 208 194 L 212 244 Q 206 264 196 258 L 188 212 Z" fill={config.skinTone} />
              <circle cx="202" cy="254" r="9" fill={config.skinTone} />
              <path d="M 198 250 Q 192 252 194 258" stroke={config.skinTone} strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* --- STRONG ATHLETIC NECK --- */}
            <rect x="127" y="140" width="26" height="22" rx="5" fill={config.skinTone} />
            <path d="M 132 142 L 132 158" stroke="#000000" strokeWidth="1" strokeOpacity="0.15" />
            <path d="M 148 142 L 148 158" stroke="#000000" strokeWidth="1" strokeOpacity="0.15" />

            {/* --- HEAD & FACE --- */}
            <g id="head">
              <ellipse cx="94" cy="120" rx="8" ry="11" fill={config.skinTone} />
              <ellipse cx="186" cy="120" rx="8" ry="11" fill={config.skinTone} />
              <ellipse cx="140" cy="116" rx="46" ry="48" fill={config.skinTone} />
              <path
                d="M 102 120 Q 106 156 140 156 Q 174 156 178 120 Z"
                fill={config.skinTone}
              />

              {/* Eyebrows */}
              <path d="M 108 100 Q 120 96 130 102" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M 172 100 Q 160 96 150 102" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" fill="none" />

              {/* Left Eye */}
              <g id="left-eye">
                <ellipse cx="120" cy="114" rx="11" ry="8" fill="#FFFFFF" />
                <circle cx="120" cy="114" r="6.5" fill="#78350F" />
                <circle cx="120" cy="114" r="3.5" fill="#000000" />
                <circle cx="118" cy="112" r="2" fill="#FFFFFF" />
                <path d="M 109 110 Q 120 105 131 110" stroke="#111827" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>

              {/* Right Eye */}
              <g id="right-eye">
                <ellipse cx="160" cy="114" rx="11" ry="8" fill="#FFFFFF" />
                <circle cx="160" cy="114" r="6.5" fill="#78350F" />
                <circle cx="160" cy="114" r="3.5" fill="#000000" />
                <circle cx="158" cy="112" r="2" fill="#FFFFFF" />
                <path d="M 149 110 Q 160 105 171 110" stroke="#111827" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>

              {/* Nose */}
              <path d="M 138 120 Q 140 126 142 126 Q 144 126 144 123" stroke="#9A3412" strokeWidth="1.5" fill="none" strokeLinecap="round" />

              {/* Mouth */}
              <path d="M 134 135 Q 140 139 146 135" stroke="#7C2D12" strokeWidth="2" fill="none" strokeLinecap="round" />

              {/* Facial Hair Options */}
              {config.beardStyle === 'goatee' && (
                <g id="goatee">
                  <ellipse cx="140" cy="139" rx="2.5" ry="2" fill="#451A03" />
                  <path
                    d="M 135 146 Q 140 144 145 146 L 144 154 Q 140 156 136 154 Z"
                    fill="#451A03"
                  />
                  <path d="M 131 133 Q 140 131 149 133" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </g>
              )}

              {config.beardStyle === 'stubble' && (
                <g id="stubble" opacity="0.45">
                  <path d="M 122 136 Q 140 156 158 136" stroke="#451A03" strokeWidth="7" strokeDasharray="2,2" fill="none" />
                </g>
              )}

              {config.beardStyle === 'full' && (
                <g id="full-beard">
                  <path
                    d="M 112 124 Q 118 158 140 158 Q 162 158 168 124 L 164 128 Q 140 162 116 128 Z"
                    fill="#451A03"
                  />
                  <path d="M 130 132 Q 140 129 150 132" stroke="#451A03" strokeWidth="3" strokeLinecap="round" fill="none" />
                </g>
              )}

              {config.beardStyle === 'mustache' && (
                <g id="mustache">
                  <path
                    d="M 126 133 Q 140 128 154 133 Q 146 137 140 135 Q 134 137 126 133 Z"
                    fill="#451A03"
                  />
                </g>
              )}

              {config.beardStyle === 'spartan' && (
                <g id="spartan-beard">
                  <path
                    d="M 110 122 Q 114 156 136 166 L 140 170 L 144 166 Q 166 156 170 122 L 166 126 Q 140 172 114 126 Z"
                    fill="#451A03"
                  />
                  <path d="M 128 132 Q 140 128 152 132" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                </g>
              )}

              {config.beardStyle === 'line_up' && (
                <g id="line-up-beard">
                  <path
                    d="M 114 128 Q 120 155 140 155 Q 160 155 166 128"
                    stroke="#451A03"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path d="M 132 133 Q 140 130 148 133" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </g>
              )}

              {config.beardStyle === 'van_dyke' && (
                <g id="van-dyke-beard">
                  {/* Pointed chin beard */}
                  <polygon points="135,146 140,158 145,146" fill="#451A03" />
                  {/* Disconnected styled mustache */}
                  <path d="M 127 132 Q 134 129 138 133" stroke="#451A03" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M 142 133 Q 146 129 153 132" stroke="#451A03" strokeWidth="3" strokeLinecap="round" fill="none" />
                </g>
              )}

              {/* Hair Front Options */}
              {config.hairStyle === 'short_fade' && (
                <g id="hair-short-fade">
                  <path
                    d="M 94 104 Q 92 68 140 68 Q 188 68 186 104 Q 184 76 140 74 Q 96 76 94 104 Z"
                    fill={config.hairColor}
                  />
                  <path
                    d="M 93 100 C 90 60, 130 54, 140 54 C 150 54, 190 60, 187 100 C 182 85, 172 72, 140 72 C 108 72, 98 85, 93 100 Z"
                    fill={config.hairColor}
                  />
                  <path d="M 110 74 Q 124 64 136 78" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
                  <path d="M 144 76 Q 156 64 168 76" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
                  <path d="M 128 62 Q 140 56 150 64" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
                  <path d="M 97 104 L 98 116" stroke={config.hairColor} strokeWidth="3" strokeLinecap="round" />
                  <path d="M 183 104 L 182 116" stroke={config.hairColor} strokeWidth="3" strokeLinecap="round" />
                </g>
              )}

              {config.hairStyle === 'spiky' && (
                <g id="hair-spiky">
                  <polygon points="96,94 104,60 114,80 128,50 140,78 152,48 166,76 176,58 184,94" fill={config.hairColor} />
                  <path d="M 94 94 Q 140 70 186 94" fill={config.hairColor} />
                </g>
              )}

              {config.hairStyle === 'curls' && (
                <g id="hair-curls">
                  <circle cx="106" cy="78" r="14" fill={config.hairColor} />
                  <circle cx="124" cy="66" r="15" fill={config.hairColor} />
                  <circle cx="144" cy="64" r="16" fill={config.hairColor} />
                  <circle cx="164" cy="70" r="14" fill={config.hairColor} />
                  <circle cx="178" cy="84" r="12" fill={config.hairColor} />
                  <circle cx="98" cy="90" r="10" fill={config.hairColor} />
                </g>
              )}

              {config.hairStyle === 'buzz' && (
                <g id="hair-buzz">
                  <path d="M 95 106 Q 96 74 140 74 Q 184 74 185 106 Z" fill={config.hairColor} opacity="0.85" />
                </g>
              )}

              {config.hairStyle === 'mohawk' && (
                <g id="hair-mohawk">
                  <polygon points="128,84 132,44 140,40 148,44 152,84" fill={config.hairColor} />
                  <polygon points="134,44 138,30 142,30 146,44" fill={config.hairColor} />
                </g>
              )}

              {config.hairStyle === 'dreadlocks' && (
                <g id="hair-dreads">
                  <path d="M 96 90 Q 140 60 184 90" fill={config.hairColor} />
                  {/* Hanging Dreads */}
                  <rect x="94" y="86" width="6" height="42" rx="3" fill={config.hairColor} />
                  <rect x="104" y="82" width="6" height="46" rx="3" fill={config.hairColor} />
                  <rect x="114" y="78" width="6" height="48" rx="3" fill={config.hairColor} />
                  <rect x="125" y="76" width="6" height="40" rx="3" fill={config.hairColor} />
                  <rect x="136" y="76" width="6" height="40" rx="3" fill={config.hairColor} />
                  <rect x="148" y="78" width="6" height="48" rx="3" fill={config.hairColor} />
                  <rect x="159" y="82" width="6" height="46" rx="3" fill={config.hairColor} />
                  <rect x="169" y="86" width="6" height="42" rx="3" fill={config.hairColor} />
                  {/* Dread bead accessory */}
                  <rect x="103" y="116" width="8" height="4" rx="1" fill="#FACC15" />
                  <rect x="158" y="118" width="8" height="4" rx="1" fill="#FACC15" />
                </g>
              )}

              {config.hairStyle === 'afro' && (
                <g id="hair-afro">
                  <circle cx="140" cy="74" r="38" fill={config.hairColor} />
                  <circle cx="112" cy="84" r="28" fill={config.hairColor} />
                  <circle cx="168" cy="84" r="28" fill={config.hairColor} />
                  <circle cx="140" cy="94" r="30" fill={config.hairColor} />
                </g>
              )}

              {config.hairStyle === 'samurai' && (
                <g id="hair-samurai">
                  {/* Clean fade sides */}
                  <path d="M 98 94 Q 140 70 182 94 Z" fill={config.hairColor} opacity="0.6" />
                  {/* Top knot */}
                  <ellipse cx="140" cy="68" rx="26" ry="18" fill={config.hairColor} />
                  {/* Bun on top */}
                  <circle cx="140" cy="45" r="14" fill={config.hairColor} />
                  <rect x="133" y="52" width="14" height="4" rx="2" fill="#FACC15" />
                </g>
              )}

              {config.hairStyle === 'long_band' && (
                <g id="hair-long-band">
                  {/* Long hair flowing behind */}
                  <path d="M 92 88 Q 80 130 84 150 Q 140 140 196 150 Q 200 130 188 88 Z" fill={config.hairColor} />
                  <path d="M 94 94 Q 140 64 186 94" fill={config.hairColor} />
                  {/* White Athletic Headband */}
                  <path d="M 93 90 Q 140 74 187 90" stroke="#FFFFFF" strokeWidth="6" fill="none" strokeLinecap="round" />
                </g>
              )}

              {config.hairStyle === 'platinum_crop' && (
                <g id="hair-platinum-crop">
                  <path
                    d="M 95 96 C 92 64, 130 58, 140 58 C 150 58, 188 64, 185 96 C 170 82, 110 82, 95 96 Z"
                    fill={config.hairColor}
                  />
                  {/* Crop fringe */}
                  <rect x="110" y="78" width="60" height="8" rx="2" fill={config.hairColor} />
                  <path d="M 115 74 L 165 74" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.8" />
                </g>
              )}

              {config.hairStyle === 'bald' && (
                <g id="hair-bald">
                  {/* Subtle shine highlight on shaved head */}
                  <ellipse cx="132" cy="80" rx="20" ry="10" fill="#FFFFFF" opacity="0.15" />
                </g>
              )}
            </g>
          </svg>
        ) : (
          /* BACK VIEW - ATHLETE NAME & SQUAD NUMBER */
          <svg
            viewBox="0 0 280 440"
            className="w-full h-full object-contain filter drop-shadow-[0_12px_16px_rgba(0,0,0,0.45)]"
          >
            {/* Soft shadow */}
            <ellipse cx="140" cy="416" rx="68" ry="14" fill="#000000" opacity="0.4" />

            {/* Muscular Back Legs & Cleats */}
            <g id="back-legs">
              {/* Powerful Thighs */}
              <rect x="100" y="270" width="32" height="52" rx="8" fill={config.skinTone} />
              <rect x="148" y="270" width="32" height="52" rx="8" fill={config.skinTone} />

              {/* Muscular Calves & Socks */}
              <rect x="102" y="322" width="28" height="60" rx="6" fill={config.jerseyColor} />
              <rect x="150" y="322" width="28" height="60" rx="6" fill={config.jerseyColor} />
              <rect x="102" y="325" width="28" height="4" fill="#111827" />
              <rect x="150" y="325" width="28" height="4" fill="#111827" />

              {/* Cleats Heels */}
              <path
                d="M 98 380 Q 116 375 130 380 L 132 408 Q 116 412 100 408 Z"
                fill={config.bootColor}
              />
              <path
                d="M 150 380 Q 164 375 182 380 L 180 408 Q 164 412 148 408 Z"
                fill={config.bootColor}
              />
              {/* Back Studs */}
              <rect x="104" y="407" width="5" height="4" rx="1" fill="#FACC15" />
              <rect x="120" y="407" width="5" height="4" rx="1" fill="#FACC15" />
              <rect x="154" y="407" width="5" height="4" rx="1" fill="#FACC15" />
              <rect x="170" y="407" width="5" height="4" rx="1" fill="#FACC15" />
            </g>

            {/* Athletic Back Shorts */}
            <g id="back-shorts">
              <path
                d="M 94 226 Q 140 232 186 226 L 194 276 Q 166 282 140 272 Q 114 282 86 276 Z"
                fill={config.jerseyColor}
              />
              <path d="M 140 228 L 140 268" stroke="#000000" strokeWidth="2" strokeOpacity="0.3" />
            </g>

            {/* Back Jersey Torso with Athletic V-Taper, Athlete Name & Number */}
            <g id="back-torso">
              <path
                d="M 88 156 Q 140 150 192 156 L 186 230 Q 140 236 94 230 Z"
                fill={config.jerseyColor}
              />
              {/* High collar back */}
              <path d="M 120 155 Q 140 150 160 155" stroke="#111827" strokeWidth="4.5" fill="none" strokeLinecap="round" />

              {/* ATHLETE NAME ON BACK */}
              <text
                x="140"
                y="182"
                fill="#FFFFFF"
                stroke="#0F172A"
                strokeWidth="0.8"
                fontSize="12"
                fontWeight="900"
                fontFamily="Outfit, sans-serif"
                textAnchor="middle"
                letterSpacing="1"
              >
                {(config.name || 'GABRIEL M.').toUpperCase()}
              </text>

              {/* BIG SQUAD NUMBER ON BACK */}
              <text
                x="140"
                y="218"
                fill="#FFFFFF"
                stroke="#0F172A"
                strokeWidth="1.5"
                fontSize="36"
                fontWeight="900"
                fontFamily="Outfit, sans-serif"
                textAnchor="middle"
              >
                {config.number || 9}
              </text>
            </g>

            {/* Muscular Back Arms */}
            <g id="back-left-arm">
              <path d="M 94 158 L 68 188 L 88 206 L 104 176 Z" fill={config.jerseyColor} />
              <path d="M 72 194 L 68 244 Q 74 264 84 258 L 92 212 Z" fill={config.skinTone} />
              <circle cx="78" cy="254" r="9" fill={config.skinTone} />
            </g>

            <g id="back-right-arm">
              <path d="M 186 158 L 212 188 L 192 206 L 176 176 Z" fill={config.jerseyColor} />
              <path d="M 208 194 L 212 244 Q 206 264 196 258 L 188 212 Z" fill={config.skinTone} />
              <circle cx="202" cy="254" r="9" fill={config.skinTone} />
            </g>

            {/* Neck Back */}
            <rect x="127" y="140" width="26" height="22" rx="5" fill={config.skinTone} />
            {/* Base of skull hairline */}
            {config.hairStyle !== 'bald' && (
              <path d="M 126 144 Q 140 148 154 144" stroke={config.hairColor} strokeWidth="3" fill="none" />
            )}

            {/* Back of Head & Hair */}
            <g id="back-head">
              <ellipse cx="94" cy="120" rx="7" ry="10" fill={config.skinTone} />
              <ellipse cx="186" cy="120" rx="7" ry="10" fill={config.skinTone} />
              <ellipse cx="140" cy="116" rx="46" ry="48" fill={config.skinTone} />

              {/* Hairstyle Specific Back */}
              {config.hairStyle === 'bald' ? (
                <ellipse cx="140" cy="98" rx="20" ry="10" fill="#FFFFFF" opacity="0.15" />
              ) : config.hairStyle === 'afro' ? (
                <g id="back-afro">
                  <circle cx="140" cy="74" r="42" fill={config.hairColor} />
                  <circle cx="110" cy="84" r="30" fill={config.hairColor} />
                  <circle cx="170" cy="84" r="30" fill={config.hairColor} />
                </g>
              ) : config.hairStyle === 'samurai' ? (
                <g id="back-samurai">
                  <path d="M 98 116 Q 140 80 182 116 Z" fill={config.hairColor} opacity="0.7" />
                  <ellipse cx="140" cy="78" rx="26" ry="20" fill={config.hairColor} />
                  <circle cx="140" cy="45" r="14" fill={config.hairColor} />
                  <rect x="133" y="52" width="14" height="4" rx="2" fill="#FACC15" />
                </g>
              ) : config.hairStyle === 'dreadlocks' ? (
                <g id="back-dreads">
                  <ellipse cx="140" cy="100" rx="46" ry="36" fill={config.hairColor} />
                  {[96, 106, 116, 126, 136, 146, 156, 166, 176].map((xPos, idx) => (
                    <rect key={idx} x={xPos} y={90} width={6} height={48 + (idx % 3) * 6} rx={3} fill={config.hairColor} />
                  ))}
                </g>
              ) : config.hairStyle === 'long_band' ? (
                <g id="back-long">
                  <path d="M 88 90 Q 76 136 82 165 Q 140 155 198 165 Q 204 136 192 90 Z" fill={config.hairColor} />
                  <path d="M 93 90 Q 140 76 187 90" stroke="#FFFFFF" strokeWidth="6" fill="none" strokeLinecap="round" />
                </g>
              ) : (
                /* Default back hair for fades, spikes, buzz, crop, etc */
                <g id="back-default-hair">
                  <ellipse cx="140" cy="110" rx="48" ry="46" fill={config.hairColor} />
                  <path
                    d="M 94 116 Q 92 68 140 68 Q 188 68 186 116 Q 165 146 140 146 Q 115 146 94 116 Z"
                    fill={config.hairColor}
                  />
                  <path d="M 115 85 Q 140 78 165 85" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
                  <path d="M 125 100 Q 140 94 155 100" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
                </g>
              )}
            </g>
          </svg>
        )}
      </div>
    </div>
  );
};
