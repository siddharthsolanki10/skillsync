import { Link } from 'react-router-dom'
import { 
  Target, 
  BookOpen, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Star,
  Award,
  Lightbulb
} from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: <Target className="w-8 h-8 text-primary" />,
      title: "Personalized Career Guidance",
      description: "Get tailored career recommendations based on your skills, interests, and goals."
    },
    {
      icon: <BookOpen className="w-8 h-8 text-primary" />,
      title: "Learning Paths",
      description: "Access curated learning resources and structured paths to achieve your career goals."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      title: "Progress Tracking",
      description: "Monitor your learning progress with detailed analytics and achievement tracking."
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Community Support",
      description: "Connect with peers, mentors, and industry professionals for guidance and support."
    }
  ]

  const stats = [
    { number: "10K+", label: "Students Guided" },
    { number: "500+", label: "Career Paths" },
    { number: "95%", label: "Success Rate" },
    { number: "24/7", label: "Support Available" }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Computer Science Student",
      content: "SkillSync helped me discover my passion for data science and provided a clear roadmap to achieve my goals.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Engineering Graduate",
      content: "The personalized learning paths and career guidance were exactly what I needed to transition into tech.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Business Student",
      content: "I love how SkillSync tracks my progress and keeps me motivated with achievable milestones.",
      rating: 5
    }
  ]

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-poppins font-bold mb-6">
              Unlock Your
              <span className="text-accent block">Career Potential</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
              Get personalized career guidance and learning paths tailored to your skills and aspirations. 
              Start your journey to success today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn-primary bg-accent text-secondary hover:bg-accent/90">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-secondary">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-poppins font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-text mb-4">
              Why Choose SkillSync?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide comprehensive tools and resources to help you succeed in your career journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:scale-105 transition-transform duration-300">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-poppins font-semibold text-text mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-text mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in just three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-poppins font-semibold text-text mb-3">
                Create Your Profile
              </h3>
              <p className="text-gray-600">
                Sign up and tell us about your skills, interests, and career goals.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-poppins font-semibold text-text mb-3">
                Get Recommendations
              </h3>
              <p className="text-gray-600">
                Receive personalized career suggestions and learning paths.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-poppins font-semibold text-text mb-3">
                Track Progress
              </h3>
              <p className="text-gray-600">
                Monitor your learning journey and achieve your career milestones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-text mb-4">
              What Students Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from students who have transformed their careers with SkillSync
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-accent fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-text">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4">
            Ready to Start Your Career Journey?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Join thousands of students who are already building their dream careers with SkillSync.
          </p>
          <Link to="/signup" className="btn-primary bg-accent text-secondary hover:bg-accent/90 inline-flex items-center">
            Get Started Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-secondary font-bold text-lg">S</span>
                </div>
                <span className="font-poppins font-bold text-xl">SkillSync</span>
              </div>
              <p className="text-gray-300">
                Empowering students to discover and achieve their career potential through personalized guidance and learning.
              </p>
            </div>
            
            <div>
              <h3 className="font-poppins font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-300 hover:text-accent transition-colors duration-300">Home</Link></li>
                <li><Link to="/dashboard" className="text-gray-300 hover:text-accent transition-colors duration-300">Dashboard</Link></li>
                <li><Link to="/profile" className="text-gray-300 hover:text-accent transition-colors duration-300">Profile</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-accent transition-colors duration-300">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-poppins font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-accent transition-colors duration-300">Career Guides</a></li>
                <li><a href="#" className="text-gray-300 hover:text-accent transition-colors duration-300">Learning Paths</a></li>
                <li><a href="#" className="text-gray-300 hover:text-accent transition-colors duration-300">Success Stories</a></li>
                <li><a href="#" className="text-gray-300 hover:text-accent transition-colors duration-300">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-poppins font-semibold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-accent transition-colors duration-300">LinkedIn</a></li>
                <li><a href="#" className="text-gray-300 hover:text-accent transition-colors duration-300">Twitter</a></li>
                <li><a href="#" className="text-gray-300 hover:text-accent transition-colors duration-300">Instagram</a></li>
                <li><a href="#" className="text-gray-300 hover:text-accent transition-colors duration-300">YouTube</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300">
              © 2024 SkillSync. All rights reserved. Built with ❤️ for students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
