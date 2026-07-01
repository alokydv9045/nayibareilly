'use client'

import Link from 'next/link'
import Image from 'next/image'
import { 
  Users, CheckCircle, Globe, 
  MapPin, Target, Eye, Heart,
  Building2, Smartphone, Zap, FileText, BarChart3,
  ArrowRight, UserCheck, Shield, Clock, Camera
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Hero Section */}
      <section className="relative bg-slate-50 overflow-hidden pt-12 pb-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <Badge className="px-4 py-2 text-xs sm:text-sm font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-sm uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 mr-2 text-emerald-500" />
              About NayiBareilly
            </Badge>
            
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Building a <span className="text-emerald-600">Smarter Bareilly</span>
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              A revolutionary digital governance platform empowering citizens to participate in transparent, efficient, and accountable civic management.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg transition-all border-0 px-8 w-full sm:w-auto">
                  <Link href="/report">
                    <Camera className="w-5 h-5 mr-2" />
                    Report an Issue
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                <Button asChild size="lg" variant="outline" className="bg-transparent border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all px-8 w-full sm:w-auto">
                  <Link href="/contact">
                    Contact Us
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                <Button asChild size="lg" variant="outline" className="bg-transparent border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all px-8 w-full sm:w-auto">
                  <Link href="/track">
                    Track Issues
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Mayor's Message Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="px-4 py-2 text-xs sm:text-sm font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-sm uppercase tracking-wider mb-4">
              <Shield className="w-3.5 h-3.5 mr-2 text-emerald-500" />
              Message from the Mayor
            </Badge>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Leadership & Vision</h2>
          </div>

          <Card className="overflow-hidden shadow-xl border border-slate-200 max-w-5xl mx-auto bg-white">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-5 gap-0">
                {/* Mayor Photo Side */}
                <div className="lg:col-span-2 bg-slate-50 p-8 flex flex-col items-center justify-center text-slate-900 relative border-r border-slate-200">
                  <div className="relative z-10 text-center space-y-6">
                    {/* Mayor Photo */}
                    <div className="w-48 h-48 mx-auto rounded-2xl bg-white p-1 shadow-md border border-slate-200 overflow-hidden">
                      <div className="w-full h-full rounded-xl bg-slate-100 overflow-hidden">
                        <Image src="/images/Mayorsahab.jpg" alt="Mayor Dr. Umesh Gautam" width={192} height={192} className="object-cover w-full h-full" />
                      </div>
                    </div>

                    {/* Mayor Info */}
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-slate-900">Dr. Umesh Gautam</h3>
                      <p className="text-emerald-600 text-sm font-semibold uppercase tracking-wider">Hon'ble Mayor</p>
                      <p className="text-xs text-slate-500 font-medium">Bareilly Municipal Corporation</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200 w-full">
                      {[
                        { value: "7.5L+", label: "Citizens" },
                        { value: "500+", label: "Projects" },
                        { value: "95%", label: "Rating" }
                      ].map((stat, idx) => (
                        <div key={idx} className="text-center">
                          <div className="text-lg font-bold text-slate-900">{stat.value}</div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Message Content Side */}
                <div className="lg:col-span-3 p-8 lg:p-10 space-y-6">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-1.5 h-12 bg-emerald-500 rounded-full flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">Dear Citizens of Bareilly,</h3>
                        <p className="text-sm text-slate-500 font-medium">प्रिय बरेली वासियों,</p>
                      </div>
                    </div>

                    <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
                      <div className="space-y-1">
                        <p>
                          It is with great pride and enthusiasm that I present to you <strong>NayiBareilly</strong> – 
                          a revolutionary digital platform that marks a new chapter in our city's journey towards 
                          becoming a truly smart and citizen-centric municipality.
                        </p>
                        <p className="text-slate-500 text-xs font-medium">
                          मुझे बड़े गर्व और उत्साह के साथ आपके समक्ष <strong>नई बरेली</strong> प्रस्तुत करते हुए खुशी हो रही है – 
                          एक क्रांतिकारी डिजिटल मंच जो हमारे शहर की यात्रा में एक नया अध्याय शुरू करता है।
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p>
                          As your Mayor, I have always believed that the strength of our city lies in the active 
                          participation of our citizens. This platform is not just a technological advancement; 
                          it is a bridge that connects every resident of Bareilly directly to their municipal government, 
                          ensuring that your voice is heard, your concerns are addressed, and your ideas shape our city's future.
                        </p>
                        <p className="text-slate-500 text-xs font-medium">
                          आपके मेयर के रूप में, मैंने हमेशा माना है कि हमारे शहर की ताकत हमारे नागरिकों की सक्रिय भागीदारी में निहित है। 
                          यह मंच केवल एक तकनीकी प्रगति नहीं है; यह एक पुल है जो बरेली के हर निवासी को सीधे उनकी नगर सरकार से जोड़ता है।
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="font-semibold text-slate-800">
                          Through <strong>NayiBareilly</strong>, we are committed to:
                        </p>
                      </div>

                      <ul className="space-y-3 ml-4">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="text-sm text-slate-700"><strong>Transparency:</strong> Every issue, every action, and every resolution tracked in real-time</span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="text-sm text-slate-700"><strong>Efficiency:</strong> Rapid response and resolution of civic issues through AI-powered systems</span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="text-sm text-slate-700"><strong>Accountability:</strong> Clear responsibilities and timelines for every department</span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="text-sm text-slate-700"><strong>Innovation:</strong> Leveraging cutting-edge technology for better civic management</span>
                          </div>
                        </li>
                      </ul>

                      <div className="space-y-1 pt-2">
                        <p className="font-bold text-slate-900">
                          Together, let us build a <span className="text-emerald-600">Nayi Bareilly</span> – 
                          a city that we can all be proud of, a city that sets new standards of civic excellence, 
                          and a city that truly belongs to its people.
                        </p>
                        <p className="text-slate-500 text-xs font-semibold">
                          आइए मिलकर <span className="text-emerald-600">नई बरेली</span> का निर्माण करें – 
                          एक ऐसा शहर जिस पर हम सभी को गर्व हो, एक ऐसा शहर जो नागरिक उत्कृष्टता के नए मानक स्थापित करे।
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <p className="font-bold text-slate-900 text-base">Dr. Umesh Gautam</p>
                      <p className="text-sm text-slate-500 font-medium">Mayor, Bareilly Municipal Corporation</p>
                      <p className="text-xs text-emerald-600 font-semibold mt-1">
                        "नई सोच, नया समाधान, नई बरेली"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Our Mission & Vision */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Mission */}
            <motion.div whileHover={{ y: -6, boxShadow: "0px 12px 24px rgba(0,0,0,0.1)" }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl h-full">
                <CardHeader className="text-center pb-4">
                  <div className="w-14 h-14 mx-auto mb-4 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Target className="h-7 w-7 text-emerald-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">Our Mission</CardTitle>
                  <CardDescription className="text-emerald-600 font-semibold uppercase tracking-wider text-xs">हमारा मिशन</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 font-medium text-center leading-relaxed text-sm">
                    To create a transparent, efficient, and citizen-centric digital governance ecosystem 
                    that bridges the gap between citizens and municipal administration in Bareilly.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Vision */}
            <motion.div whileHover={{ y: -6, boxShadow: "0px 12px 24px rgba(0,0,0,0.1)" }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl h-full">
                <CardHeader className="text-center pb-4">
                  <div className="w-14 h-14 mx-auto mb-4 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Eye className="h-7 w-7 text-emerald-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">Our Vision</CardTitle>
                  <CardDescription className="text-emerald-600 font-semibold uppercase tracking-wider text-xs">हमारी दृष्टि</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 font-medium text-center leading-relaxed text-sm">
                    To transform Bareilly into a model smart city where every citizen actively 
                    participates in governance through digital innovation and community collaboration.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Values */}
            <motion.div whileHover={{ y: -6, boxShadow: "0px 12px 24px rgba(0,0,0,0.1)" }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl h-full">
                <CardHeader className="text-center pb-4">
                  <div className="w-14 h-14 mx-auto mb-4 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Heart className="h-7 w-7 text-emerald-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">Our Values</CardTitle>
                  <CardDescription className="text-emerald-600 font-semibold uppercase tracking-wider text-xs">हमारे मूल्य</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm font-medium text-slate-600">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mr-3" />
                      Transparency (पारदर्शिता)
                    </div>
                    <div className="flex items-center text-sm font-medium text-slate-600">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mr-3" />
                      Accountability (जवाबदेही)
                    </div>
                    <div className="flex items-center text-sm font-medium text-slate-600">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mr-3" />
                      Innovation (नवाचार)
                    </div>
                    <div className="flex items-center text-sm font-medium text-slate-600">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mr-3" />
                      Community First (समुदाय प्रथम)
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Platform Capabilities</h2>
            <p className="text-slate-500 font-medium uppercase tracking-wider text-sm mb-4">प्लेटफॉर्म की विशेषताएं</p>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              NayiBareilly offers comprehensive digital tools for modern civic engagement and governance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Smartphone,
                title: "Real-time Issue Reporting",
                description: "Report civic issues instantly with photos, location, and detailed descriptions."
              },
              {
                icon: MapPin,
                title: "Interactive Issue Mapping",
                description: "Visualize civic issues across Bareilly with detailed geographical insights."
              },
              {
                icon: Clock,
                title: "Progress Tracking",
                description: "Track resolution progress from submission to completion in real-time."
              },
              {
                icon: Users,
                title: "Community Engagement",
                description: "Vote, comment, and collaborate on civic issues with fellow citizens."
              },
              {
                icon: BarChart3,
                title: "Data Analytics",
                description: "Comprehensive insights and statistics on civic issue trends."
              },
              {
                icon: Zap,
                title: "Quick Resolution",
                description: "Streamlined workflows for faster issue resolution and citizen satisfaction."
              }
            ].map((feature, index) => (
              <motion.div key={index} whileHover={{ y: -6, boxShadow: "0px 12px 24px rgba(0,0,0,0.1)" }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="flex gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm cursor-default">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-2">
                    <feature.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="px-4 py-2 text-xs font-bold bg-slate-800 text-emerald-400 border border-slate-700 mb-4 uppercase tracking-wider">
              Our Impact
            </Badge>
            <h2 className="text-3xl font-extrabold mb-4">Making a Difference in Bareilly</h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-slate-800">
            {[
              { number: "2,847", label: "Issues Reported" },
              { number: "2,103", label: "Issues Resolved" },
              { number: "8,500+", label: "Active Citizens" },
              { number: "73%", label: "Resolution Rate" }
            ].map((stat, index) => (
              <div key={index} className="text-center px-4">
                <div className="text-4xl lg:text-5xl font-extrabold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Simple steps to report, track, and resolve civic issues in Bareilly
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Desktop Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-slate-200" />

            {[
              {
                step: "01",
                title: "Report Issue",
                description: "Take a photo, describe the issue, and add location details",
                icon: FileText
              },
              {
                step: "02", 
                title: "Admin Review",
                description: "Municipal authorities review and categorize your report",
                icon: UserCheck
              },
              {
                step: "03",
                title: "Resolution",
                description: "Relevant department takes action to resolve the issue",
                icon: Zap
              },
              {
                step: "04",
                title: "Completed",
                description: "Get notified when your issue is successfully resolved",
                icon: CheckCircle
              }
            ].map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="relative z-10 w-24 h-24 mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center mb-6">
                  <step.icon className="h-10 w-10 text-emerald-600" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-white border-t border-slate-200 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="px-4 py-2 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 mb-6 uppercase tracking-wider">
            Join the Movement
          </Badge>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Help Us Build a Smarter Bareilly</h2>
          <p className="text-slate-600 text-lg mb-10 leading-relaxed">
            Be part of the digital transformation. Report issues, track progress, and ensure a cleaner, better environment for everyone.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
              <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md border-0 px-8 w-full sm:w-auto">
                <Link href="/report">
                  Get Started Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-slate-300 text-slate-700 hover:bg-slate-100 px-8 w-full sm:w-auto">
                <Link href="/about">
                  Learn More
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
