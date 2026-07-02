'use client'
import AnimatedHeading from '@/components/ui/AnimatedHeading'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Users, Shield, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

export default function GuidelinesPage() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en')

  const content = {
    en: {
      title: "Community Guidelines",
      subtitle: "Learn how to effectively report issues and participate in our NayiBareilly platform",
      reportCard: {
        title: "Report an Issue",
        description: "Submit community problems for resolution",
        button: "Start Report"
      },
      joinCard: {
        title: "Join Community",
        description: "Connect with neighbors and local officials",
        button: "Sign Up"
      },
      privacyCard: {
        title: "Privacy & Safety",
        description: "Understand our commitment to your data",
        button: "Learn More"
      },
      reportingGuidelines: {
        title: "Effective Issue Reporting",
        doThis: "✅ Do This:",
        doItems: [
          "• Provide clear, descriptive titles",
          "• Include specific location details",
          "• Add photos when helpful",
          "• Choose appropriate priority level",
          "• Use respectful, constructive language"
        ],
        avoidThis: "❌ Avoid This:",
        avoidItems: [
          "• Vague or unclear descriptions",
          "• Personal attacks or inappropriate content",
          "• Duplicate reports for the same issue",
          "• Emergency situations (call 911 instead)"
        ]
      },
      responseTimes: {
        title: "Expected Response Times",
        emergency: "Emergency Issues",
        high: "High Priority",
        medium: "Medium Priority",
        low: "Low Priority",
        note: "Response times may vary based on resource availability and issue complexity"
      },
      communityStandards: {
        title: "Community Standards",
        respectful: {
          title: "Respectful Communication",
          description: "Treat all community members with courtesy and respect"
        },
        constructive: {
          title: "Constructive Feedback",
          description: "Focus on solutions and improvement rather than complaints"
        },
        accurate: {
          title: "Accurate Information",
          description: "Provide truthful and verified details in your reports"
        },
        privacy: {
          title: "Privacy Respect",
          description: "Don't share personal information of others without consent"
        }
      },
      issueCategories: {
        title: "Common Issue Categories",
        categories: {
          roads: "🚗 Roads & Transport",
          water: "💧 Water Supply",
          electricity: "⚡ Electricity",
          safety: "🛡️ Public Safety",
          environment: "🌱 Environment",
          health: "🏥 Public Health",
          civic: "🏛️ Civic Services",
          other: "📋 Other Issues"
        }
      },
      footer: {
        title: "Need Help?",
        description: "Can't find what you're looking for? Our support team is here to help.",
        helpCenter: "Help Center",
        contactSupport: "Contact Support"
      }
    },
    hi: {
      title: "समुदायिक दिशानिर्देश",
      subtitle: "सीखें कि समस्याओं की रिपोर्ट कैसे करें और हमारे नयी बरेली प्लेटफॉर्म में कैसे भाग लें",
      reportCard: {
        title: "समस्या रिपोर्ट करें",
        description: "समुदायिक समस्याओं का समाधान के लिए सबमिट करें",
        button: "रिपोर्ट शुरू करें"
      },
      joinCard: {
        title: "समुदाय में शामिल हों",
        description: "पड़ोसियों और स्थानीय अधिकारियों से जुड़ें",
        button: "साइन अप करें"
      },
      privacyCard: {
        title: "गोपनीयता और सुरक्षा",
        description: "आपके डेटा के लिए हमारी प्रतिबद्धता को समझें",
        button: "और जानें"
      },
      reportingGuidelines: {
        title: "प्रभावी समस्या रिपोर्टिंग",
        doThis: "✅ यह करें:",
        doItems: [
          "• स्पष्ट, वर्णनात्मक शीर्षक प्रदान करें",
          "• विशिष्ट स्थान विवरण शामिल करें",
          "• जब सहायक हो तो फोटो जोड़ें",
          "• उपयुक्त प्राथमिकता स्तर चुनें",
          "• सम्मानजनक, रचनात्मक भाषा का उपयोग करें"
        ],
        avoidThis: "❌ यह न करें:",
        avoidItems: [
          "• अस्पष्ट या अनुचित विवरण",
          "• व्यक्तिगत हमले या अनुचित सामग्री",
          "• एक ही समस्या के लिए डुप्लिकेट रिपोर्ट",
          "• आपातकालीन स्थितियां (इसके बजाय 100 कॉल करें)"
        ]
      },
      responseTimes: {
        title: "अपेक्षित प्रतिक्रिया समय",
        emergency: "आपातकालीन समस्याएं",
        high: "उच्च प्राथमिकता",
        medium: "मध्यम प्राथमिकता",
        low: "कम प्राथमिकता",
        note: "संसाधन उपलब्धता और समस्या की जटिलता के आधार पर प्रतिक्रिया समय अलग हो सकता है"
      },
      communityStandards: {
        title: "समुदायिक मानक",
        respectful: {
          title: "सम्मानजनक संवाद",
          description: "सभी समुदायिक सदस्यों के साथ शिष्टाचार और सम्मान के साथ व्यवहार करें"
        },
        constructive: {
          title: "रचनात्मक प्रतिक्रिया",
          description: "शिकायतों के बजाय समाधान और सुधार पर ध्यान दें"
        },
        accurate: {
          title: "सटीक जानकारी",
          description: "अपनी रिपोर्ट में सच्चे और सत्यापित विवरण प्रदान करें"
        },
        privacy: {
          title: "गोपनीयता का सम्मान",
          description: "दूसरों की व्यक्तिगत जानकारी बिना अनुमति के साझा न करें"
        }
      },
      issueCategories: {
        title: "सामान्य समस्या श्रेणियां",
        categories: {
          roads: "🚗 सड़क और परिवहन",
          water: "💧 जल आपूर्ति",
          electricity: "⚡ बिजली",
          safety: "🛡️ सार्वजनिक सुरक्षा",
          environment: "🌱 पर्यावरण",
          health: "🏥 सार्वजनिक स्वास्थ्य",
          civic: "🏛️ नागरिक सेवाएं",
          other: "📋 अन्य समस्याएं"
        }
      },
      footer: {
        title: "सहायता चाहिए?",
        description: "जो आप खोज रहे हैं वह नहीं मिल रहा? हमारी सहायता टीम यहां मदद के लिए है।",
        helpCenter: "सहायता केंद्र",
        contactSupport: "सहायता से संपर्क करें"
      }
    }
  }

  const currentContent = content[language]

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-8">
        {/* Language Toggle */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
            <Button
              variant={language === 'en' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLanguage('en')}
              className="text-xs"
            >
              English
            </Button>
            <Button
              variant={language === 'hi' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLanguage('hi')}
              className="text-xs"
            >
              हिंदी
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <AnimatedHeading as="h1" className="text-4xl font-bold text-slate-900 mb-4">{currentContent.title}</AnimatedHeading>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            {currentContent.subtitle}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <FileText className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
              <CardTitle>{currentContent.reportCard.title}</CardTitle>
              <CardDescription>{currentContent.reportCard.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/report" className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                {currentContent.reportCard.button}
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <CardTitle>{currentContent.joinCard.title}</CardTitle>
              <CardDescription>{currentContent.joinCard.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/login" className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                {currentContent.joinCard.button}
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-slate-800 mx-auto mb-2" />
              <CardTitle>{currentContent.privacyCard.title}</CardTitle>
              <CardDescription>{currentContent.privacyCard.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/privacy" className="inline-flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-purple-700 transition-colors">
                {currentContent.privacyCard.button}
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Guidelines Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Reporting Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                {currentContent.reportingGuidelines.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{currentContent.reportingGuidelines.doThis}</h3>
                <ul className="space-y-1 text-sm">
                  {currentContent.reportingGuidelines.doItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-red-600">{currentContent.reportingGuidelines.avoidThis}</h3>
                <ul className="space-y-1 text-sm text-red-600">
                  {currentContent.reportingGuidelines.avoidItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Response Times */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                {currentContent.responseTimes.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{currentContent.responseTimes.emergency}</span>
                  <Badge variant="destructive">24 {language === 'hi' ? 'घंटे' : 'hours'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{currentContent.responseTimes.high}</span>
                  <Badge variant="secondary">3-5 {language === 'hi' ? 'दिन' : 'days'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{currentContent.responseTimes.medium}</span>
                  <Badge variant="outline">1-2 {language === 'hi' ? 'सप्ताह' : 'weeks'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{currentContent.responseTimes.low}</span>
                  <Badge variant="outline">2-4 {language === 'hi' ? 'सप्ताह' : 'weeks'}</Badge>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-slate-600">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  {currentContent.responseTimes.note}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Community Standards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                {currentContent.communityStandards.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium">{currentContent.communityStandards.respectful.title}</h4>
                <p className="text-sm text-slate-600">{currentContent.communityStandards.respectful.description}</p>
              </div>
              <div>
                <h4 className="font-medium">{currentContent.communityStandards.constructive.title}</h4>
                <p className="text-sm text-slate-600">{currentContent.communityStandards.constructive.description}</p>
              </div>
              <div>
                <h4 className="font-medium">{currentContent.communityStandards.accurate.title}</h4>
                <p className="text-sm text-slate-600">{currentContent.communityStandards.accurate.description}</p>
              </div>
              <div>
                <h4 className="font-medium">{currentContent.communityStandards.privacy.title}</h4>
                <p className="text-sm text-slate-600">{currentContent.communityStandards.privacy.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Issue Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-800" />
                {currentContent.issueCategories.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>{currentContent.issueCategories.categories.roads}</div>
                <div>{currentContent.issueCategories.categories.water}</div>
                <div>{currentContent.issueCategories.categories.electricity}</div>
                <div>{currentContent.issueCategories.categories.safety}</div>
                <div>{currentContent.issueCategories.categories.environment}</div>
                <div>{currentContent.issueCategories.categories.health}</div>
                <div>{currentContent.issueCategories.categories.civic}</div>
                <div>{currentContent.issueCategories.categories.other}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">{currentContent.footer.title}</h3>
          <p className="text-slate-600 mb-4">
            {currentContent.footer.description}
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/help" className="text-emerald-600 hover:underline">
              {currentContent.footer.helpCenter}
            </Link>
            <Link href="/contact" className="text-emerald-600 hover:underline">
              {currentContent.footer.contactSupport}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
