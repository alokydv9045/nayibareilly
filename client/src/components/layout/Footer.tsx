'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSession } from '@/hooks/useSession'
import { 
  Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, 
  Linkedin, Youtube, Send, ExternalLink, Shield, FileText, 
  HelpCircle, Users, Activity, CheckCircle, ArrowUp
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const { user } = useSession()

  // Dynamic Quick Links based on user type
  const getQuickLinks = () => {
    const commonLinks = [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About' },
    ]

    if (!user) {
      // Guest user
      return [
        ...commonLinks,
        { href: '/report', label: 'Report Issue' },
        { href: '/map', label: 'Explore Map' },
        { href: '/track', label: 'Track Issue' },
        { href: '/login', label: 'Login' },
      ]
    }

    // Logged in users
    const userLinks = [...commonLinks]
    
    // Get the primary role (first role in the array)
    const primaryRole = user.roles[0]?.toUpperCase()

    if (primaryRole === 'CITIZEN') {
      userLinks.push(
        { href: '/report', label: 'Report Issue' },
        { href: '/my-issues', label: 'My Issues' },
        { href: '/map', label: 'Explore Map' },
        { href: '/profile', label: 'My Profile' },
      )
    } else if (primaryRole === 'STAFF') {
      userLinks.push(
        { href: '/staff/dashboard', label: 'Dashboard' },
        { href: '/staff/assigned', label: 'Assigned Issues' },
        { href: '/staff/completed', label: 'Completed' },
        { href: '/profile', label: 'Profile' },
      )
    } else if (primaryRole === 'MODERATOR') {
      userLinks.push(
        { href: '/moderator/dashboard', label: 'Dashboard' },
        { href: '/moderator/pending', label: 'Pending Reviews' },
        { href: '/moderator/analytics', label: 'Analytics' },
        { href: '/profile', label: 'Profile' },
      )
    } else if (primaryRole === 'SUPERADMIN') {
      userLinks.push(
        { href: '/superadmin/dashboard', label: 'Admin Dashboard' },
        { href: '/superadmin/users', label: 'Manage Users' },
        { href: '/superadmin/departments', label: 'Departments' },
        { href: '/superadmin/analytics', label: 'Analytics' },
      )
    }

    return userLinks
  }

  const quickLinks = getQuickLinks()

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setSubscribing(true)
    
    try {
      // Simulate API call - replace with actual newsletter signup
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Thank you for subscribing to our newsletter!')
      setEmail('')
    } catch {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setSubscribing(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-sky-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-white mb-2">Stay Connected</h3>
              <p className="text-white/90">
                नई बरेली की डिजिटल यात्रा में शामिल हों - Get real-time updates on civic improvements
              </p>
            </div>
            
            <form onSubmit={handleNewsletterSignup} className="flex w-full md:w-auto">
              <div className="flex-1 md:w-80">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  aria-label="Email address for newsletter"
                  className="w-full px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <button
                type="submit"
                disabled={subscribing}
                aria-label={subscribing ? 'Subscribing…' : 'Subscribe to newsletter'}
                className="px-6 py-3 bg-sky-700 hover:bg-sky-800 rounded-r-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {subscribing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" aria-hidden="true" />
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" aria-hidden="true" />
                    <span className="sr-only sm:not-sr-only">Subscribe</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-sky-600 to-teal-600 rounded-xl p-2.5">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">NayiBareilly</h3>
                <p className="text-sm text-gray-400">नई सोच, नया समाधान</p>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm leading-relaxed">
              Empowering citizens with transparent, efficient digital governance. 
              Building a smarter Bareilly through community collaboration and innovative civic solutions.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <div className="text-lg font-bold text-sky-400">2,847</div>
                <div className="text-xs text-gray-400">Issues Reported</div>
              </div>
              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <div className="text-lg font-bold text-green-400">2,103</div>
                <div className="text-xs text-gray-400">Issues Resolved</div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <div className="space-y-3">
              {quickLinks.map((link, index) => (
                <Link 
                  key={index}
                  href={link.href} 
                  className="block text-gray-300 hover:text-white transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Resources</h4>
            <div className="space-y-3">
              <Link 
                href="/notifications" 
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                Notifications
              </Link>
            </div>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Support & Legal</h4>
            <div className="space-y-3">
              <Link 
                href="/help" 
                className="flex items-center text-gray-300 hover:text-white transition-colors text-sm"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help Center
              </Link>
              <Link 
                href="/contact" 
                className="flex items-center text-gray-300 hover:text-white transition-colors text-sm"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Us
              </Link>
              <Link 
                href="/privacy" 
                className="flex items-center text-gray-300 hover:text-white transition-colors text-sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="flex items-center text-gray-300 hover:text-white transition-colors text-sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Terms of Service
              </Link>
              <Link 
                href="/guidelines" 
                className="flex items-center text-gray-300 hover:text-white transition-colors text-sm"
              >
                <Users className="h-4 w-4 mr-2" />
                Community Guidelines
              </Link>
              <Link 
                href="/" 
                className="flex items-center text-gray-300 hover:text-white transition-colors text-sm"
              >
                <Activity className="h-4 w-4 mr-2" />
                Accessibility
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Information</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-300">
                    Bareilly Municipal Corporation<br />
                    Collectorate Compound<br />
                    Bareilly, Uttar Pradesh 243001
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-300">+91 581 2545 678</p>
                  <p className="text-xs text-gray-400">Mon-Fri: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-300">support@nayibareilly.gov.in</p>
                  <p className="text-xs text-gray-400">24/7 Digital Support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact - Moved to right side */}
          <div>
            <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
              <h5 className="text-red-400 font-semibold text-sm mb-2">Emergency Civic Issues</h5>
              <p className="text-red-300 text-xs mb-2">
                For urgent civic emergencies requiring immediate municipal attention
              </p>
              <a 
                href="tel:112" 
                className="text-red-400 font-bold hover:text-red-300 transition-colors"
              >
                📞 Emergency Hotline: 112
              </a>
            </div>
          </div>
        </div>

        {/* Platform Features */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h4 className="text-lg font-semibold mb-6 text-center">Platform Features</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-sky-900/30 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Activity className="h-8 w-8 text-sky-400" />
              </div>
              <h5 className="font-medium text-sm mb-1">Real-time Tracking</h5>
              <p className="text-xs text-gray-400">Monitor issue progress live</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-900/30 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Users className="h-8 w-8 text-green-400" />
              </div>
              <h5 className="font-medium text-sm mb-1">Community Driven</h5>
              <p className="text-xs text-gray-400">Citizens working together</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-900/30 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Shield className="h-8 w-8 text-purple-400" />
              </div>
              <h5 className="font-medium text-sm mb-1">Transparent Process</h5>
              <p className="text-xs text-gray-400">Open governance system</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-900/30 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-orange-400" />
              </div>
              <h5 className="font-medium text-sm mb-1">Quick Resolution</h5>
              <p className="text-xs text-gray-400">Faster issue resolution</p>
            </div>
          </div>
        </div>

        {/* Social Media & Government Links */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            {/* Social Media */}
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium text-gray-400">Follow NayiBareilly:</span>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com/nayibareilly"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="NayiBareilly on Facebook"
                  className="text-gray-400 hover:text-sky-400 transition-colors"
                >
                  <Facebook className="h-5 w-5" aria-hidden="true" />
                </a>
                <a
                  href="https://twitter.com/nayibareilly"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="NayiBareilly on Twitter"
                  className="text-gray-400 hover:text-sky-400 transition-colors"
                >
                  <Twitter className="h-5 w-5" aria-hidden="true" />
                </a>
                <a
                  href="https://instagram.com/nayibareilly"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="NayiBareilly on Instagram"
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  <Instagram className="h-5 w-5" aria-hidden="true" />
                </a>
                <a
                  href="https://linkedin.com/company/nayibareilly"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="NayiBareilly on LinkedIn"
                  className="text-gray-400 hover:text-sky-400 transition-colors"
                >
                  <Linkedin className="h-5 w-5" aria-hidden="true" />
                </a>
                <a
                  href="https://youtube.com/nayibareilly"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="NayiBareilly on YouTube"
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Youtube className="h-5 w-5" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Government Links */}
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium text-gray-400">Government:</span>
              <div className="flex space-x-4 text-sm">
                <a
                  href="https://up.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors flex items-center"
                >
                  UP Government <ExternalLink className="h-3 w-3 ml-1" />
                </a>
                <a
                  href="https://digitalindia.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors flex items-center"
                >
                  Digital India <ExternalLink className="h-3 w-3 ml-1" />
                </a>
                <a
                  href="https://india.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors flex items-center"
                >
                  India.gov.in <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>© 2025 NayiBareilly Digital Platform. All rights reserved.</span>
              <span className="hidden md:block">|</span>
              <span className="flex items-center">
                नई सोच से नई बरेली - Made with ❤️ for our community
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>System Status: Operational</span>
              </div>
              
              <button
                onClick={scrollToTop}
                className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                title="Back to top"
                aria-label="Back to top"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
