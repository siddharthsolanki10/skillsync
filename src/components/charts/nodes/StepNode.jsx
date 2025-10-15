import React from "react";
import { Handle, Position } from "reactflow";
import {
  Clock,
  CheckCircle,
  Circle,
  Star,
  Zap,
  Book,
  Code,
  Award,
  FileText,
  Video,
} from "lucide-react";

const StepNode = ({ data, selected }) => {
  const {
    label,
    description,
    duration,
    difficulty,
    skills,
    completed,
    timeSpent,
    rating,
    onClick,
    step,
  } = data;

  const handleClick = () => {
    if (onClick) {
      onClick(step);
    }
  };

  // Get icon based on step type
  const getStepIcon = (type) => {
    switch (type) {
      case "course":
        return Book;
      case "project":
        return Code;
      case "certification":
        return Award;
      case "reading":
        return FileText;
      case "practice":
        return Zap;
      default:
        return Circle;
    }
  };

  const StepIcon = getStepIcon(step.type);

  // Get difficulty color
  const getDifficultyColor = (level) => {
    switch (level) {
      case 1:
        return "text-green-500";
      case 2:
        return "text-green-400";
      case 3:
        return "text-yellow-500";
      case 4:
        return "text-orange-500";
      case 5:
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div
      className={`
        relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 bg-white
        ${
          completed
            ? "border-green-500 bg-green-50"
            : "border-gray-300 bg-white"
        }
        ${selected ? "ring-4 ring-blue-300" : ""}
        hover:shadow-md hover:scale-105
      `}
      style={{
        minWidth: "180px",
        minHeight: "100px",
      }}
      onClick={handleClick}
    >
      {/* Status indicator */}
      <div className="absolute top-2 right-2">
        {completed ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <Circle className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {/* Step type icon */}
      <div className="flex items-start space-x-2 mb-2">
        <StepIcon
          className={`w-4 h-4 mt-0.5 ${
            completed ? "text-green-600" : "text-gray-500"
          }`}
        />
        <div className="flex-1">
          <div
            className={`font-medium text-sm leading-tight ${
              completed ? "text-green-800" : "text-gray-800"
            }`}
          >
            {label}
          </div>
        </div>
      </div>

      {/* Progress info */}
      <div className="space-y-1 text-xs">
        {/* Duration and time spent */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-gray-600">
            <Clock className="w-3 h-3" />
            <span>{duration}</span>
          </div>
          {timeSpent > 0 && (
            <div className="text-green-600 font-medium">{timeSpent}h spent</div>
          )}
        </div>

        {/* Difficulty */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-gray-500">Difficulty:</span>
            <div className="flex space-x-0.5">
              {[1, 2, 3, 4, 5].map((level) => (
                <Star
                  key={level}
                  className={`w-3 h-3 ${
                    level <= difficulty
                      ? getDifficultyColor(difficulty)
                      : "text-gray-300"
                  }`}
                  fill={level <= difficulty ? "currentColor" : "none"}
                />
              ))}
            </div>
          </div>

          {/* User rating */}
          {rating > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
              <span className="text-yellow-600 font-medium">{rating}</span>
            </div>
          )}
        </div>

        {/* Skills preview */}
        {skills && skills.length > 0 && (
          <div className="pt-1">
            <div className="text-gray-500 mb-1">Skills:</div>
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 2).map((skill, index) => (
                <span
                  key={index}
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    completed
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {skill}
                </span>
              ))}
              {skills.length > 2 && (
                <span className="text-gray-400 text-xs">
                  +{skills.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: completed ? "#10B981" : "#9CA3AF",
          border: "2px solid white",
          width: 10,
          height: 10,
        }}
      />

      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: completed ? "#10B981" : "#9CA3AF",
          border: "2px solid white",
          width: 10,
          height: 10,
        }}
      />
    </div>
  );
};

export default StepNode;
