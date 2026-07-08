import { useState } from "react";
import type { Hotspot } from "../types";

interface HotspotImageProps {
  image: string;
  alt: string;
  hotspots: Hotspot[];
}

export function HotspotImage({ image, alt, hotspots }: HotspotImageProps) {
  const [active, setActive] = useState(0);
  return (
    <div className="hotspot-wrap">
      <img src={image} alt={alt} loading="lazy" />
      {hotspots.map((spot, index) => (
        <button
          className={`hotspot ${active === index ? "is-active" : ""}`}
          style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
          onClick={() => setActive(index)}
          key={spot.title}
          aria-label={spot.title}
        >
          <span />
        </button>
      ))}
      {hotspots[active] && (
        <aside className="hotspot-panel">
          <strong>{hotspots[active].title}</strong>
          <p>{hotspots[active].body}</p>
        </aside>
      )}
    </div>
  );
}
