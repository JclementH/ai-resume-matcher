export default function ScoreBar({ score }: { score: number }) {
  // color logic
  const getColor = (score: number) => {
    if (score < 40) return "bg-red-500";
    if (score < 70) return "bg-yellow-400";
    return "bg-green-500";
  };

  return (
    <div className="w-full">
      {/* Track */}
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        
        {/* Fill */}
        <div
          className={`h-full transition-all duration-500 ${getColor(score)}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>

      <div className="relative w-full mt-1">
				{/* Labels */}
				<div className="flex justify-between text-xs text-gray-500">
					<span>0</span>
					<span>100</span>
				</div>

				{/* Dynamic score position */}
				{ score >= 0 && score <= 100 && (
          <span
            className="absolute text-xs font-semibold text-gray-300 -top-1 mt-1 -translate-x-1/2"
            style={{
              left: `${Math.min(100, Math.max(0, score))}%`
            }}
          >
            {score}
          </span>
        )}
			</div>
    </div>
  );
}