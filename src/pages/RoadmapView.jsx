import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Share2,
  Edit,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  Settings,
  Eye,
  BarChart3,
  GitBranch,
  Map,
  FileText,
  AlertCircle,
  Loader,
} from "lucide-react";

// Chart Components
import RoadmapFlowChart from "../components/charts/RoadmapFlowChart";
import MermaidChart from "../components/charts/MermaidChart";
import ProgressCharts from "../components/charts/ProgressCharts";

// Roadmap Components
import PhaseOverview from "../components/roadmap/PhaseOverview";
import StepDetail from "../components/roadmap/StepDetail";

const RoadmapView = () => {
  const { roadmapId } = useParams();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [documentation, setDocumentation] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View state
  const [activeView, setActiveView] = useState("overview"); // overview, flowchart, timeline, progress
  const [selectedStep, setSelectedStep] = useState(null);
  const [expandedPhases, setExpandedPhases] = useState({});

  useEffect(() => {
    fetchRoadmapData();
  }, [roadmapId]);

  const fetchRoadmapData = async () => {
    try {
      setLoading(true);

      // Fetch roadmap data
      const roadmapResponse = await fetch(`/api/roadmaps/${roadmapId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!roadmapResponse.ok) {
        throw new Error("Failed to fetch roadmap");
      }

      const roadmapData = await roadmapResponse.json();
      setRoadmap(roadmapData);

      // Fetch documentation
      if (roadmapData.documentationId) {
        const docResponse = await fetch(
          `/api/documentation/${roadmapData.documentationId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (docResponse.ok) {
          const docData = await docResponse.json();
          setDocumentation(docData);
        }
      }

      // Fetch user progress
      const progressResponse = await fetch(
        `/api/progress/roadmap/${roadmapId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setUserProgress(progressData);
      }
    } catch (error) {
      console.error("Error fetching roadmap data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (stepId, progressData) => {
    try {
      const response = await fetch(`/api/progress/step/${stepId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(progressData),
      });

      if (response.ok) {
        // Refresh progress data
        await fetchRoadmapData();
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleStepClick = (step) => {
    setSelectedStep(step);
  };

  const handlePhaseToggle = (phaseId) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  const handleExport = () => {
    // Export roadmap data as JSON
    const exportData = {
      roadmap,
      documentation,
      progress: userProgress,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roadmap-${
      roadmap?.careerField || "learning"
    }-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const calculateOverallProgress = () => {
    if (!roadmap?.phases || !userProgress?.phases) return 0;

    const totalSteps = roadmap.phases.reduce(
      (sum, phase) => sum + phase.steps.length,
      0
    );
    const completedSteps = userProgress.phases.reduce(
      (sum, phase) =>
        sum + (phase.steps?.filter((s) => s.completed).length || 0),
      0
    );

    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Roadmap
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Roadmap not found</p>
        </div>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {roadmap.title || `${roadmap.careerField} Learning Path`}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center space-x-1">
                    <Target className="w-4 h-4" />
                    <span>{roadmap.careerField}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{roadmap.estimatedDuration}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{overallProgress}% Complete</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Edit className="w-4 h-4" />
                <span>Customize</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex space-x-8 border-b">
            {[
              { id: "overview", label: "Overview", icon: Eye },
              { id: "flowchart", label: "Interactive Chart", icon: GitBranch },
              { id: "timeline", label: "Timeline View", icon: Map },
              { id: "progress", label: "Progress Analytics", icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-3 border-b-2 font-medium transition-colors
                    ${
                      activeView === tab.id
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main View Area */}
          <div className="lg:col-span-3">
            {activeView === "overview" && (
              <div className="space-y-6">
                {/* Roadmap Summary */}
                {documentation && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <h2 className="text-xl font-semibold text-gray-900">
                        Learning Guide
                      </h2>
                    </div>

                    <div className="prose max-w-none">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: documentation.content,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Phases Overview */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    <span>Learning Phases</span>
                  </h2>

                  {roadmap.phases?.map((phase) => {
                    const phaseProgress = userProgress?.phases?.find(
                      (p) => p.phaseId === phase.id
                    );

                    return (
                      <PhaseOverview
                        key={phase.id}
                        phase={phase}
                        progress={phaseProgress}
                        onStepClick={handleStepClick}
                        isExpanded={expandedPhases[phase.id]}
                        onToggleExpand={() => handlePhaseToggle(phase.id)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {activeView === "flowchart" && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <GitBranch className="w-6 h-6 text-blue-600" />
                  <span>Interactive Roadmap</span>
                </h2>

                <div className="h-96 border rounded-lg">
                  <RoadmapFlowChart
                    roadmapData={roadmap}
                    progress={userProgress}
                    onStepClick={handleStepClick}
                  />
                </div>
              </div>
            )}

            {activeView === "timeline" && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <Map className="w-6 h-6 text-blue-600" />
                  <span>Timeline View</span>
                </h2>

                <div className="space-y-6">
                  <MermaidChart
                    type="gantt"
                    roadmapData={roadmap}
                    progress={userProgress}
                  />

                  <MermaidChart
                    type="journey"
                    roadmapData={roadmap}
                    progress={userProgress}
                  />
                </div>
              </div>
            )}

            {activeView === "progress" && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  <span>Progress Analytics</span>
                </h2>

                <ProgressCharts
                  roadmapData={roadmap}
                  progressData={userProgress}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Stats
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-semibold text-blue-600">
                      {overallProgress}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Phases</span>
                    <span className="font-semibold">
                      {roadmap.phases?.length || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Steps</span>
                    <span className="font-semibold">
                      {roadmap.phases?.reduce(
                        (sum, phase) => sum + phase.steps.length,
                        0
                      ) || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Time Investment</span>
                    <span className="font-semibold">
                      {roadmap.estimatedDuration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Step */}
              {selectedStep && (
                <div className="bg-white rounded-lg shadow-lg">
                  <StepDetail
                    step={selectedStep}
                    progress={userProgress?.phases
                      ?.find((p) =>
                        p.steps?.some((s) => s.stepId === selectedStep.id)
                      )
                      ?.steps?.find((s) => s.stepId === selectedStep.id)}
                    onProgressUpdate={(progressData) =>
                      updateProgress(selectedStep.id, progressData)
                    }
                    onClose={() => setSelectedStep(null)}
                  />
                </div>
              )}

              {/* AI Generation Info */}
              {roadmap.aiMetadata && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    AI Generated
                  </h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div>Model: {roadmap.aiMetadata.model}</div>
                    <div>
                      Generated:{" "}
                      {new Date(roadmap.createdAt).toLocaleDateString()}
                    </div>
                    <div>Confidence: {roadmap.aiMetadata.confidence}%</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapView;
