"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { accessLabel, levelLabel, roleLabel } from "@/lib/i18n";
import { useLocale } from "@/components/site-shell";
import type { Score } from "@/lib/catalog";

type ScoreCardProps = {
  score: Score;
  liked?: boolean;
  onLike?: () => void;
  showLikes?: boolean;
  index?: number;
};

export function ScoreCard({ score, liked = false, onLike, showLikes = false, index }: ScoreCardProps) {
  const { locale } = useLocale();
  const title = locale === "en" && score.latin && !/[\u0600-\u06ff]/.test(score.title) ? score.title : score.title;
  const credits = [roleLabel(score.role, locale), score.artist].filter(Boolean).join(" · ");
  const count = (score.likes + (liked ? 1 : 0)).toLocaleString(locale === "fa" ? "fa-IR" : "en-US");

  return (
    <article className="score-card">
      <Link className="score-card-link" href={`/sheet/${score.slug}`} aria-label={`${locale === "en" ? "Open score" : "بازکردن نت"}: ${title}`}>
        <div className="cover-wrap">
          <Image className="cover-image" src={score.cover} alt={`${locale === "en" ? "Editorial piano score artwork for" : "تصویر هنری نت پیانو"} ${title}`} fill sizes="(max-width: 620px) 46vw, (max-width: 980px) 30vw, (max-width: 1300px) 23vw, 18vw" />
          <span className="cover-wash" aria-hidden="true" />
          {typeof index === "number" && <span className="cover-index">{String(index + 1).padStart(2, "0")}</span>}
          {score.recent && <span className="cover-badge">{locale === "en" ? "New" : "تازه"}</span>}
        </div>
        <div className="card-body">
          <h3 className="score-title" dir="auto">{title}</h3>
          {score.latin && <span className="score-latin" dir="auto">{score.latin}</span>}
          {credits && <span className="score-credit" dir="auto">{credits}</span>}
          <div className="card-meta">
            <span className="level-badge">{levelLabel(score.level, locale)}</span>
            <span className="price-badge">{accessLabel(score.price, score.free, locale)}</span>
          </div>
        </div>
      </Link>
      {showLikes && onLike && (
        <button className={`like-button ${liked ? "liked" : ""}`} type="button" onClick={onLike} aria-label={liked ? `${locale === "en" ? "Remove" : "حذف"} ${title} ${locale === "en" ? "from saved scores" : "از ذخیره‌شده‌ها"}` : `${locale === "en" ? "Save" : "ذخیرهٔ"} ${title}`} aria-pressed={liked}>
          <span>{count}</span><Heart size={15} fill={liked ? "currentColor" : "none"} aria-hidden="true" />
        </button>
      )}
    </article>
  );
}
