import { useState } from 'react';

export default function StarRating({ value = 0, onChange, readonly = false, size = 'lg' }) {
  const [hover, setHover] = useState(0);
  const [burst, setBurst] = useState(null);

  const display = hover || value;

  const handleClick = (star) => {
    if (readonly || !onChange) return;
    onChange(star);
    setBurst(star);
    setTimeout(() => setBurst(null), 500);
  };

  return (
    <div className={`star-rating star-rating--${size}`} role="group" aria-label="Rate store">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= display;
        const isBurst = burst === star;
        return (
          <button
            key={star}
            type="button"
            className={`star-rating__star ${filled ? 'star-rating__star--filled' : ''} ${isBurst ? 'star-rating__star--burst' : ''}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            disabled={readonly}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <span className="star-rating__icon">★</span>
            {isBurst && <span className="star-rating__sparkles" aria-hidden />}
          </button>
        );
      })}
      {!readonly && display > 0 && (
        <span className="star-rating__label">{display}/5</span>
      )}
    </div>
  );
}
