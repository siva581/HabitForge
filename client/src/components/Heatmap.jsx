export function Heatmap({ cells = [] }) {
  const weeks = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  const legendLevels = [0, 1, 2, 3, 4];

  return (
    <div className="heatmap-shell">
      <div className="heatmap-grid">
        {weeks.map((week, weekIndex) => (
          <div className="heatmap-week" key={weekIndex}>
            {week.map((cell) => (
              <div
                key={cell.date}
                className={`heatmap-cell level-${cell.level}`}
                title={`${cell.date}: ${cell.count} completions`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="heatmap-legend">
        <span>Less</span>
        {legendLevels.map((level) => <i key={level} className={`level-${level}`} />)}
        <span>More</span>
      </div>
    </div>
  );
}
