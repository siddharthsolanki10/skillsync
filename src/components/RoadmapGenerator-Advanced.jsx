import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RoadmapGenerator.css';

/**
 * RoadmapGenerator Component
 * Handles career selection, API calls, and displays generated roadmaps
 */
const RoadmapGenerator = () => {
  const [careerField, setCareerField] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  // Popular career fields
  const careerOptions = [
    'Web Development',
    'Data Science',
    'Mobile Development',
    'DevOps & Cloud',
    'Cyber Security',
    'Machine Learning',
    'UI/UX Design',
    'Full Stack Development',
    'Game Development',
    'Blockchain Development'
  ];

  /**
   * Handle roadmap generation
   * Calls backend API which triggers n8n workflow
   */
  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    
    if (!careerField.trim()) {
      setError('Please select a career field');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(10);

    try {
      const token = localStorage.getItem('token');

      // Step 1: Call backend endpoint to trigger n8n workflow
      setProgress(20);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/roadmaps/generate`,
        { careerField },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setProgress(50);

      // Step 2: Fetch the generated roadmap
      const roadmapResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/roadmaps`,
        {
          params: { field: careerField },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setProgress(80);

      if (roadmapResponse.data.data.length > 0) {
        const latestRoadmap = roadmapResponse.data.data[0];
        setRoadmap(latestRoadmap);
        setProgress(100);
      } else {
        throw new Error('Failed to fetch generated roadmap');
      }

    } catch (err) {
      console.error('Error generating roadmap:', err);
      setError(err.response?.data?.error || err.message || 'Error generating roadmap');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark roadmap as helpful
   */
  const markAsHelpful = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/roadmaps/${roadmap._id}/mark-helpful`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local roadmap
      setRoadmap({ ...roadmap, helpful: roadmap.helpful + 1 });
    } catch (err) {
      console.error('Error marking as helpful:', err);
    }
  };

  /**
   * Download roadmap as JSON
   */
  const downloadRoadmap = () => {
    const dataStr = JSON.stringify(roadmap, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${careerField}-roadmap.json`;
    link.click();
  };

  return (
    <div className="roadmap-generator">
      <div className="container">
        {/* Header */}
        <header className="generator-header">
          <h1>🚀 Career Roadmap Generator</h1>
          <p>Generate personalized learning paths for your career</p>
        </header>

        {/* Career Selection Form */}
        {!roadmap && (
          <div className="selection-section">
            <form onSubmit={handleGenerateRoadmap} className="career-form">
              <div className="form-group">
                <label htmlFor="careerField">Select Your Career Path</label>
                <select
                  id="careerField"
                  value={careerField}
                  onChange={(e) => setCareerField(e.target.value)}
                  disabled={loading}
                  className="career-select"
                >
                  <option value="">-- Choose a career field --</option>
                  {careerOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !careerField}
                className="generate-btn"
              >
                {loading ? 'Generating...' : 'Generate Roadmap'}
              </button>
            </form>

            {/* Progress Bar */}
            {loading && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="progress-text">{progress}% - Generating your roadmap...</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <span className="error-icon">❌</span>
                <p>{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Roadmap Display */}
        {roadmap && (
          <div className="roadmap-display">
            {/* Roadmap Header */}
            <div className="roadmap-header">
              <h2>{roadmap.title}</h2>
              <p className="roadmap-description">{roadmap.description}</p>

              <div className="roadmap-meta">
                <span className="meta-item">
                  📚 {roadmap.stages?.length || 0} Phases
                </span>
                <span className="meta-item">
                  ⏱️ {roadmap.duration || 'N/A'}
                </span>
                <span className="meta-item">
                  👁️ {roadmap.views} Views
                </span>
                <span className="meta-item helpful-count">
                  👍 {roadmap.helpful} Helpful
                </span>
              </div>

              <div className="roadmap-actions">
                <button onClick={markAsHelpful} className="helpful-btn">
                  👍 Mark as Helpful
                </button>
                <button onClick={downloadRoadmap} className="download-btn">
                  ⬇️ Download JSON
                </button>
                <button
                  onClick={() => {
                    setRoadmap(null);
                    setCareerField('');
                  }}
                  className="new-roadmap-btn"
                >
                  ✨ Generate New
                </button>
              </div>
            </div>

            {/* Stages and Skills */}
            <div className="roadmap-content">
              {/* Summary */}
              {roadmap.summary && (
                <section className="summary-section">
                  <h3>📖 Roadmap Summary</h3>
                  <p>{roadmap.summary}</p>
                </section>
              )}

              {/* Phases */}
              <section className="phases-section">
                <h3>🎯 Learning Phases</h3>
                {roadmap.stages?.map((stage, stageIndex) => (
                  <div key={stageIndex} className="phase-card">
                    <h4 className="phase-title">
                      Phase {stageIndex + 1}: {stage.name}
                    </h4>
                    <p className="phase-description">{stage.description}</p>

                    <div className="skills-grid">
                      {stage.skills?.map((skill, skillIndex) => (
                        <div key={skillIndex} className="skill-card">
                          <h5>{skill.name}</h5>
                          <p className="skill-description">{skill.description}</p>

                          {skill.keyTopics && (
                            <div className="key-topics">
                              <strong>Topics:</strong>
                              <ul>
                                {skill.keyTopics.slice(0, 3).map((topic, i) => (
                                  <li key={i}>• {topic}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {skill.time_required && (
                            <p className="time-required">⏱️ {skill.time_required}</p>
                          )}

                          {skill.resources?.free && skill.resources.free.length > 0 && (
                            <div className="resources">
                              <strong>Free Resources:</strong>
                              <ul>
                                {skill.resources.free.slice(0, 2).map((res, i) => (
                                  <li key={i}>
                                    <a href={res.link} target="_blank" rel="noopener noreferrer">
                                      {res.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>

              {/* Daily Checklist */}
              {roadmap.dailyChecklist && (
                <section className="checklist-section">
                  <h3>✅ {roadmap.dailyChecklist.title}</h3>
                  {roadmap.dailyChecklist.phases?.map((phase, phaseIndex) => (
                    <div key={phaseIndex} className="checklist-phase">
                      <h4>{phase.week}</h4>
                      {phase.days?.map((day, dayIndex) => (
                        <div key={dayIndex} className="checklist-day">
                          <strong>{day.day}</strong>
                          <ul>
                            {day.tasks?.slice(0, 3).map((task, taskIndex) => (
                              <li key={taskIndex}>• {task}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ))}
                </section>
              )}

              {/* Resources */}
              {roadmap.resources && (
                <section className="resources-section">
                  <h3>📚 Learning Resources</h3>

                  {roadmap.resources.free && roadmap.resources.free.length > 0 && (
                    <div className="resource-category">
                      <h4>🆓 Free Resources</h4>
                      <ul>
                        {roadmap.resources.free.slice(0, 5).map((res, i) => (
                          <li key={i}>
                            <a href={res.link} target="_blank" rel="noopener noreferrer">
                              {res.title}
                            </a>
                            <span className="resource-why">— {res.why}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {roadmap.resources.paid && roadmap.resources.paid.length > 0 && (
                    <div className="resource-category">
                      <h4>💰 Paid Courses</h4>
                      <ul>
                        {roadmap.resources.paid.slice(0, 5).map((res, i) => (
                          <li key={i}>
                            <strong>{res.title}</strong>
                            <span className="resource-platform">
                              {res.platform} — {res.price}
                            </span>
                            <span className="resource-why">— {res.why}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              )}

              {/* Notes for Learners */}
              {roadmap.notesForLearners && (
                <section className="notes-section">
                  <h3>💡 {roadmap.notesForLearners.title}</h3>
                  {roadmap.notesForLearners.sections?.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="notes-category">
                      <h4>{section.category}</h4>
                      <ul>
                        {section.points?.map((point, pointIndex) => (
                          <li key={pointIndex}>• {point}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </section>
              )}

              {/* Capstone Project */}
              {roadmap.capstoneProject && (
                <section className="capstone-section">
                  <h3>🎓 Capstone Project</h3>
                  <div className="capstone-card">
                    <h4>{roadmap.capstoneProject.title}</h4>
                    <p>{roadmap.capstoneProject.description}</p>

                    {roadmap.capstoneProject.features && (
                      <div className="capstone-features">
                        <strong>Key Features:</strong>
                        <ul>
                          {roadmap.capstoneProject.features.map((feature, i) => (
                            <li key={i}>✓ {feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {roadmap.capstoneProject.technologies && (
                      <div className="capstone-tech">
                        <strong>Technologies:</strong>
                        <div className="tech-tags">
                          {roadmap.capstoneProject.technologies.map((tech, i) => (
                            <span key={i} className="tech-tag">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {roadmap.capstoneProject.timeline && (
                      <p className="capstone-timeline">
                        <strong>Timeline:</strong> {roadmap.capstoneProject.timeline}
                      </p>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapGenerator;
