import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, Clock, Target, Award } from "lucide-react";

const ProgressCharts = ({
  roadmapData,
  userProgress,
  chartType = "overview", // 'overview', 'phases', 'timeline', 'skills'
}) => {
  // Prepare data for different chart types
  const chartData = useMemo(() => {
    if (!roadmapData?.phases || !userProgress?.phases) {
      return { overview: [], phases: [], timeline: [], skills: [] };
    }

    // Overview data
    const overviewData = [
      {
        name: "Progress",
        completed: userProgress.overallProgress,
        remaining: 100 - userProgress.overallProgress,
        timeSpent: userProgress.stats?.totalTimeSpent || 0,
        streak: userProgress.stats?.streakDays || 0,
      },
    ];

    // Phase progress data
    const phasesData = roadmapData.phases.map((phase, index) => {
      const phaseProgress = userProgress.phases.find(
        (p) => p.phaseId === phase.id
      );
      const totalSteps = phase.steps.length;
      const completedSteps =
        phaseProgress?.steps?.filter((s) => s.completed).length || 0;
      const timeSpent =
        phaseProgress?.steps?.reduce((sum, s) => sum + (s.timeSpent || 0), 0) ||
        0;

      return {
        name:
          phase.title.substring(0, 15) + (phase.title.length > 15 ? "..." : ""),
        fullName: phase.title,
        progress: phaseProgress?.overallProgress || 0,
        completedSteps,
        totalSteps,
        timeSpent,
        order: phase.order || index + 1,
        color: phase.color || `hsl(${index * 60}, 70%, 50%)`,
      };
    });

    // Timeline data (last 30 days of activity)
    const timelineData = generateTimelineData(userProgress);

    // Skills data
    const skillsData = generateSkillsData(roadmapData, userProgress);

    return {
      overview: overviewData,
      phases: phasesData,
      timeline: timelineData,
      skills: skillsData,
    };
  }, [roadmapData, userProgress]);

  const renderOverviewCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Overall Progress Radial Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Overall Progress
          </h3>
          <Target className="w-5 h-5 text-blue-600" />
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="90%"
            data={chartData.overview}
          >
            <RadialBar
              dataKey="completed"
              cornerRadius={10}
              fill="#10B981"
              className="drop-shadow-lg"
            />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-2xl font-bold fill-gray-800"
            >
              {chartData.overview[0]?.completed || 0}%
            </text>
          </RadialBarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {chartData.overview[0]?.timeSpent || 0}h
            </div>
            <div className="text-sm text-gray-600">Time Spent</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {chartData.overview[0]?.streak || 0}
            </div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {userProgress?.achievements?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Achievements</div>
          </div>
        </div>
      </div>

      {/* Phase Progress Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Phase Progress
          </h3>
          <TrendingUp className="w-5 h-5 text-blue-600" />
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData.phases}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [
                `${value}${
                  name === "progress" ? "%" : name === "timeSpent" ? "h" : ""
                }`,
                name === "progress"
                  ? "Progress"
                  : name === "timeSpent"
                  ? "Time Spent"
                  : name === "completedSteps"
                  ? "Completed Steps"
                  : name,
              ]}
              labelFormatter={(label) => {
                const phase = chartData.phases.find((p) => p.name === label);
                return phase?.fullName || label;
              }}
            />
            <Legend />
            <Bar dataKey="progress" fill="#3B82F6" name="Progress %" />
            <Bar dataKey="timeSpent" fill="#10B981" name="Time (hours)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderPhaseChart = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Phase Breakdown</h3>
        <Award className="w-5 h-5 text-blue-600" />
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData.phases}
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={60}
            paddingAngle={5}
            dataKey="completedSteps"
            label={({ name, completedSteps, totalSteps }) =>
              `${name}: ${completedSteps}/${totalSteps}`
            }
          >
            {chartData.phases.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => [
              `${value}/${props.payload.totalSteps} steps`,
              "Completed",
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const renderTimelineChart = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Learning Timeline
        </h3>
        <Clock className="w-5 h-5 text-blue-600" />
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData.timeline}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value, name) => [
              `${value}${name === "timeSpent" ? "h" : ""}`,
              name === "timeSpent" ? "Time Spent" : "Steps Completed",
            ]}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="timeSpent"
            stackId="1"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.6}
            name="Hours Studied"
          />
          <Area
            type="monotone"
            dataKey="stepsCompleted"
            stackId="2"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.6}
            name="Steps Completed"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const renderSkillsChart = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Skills Progress</h3>
        <Award className="w-5 h-5 text-blue-600" />
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData.skills} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            width={100}
          />
          <Tooltip formatter={(value) => [`${value}%`, "Progress"]} />
          <Bar dataKey="progress" fill="#8B5CF6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  // Render based on chart type
  switch (chartType) {
    case "phases":
      return renderPhaseChart();
    case "timeline":
      return renderTimelineChart();
    case "skills":
      return renderSkillsChart();
    case "overview":
    default:
      return renderOverviewCharts();
  }
};

// Helper functions
function generateTimelineData(userProgress) {
  // Generate sample timeline data for the last 30 days
  const data = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Sample data - in real app, this would come from user's activity log
    const dayData = {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      timeSpent: Math.random() * 3, // 0-3 hours
      stepsCompleted: Math.floor(Math.random() * 3), // 0-2 steps
    };

    data.push(dayData);
  }

  return data;
}

function generateSkillsData(roadmapData, userProgress) {
  // Extract all skills from completed steps and calculate progress
  const skillMap = new Map();

  roadmapData.phases.forEach((phase) => {
    const phaseProgress = userProgress?.phases?.find(
      (p) => p.phaseId === phase.id
    );

    phase.steps.forEach((step) => {
      const stepProgress = phaseProgress?.steps?.find(
        (s) => s.stepId === step.id
      );
      const completed = stepProgress?.completed || false;

      if (step.skills) {
        step.skills.forEach((skill) => {
          if (!skillMap.has(skill)) {
            skillMap.set(skill, { total: 0, completed: 0 });
          }

          const skillData = skillMap.get(skill);
          skillData.total += 1;
          if (completed) {
            skillData.completed += 1;
          }
        });
      }
    });
  });

  // Convert to array and calculate percentages
  const skillsArray = Array.from(skillMap.entries()).map(([skill, data]) => ({
    name: skill,
    progress: Math.round((data.completed / data.total) * 100),
    completed: data.completed,
    total: data.total,
  }));

  // Sort by progress and take top 10
  return skillsArray.sort((a, b) => b.progress - a.progress).slice(0, 10);
}

export default ProgressCharts;
