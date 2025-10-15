import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  profile: null,
  skills: [],
  goals: [],
  progress: [],
  careerRecommendations: [],
  learningPaths: [],
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload
    },
    setSkills: (state, action) => {
      state.skills = action.payload
    },
    setGoals: (state, action) => {
      state.goals = action.payload
    },
    setProgress: (state, action) => {
      state.progress = action.payload
    },
    setCareerRecommendations: (state, action) => {
      state.careerRecommendations = action.payload
    },
    setLearningPaths: (state, action) => {
      state.learningPaths = action.payload
    },
    updateSkill: (state, action) => {
      const { id, level } = action.payload
      const skill = state.skills.find(s => s.id === id)
      if (skill) {
        skill.level = level
      }
    },
    addGoal: (state, action) => {
      state.goals.push(action.payload)
    },
    updateGoal: (state, action) => {
      const { id, ...updates } = action.payload
      const goal = state.goals.find(g => g.id === id)
      if (goal) {
        Object.assign(goal, updates)
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setProfile,
  setSkills,
  setGoals,
  setProgress,
  setCareerRecommendations,
  setLearningPaths,
  updateSkill,
  addGoal,
  updateGoal,
  setLoading,
  setError,
  clearError,
} = userSlice.actions

export default userSlice.reducer
