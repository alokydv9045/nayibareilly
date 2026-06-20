 'use client'

import Link from 'next/link'
import Image from 'next/image'
import { 
  Users, CheckCircle, Globe, 
  MapPin, Target, Eye, Heart,
  Building2, Smartphone, Zap, FileText, BarChart3,
  ArrowRight, UserCheck, Shield, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-green-50/30">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-green-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6">
            <Badge className="bg-white/20 text-white border-0 px-4 py-2">
              <Building2 className="w-4 h-4 mr-2" />
              About NayiBareilly
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold">
              Building a <span className="bg-gradient-to-r from-sky-300 to-green-300 bg-clip-text text-transparent">Smarter Bareilly</span>
            </h1>
            
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              A revolutionary digital governance platform empowering citizens to participate in transparent, efficient, and accountable civic management.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                <Link href="/report">
                  Report an Issue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl backdrop-blur-sm">
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                <Link href="/track">
                  Track Issues
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mayor's Message Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-blue-600 to-green-600 text-white border-0 px-4 py-2 mb-4">
              <Shield className="w-4 h-4 mr-2" />
              Message from the Mayor
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900">Leadership & Vision</h2>
          </div>

          <Card className="overflow-hidden shadow-xl border-0 max-w-5xl mx-auto">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-5 gap-0">
                {/* Mayor Photo Side */}
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-900 via-blue-800 to-green-800 p-8 flex flex-col items-center justify-center text-white relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }} />
                  
                  <div className="relative z-10 text-center space-y-4">
                    {/* Mayor Photo */}
                    <div className="w-48 h-48 mx-auto rounded-2xl bg-white/10 backdrop-blur-sm p-1 shadow-2xl overflow-hidden">
                      <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-100 to-green-100 overflow-hidden">
                        <Image src="/images/Mayorsahab.jpg" alt="Mayor Dr. Umesh Gautam" width={192} height={192} className="object-cover w-full h-full" />
                      </div>
                    </div>

                    {/* Mayor Info */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">Dr. Umesh Gautam</h3>
                      <p className="text-blue-200 text-sm font-medium">Hon&apos;ble Mayor</p>
                      <p className="text-xs text-blue-100">Bareilly Municipal Corporation</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/20">
                      {[
                        { value: "7.5L+", label: "Citizens" },
                        { value: "500+", label: "Projects" },
                        { value: "95%", label: "Rating" }
                      ].map((stat, idx) => (
                        <div key={idx} className="text-center">
                          <div className="text-lg font-bold">{stat.value}</div>
                          <div className="text-xs text-blue-200">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Message Content Side */}
                <div className="lg:col-span-3 p-6 lg:p-8 space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-12 bg-gradient-to-b from-blue-600 to-green-600 rounded-full flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">Dear Citizens of Bareilly,</h3>
                        <p className="text-sm text-slate-600 italic">प्रिय बरेली वासियों,</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-slate-700 leading-relaxed text-sm">
                      <div className="space-y-2">
                        <p>
                          It is with great pride and enthusiasm that I present to you <strong>NayiBareilly</strong> – 
                          a revolutionary digital platform that marks a new chapter in our city&apos;s journey towards 
                          becoming a truly smart and citizen-centric municipality.
                        </p>
                        <p className="text-slate-600 italic text-xs">
                          मुझे बड़े गर्व और उत्साह के साथ आपके समक्ष <strong>नई बरेली</strong> प्रस्तुत करते हुए खुशी हो रही है – 
                          एक क्रांतिकारी डिजिटल मंच जो हमारे शहर की यात्रा में एक नया अध्याय शुरू करता है।
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p>
                          As your Mayor, I have always believed that the strength of our city lies in the active 
                          participation of our citizens. This platform is not just a technological advancement; 
                          it is a bridge that connects every resident of Bareilly directly to their municipal government, 
                          ensuring that your voice is heard, your concerns are addressed, and your ideas shape our city&apos;s future.
                        </p>
                        <p className="text-slate-600 italic text-xs">
                          आपके मेयर के रूप में, मैंने हमेशा माना है कि हमारे शहर की ताकत हमारे नागरिकों की सक्रिय भागीदारी में निहित है। 
                          यह मंच केवल एक तकनीकी प्रगति नहीं है; यह एक पुल है जो बरेली के हर निवासी को सीधे उनकी नगर सरकार से जोड़ता है।
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p>
                          Through <strong>NayiBareilly</strong>, we are committed to:
                        </p>
                        <p className="text-slate-600 italic text-xs">
                          <strong>नई बरेली</strong> के माध्यम से, हम प्रतिबद्ध हैं:
                        </p>
                      </div>

                      <ul className="space-y-2 ml-6">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="text-sm"><strong>Transparency:</strong> Every issue, every action, and every resolution tracked in real-time</span>
                            <p className="text-slate-600 italic text-xs"><strong>पारदर्शिता:</strong> हर मुद्दे, हर कार्रवाई और हर समाधान की रियल-टाइम ट्रैकिंग</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="text-sm"><strong>Efficiency:</strong> Rapid response and resolution of civic issues through AI-powered systems</span>
                            <p className="text-slate-600 italic text-xs"><strong>दक्षता:</strong> AI-संचालित प्रणालियों के माध्यम से नागरिक मुद्दों का तेज़ समाधान</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="text-sm"><strong>Accountability:</strong> Clear responsibilities and timelines for every department</span>
                            <p className="text-slate-600 italic text-xs"><strong>जवाबदेही:</strong> हर विभाग के लिए स्पष्ट जिम्मेदारियां और समय सीमा</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="text-sm"><strong>Innovation:</strong> Leveraging cutting-edge technology for better civic management</span>
                            <p className="text-slate-600 italic text-xs"><strong>नवाचार:</strong> बेहतर नागरिक प्रबंधन के लिए अत्याधुनिक तकनीक का लाभ</p>
                          </div>
                        </li>
                      </ul>

                      <div className="space-y-2">
                        <p>
                          Our vision is simple yet ambitious – to make Bareilly a model city where technology serves 
                          the people, where governance is transparent, and where every citizen feels empowered to 
                          contribute to our collective progress.
                        </p>
                        <p className="text-slate-600 italic text-xs">
                          हमारी दृष्टि सरल लेकिन महत्वाकांक्षी है – बरेली को एक आदर्श शहर बनाना जहां तकनीक लोगों की सेवा करे, 
                          जहां शासन पारदर्शी हो, और जहां हर नागरिक हमारी सामूहिक प्रगति में योगदान करने के लिए सशक्त महसूस करे।
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="font-semibold text-slate-900">
                          Together, let us build a <span className="text-blue-600">Nayi Bareilly</span> – 
                          a city that we can all be proud of, a city that sets new standards of civic excellence, 
                          and a city that truly belongs to its people.
                        </p>
                        <p className="text-slate-600 italic text-xs font-semibold">
                          आइए मिलकर <span className="text-blue-600">नई बरेली</span> का निर्माण करें – 
                          एक ऐसा शहर जिस पर हम सभी को गर्व हो, एक ऐसा शहर जो नागरिक उत्कृष्टता के नए मानक स्थापित करे।
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <p className="font-bold text-slate-900 text-base">Dr. Umesh Gautam</p>
                      <p className="text-sm text-slate-600">Mayor, Bareilly Municipal Corporation</p>
                      <p className="text-xs text-slate-500 mt-1">
                        &ldquo;नई सोच, नया समाधान, नई बरेली&rdquo;
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
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Mission */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 group hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 hover:rotate-1 animate-fadeInLeft">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 hover:shadow-lg">
                  <Target className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardTitle className="text-2xl text-gray-900 group-hover:text-blue-600 transition-colors duration-300">Our Mission</CardTitle>
                <CardDescription className="text-blue-600 font-medium group-hover:text-blue-700 transition-colors duration-300">हमारा मिशन</CardDescription>
              </CardHeader>
              <CardContent className="group-hover:scale-105 transition-transform duration-300">
                <p className="text-gray-700 text-center leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                  To create a transparent, efficient, and citizen-centric digital governance ecosystem 
                  that bridges the gap between citizens and municipal administration in Bareilly.
                </p>
                <p className="text-gray-600 text-center text-sm mt-3 italic group-hover:text-blue-600 transition-colors duration-300">
                  &ldquo;प्रत्येक नागरिक की आवाज को सुनना और समस्याओं का त्वरित समाधान करना&rdquo;
                </p>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 group hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 hover:-rotate-1 animate-fadeInUp animation-delay-200">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 hover:shadow-lg">
                  <Eye className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardTitle className="text-2xl text-gray-900 group-hover:text-green-600 transition-colors duration-300">Our Vision</CardTitle>
                <CardDescription className="text-green-600 font-medium group-hover:text-green-700 transition-colors duration-300">हमारी दृष्टि</CardDescription>
              </CardHeader>
              <CardContent className="group-hover:scale-105 transition-transform duration-300">
                <p className="text-gray-700 text-center leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                  To transform Bareilly into a model smart city where every citizen actively 
                  participates in governance through digital innovation and community collaboration.
                </p>
                <p className="text-gray-600 text-center text-sm mt-3 italic group-hover:text-green-600 transition-colors duration-300">
                  &ldquo;एक स्मार्ट, पारदर्शी और नागरिक-केंद्रित बरेली का निर्माण&rdquo;
                </p>
              </CardContent>
            </Card>

            {/* Values */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 group hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 hover:rotate-1 animate-fadeInRight animation-delay-400">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 hover:shadow-lg">
                  <Heart className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300 animate-pulse" />
                </div>
                <CardTitle className="text-2xl text-gray-900 group-hover:text-purple-600 transition-colors duration-300">Our Values</CardTitle>
                <CardDescription className="text-purple-600 font-medium group-hover:text-purple-700 transition-colors duration-300">हमारे मूल्य</CardDescription>
              </CardHeader>
              <CardContent className="group-hover:scale-105 transition-transform duration-300">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-700 hover:text-purple-600 transition-colors duration-300 transform hover:translate-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 group-hover:animate-spin" />
                    Transparency (पारदर्शिता)
                  </div>
                  <div className="flex items-center text-sm text-gray-700 hover:text-purple-600 transition-colors duration-300 transform hover:translate-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 group-hover:animate-spin" />
                    Accountability (जवाबदेही)
                  </div>
                  <div className="flex items-center text-sm text-gray-700 hover:text-purple-600 transition-colors duration-300 transform hover:translate-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 group-hover:animate-spin" />
                    Innovation (नवाचार)
                  </div>
                  <div className="flex items-center text-sm text-gray-700 hover:text-purple-600 transition-colors duration-300 transform hover:translate-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 group-hover:animate-spin" />
                    Community First (समुदाय प्रथम)
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fadeInUp">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Capabilities</h2>
            <p className="text-gray-600 text-lg mb-2">प्लेटफॉर्म की विशेषताएं</p>
            <p className="text-gray-600 max-w-3xl mx-auto">
              NayiBareilly offers comprehensive digital tools for modern civic engagement and governance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Smartphone,
                title: "Real-time Issue Reporting",
                hindi: "त्वरित शिकायत दर्ज",
                description: "Report civic issues instantly with photos, location, and detailed descriptions",
                color: "blue",
                delay: "stagger-1"
              },
              {
                icon: MapPin,
                title: "Interactive Issue Mapping",
                hindi: "इंटरैक्टिव मैप",
                description: "Visualize civic issues across Bareilly with detailed geographical insights",
                color: "green",
                delay: "stagger-2"
              },
              {
                icon: Clock,
                title: "Progress Tracking",
                hindi: "प्रगति ट्रैकिंग",
                description: "Track resolution progress from submission to completion in real-time",
                color: "orange",
                delay: "stagger-3"
              },
              {
                icon: Users,
                title: "Community Engagement",
                hindi: "सामुदायिक भागीदारी",
                description: "Vote, comment, and collaborate on civic issues with fellow citizens",
                color: "purple",
                delay: "stagger-4"
              },
              {
                icon: BarChart3,
                title: "Data Analytics",
                hindi: "डेटा विश्लेषण",
                description: "Comprehensive insights and statistics on civic issue trends",
                color: "teal",
                delay: "stagger-5"
              },
              {
                icon: Zap,
                title: "Quick Resolution",
                hindi: "त्वरित समाधान",
                description: "Streamlined workflows for faster issue resolution and citizen satisfaction",
                color: "red",
                delay: "stagger-6"
              }
            ].map((feature, index) => (
              <Card key={index} className={`group hover:shadow-xl transition-all duration-500 border-0 shadow-lg transform hover:-translate-y-3 hover:rotate-1 animate-fadeInUp ${feature.delay}`}>
                <CardHeader className="text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 rounded-full flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 hover:shadow-2xl relative z-10`}>
                    <feature.icon className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <CardTitle className={`text-lg text-gray-900 group-hover:text-${feature.color}-600 transition-colors duration-300 relative z-10`}>{feature.title}</CardTitle>
                  <CardDescription className={`text-sm font-medium text-gray-600 group-hover:text-${feature.color}-700 transition-colors duration-300 relative z-10`}>{feature.hindi}</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-600 text-center text-sm group-hover:text-gray-700 transition-colors duration-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-green-400/20 rounded-full blur-3xl animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-blue-400/15 rounded-full blur-xl animate-ping"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 animate-fadeInUp">
            <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
            <p className="text-blue-100 text-lg">हमारा प्रभाव - Making a difference in Bareilly</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "2,847", label: "Issues Reported", hindi: "समस्याएं दर्ज", delay: "stagger-1" },
              { number: "2,103", label: "Issues Resolved", hindi: "समस्याएं हल", delay: "stagger-2" },
              { number: "8,500+", label: "Active Citizens", hindi: "सक्रिय नागरिक", delay: "stagger-3" },
              { number: "73%", label: "Resolution Rate", hindi: "समाधान दर", delay: "stagger-4" }
            ].map((stat, index) => (
              <div key={index} className={`text-center group animate-fadeInUp ${stat.delay}`}>
                <div className="transform group-hover:scale-110 transition-all duration-500 hover:rotate-3">
                  <div className="text-4xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300 animate-pulse">
                    {stat.number}
                  </div>
                  <div className="text-blue-100 text-sm font-medium group-hover:text-white transition-colors duration-300">
                    {stat.label}
                  </div>
                  <div className="text-blue-200 text-xs group-hover:text-blue-100 transition-colors duration-300">
                    {stat.hindi}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fadeInUp">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 text-lg mb-2">यह कैसे काम करता है</p>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple steps to report, track, and resolve civic issues in Bareilly
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Report Issue",
                hindi: "समस्या दर्ज करें",
                description: "Take a photo, describe the issue, and add location details",
                icon: FileText
              },
              {
                step: "02", 
                title: "Admin Review",
                hindi: "प्रशासनिक समीक्षा",
                description: "Municipal authorities review and categorize your report",
                icon: UserCheck
              },
              {
                step: "03",
                title: "Resolution Process",
                hindi: "समाधान प्रक्रिया",
                description: "Relevant department takes action to resolve the issue",
                icon: Zap
              },
              {
                step: "04",
                title: "Issue Resolved",
                hindi: "समस्या हल",
                description: "Get notified when your issue is successfully resolved",
                icon: CheckCircle
              }
            ].map((step, index) => (
              <div key={index} className={`text-center group animate-fadeInUp stagger-${index + 1}`}>
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 hover:shadow-2xl">
                    <step.icon className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 animate-pulse">
                    {step.step}
                  </div>
                  {/* Connecting line for desktop */}
                  {index < 3 && (
                    <div className="hidden md:block absolute top-10 left-20 w-full h-0.5 bg-gradient-to-r from-blue-300 to-green-300 opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">{step.title}</h3>
                <p className="text-sm font-medium text-blue-600 mb-2 group-hover:text-blue-700 transition-colors duration-300">{step.hindi}</p>
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team & Leadership */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Leadership & Partnership</h2>
            <p className="text-gray-600 text-lg mb-2">नेतृत्व और साझेदारी</p>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Working together with municipal authorities and technology partners for better governance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-xl">Municipal Corporation</CardTitle>
                <CardDescription>नगर निगम बरेली</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Official partnership with Bareilly Municipal Corporation for seamless civic service delivery
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Globe className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-xl">Digital India Initiative</CardTitle>
                <CardDescription>डिजिटल इंडिया पहल</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Aligned with Digital India vision for transparent and efficient e-governance
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-xl">Community Partners</CardTitle>
                <CardDescription>सामुदायिक साझेदार</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Collaborating with local organizations and citizen groups for grassroots engagement
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-green-900 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-60 h-60 bg-green-400/10 rounded-full blur-3xl animate-bounce"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl animate-ping"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4 animate-fadeInUp">Join the NayiBareilly Movement</h2>
          <p className="text-blue-100 text-lg mb-2 animate-fadeInUp animation-delay-200">नई बरेली आंदोलन में शामिल हों</p>
          <p className="text-blue-200 mb-8 max-w-2xl mx-auto animate-fadeInUp animation-delay-400">
            Be part of the digital transformation. Help us build a smarter, more responsive Bareilly 
            where every citizen&apos;s voice matters and every issue gets the attention it deserves.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp animation-delay-600">
            <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl group">
              <Link href="/login">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl backdrop-blur-sm">
              <Link href="/help">
                Learn More
              </Link>
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/20 animate-fadeInUp animation-delay-800">
            <p className="text-blue-200 text-sm animate-pulse">
              &ldquo;हर नागरिक के साथ, नई बरेली की ओर&rdquo; - Together towards a New Bareilly
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
