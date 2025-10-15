import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Settings,
  Send,
  Loader,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Star,
  ArrowRight,
  BookOpen,
  Code,
  Users,
  Briefcase,
} from "lucide-react";

const RoadmapGenerator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    careerField: "",
    currentLevel: "beginner",
    targetLevel: "intermediate",
    timeCommitment: "",
    learningStyle: "visual",
    specificGoals: "",
    preferredResources: [],
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState(null);
  const [errors, setErrors] = useState({});

  const careerFields = [
    {
      id: "web-development",
      title: "Web Development",
      icon: Code,
      description: "Frontend, Backend, Full-stack development",
    },
    {
      id: "data-science",
      title: "Data Science",
      icon: Brain,
      description: "Machine Learning, Analytics, AI",
    },
    {
      id: "digital-marketing",
      title: "Digital Marketing",
      icon: Target,
      description: "SEO, Social Media, Content Marketing",
    },
    {
      id: "product-management",
      title: "Product Management",
      icon: Briefcase,
      description: "Strategy, Analytics, User Research",
    },
    {
      id: "design",
      title: "UX/UI Design",
      icon: Star,
      description: "User Experience, Visual Design, Prototyping",
    },
    {
      id: "project-management",
      title: "Project Management",
      icon: Users,
      description: "Agile, Scrum, Team Leadership",
    },
  ];

  const skillLevels = [
    { value: "beginner", label: "Beginner", description: "Just starting out" },
    {
      value: "intermediate",
      label: "Intermediate",
      description: "Some experience",
    },
    { value: "advanced", label: "Advanced", description: "Professional level" },
    { value: "expert", label: "Expert", description: "Industry leader" },
  ];

  const timeCommitments = [
    {
      value: "1-5",
      label: "1-5 hours/week",
      description: "Part-time learning",
    },
    {
      value: "5-10",
      label: "5-10 hours/week",
      description: "Dedicated learning",
    },
    {
      value: "10-20",
      label: "10-20 hours/week",
      description: "Intensive learning",
    },
    {
      value: "20+",
      label: "20+ hours/week",
      description: "Full-time commitment",
    },
  ];

  const learningStyles = [
    {
      value: "visual",
      label: "Visual",
      icon: BookOpen,
      description: "Charts, diagrams, videos",
    },
    {
      value: "hands-on",
      label: "Hands-on",
      icon: Code,
      description: "Projects, coding, practice",
    },
    {
      value: "reading",
      label: "Reading",
      icon: BookOpen,
      description: "Articles, books, documentation",
    },
    {
      value: "interactive",
      label: "Interactive",
      icon: Users,
      description: "Courses, mentoring, discussions",
    },
  ];

  const resourceTypes = [
    "Free Online Courses",
    "Paid Courses",
    "Books & eBooks",
    "YouTube Videos",
    "Practice Projects",
    "Coding Challenges",
    "Bootcamps",
    "Mentorship",
    "Certification Programs",
    "Community Forums",
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleResourceToggle = (resource) => {
    setFormData((prev) => ({
      ...prev,
      preferredResources: prev.preferredResources.includes(resource)
        ? prev.preferredResources.filter((r) => r !== resource)
        : [...prev.preferredResources, resource],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.careerField) {
      newErrors.careerField = "Please select a career field";
    }

    if (!formData.timeCommitment) {
      newErrors.timeCommitment = "Please select your time commitment";
    }

    if (formData.specificGoals.length < 10) {
      newErrors.specificGoals =
        "Please provide more details about your goals (at least 10 characters)";
    }

    if (formData.preferredResources.length === 0) {
      newErrors.preferredResources =
        "Please select at least one preferred resource type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateForm()) {
      return;
    }

    setIsGenerating(true);
    setGenerationStatus({
      type: "info",
      message: "Initializing AI roadmap generation...",
    });

    try {
      // Start the roadmap generation
      const response = await fetch("/api/roadmaps/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to start roadmap generation");
      }

      const { roadmapId, n8nWorkflowId } = await response.json();

      setGenerationStatus({
        type: "info",
        message:
          "AI is analyzing your requirements and generating personalized roadmap...",
      });

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(
            `/api/roadmaps/${roadmapId}/status`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (!statusResponse.ok) {
            throw new Error("Failed to check generation status");
          }

          const status = await statusResponse.json();

          if (status.status === "completed") {
            clearInterval(pollInterval);
            setGenerationStatus({
              type: "success",
              message:
                "Roadmap generated successfully! Redirecting to your personalized learning path...",
            });

            setTimeout(() => {
              navigate(`/roadmap/${roadmapId}`);
            }, 2000);
          } else if (status.status === "failed") {
            clearInterval(pollInterval);
            setGenerationStatus({
              type: "error",
              message: `Generation failed: ${
                status.error || "Unknown error occurred"
              }`,
            });
            setIsGenerating(false);
          } else {
            // Update progress message based on current step
            const messages = {
              processing: "Analyzing your requirements...",
              generating: "AI is creating your personalized roadmap...",
              structuring: "Organizing learning phases and steps...",
              finalizing: "Adding resources and finalizing details...",
            };

            setGenerationStatus({
              type: "info",
              message:
                messages[status.currentStep] || "Processing your request...",
            });
          }
        } catch (error) {
          console.error("Error polling status:", error);
          clearInterval(pollInterval);
          setGenerationStatus({
            type: "error",
            message: "Error checking generation status. Please try again.",
          });
          setIsGenerating(false);
        }
      }, 3000);
    } catch (error) {
      console.error("Error generating roadmap:", error);
      setGenerationStatus({
        type: "error",
        message: "Failed to start roadmap generation. Please try again.",
      });
      setIsGenerating(false);
    }
  };

  const getStatusIcon = () => {
    if (!generationStatus) return null;

    switch (generationStatus.type) {
      case "info":
        return <Loader className="w-5 h-5 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              AI Roadmap Generator
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create a personalized learning roadmap powered by AI. Tell us about
            your goals, and we'll generate a structured path to help you achieve
            them.
          </p>
        </div>

        {/* Generation Status */}
        {generationStatus && (
          <div
            className={`
            mb-8 p-4 rounded-lg border flex items-center space-x-3
            ${
              generationStatus.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : ""
            }
            ${
              generationStatus.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : ""
            }
            ${
              generationStatus.type === "info"
                ? "bg-blue-50 border-blue-200 text-blue-800"
                : ""
            }
          `}
          >
            {getStatusIcon()}
            <span className="font-medium">{generationStatus.message}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Career Field Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              What career field interests you?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {careerFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div
                    key={field.id}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${
                        formData.careerField === field.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                    onClick={() => handleInputChange("careerField", field.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon
                        className={`w-6 h-6 mt-1 ${
                          formData.careerField === field.id
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`}
                      />
                      <div>
                        <h3
                          className={`font-medium ${
                            formData.careerField === field.id
                              ? "text-blue-900"
                              : "text-gray-900"
                          }`}
                        >
                          {field.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {field.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.careerField && (
              <p className="text-red-600 text-sm mt-2">{errors.careerField}</p>
            )}
          </div>

          {/* Skill Levels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Current Skill Level
              </h2>
              <div className="space-y-3">
                {skillLevels.map((level) => (
                  <label
                    key={level.value}
                    className={`
                      flex items-center p-3 rounded-lg border cursor-pointer transition-all
                      ${
                        formData.currentLevel === level.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="currentLevel"
                      value={level.value}
                      checked={formData.currentLevel === level.value}
                      onChange={(e) =>
                        handleInputChange("currentLevel", e.target.value)
                      }
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div
                        className={`font-medium ${
                          formData.currentLevel === level.value
                            ? "text-blue-900"
                            : "text-gray-900"
                        }`}
                      >
                        {level.label}
                      </div>
                      <div className="text-sm text-gray-600">
                        {level.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Target Skill Level
              </h2>
              <div className="space-y-3">
                {skillLevels.map((level) => (
                  <label
                    key={level.value}
                    className={`
                      flex items-center p-3 rounded-lg border cursor-pointer transition-all
                      ${
                        formData.targetLevel === level.value
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="targetLevel"
                      value={level.value}
                      checked={formData.targetLevel === level.value}
                      onChange={(e) =>
                        handleInputChange("targetLevel", e.target.value)
                      }
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div
                        className={`font-medium ${
                          formData.targetLevel === level.value
                            ? "text-green-900"
                            : "text-gray-900"
                        }`}
                      >
                        {level.label}
                      </div>
                      <div className="text-sm text-gray-600">
                        {level.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Time Commitment */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              How much time can you commit per week?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {timeCommitments.map((commitment) => (
                <div
                  key={commitment.value}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all text-center
                    ${
                      formData.timeCommitment === commitment.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                  onClick={() =>
                    handleInputChange("timeCommitment", commitment.value)
                  }
                >
                  <Clock
                    className={`w-6 h-6 mx-auto mb-2 ${
                      formData.timeCommitment === commitment.value
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}
                  />
                  <div
                    className={`font-medium ${
                      formData.timeCommitment === commitment.value
                        ? "text-blue-900"
                        : "text-gray-900"
                    }`}
                  >
                    {commitment.label}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {commitment.description}
                  </div>
                </div>
              ))}
            </div>
            {errors.timeCommitment && (
              <p className="text-red-600 text-sm mt-2">
                {errors.timeCommitment}
              </p>
            )}
          </div>

          {/* Learning Style */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              What's your preferred learning style?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {learningStyles.map((style) => {
                const Icon = style.icon;
                return (
                  <div
                    key={style.value}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all text-center
                      ${
                        formData.learningStyle === style.value
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                    onClick={() =>
                      handleInputChange("learningStyle", style.value)
                    }
                  >
                    <Icon
                      className={`w-6 h-6 mx-auto mb-2 ${
                        formData.learningStyle === style.value
                          ? "text-purple-600"
                          : "text-gray-600"
                      }`}
                    />
                    <div
                      className={`font-medium ${
                        formData.learningStyle === style.value
                          ? "text-purple-900"
                          : "text-gray-900"
                      }`}
                    >
                      {style.label}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {style.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Specific Goals */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              What are your specific goals?
            </h2>
            <textarea
              value={formData.specificGoals}
              onChange={(e) =>
                handleInputChange("specificGoals", e.target.value)
              }
              placeholder="Describe what you want to achieve, any specific skills you want to learn, projects you want to build, or career outcomes you're aiming for..."
              rows={4}
              className={`
                w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.specificGoals ? "border-red-500" : "border-gray-300"}
              `}
            />
            <div className="flex justify-between items-center mt-2">
              {errors.specificGoals && (
                <p className="text-red-600 text-sm">{errors.specificGoals}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {formData.specificGoals.length} characters
              </p>
            </div>
          </div>

          {/* Preferred Resources */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              What types of learning resources do you prefer?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {resourceTypes.map((resource) => (
                <label
                  key={resource}
                  className={`
                    flex items-center p-3 rounded-lg border cursor-pointer transition-all
                    ${
                      formData.preferredResources.includes(resource)
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={formData.preferredResources.includes(resource)}
                    onChange={() => handleResourceToggle(resource)}
                    className="sr-only"
                  />
                  <div
                    className={`
                    w-4 h-4 mr-3 rounded border-2 flex items-center justify-center
                    ${
                      formData.preferredResources.includes(resource)
                        ? "border-green-500 bg-green-500"
                        : "border-gray-300"
                    }
                  `}
                  >
                    {formData.preferredResources.includes(resource) && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      formData.preferredResources.includes(resource)
                        ? "text-green-900"
                        : "text-gray-700"
                    }`}
                  >
                    {resource}
                  </span>
                </label>
              ))}
            </div>
            {errors.preferredResources && (
              <p className="text-red-600 text-sm mt-2">
                {errors.preferredResources}
              </p>
            )}
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`
                inline-flex items-center space-x-3 px-8 py-4 rounded-lg font-semibold text-lg transition-all
                ${
                  isGenerating
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
                }
              `}
            >
              {isGenerating ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  <span>Generating Your Roadmap...</span>
                </>
              ) : (
                <>
                  <Brain className="w-6 h-6" />
                  <span>Generate AI Roadmap</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="text-sm text-gray-600 mt-4">
              This will create a personalized learning roadmap based on your
              preferences. Generation typically takes 1-2 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapGenerator;
