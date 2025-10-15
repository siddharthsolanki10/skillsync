import React from "react";
import { Handle, Position } from "reactflow";
import { Clock, Target } from "lucide-react";

const PhaseNode = ({ data, selected }) => {
  const { label, description, duration, color, progress, onClick, phase } =
    data;

  const handleClick = () => {
    if (onClick) {
      onClick(phase);
    }
  };

  return (
    <div
      className={`
        relative px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200
        ${selected ? "ring-4 ring-blue-300" : ""}
        hover:shadow-lg hover:scale-105
      `}
      style={{
        background: `linear-gradient(135deg, ${color}, ${adjustColor(
          color,
          -20
        )})`,
        borderColor: adjustColor(color, -30),
        color: "white",
        minWidth: "200px",
        minHeight: "80px",
      }}
      onClick={handleClick}
    >
      {/* Progress bar */}
      <div className="absolute top-1 left-1 right-1 h-1 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="mt-2">
        <div className="font-semibold text-sm leading-tight mb-1">{label}</div>

        <div className="flex items-center justify-between text-xs opacity-90">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{duration}</span>
          </div>

          <div className="flex items-center space-x-1">
            <Target className="w-3 h-3" />
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Handles for connections */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "white",
          border: `2px solid ${color}`,
          width: 12,
          height: 12,
        }}
      />

      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "white",
          border: `2px solid ${color}`,
          width: 12,
          height: 12,
        }}
      />
    </div>
  );
};

// Helper function to adjust color brightness
function adjustColor(color, amount) {
  // Simple color adjustment (hex colors)
  const usePound = color[0] === "#";
  const col = usePound ? color.slice(1) : color;

  const num = parseInt(col, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;

  r = r > 255 ? 255 : r < 0 ? 0 : r;
  g = g > 255 ? 255 : g < 0 ? 0 : g;
  b = b > 255 ? 255 : b < 0 ? 0 : b;

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default PhaseNode;
