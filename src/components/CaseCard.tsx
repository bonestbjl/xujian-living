import { Link } from "react-router-dom";
import type { CaseItem } from "../types";

interface CaseCardProps {
  item: CaseItem;
  match?: number;
  reasons?: string[];
}

export function CaseCard({ item, match, reasons }: CaseCardProps) {
  return (
    <article className="case-card">
      <Link to={`/cases/${item.id}`} className="image-link" aria-label={`查看${item.title}`}>
        <img src={item.cover} alt={`${item.title} ${item.style}案例`} loading="lazy" />
        {typeof match === "number" && <span className="match-badge">{match}% MATCH</span>}
      </Link>
      <div className="case-card__body">
        <div className="eyebrow">{item.city} · {item.community}</div>
        <h3>{item.area}㎡ / {item.layoutDetail} / {item.familyLabel}</h3>
        <p className="muted">{item.style}</p>
        <p>{item.highlight}</p>
        {reasons && (
          <div className="reason-list">
            {reasons.map((reason) => (
              <span key={reason}>{reason}</span>
            ))}
          </div>
        )}
        <Link className="text-link" to={`/cases/${item.id}`}>查看完整方案</Link>
      </div>
    </article>
  );
}
