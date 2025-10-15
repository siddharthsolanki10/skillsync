import React, { useCallback, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";

// Custom node components
import PhaseNode from "./nodes/PhaseNode";
import StepNode from "./nodes/StepNode";

const nodeTypes = {
  phase: PhaseNode,
  step: StepNode,
};

// Default styles
const defaultEdgeOptions = {
  animated: true,
  style: {
    stroke: "#2563EB",
    strokeWidth: 2,
  },
};

const RoadmapFlowChart = ({
  roadmapData,
  userProgress = null,
  onStepClick = null,
  onPhaseClick = null,
  isInteractive = true,
  height = "600px",
}) => {
  // Transform roadmap data to React Flow format
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!roadmapData?.phases) {
      return { initialNodes: [], initialEdges: [] };
    }

    const nodes = [];
    const edges = [];

    let yPosition = 100;
    const phaseSpacing = 300;
    const stepSpacing = 200;
    const stepsPerRow = 3;

    roadmapData.phases.forEach((phase, phaseIndex) => {
      // Add phase node
      const phaseNode = {
        id: phase.id,
        type: "phase",
        position: { x: 50, y: yPosition },
        data: {
          label: phase.title,
          description: phase.description,
          duration: phase.duration,
          color: phase.color || "#2563EB",
          phase: phase,
          progress: userProgress ? getPhaseProgress(userProgress, phase.id) : 0,
          onClick: onPhaseClick,
        },
        style: {
          background: phase.color || "#2563EB",
          color: "white",
          border: "2px solid #1E40AF",
          borderRadius: "12px",
          width: 200,
          height: 80,
        },
      };
      nodes.push(phaseNode);

      // Add step nodes for this phase
      let stepYPosition = yPosition + 120;
      phase.steps.forEach((step, stepIndex) => {
        const row = Math.floor(stepIndex / stepsPerRow);
        const col = stepIndex % stepsPerRow;
        const stepXPosition = 300 + col * stepSpacing;
        const stepYPositionForRow = stepYPosition + row * 120;

        const stepProgress = userProgress
          ? getStepProgress(userProgress, phase.id, step.id)
          : null;

        const stepNode = {
          id: step.id,
          type: "step",
          position: { x: stepXPosition, y: stepYPositionForRow },
          data: {
            label: step.title,
            description: step.description,
            duration: step.duration,
            difficulty: step.difficulty,
            skills: step.skills || [],
            completed: stepProgress?.completed || false,
            timeSpent: stepProgress?.timeSpent || 0,
            rating: stepProgress?.rating || 0,
            phase: phase.id,
            step: step,
            onClick: onStepClick,
          },
          style: {
            background: stepProgress?.completed ? "#10B981" : "#F3F4F6",
            color: stepProgress?.completed ? "white" : "#374151",
            border: `2px solid ${
              stepProgress?.completed ? "#059669" : "#D1D5DB"
            }`,
            borderRadius: "8px",
            width: 180,
            height: 100,
          },
        };
        nodes.push(stepNode);

        // Connect phase to first step in row
        if (col === 0) {
          edges.push({
            id: `${phase.id}-${step.id}`,
            source: phase.id,
            target: step.id,
            type: "smoothstep",
            style: { stroke: phase.color || "#2563EB" },
          });
        }

        // Connect steps horizontally in the same row
        if (col > 0) {
          const previousStepIndex = stepIndex - 1;
          const previousStep = phase.steps[previousStepIndex];
          edges.push({
            id: `${previousStep.id}-${step.id}`,
            source: previousStep.id,
            target: step.id,
            type: "smoothstep",
            style: { stroke: "#94A3B8" },
          });
        }
      });

      // Update Y position for next phase
      const maxRowsInPhase = Math.ceil(phase.steps.length / stepsPerRow);
      yPosition += phaseSpacing + maxRowsInPhase * 120;
    });

    // Add connections between phases (from roadmap connections data)
    if (roadmapData.connections) {
      roadmapData.connections.forEach((connection) => {
        const connectionEdge = {
          id: `connection-${connection.from}-${connection.to}`,
          source: connection.from,
          target: connection.to,
          type: "smoothstep",
          label: connection.label,
          style: {
            stroke: getConnectionColor(connection.type),
            strokeDasharray: connection.type === "optional" ? "5,5" : undefined,
            strokeWidth: connection.type === "prerequisite" ? 3 : 2,
          },
          markerEnd: {
            type: "arrowclosed",
            color: getConnectionColor(connection.type),
          },
        };
        edges.push(connectionEdge);
      });
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [roadmapData, userProgress, onStepClick, onPhaseClick]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (!userProgress?.phases) return 0;

    const totalSteps =
      roadmapData?.phases?.reduce(
        (sum, phase) => sum + phase.steps.length,
        0
      ) || 0;
    const completedSteps = userProgress.phases.reduce(
      (sum, phase) => sum + phase.steps.filter((step) => step.completed).length,
      0
    );

    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  }, [roadmapData, userProgress]);

  return (
    <div
      style={{ width: "100%", height }}
      className="bg-gray-50 rounded-lg border"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        attributionPosition="bottom-left"
        nodesDraggable={isInteractive}
        nodesConnectable={false}
        elementsSelectable={isInteractive}
      >
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => n.style?.border || "#2563EB"}
          nodeColor={(n) => n.style?.background || "#F3F4F6"}
          nodeBorderRadius={2}
        />
        <Background variant="dots" gap={12} size={1} />

        {/* Progress Panel */}
        <Panel
          position="top-right"
          className="bg-white p-4 rounded-lg shadow-lg"
        >
          <div className="text-sm font-medium text-gray-700 mb-2">
            Overall Progress
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {overallProgress}%
            </span>
          </div>
        </Panel>

        {/* Legend Panel */}
        <Panel
          position="bottom-right"
          className="bg-white p-4 rounded-lg shadow-lg"
        >
          <div className="text-sm font-medium text-gray-700 mb-3">Legend</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-600"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded border-2 border-gray-300"></div>
              <span>Not Started</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-2 bg-blue-500"></div>
              <span>Phase Connection</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-gray-400 border-dashed"></div>
              <span>Optional</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

// Helper functions
function getPhaseProgress(userProgress, phaseId) {
  const phase = userProgress?.phases?.find((p) => p.phaseId === phaseId);
  return phase?.overallProgress || 0;
}

function getStepProgress(userProgress, phaseId, stepId) {
  const phase = userProgress?.phases?.find((p) => p.phaseId === phaseId);
  const step = phase?.steps?.find((s) => s.stepId === stepId);
  return step || null;
}

function getConnectionColor(type) {
  switch (type) {
    case "prerequisite":
      return "#DC2626"; // Red
    case "recommended":
      return "#2563EB"; // Blue
    case "parallel":
      return "#7C3AED"; // Purple
    case "optional":
      return "#6B7280"; // Gray
    default:
      return "#2563EB";
  }
}

export default RoadmapFlowChart;
