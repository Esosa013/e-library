import { Star, StarBorder, StarHalf } from '@mui/icons-material';
export default function StarRating({ rating }: { rating: number }) {
  const ratingVal = rating / 2;
  const clampedRating = Math.max(1, Math.min(ratingVal, 5));
  const fullStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {Array.from({ length: clampedRating }).map((_, index) => (
        <Star key={index} className="text-2xl text-red-800" />
      ))}
      {hasHalfStar && <StarHalf className="text-2xl text-red-800" />}
      {Array.from({ length: emptyStars }).map((_, index) => (
        <StarBorder key={`empty-${index}`} className="text-2xl text-red-800" />
      ))}
    </div>
  );
}
