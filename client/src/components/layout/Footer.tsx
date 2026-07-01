'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSession } from '@/hooks/useSession'
import { 
  Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, 
  Linkedin, Youtube, Send, ExternalLink, Shield, FileText, 
  HelpCircle, Users, Activity, CheckCircle, ArrowUp, AlertTriangle
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
      return [
        ...commonLinks,
        { href: '/report', label: 'Report Issue' },
        { href: '/map', label: 'Explore Map' },
        { href: '/track', label: 'Track Issue' },
        { href: '/login', label: 'Login' },
      ]
    }

    const userLinks = [...commonLinks]
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
<<<<<<< HEAD
    } else if (primaryRole === 'SUPERADMIN') {
      userLinks.push(
        { href: '/superadmin/dashboard', label: 'Admin Dashboard' },
        { href: '/superadmin/users', label: 'Manage Users' },
=======
    } else if (primaryRole === 'MODERATOR') {
      userLinks.push(
        { href: '/moderator/dashboard', label: 'Dashboard' },
        { href: '/moderator/pending', label: 'Pending Reviews' },
        { href: '/moderator/analytics', label: 'Analytics' },
        { href: '/profile', label: 'Profile' },
      )
    } else if (primaryRole === 'TECH_ADMIN' || primaryRole === 'TECHADMIN' || primaryRole === 'SUPERADMIN' || primaryRole === 'DEVELOPER_ADMIN') {
      userLinks.push(
        { href: '/techadmin', label: 'Admin Dashboard' },
        { href: '/techadmin/users', label: 'Manage Users' },
        { href: '/techadmin/departments', label: 'Departments' },
        { href: '/techadmin/analytics', label: 'Analytics' },
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9
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
    <footer className="bg-slate-950 text-slate-300">
      
      {/* Full-Width Emergency Ticker Banner */}
      <div className="bg-rose-900 border-b border-rose-950 px-4 py-4 sm:py-5 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="bg-rose-800 p-2.5 rounded-full shadow-sm">
              <AlertTriangle className="h-6 w-6 text-rose-100" />
            </div>
            <div>
              <h3 className="text-rose-100 text-lg font-bold uppercase tracking-widest mb-0.5">Emergency Civic Hotline</h3>
              <p className="text-rose-200 text-sm font-medium">For urgent civic issues requiring immediate municipal attention</p>
            </div>
          </div>
          <motion.a 
            whileHover={{ scale: 1.03, boxShadow: "0px 8px 20px rgba(225, 29, 72, 0.25)" }}
            href="tel:1800-180-1551" 
            className="group flex items-center gap-3 bg-white text-rose-900 px-6 py-3 rounded-xl font-bold shadow-md transition-all"
          >
            <Phone className="h-5 w-5 group-hover:-rotate-12 transition-transform" />
            <span className="text-xl tracking-wider">1800-180-1551</span>
          </motion.a>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-1.5">Stay Connected</h3>
              <p className="text-slate-400 font-medium">Get real-time updates on civic improvements and smart city initiatives.</p>
            </div>
            
            <form onSubmit={handleNewsletterSignup} className="flex w-full md:w-auto shadow-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                aria-label="Email address for newsletter"
                className="w-full md:w-80 px-4 py-3 rounded-l-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-r-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {subscribing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" aria-hidden="true" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          
          {/* Company Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-3 shadow-sm">
                <Building2 className="h-7 w-7 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Nayi Bareilly</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Smart City Portal</p>
              </div>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Empowering citizens with transparent, efficient digital governance. 
              Building a smarter Bareilly through community collaboration and innovative civic solutions.
            </p>

            {/* Social Media */}
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Quick Links</h4>
            <div className="space-y-4">
              {quickLinks.map((link, index) => (
                <Link 
                  key={index}
                  href={link.href} 
                  className="block text-slate-400 hover:text-emerald-400 font-medium transition-colors text-sm flex items-center"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 mr-2"></span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support & Legal */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Support & Legal</h4>
            <div className="space-y-4">
              <Link href="/help" className="flex items-center text-slate-400 hover:text-emerald-400 font-medium transition-colors text-sm">
                <HelpCircle className="h-4 w-4 mr-2.5 text-slate-600" /> Help Center
              </Link>
              <Link href="/privacy" className="flex items-center text-slate-400 hover:text-emerald-400 font-medium transition-colors text-sm">
                <Shield className="h-4 w-4 mr-2.5 text-slate-600" /> Privacy Policy
              </Link>
              <Link href="/terms" className="flex items-center text-slate-400 hover:text-emerald-400 font-medium transition-colors text-sm">
                <FileText className="h-4 w-4 mr-2.5 text-slate-600" /> Terms of Service
              </Link>
              <Link href="/guidelines" className="flex items-center text-slate-400 hover:text-emerald-400 font-medium transition-colors text-sm">
                <Users className="h-4 w-4 mr-2.5 text-slate-600" /> Community Guidelines
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Contact Us</h4>
            <div className="space-y-5">
              <div className="flex items-start space-x-3 text-slate-400 font-medium">
                <MapPin className="h-5 w-5 text-emerald-500 mt-0.5" />
                <p className="text-sm leading-relaxed">
                  Bareilly Municipal Corporation<br />
                  Collectorate Compound<br />
                  Bareilly, UP 243001
                </p>
              </div>
              <div className="flex items-center space-x-3 text-slate-400 font-medium">
                <Phone className="h-5 w-5 text-emerald-500" />
                <p className="text-sm">+91 581 2545 678</p>
              </div>
              <div className="flex items-center space-x-3 text-slate-400 font-medium">
                <Mail className="h-5 w-5 text-emerald-500" />
                <p className="text-sm">support@nayibareilly.gov.in</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-slate-500 font-medium">
              © {new Date().getFullYear()} Nayi Bareilly Digital Platform. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex space-x-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                <a href="https://up.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">UP Gov</a>
                <a href="https://digitalindia.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">Digital India</a>
              </div>
              <div className="w-px h-4 bg-slate-800"></div>
              <button
                onClick={scrollToTop}
                className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shadow-sm"
                title="Back to top"
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
