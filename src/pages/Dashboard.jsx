import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  TrendingUp, 
  BookOpen, 
  Target, 
  Award, 
  Calendar,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Plus
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { setProgress, setCareerRecommendations, setLearningPaths } from '../store/slices/userSlice'

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const { progress, careerRecommendations, learningPaths } = useSelector((state) => state.user)
  const dispatch = useDispatch()

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate loading data
    const mockProgress = [
      { name: 'Jan', completed: 4, inProgress: 2 },
      { name: 'Feb', completed: 6, inProgress: 3 },
      { name: 'Mar', completed: 8, inProgress: 4 },
      { name: 'Apr', completed: 10, inProgress: 2 },
      { name: 'May', completed: 12, inProgress: 3 },
      { name: 'Jun', completed: 15, inProgress: 5 },
    ]

    const mockCareerRecommendations = [
      {
        id: 1,
        title: "Software Developer",
        match: 95,
        description: "High demand field with excellent growth prospects",
        skills: ["JavaScript", "React", "Node.js", "Python"],
        salary: "$70,000 - $120,000"
      },
      {
        id: 2,
        title: "Data Scientist",
        match: 88,
        description: "Analyze data to help businesses make informed decisions",
        skills: ["Python", "R", "SQL", "Machine Learning"],
        salary: "$80,000 - $140,000"
      },
      {
        id: 3,
        title: "UX Designer",
        match: 82,
        description: "Create user-friendly digital experiences",
        skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
        salary: "$60,000 - $100,000"
      }
    ]

    const mockLearningPaths = [
      {
        id: 1,
        title: "Full-Stack Web Development",
        progress: 65,
        totalCourses: 12,
        completedCourses: 8,
        estimatedTime: "6 months",
        difficulty: "Intermediate"
      },
      {
        id: 2,
        title: "Data Science Fundamentals",
        progress: 40,
        totalCourses: 10,
        completedCourses: 4,
        estimatedTime: "4 months",
        difficulty: "Beginner"
      },
      {
        id: 3,
        title: "UI/UX Design Mastery",
        progress: 25,
        totalCourses: 8,
        completedCourses: 2,
        estimatedTime: "3 months",
        difficulty: "Beginner"
      }
    ]

    dispatch(setProgress(mockProgress))
    dispatch(setCareerRecommendations(mockCareerRecommendations))
    dispatch(setLearningPaths(mockLearningPaths))
  }, [dispatch])

  const skillData = [
    { name: 'JavaScript', value: 85, color: '#2563EB' },
    { name: 'React', value: 70, color: '#1E293B' },
    { name: 'Python', value: 60, color: '#FACC15' },
    { name: 'Node.js', value: 55, color: '#10B981' },
    { name: 'SQL', value: 45, color: '#F59E0B' },
  ]

  const recentActivities = [
    { id: 1, action: "Completed React Basics Course", time: "2 hours ago", type: "course" },
    { id: 2, action: "Updated skill level for JavaScript", time: "1 day ago", type: "skill" },
    { id: 3, action: "Started Data Structures Course", time: "2 days ago", type: "course" },
    { id: 4, action: "Added new career goal", time: "3 days ago", type: "goal" },
  ]

  const stats = [
    { label: "Courses Completed", value: "24", icon: <CheckCircle className="w-6 h-6" />, color: "text-green-600" },
    { label: "Skills Mastered", value: "12", icon: <Award className="w-6 h-6" />, color: "text-blue-600" },
    { label: "Hours Studied", value: "156", icon: <Clock className="w-6 h-6" />, color: "text-purple-600" },
    { label: "Current Streak", value: "7 days", icon: <TrendingUp className="w-6 h-6" />, color: "text-orange-600" },
  ]

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-poppins font-bold text-text mb-2">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-gray-600">
            Here's your learning progress and career recommendations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-poppins font-bold text-text">{stat.value}</p>
                </div>
                <div className={`${stat.color} bg-gray-100 p-3 rounded-2xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Chart */}
            <div className="card">
              <h2 className="text-xl font-poppins font-semibold text-text mb-6">
                Learning Progress
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={progress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#2563EB" name="Completed" />
                  <Bar dataKey="inProgress" fill="#FACC15" name="In Progress" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Learning Paths */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-poppins font-semibold text-text">
                  Learning Paths
                </h2>
                <button className="btn-primary flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Path
                </button>
              </div>
              <div className="space-y-4">
                {learningPaths.map((path) => (
                  <div key={path.id} className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-text">{path.title}</h3>
                      <span className="text-sm text-gray-500">{path.difficulty}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{path.completedCourses}/{path.totalCourses} courses</span>
                        <span>{path.estimatedTime}</span>
                      </div>
                      <span className="text-sm font-semibold text-primary">{path.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${path.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Career Recommendations */}
            <div className="card">
              <h2 className="text-xl font-poppins font-semibold text-text mb-6">
                Career Recommendations
              </h2>
              <div className="space-y-4">
                {careerRecommendations.map((career) => (
                  <div key={career.id} className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-text">{career.title}</h3>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-accent fill-current mr-1" />
                        <span className="text-sm font-semibold text-primary">{career.match}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{career.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {career.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                      {career.skills.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          +{career.skills.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-green-600">{career.salary}</span>
                      <button className="text-primary hover:text-primary/80 text-sm font-medium flex items-center">
                        Learn More
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Overview */}
            <div className="card">
              <h2 className="text-xl font-poppins font-semibold text-text mb-6">
                Skills Overview
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={skillData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {skillData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {skillData.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: skill.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{skill.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-text">{skill.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h2 className="text-xl font-poppins font-semibold text-text mb-6">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-text">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
