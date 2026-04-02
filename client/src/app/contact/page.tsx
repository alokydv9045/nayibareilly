'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Mail, Phone, MapPin, Clock, Send, 
  MessageSquare, Users, AlertTriangle,
  Facebook, Twitter, Instagram, Linkedin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Message sent successfully! We will get back to you soon.')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        category: 'general'
      })
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-green-800 text-white py-20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400/10 rounded-full blur-3xl animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl animate-ping"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6 animate-fadeInUp">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/20 transition-all duration-500 hover:scale-110 hover:rotate-3">
                <MessageSquare className="h-12 w-12 text-white animate-bounce" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeInUp animation-delay-200">
              Contact <span className="bg-gradient-to-r from-sky-300 to-green-300 bg-clip-text text-transparent animate-pulse">NayiBareilly</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-4 animate-fadeInUp animation-delay-400">
              हमसे जुड़ें - आपकी आवाज़ हमारी प्राथमिकता
            </p>
            <p className="text-lg text-blue-200 max-w-3xl mx-auto mb-8 animate-fadeInUp animation-delay-600">
              We&apos;re here to help! Reach out to us for support, feedback, or any inquiries about our civic services.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Information */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="animate-fadeInLeft">
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-gray-900 mb-2">Send us a Message</CardTitle>
                  <CardDescription className="text-gray-600">संदेश भेजें - हम जल्दी जवाब देंगे</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2 animate-fadeInUp stagger-1">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          required
                          className="transition-all duration-300 focus:scale-105 hover:shadow-md"
                        />
                      </div>
                      <div className="space-y-2 animate-fadeInUp stagger-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                          required
                          className="transition-all duration-300 focus:scale-105 hover:shadow-md"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2 animate-fadeInUp stagger-3">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+91 XXXXX XXXXX"
                          className="transition-all duration-300 focus:scale-105 hover:shadow-md"
                        />
                      </div>
                      <div className="space-y-2 animate-fadeInUp stagger-4">
                        <Label htmlFor="category">Category</Label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 focus:scale-105 hover:shadow-md"
                        >
                          <option value="general">General Inquiry</option>
                          <option value="technical">Technical Support</option>
                          <option value="feedback">Feedback</option>
                          <option value="complaint">Complaint</option>
                          <option value="suggestion">Suggestion</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 animate-fadeInUp stagger-5">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Brief subject of your message"
                        required
                        className="transition-all duration-300 focus:scale-105 hover:shadow-md"
                      />
                    </div>

                    <div className="space-y-2 animate-fadeInUp stagger-6">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Please describe your message in detail..."
                        rows={6}
                        required
                        className="transition-all duration-300 focus:scale-105 hover:shadow-md resize-none"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white transform hover:scale-105 transition-all duration-300 group animate-fadeInUp stagger-7"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending...
                        </div>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8 animate-fadeInRight">
              {/* Quick Contact */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 group hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-gray-900">
                    <Phone className="mr-2 h-6 w-6 text-blue-600 group-hover:rotate-12 transition-transform duration-300" />
                    Quick Contact
                  </CardTitle>
                  <CardDescription>त्वरित संपर्क</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">+91 581 2545 678</p>
                      <p className="text-sm text-gray-600">Mon-Fri: 9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">support@nayibareilly.gov.in</p>
                      <p className="text-sm text-gray-600">24/7 Email Support</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 hover:scale-105 transition-transform duration-300">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Bareilly Municipal Corporation</p>
                      <p className="text-sm text-gray-600">Collectorate Compound<br />Bareilly, UP 243001</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Office Hours */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 group hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-gray-900">
                    <Clock className="mr-2 h-6 w-6 text-green-600 group-hover:rotate-12 transition-transform duration-300" />
                    Office Hours
                  </CardTitle>
                  <CardDescription>कार्यालय समय</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center hover:scale-105 transition-transform duration-300">
                    <span className="text-gray-700">Monday - Friday</span>
                    <span className="font-medium text-gray-900">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center hover:scale-105 transition-transform duration-300">
                    <span className="text-gray-700">Saturday</span>
                    <span className="font-medium text-gray-900">9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center hover:scale-105 transition-transform duration-300">
                    <span className="text-gray-700">Sunday</span>
                    <span className="font-medium text-gray-900">Closed</span>
                  </div>
                  <div className="pt-3 border-t border-green-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-700">Currently Open</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-red-100 group hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-gray-900">
                    <AlertTriangle className="mr-2 h-6 w-6 text-red-600 group-hover:rotate-12 transition-transform duration-300" />
                    Emergency Contact
                  </CardTitle>
                  <CardDescription>आपातकालीन संपर्क</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-4 bg-red-100 rounded-lg hover:scale-105 transition-transform duration-300">
                    <p className="text-red-800 font-semibold text-lg">Emergency Hotline</p>
                    <p className="text-red-900 text-2xl font-bold">112</p>
                    <p className="text-red-700 text-sm">24/7 Emergency Services</p>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 group hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-gray-900">
                    <Users className="mr-2 h-6 w-6 text-purple-600 group-hover:rotate-12 transition-transform duration-300" />
                    Follow Us
                  </CardTitle>
                  <CardDescription>सोशल मीडिया पर फॉलो करें</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm" className="hover:scale-110 transition-transform duration-300 hover:shadow-lg group">
                      <Facebook className="h-4 w-4 group-hover:text-blue-600" />
                    </Button>
                    <Button variant="outline" size="sm" className="hover:scale-110 transition-transform duration-300 hover:shadow-lg group">
                      <Twitter className="h-4 w-4 group-hover:text-blue-400" />
                    </Button>
                    <Button variant="outline" size="sm" className="hover:scale-110 transition-transform duration-300 hover:shadow-lg group">
                      <Instagram className="h-4 w-4 group-hover:text-pink-600" />
                    </Button>
                    <Button variant="outline" size="sm" className="hover:scale-110 transition-transform duration-300 hover:shadow-lg group">
                      <Linkedin className="h-4 w-4 group-hover:text-blue-700" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fadeInUp">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-lg">अक्सर पूछे जाने वाले प्रश्न</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                question: "How do I report a civic issue?",
                hindi: "मैं नगरीय समस्या की रिपोर्ट कैसे करूं?",
                answer: "You can report issues through our platform by clicking 'Report Issue', filling out the form with details and photos.",
                delay: "stagger-1"
              },
              {
                question: "How long does it take to resolve issues?",
                hindi: "समस्या का समाधान कितने समय में होता है?",
                answer: "Resolution time varies by issue type. Most issues are acknowledged within 24 hours and resolved within 7-15 days.",
                delay: "stagger-2"
              },
              {
                question: "Can I track the progress of my report?",
                hindi: "क्या मैं अपनी रिपोर्ट की प्रगति देख सकता हूं?",
                answer: "Yes! You can track your issue status in real-time through your dashboard and receive notifications.",
                delay: "stagger-3"
              },
              {
                question: "Is there a mobile app available?",
                hindi: "क्या मोबाइल ऐप उपलब्ध है?",
                answer: "Currently, our platform is web-based and fully mobile-responsive. A dedicated mobile app is coming soon.",
                delay: "stagger-4"
              }
            ].map((faq, index) => (
              <Card key={index} className={`border-0 shadow-lg hover:shadow-xl transition-all duration-500 group transform hover:-translate-y-1 animate-fadeInUp ${faq.delay}`}>
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {faq.question}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 italic">
                    {faq.hindi}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-green-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-60 h-60 bg-green-400/10 rounded-full blur-3xl animate-bounce"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4 animate-fadeInUp">Ready to Get Started?</h2>
          <p className="text-blue-100 text-lg mb-8 animate-fadeInUp animation-delay-200">
            Join thousands of citizens making Bareilly a better place to live
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp animation-delay-400">
            <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 group">
              <Link href="/report">
                <MessageSquare className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                Report an Issue
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 transform hover:scale-105 transition-all duration-300">
              <Link href="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
