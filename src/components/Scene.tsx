/** Her şerit kendi içinde kapalı: bulutlar y=100..900 arasında, dikiş yerinde kesilmez. */
function CloudTile() {
  return (
    <svg
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      className="h-1/2 w-full"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="#ffb6a3" opacity="0.38">
        <ellipse cx="170" cy="200" rx="170" ry="34" />
        <ellipse cx="300" cy="228" rx="120" ry="26" />
        <ellipse cx="760" cy="330" rx="190" ry="38" />
        <ellipse cx="880" cy="356" rx="110" ry="24" />
      </g>
      <g fill="#ff8fa3" opacity="0.3">
        <ellipse cx="520" cy="560" rx="210" ry="40" />
        <ellipse cx="640" cy="588" rx="130" ry="26" />
        <ellipse cx="120" cy="700" rx="150" ry="32" />
      </g>
      <g fill="#ffd9a8" opacity="0.28">
        <ellipse cx="820" cy="780" rx="180" ry="34" />
        <ellipse cx="380" cy="860" rx="200" ry="30" />
      </g>
    </svg>
  );
}

export function Scene() {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[linear-gradient(to_bottom,#1d1b4b_0%,#5a2a6b_30%,#c4476b_52%,#ff8f5a_62%)]"
      aria-hidden="true"
    >
      <div className="absolute inset-0 overflow-hidden opacity-60">
        <div className="cloud-rise-slow absolute inset-x-0 top-0 h-[200%]">
          <CloudTile />
          <CloudTile />
        </div>
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="cloud-rise-fast absolute inset-x-0 top-0 h-[200%]">
          <CloudTile />
          <CloudTile />
        </div>
      </div>
      <div className="scene-zoom absolute inset-0">
        <div className="absolute top-[62%] left-1/2 size-[64vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,214,140,0.7),rgba(255,214,140,0)_70%)]" />
        <div className="absolute top-[62%] left-1/2 size-[22vmin] -translate-x-1/2 -translate-y-[65%] rounded-full bg-[radial-gradient(circle,#fff3c4,#ffc766_70%,#ff9b52)]" />
        <div className="absolute inset-x-0 top-[62%] bottom-0 bg-[linear-gradient(to_bottom,#e0735a,#7a3a6e_45%,#2b2352)]" />
        <div className="absolute top-[62%] left-1/2 h-[22%] w-[12vmin] -translate-x-1/2 bg-linear-to-b from-[#ffd08a]/80 to-transparent blur-md" />
        <div className="absolute -inset-x-[25%] -bottom-[14%] h-[30%] rounded-[50%] bg-[linear-gradient(to_bottom,#f1b97c,#c98150)]" />
      </div>
    </div>
  );
}
