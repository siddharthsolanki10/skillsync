import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  Target,
  TrendingUp,
  CheckCircle,
  Circle,
  ChevronRight,
} from "lucide-react";

const PhaseOverview = ({
  phase,
  progress = null,
  onStepClick,
  isExpanded = false,
  onToggleExpand,
}) => {
  const totalSteps = phase.steps.length;
  const completedSteps =
    progress?.steps?.filter((s) => s.completed).length || 0;
  const phaseProgress =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const totalTimeSpent =
    progress?.steps?.reduce((sum, s) => sum + (s.timeSpent || 0), 0) || 0;

  return (
    <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
      {/* Phase Header */}
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggleExpand}
        style={{
          background: `linear-gradient(135deg, ${phase.color}15, ${phase.color}05)`,
          borderLeft: `4px solid ${phase.color}`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: phase.color }}
              />
              <h3 className="text-xl font-semibold text-gray-800">
                {phase.title}
              </h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Phase {phase.order}
              </span>
            </div>

            <p className="text-gray-600 mb-4">{phase.description}</p>

            {/* Phase Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {phase.duration}
                  </div>
                  <div className="text-xs text-gray-500">Duration</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {completedSteps}/{totalSteps}
                  </div>
                  <div className="text-xs text-gray-500">Steps</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {totalTimeSpent}h
                  </div>
                  <div className="text-xs text-gray-500">Time Spent</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {phaseProgress}%
                  </div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${phaseProgress}%`,
                  backgroundColor: phase.color,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{phaseProgress}% Complete</span>
              <span>
                {progress?.startedAt && !progress?.completedAt && (
                  <span className="text-blue-600 font-medium">In Progress</span>
                )}
                {progress?.completedAt && (
                  <span className="text-green-600 font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Completed
                  </span>
                )}
                {!progress?.startedAt && (
                  <span className="text-gray-500">Not Started</span>
                )}
              </span>
            </div>
          </div>

          <ChevronRight
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </div>

      {/* Phase Steps (when expanded) */}
      {isExpanded && (
        <div className="border-t bg-gray-50">
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Learning Steps
            </h4>

            <div className="space-y-3">
              {phase.steps.map((step, index) => {
                const stepProgress = progress?.steps?.find(
                  (s) => s.stepId === step.id
                );
                const isCompleted = stepProgress?.completed || false;

                return (
                  <div
                    key={step.id}
                    className={`
                      p-4 rounded-lg border cursor-pointer transition-all duration-200
                      ${
                        isCompleted
                          ? "bg-green-50 border-green-200 hover:bg-green-100"
                          : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                      }
                    `}
                    onClick={() => onStepClick?.(step)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`
                          flex items-center justify-center w-8 h-8 rounded-full
                          ${
                            isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-600"
                          }
                        `}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-medium">
                              {index + 1}
                            </span>
                          )}
                        </div>

                        <div>
                          <h5
                            className={`font-medium ${
                              isCompleted ? "text-green-800" : "text-gray-800"
                            }`}
                          >
                            {step.title}
                          </h5>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{step.duration}</span>
                            <span className="capitalize">{step.type}</span>
                            <span>Difficulty: {step.difficulty}/5</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {stepProgress?.timeSpent > 0 && (
                          <span className="text-sm text-green-600 font-medium">
                            {stepProgress.timeSpent}h
                          </span>
                        )}

                        {stepProgress?.rating > 0 && (
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-yellow-600">★</span>
                            <span className="text-sm text-yellow-600">
                              {stepProgress.rating}
                            </span>
                          </div>
                        )}

                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    {step.skills && step.skills.length > 0 && (
                      <div className="mt-2 ml-11">
                        <div className="flex flex-wrap gap-1">
                          {step.skills.slice(0, 4).map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className={`px-2 py-1 rounded text-xs ${
                                isCompleted
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                          {step.skills.length > 4 && (
                            <span className="text-xs text-gray-500 py-1">
                              +{step.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaseOverview;
