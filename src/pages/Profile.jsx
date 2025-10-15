import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { 
  User, 
  Mail, 
  GraduationCap, 
  Target, 
  Plus, 
  Edit3, 
  Save, 
  X,
  Award,
  Calendar,
  MapPin,
  Phone,
  Linkedin,
  Github,
  Globe
} from 'lucide-react'
import { setProfile, setSkills, setGoals, addGoal, updateGoal } from '../store/slices/userSlice'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user } = useSelector((state) => state.auth)
  const { profile, skills, goals } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  
  const [isEditing, setIsEditing] = useState(false)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockProfile = {
      id: user?.id || 1,
      name: user?.name || 'John Doe',
      email: user?.email || 'john@example.com',
      field: user?.field || 'computer-science',
      bio: 'Passionate about technology and continuous learning. Always eager to take on new challenges and grow professionally.',
      location: 'San Francisco, CA',
      phone: '+1 (555) 123-4567',
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe',
      website: 'johndoe.dev',
      joinDate: '2024-01-15',
      lastActive: '2024-12-19'
    }

    const mockSkills = [
      { id: 1, name: 'JavaScript', level: 85, category: 'Programming' },
      { id: 2, name: 'React', level: 75, category: 'Frontend' },
      { id: 3, name: 'Node.js', level: 70, category: 'Backend' },
      { id: 4, name: 'Python', level: 65, category: 'Programming' },
      { id: 5, name: 'SQL', level: 60, category: 'Database' },
      { id: 6, name: 'Git', level: 80, category: 'Tools' },
    ]

    const mockGoals = [
      {
        id: 1,
        title: 'Become a Full-Stack Developer',
        description: 'Master both frontend and backend technologies to build complete web applications',
        targetDate: '2024-06-30',
        status: 'in-progress',
        priority: 'high'
      },
      {
        id: 2,
        title: 'Learn Machine Learning',
        description: 'Understand the fundamentals of ML and build practical projects',
        targetDate: '2024-08-15',
        status: 'planned',
        priority: 'medium'
      },
      {
        id: 3,
        title: 'Get AWS Certification',
        description: 'Earn AWS Solutions Architect certification',
        targetDate: '2024-09-30',
        status: 'planned',
        priority: 'high'
      }
    ]

    dispatch(setProfile(mockProfile))
    dispatch(setSkills(mockSkills))
    dispatch(setGoals(mockGoals))
  }, [dispatch, user])

  const onSubmit = (data) => {
    dispatch(setProfile({ ...profile, ...data }))
    setIsEditing(false)
    toast.success('Profile updated successfully!')
  }

  const handleAddGoal = (data) => {
    const newGoal = {
      id: Date.now(),
      ...data,
      status: 'planned'
    }
    dispatch(addGoal(newGoal))
    setShowAddGoal(false)
    toast.success('Goal added successfully!')
  }

  const handleUpdateGoal = (data) => {
    dispatch(updateGoal({ id: editingGoal.id, ...data }))
    setEditingGoal(null)
    toast.success('Goal updated successfully!')
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'planned': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-poppins font-bold text-text mb-2">
            My Profile
          </h1>
          <p className="text-gray-600">
            Manage your personal information, skills, and career goals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-poppins font-semibold text-text">
                  {profile?.name || 'User Name'}
                </h2>
                <p className="text-gray-600">{profile?.field || 'Field of Study'}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{profile?.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{profile?.location}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{profile?.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Linkedin className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{profile?.linkedin}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Github className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{profile?.github}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{profile?.website}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Joined {new Date(profile?.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-full mt-6 btn-primary flex items-center justify-center"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio Section */}
            <div className="card">
              <h3 className="text-lg font-poppins font-semibold text-text mb-4">
                About Me
              </h3>
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Bio
                    </label>
                    <textarea
                      {...register('bio')}
                      rows={4}
                      className="input-field"
                      placeholder="Tell us about yourself..."
                      defaultValue={profile?.bio}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Location
                      </label>
                      <input
                        {...register('location')}
                        type="text"
                        className="input-field"
                        defaultValue={profile?.location}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Phone
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        className="input-field"
                        defaultValue={profile?.phone}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        LinkedIn
                      </label>
                      <input
                        {...register('linkedin')}
                        type="text"
                        className="input-field"
                        defaultValue={profile?.linkedin}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        GitHub
                      </label>
                      <input
                        {...register('github')}
                        type="text"
                        className="input-field"
                        defaultValue={profile?.github}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Website
                      </label>
                      <input
                        {...register('website')}
                        type="text"
                        className="input-field"
                        defaultValue={profile?.website}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button type="submit" className="btn-primary flex items-center">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-gray-600">{profile?.bio}</p>
              )}
            </div>

            {/* Skills Section */}
            <div className="card">
              <h3 className="text-lg font-poppins font-semibold text-text mb-4">
                Skills & Expertise
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill) => (
                  <div key={skill.id} className="border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-text">{skill.name}</h4>
                      <span className="text-sm text-gray-500">{skill.category}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-600">Proficiency</span>
                      <span className="text-sm font-semibold text-primary">{skill.level}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals Section */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-poppins font-semibold text-text">
                  Career Goals
                </h3>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="btn-primary flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Goal
                </button>
              </div>

              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="border border-gray-200 rounded-2xl p-4">
                    {editingGoal?.id === goal.id ? (
                      <form onSubmit={handleSubmit(handleUpdateGoal)} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-text mb-2">
                            Goal Title
                          </label>
                          <input
                            {...register('title')}
                            type="text"
                            className="input-field"
                            defaultValue={goal.title}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text mb-2">
                            Description
                          </label>
                          <textarea
                            {...register('description')}
                            rows={3}
                            className="input-field"
                            defaultValue={goal.description}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-text mb-2">
                              Target Date
                            </label>
                            <input
                              {...register('targetDate')}
                              type="date"
                              className="input-field"
                              defaultValue={goal.targetDate}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text mb-2">
                              Priority
                            </label>
                            <select
                              {...register('priority')}
                              className="input-field"
                              defaultValue={goal.priority}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex space-x-4">
                          <button type="submit" className="btn-primary flex items-center">
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingGoal(null)}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-text mb-1">{goal.title}</h4>
                            <p className="text-gray-600 text-sm mb-2">{goal.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(goal.targetDate).toLocaleDateString()}
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(goal.priority)}`}>
                                {goal.priority} priority
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(goal.status)}`}>
                                {goal.status.replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setEditingGoal(goal)}
                            className="text-gray-400 hover:text-primary transition-colors duration-300"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Add Goal Modal */}
        {showAddGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-poppins font-semibold text-text mb-4">
                Add New Goal
              </h3>
              <form onSubmit={handleSubmit(handleAddGoal)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Goal Title
                  </label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    type="text"
                    className="input-field"
                    placeholder="Enter goal title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={3}
                    className="input-field"
                    placeholder="Describe your goal"
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Target Date
                    </label>
                    <input
                      {...register('targetDate', { required: 'Target date is required' })}
                      type="date"
                      className="input-field"
                    />
                    {errors.targetDate && (
                      <p className="text-sm text-red-600 mt-1">{errors.targetDate.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Priority
                    </label>
                    <select
                      {...register('priority', { required: 'Priority is required' })}
                      className="input-field"
                    >
                      <option value="">Select priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    {errors.priority && (
                      <p className="text-sm text-red-600 mt-1">{errors.priority.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button type="submit" className="btn-primary flex-1">
                    Add Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddGoal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
