"use client";

export function CinematicBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#070a13]" />

      <div className="ops-cloud-layer ops-cloud-layer-a absolute -left-[20%] top-[8%] h-[55%] w-[70%] rounded-[100%] bg-[radial-gradient(ellipse_at_center,_rgba(30,58,95,0.9)_0%,_transparent_72%)] opacity-80" />
      <div className="ops-cloud-layer ops-cloud-layer-b absolute -right-[15%] top-[2%] h-[60%] w-[75%] rounded-[100%] bg-[radial-gradient(ellipse_at_center,_rgba(15,40,70,0.85)_0%,_transparent_70%)] opacity-90" />
      <div className="ops-cloud-layer ops-cloud-layer-c absolute left-[10%] top-[22%] h-[45%] w-[55%] rounded-[100%] bg-[radial-gradient(ellipse_at_center,_rgba(13,148,136,0.12)_0%,_transparent_68%)]" />

      <div className="ops-lightning absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_rgba(147,197,253,0.08)_0%,_transparent_45%)]" />

      <div className="ops-rain absolute inset-0 opacity-30" />

      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-[#070a13] via-[#070a13]/90 to-transparent" />

      <svg
        className="absolute inset-x-0 bottom-0 h-[38%] w-full text-slate-950/90"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L0,320Z" />
        <path
          fill="rgba(15,23,42,0.85)"
          d="M0,256L60,250C120,245,240,235,360,229.3C480,224,600,224,720,234.7C840,245,960,267,1080,272C1200,277,1320,267,1380,261.3L1440,256L1440,320L0,320Z"
        />
        <g fill="rgba(30,41,59,0.95)">
          <rect x="80" y="175" width="28" height="145" />
          <rect x="120" y="155" width="34" height="165" />
          <rect x="168" y="140" width="40" height="180" />
          <rect x="220" y="165" width="30" height="155" />
          <rect x="280" y="120" width="48" height="200" />
          <rect x="340" y="150" width="36" height="170" />
          <rect x="400" y="105" width="52" height="215" />
          <rect x="470" y="135" width="38" height="185" />
          <rect x="530" y="90" width="58" height="230" />
          <rect x="610" y="125" width="42" height="195" />
          <rect x="670" y="80" width="64" height="240" />
          <rect x="750" y="115" width="44" height="205" />
          <rect x="810" y="95" width="56" height="225" />
          <rect x="880" y="130" width="40" height="190" />
          <rect x="940" y="70" width="70" height="250" />
          <rect x="1030" y="110" width="46" height="210" />
          <rect x="1090" y="85" width="60" height="235" />
          <rect x="1170" y="120" width="42" height="200" />
          <rect x="1230" y="100" width="54" height="220" />
          <rect x="1300" y="140" width="36" height="180" />
          <rect x="1350" y="160" width="32" height="160" />
        </g>
      </svg>

      <div className="absolute inset-0 bg-gradient-to-b from-[#070a13]/30 via-transparent to-[#070a13]/80" />
    </div>
  );
}
