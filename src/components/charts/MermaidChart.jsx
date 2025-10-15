import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Download, Maximize2, RotateCw } from "lucide-react";

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: 14,
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: "basis",
  },
  gantt: {
    numberSectionStyles: 4,
    axisFormat: "%m/%d/%Y",
    gridLineStartPadding: 350,
  },
});

const MermaidChart = ({
  roadmapData,
  userProgress = null,
  chartType = "flowchart", // 'flowchart', 'gantt', 'journey'
  onNodeClick = null,
  height = "500px",
}) => {
  const chartRef = useRef(null);
  const [chartId] = useState(
    `mermaid-${Math.random().toString(36).substr(2, 9)}`
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roadmapData?.phases) return;

    const generateChart = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let mermaidCode = "";

        switch (chartType) {
          case "flowchart":
            mermaidCode = generateFlowchartCode(roadmapData, userProgress);
            break;
          case "gantt":
            mermaidCode = generateGanttCode(roadmapData, userProgress);
            break;
          case "journey":
            mermaidCode = generateJourneyCode(roadmapData, userProgress);
            break;
          default:
            mermaidCode = generateFlowchartCode(roadmapData, userProgress);
        }

        // Clear previous chart
        if (chartRef.current) {
          chartRef.current.innerHTML = "";
        }

        // Render new chart
        const { svg } = await mermaid.render(chartId, mermaidCode);

        if (chartRef.current) {
          chartRef.current.innerHTML = svg;

          // Add click handlers if provided
          if (onNodeClick) {
            addClickHandlers();
          }
        }
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        setError("Failed to render chart");
      } finally {
        setIsLoading(false);
      }
    };

    generateChart();
  }, [roadmapData, userProgress, chartType, chartId, onNodeClick]);

  const addClickHandlers = () => {
    if (!chartRef.current || !onNodeClick) return;

    const nodes = chartRef.current.querySelectorAll(".node");
    nodes.forEach((node) => {
      const nodeId = node.id;
      node.style.cursor = "pointer";
      node.addEventListener("click", () => {
        // Find the corresponding phase or step
        const phase = roadmapData.phases.find((p) => p.id === nodeId);
        const step = roadmapData.phases
          .flatMap((p) => p.steps)
          .find((s) => s.id === nodeId);

        if (phase || step) {
          onNodeClick(phase || step);
        }
      });
    });
  };

  const downloadChart = () => {
    if (!chartRef.current) return;

    const svg = chartRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const link = document.createElement("a");
      link.download = `roadmap-${chartType}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const refreshChart = () => {
    if (chartRef.current) {
      chartRef.current.innerHTML = "";
    }
    // Re-trigger effect
    setIsLoading(true);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center">
          <div className="text-red-600 font-medium mb-2">Chart Error</div>
          <div className="text-red-500 text-sm mb-4">{error}</div>
          <button
            onClick={refreshChart}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RotateCw className="w-4 h-4 inline mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-lg border">
      {/* Chart controls */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <button
          onClick={downloadChart}
          className="p-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          title="Download Chart"
        >
          <Download className="w-4 h-4 text-gray-600" />
        </button>

        <button
          onClick={refreshChart}
          className="p-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          title="Refresh Chart"
        >
          <RotateCw className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Generating chart...</span>
        </div>
      )}

      {/* Chart container */}
      <div
        ref={chartRef}
        style={{ height: isLoading ? "0" : height }}
        className="overflow-auto p-4"
      />
    </div>
  );
};

// Helper functions to generate different chart types
function generateFlowchartCode(roadmapData, userProgress) {
  let code = "flowchart TD\n";

  // Add phase and step nodes
  roadmapData.phases.forEach((phase, phaseIndex) => {
    const phaseProgress = getPhaseProgress(userProgress, phase.id);
    const phaseClass =
      phaseProgress === 100
        ? "completed"
        : phaseProgress > 0
        ? "inprogress"
        : "notstarted";

    code += `    ${phase.id}["${phase.title}<br/>${phase.duration}"]:::${phaseClass}\n`;

    phase.steps.forEach((step, stepIndex) => {
      const stepProgress = getStepProgress(userProgress, phase.id, step.id);
      const stepClass = stepProgress?.completed ? "completed" : "notstarted";

      code += `    ${step.id}["${step.title}<br/>${step.duration}"]:::${stepClass}\n`;
      code += `    ${phase.id} --> ${step.id}\n`;

      // Connect steps in sequence
      if (stepIndex > 0) {
        const prevStep = phase.steps[stepIndex - 1];
        code += `    ${prevStep.id} --> ${step.id}\n`;
      }
    });
  });

  // Add phase connections
  if (roadmapData.connections) {
    roadmapData.connections.forEach((connection) => {
      const style = connection.type === "optional" ? "-->" : "==>";
      code += `    ${connection.from} ${style} ${connection.to}\n`;
    });
  }

  // Add styles
  code += `
    classDef completed fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    classDef inprogress fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    classDef notstarted fill:#F3F4F6,stroke:#D1D5DB,stroke-width:2px,color:#374151
  `;

  return code;
}

function generateGanttCode(roadmapData, userProgress) {
  let code = "gantt\n";
  code += "    title Roadmap Timeline\n";
  code += "    dateFormat  YYYY-MM-DD\n";
  code += "    axisFormat  %m/%d\n\n";

  const startDate = new Date();
  let currentDate = new Date(startDate);

  roadmapData.phases.forEach((phase, phaseIndex) => {
    code += `    section ${phase.title}\n`;

    phase.steps.forEach((step) => {
      const stepProgress = getStepProgress(userProgress, phase.id, step.id);
      const duration = parseDuration(step.duration);
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + duration);

      const status = stepProgress?.completed
        ? "done"
        : stepProgress
        ? "active"
        : "milestone";

      const startStr = currentDate.toISOString().split("T")[0];
      const endStr = endDate.toISOString().split("T")[0];

      code += `    ${step.title} :${status}, ${step.id}, ${startStr}, ${endStr}\n`;

      currentDate = new Date(endDate);
    });
  });

  return code;
}

function generateJourneyCode(roadmapData, userProgress) {
  let code = "journey\n";
  code += "    title Learning Journey\n";

  roadmapData.phases.forEach((phase) => {
    code += `    section ${phase.title}\n`;

    phase.steps.forEach((step) => {
      const stepProgress = getStepProgress(userProgress, phase.id, step.id);
      const score = stepProgress?.completed ? 5 : stepProgress?.rating || 3;

      code += `      ${step.title}: ${score}: Learner\n`;
    });
  });

  return code;
}

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

function parseDuration(duration) {
  // Parse duration strings like "2-3 weeks", "1 month" to days
  const weeks = duration.match(/(\d+).*week/i);
  const months = duration.match(/(\d+).*month/i);
  const days = duration.match(/(\d+).*day/i);

  if (weeks) return parseInt(weeks[1]) * 7;
  if (months) return parseInt(months[1]) * 30;
  if (days) return parseInt(days[1]);

  return 14; // Default to 2 weeks
}

export default MermaidChart;
