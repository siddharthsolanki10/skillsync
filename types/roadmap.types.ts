/**
 * TypeScript interfaces for SkillSync Roadmap Data Structure
 * Generated from roadmap-schema.json
 */

export interface RoadmapResource {
  title: string;
  type: "video" | "article" | "course" | "book" | "documentation" | "tutorial";
  url: string;
  duration?: string;
  free: boolean;
}

export interface RoadmapProject {
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedHours: number;
  technologies: string[];
}

export interface RoadmapMilestone {
  title: string;
  description: string;
  verification?: string;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  type: "course" | "project" | "certification" | "practice" | "reading";
  duration: string;
  order: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  skills: string[];
  prerequisites: string[];
  resources: RoadmapResource[];
  projects: RoadmapProject[];
  milestones: RoadmapMilestone[];
}

export interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  color: string; // Hex color for visualization
  steps: RoadmapStep[];
}

export interface RoadmapConnection {
  from: string; // Step ID
  to: string; // Step ID
  type: "prerequisite" | "recommended" | "parallel" | "optional";
  label?: string;
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

export interface RoadmapMetadata {
  createdAt: string; // ISO date string
  aiModel: string;
  version: string;
  tags: string[];
  industry: string;
  salaryRange: SalaryRange;
}

export interface RoadmapOverview {
  description: string;
  duration: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  outcomes: string[];
}

export interface RoadmapJson {
  id: string;
  title: string;
  field:
    | "Web Development"
    | "Mobile Development"
    | "Data Science"
    | "Machine Learning"
    | "DevOps"
    | "Cybersecurity"
    | "UI/UX Design"
    | "Product Management"
    | "Digital Marketing"
    | "Cloud Computing";
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  overview: RoadmapOverview;
  phases: RoadmapPhase[];
  connections: RoadmapConnection[];
  metadata: RoadmapMetadata;
}

export interface AIRoadmapResponse {
  roadmap_json: RoadmapJson;
  roadmap_doc: string; // Markdown content
}

// React Flow specific types for chart visualization
export interface ReactFlowNode {
  id: string;
  type: "phase" | "step";
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    duration?: string;
    difficulty?: number;
    phase?: string;
    color?: string;
    resources?: RoadmapResource[];
    projects?: RoadmapProject[];
  };
  style?: {
    background?: string;
    color?: string;
    border?: string;
    borderRadius?: string;
  };
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  type?: "default" | "step" | "straight" | "smoothstep";
  label?: string;
  style?: {
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  };
  markerEnd?: {
    type: string;
    color?: string;
  };
}

// Utility functions for data transformation
export interface RoadmapChartData {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
}

// Progress tracking interfaces
export interface StepProgress {
  stepId: string;
  completed: boolean;
  completedAt?: string;
  timeSpent?: number; // in hours
  rating?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface PhaseProgress {
  phaseId: string;
  startedAt?: string;
  completedAt?: string;
  steps: StepProgress[];
  overallProgress: number; // 0-100%
}

export interface UserRoadmapProgress {
  roadmapId: string;
  userId: string;
  startedAt: string;
  lastUpdated: string;
  completedAt?: string;
  phases: PhaseProgress[];
  overallProgress: number; // 0-100%
  customNotes?: string;
}

// API response types
export interface GenerateRoadmapRequest {
  field: string;
  level: string;
  userId: string;
  customRequirements?: string;
}

export interface GenerateRoadmapResponse {
  success: boolean;
  roadmap?: AIRoadmapResponse;
  progress?: UserRoadmapProgress;
  error?: string;
}

// n8n webhook payload types
export interface N8nRoadmapPayload {
  field: string;
  level: string;
  userId: string;
  customRequirements?: string;
  callbackUrl?: string;
}

export interface N8nRoadmapResponse {
  workflowId: string;
  status: "started" | "completed" | "failed";
  data?: AIRoadmapResponse;
  error?: string;
}
