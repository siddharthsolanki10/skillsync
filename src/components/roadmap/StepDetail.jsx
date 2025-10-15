import React, { useState } from "react";
import {
  Play,
  Pause,
  CheckCircle,
  Clock,
  Star,
  Book,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const StepDetail = ({
  step,
  progress = null,
  onComplete,
  onUpdateProgress,
  isExpanded = false,
  onToggleExpand,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete?.(step.id);
    } finally {
      setIsCompleting(false);
    }
  };

  const getDifficultyColor = (level) => {
    const colors = {
      1: "text-green-500",
      2: "text-green-400",
      3: "text-yellow-500",
      4: "text-orange-500",
      5: "text-red-500",
    };
    return colors[level] || "text-gray-400";
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "course":
        return Book;
      case "project":
        return Play;
      default:
        return Book;
    }
  };

  const TypeIcon = getTypeIcon(step.type);

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      {/* Step Header */}
      <div
        className={`p-4 cursor-pointer transition-colors ${
          isExpanded ? "border-b" : "hover:bg-gray-50"
        }`}
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                progress?.completed ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              <TypeIcon
                className={`w-5 h-5 ${
                  progress?.completed ? "text-green-600" : "text-gray-600"
                }`}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {step.title}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{step.duration}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <span>Difficulty:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <Star
                        key={level}
                        className={`w-4 h-4 ${
                          level <= step.difficulty
                            ? getDifficultyColor(step.difficulty)
                            : "text-gray-300"
                        }`}
                        fill={
                          level <= step.difficulty ? "currentColor" : "none"
                        }
                      />
                    ))}
                  </div>
                </div>

                {progress?.timeSpent > 0 && (
                  <div className="text-green-600 font-medium">
                    {progress.timeSpent}h spent
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {progress?.completed ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleComplete();
                }}
                disabled={isCompleting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isCompleting ? "Completing..." : "Mark Complete"}
              </button>
            )}

            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-4 border-b">
            {["overview", "resources", "projects", "milestones"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === "overview" && (
              <div>
                <p className="text-gray-700 mb-4">{step.description}</p>

                {step.skills && step.skills.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">
                      Skills You'll Learn
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {step.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {step.prerequisites && step.prerequisites.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-800 mb-2">
                      Prerequisites
                    </h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {step.prerequisites.map((prereq, index) => (
                        <li key={index}>{prereq}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "resources" && (
              <div>
                {step.resources && step.resources.length > 0 ? (
                  <div className="space-y-3">
                    {step.resources.map((resource, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <h5 className="font-medium text-gray-800">
                            {resource.title}
                          </h5>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span className="capitalize px-2 py-1 bg-gray-100 rounded text-xs">
                              {resource.type}
                            </span>
                            {resource.duration && (
                              <span>{resource.duration}</span>
                            )}
                            {resource.free && (
                              <span className="text-green-600 font-medium">
                                Free
                              </span>
                            )}
                          </div>
                        </div>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No resources available for this step.
                  </p>
                )}
              </div>
            )}

            {activeTab === "projects" && (
              <div>
                {step.projects && step.projects.length > 0 ? (
                  <div className="space-y-4">
                    {step.projects.map((project, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-800">
                            {project.title}
                          </h5>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <Star
                                key={level}
                                className={`w-4 h-4 ${
                                  level <= project.difficulty
                                    ? getDifficultyColor(project.difficulty)
                                    : "text-gray-300"
                                }`}
                                fill={
                                  level <= project.difficulty
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-gray-700 mb-3">
                          {project.description}
                        </p>

                        <div className="flex items-center justify-between text-sm">
                          <div className="text-gray-600">
                            Estimated: {project.estimatedHours} hours
                          </div>

                          {project.technologies && (
                            <div className="flex flex-wrap gap-1">
                              {project.technologies
                                .slice(0, 3)
                                .map((tech, techIndex) => (
                                  <span
                                    key={techIndex}
                                    className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              {project.technologies.length > 3 && (
                                <span className="text-gray-500 text-xs">
                                  +{project.technologies.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No projects defined for this step.
                  </p>
                )}
              </div>
            )}

            {activeTab === "milestones" && (
              <div>
                {step.milestones && step.milestones.length > 0 ? (
                  <div className="space-y-3">
                    {step.milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className="p-3 border-l-4 border-blue-500 bg-blue-50"
                      >
                        <h5 className="font-medium text-gray-800 mb-1">
                          {milestone.title}
                        </h5>
                        <p className="text-gray-700 text-sm mb-2">
                          {milestone.description}
                        </p>
                        {milestone.verification && (
                          <p className="text-blue-600 text-sm font-medium">
                            Verification: {milestone.verification}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No milestones defined for this step.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Progress Notes */}
          {progress?.notes && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h5 className="font-medium text-yellow-800 mb-1">Your Notes</h5>
              <p className="text-yellow-700 text-sm">{progress.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StepDetail;
