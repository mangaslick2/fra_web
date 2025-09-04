"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Play, Phone, MessageCircle, Volume2, Search, HelpCircle, Languages, Headphones } from "lucide-react"

export function HelpTraining() {
  const [selectedLanguage, setSelectedLanguage] = useState("hindi")
  const [searchQuery, setSearchQuery] = useState("")

  const tutorials = [
    {
      id: 1,
      title: "How to File Your First Claim",
      titleHindi: "अपना पहला दावा कैसे दर्ज करें",
      duration: "3:45",
      difficulty: "Beginner",
      description: "Step-by-step guide to filing your forest rights claim",
      descriptionHindi: "वन अधिकार दावा दर्ज करने की चरणबद्ध गाइड",
    },
    {
      id: 2,
      title: "Understanding Different Claim Types",
      titleHindi: "विभिन्न दावा प्रकारों को समझना",
      duration: "5:20",
      difficulty: "Beginner",
      description: "Learn about IFR, CFR, and Community Rights",
      descriptionHindi: "IFR, CFR और सामुदायिक अधिकारों के बारे में जानें",
    },
    {
      id: 3,
      title: "Document Preparation Guide",
      titleHindi: "दस्तावेज तैयारी गाइड",
      duration: "4:15",
      difficulty: "Intermediate",
      description: "What documents you need and how to prepare them",
      descriptionHindi: "आपको कौन से दस्तावेज चाहिए और उन्हें कैसे तैयार करें",
    },
    {
      id: 4,
      title: "Using the Map Interface",
      titleHindi: "मैप इंटरफेस का उपयोग",
      duration: "6:30",
      difficulty: "Intermediate",
      description: "Navigate and mark boundaries on the FRA Atlas",
      descriptionHindi: "FRA एटलस पर नेविगेट करें और सीमाएं चिह्नित करें",
    },
  ]

  const faqs = [
    {
      question: "What is the Forest Rights Act?",
      questionHindi: "वन अधिकार अधिनियम क्या है?",
      answer:
        "The Forest Rights Act (FRA) 2006 recognizes and vests forest rights and occupation in forest land in forest dwelling Scheduled Tribes and other traditional forest dwellers.",
      answerHindi:
        "वन अधिकार अधिनियम (FRA) 2006 वन भूमि में निवास करने वाली अनुसूचित जनजातियों और अन्य पारंपरिक वन निवासियों के वन अधिकारों और कब्जे को मान्यता देता है।",
    },
    {
      question: "Who can file a claim under FRA?",
      questionHindi: "FRA के तहत कौन दावा दर्ज कर सकता है?",
      answer:
        "Scheduled Tribes and other traditional forest dwellers who have been residing in forest areas before 13th December 2005 can file claims.",
      answerHindi:
        "अनुसूचित जनजातियां और अन्य पारंपरिक वन निवासी जो 13 दिसंबर 2005 से पहले से वन क्षेत्रों में निवास कर रहे हैं, वे दावा दर्ज कर सकते हैं।",
    },
    {
      question: "What documents are required?",
      questionHindi: "कौन से दस्तावेज आवश्यक हैं?",
      answer:
        "You need proof of residence, occupation evidence, community verification, and boundary documents. Our app helps you prepare these.",
      answerHindi:
        "आपको निवास प्रमाण, कब्जे का साक्ष्य, सामुदायिक सत्यापन और सीमा दस्तावेज चाहिए। हमारा ऐप इन्हें तैयार करने में मदद करता है।",
    },
    {
      question: "How long does the process take?",
      questionHindi: "प्रक्रिया में कितना समय लगता है?",
      answer:
        "The process typically takes 6-12 months, depending on the complexity of the claim and verification requirements.",
      answerHindi: "दावे की जटिलता और सत्यापन आवश्यकताओं के आधार पर प्रक्रिया में आमतौर पर 6-12 महीने लगते हैं।",
    },
  ]

  const contacts = [
    {
      name: "Bastar District Collector",
      nameHindi: "बस्तर जिला कलेक्टर",
      phone: "+91-7782-222001",
      email: "collector.bastar@gov.in",
      role: "District Administration",
      roleHindi: "जिला प्रशासन",
    },
    {
      name: "Gram Sabha Secretary - Kumhali",
      nameHindi: "ग्राम सभा सचिव - कुम्हाली",
      phone: "+91-9876543210",
      role: "Village Level",
      roleHindi: "गांव स्तर",
    },
    {
      name: "FRA Support NGO - Ekta Parishad",
      nameHindi: "FRA सहायता NGO - एकता परिषद",
      phone: "+91-9123456789",
      email: "help@ektaparishad.org",
      role: "Support Organization",
      roleHindi: "सहायता संगठन",
    },
  ]

  const filteredFAQs = faqs.filter(
    (faq) => faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.questionHindi.includes(searchQuery),
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {selectedLanguage === "hindi" ? "सहायता और प्रशिक्षण" : "Help & Training"}
              </h1>
              <p className="text-slate-600 mt-1">
                {selectedLanguage === "hindi"
                  ? "FRA दावा प्रक्रिया के लिए गाइड और सहायता"
                  : "Guides and support for the FRA claims process"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedLanguage === "hindi" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLanguage("hindi")}
              >
                <Languages className="h-4 w-4 mr-2" />
                हिंदी
              </Button>
              <Button
                variant={selectedLanguage === "english" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLanguage("english")}
              >
                <Languages className="h-4 w-4 mr-2" />
                English
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Play className="h-8 w-8 mx-auto text-blue-600 mb-3" />
              <h3 className="font-semibold text-slate-900">
                {selectedLanguage === "hindi" ? "प्रैक्टिस मोड" : "Practice Mode"}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {selectedLanguage === "hindi"
                  ? "बिना सबमिट किए दावा दर्ज करने का अभ्यास करें"
                  : "Practice filing a claim without submitting"}
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Headphones className="h-8 w-8 mx-auto text-green-600 mb-3" />
              <h3 className="font-semibold text-slate-900">
                {selectedLanguage === "hindi" ? "ऑडियो गाइड" : "Audio Guides"}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {selectedLanguage === "hindi" ? "चरणबद्ध ऑडियो निर्देश सुनें" : "Listen to step-by-step audio instructions"}
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 mx-auto text-purple-600 mb-3" />
              <h3 className="font-semibold text-slate-900">
                {selectedLanguage === "hindi" ? "सहायता चैट" : "Help Chat"}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {selectedLanguage === "hindi" ? "तुरंत सहायता के लिए चैट करें" : "Chat for immediate assistance"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tutorials" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tutorials">{selectedLanguage === "hindi" ? "ट्यूटोरियल" : "Tutorials"}</TabsTrigger>
            <TabsTrigger value="faqs">{selectedLanguage === "hindi" ? "सामान्य प्रश्न" : "FAQs"}</TabsTrigger>
            <TabsTrigger value="contacts">{selectedLanguage === "hindi" ? "संपर्क" : "Contacts"}</TabsTrigger>
          </TabsList>

          <TabsContent value="tutorials" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tutorials.map((tutorial) => (
                <Card key={tutorial.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {selectedLanguage === "hindi" ? tutorial.titleHindi : tutorial.title}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {selectedLanguage === "hindi" ? tutorial.descriptionHindi : tutorial.description}
                        </p>
                      </div>
                      <Play className="h-5 w-5 text-blue-600 ml-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{tutorial.duration}</Badge>
                        <Badge variant="secondary">{tutorial.difficulty}</Badge>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Volume2 className="h-4 w-4 mr-1" />
                        {selectedLanguage === "hindi" ? "सुनें" : "Listen"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="faqs" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Input
                placeholder={selectedLanguage === "hindi" ? "प्रश्न खोजें..." : "Search questions..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {filteredFAQs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-2">
                          {selectedLanguage === "hindi" ? faq.questionHindi : faq.question}
                        </h3>
                        <p className="text-slate-600">{selectedLanguage === "hindi" ? faq.answerHindi : faq.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map((contact, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {selectedLanguage === "hindi" ? contact.nameHindi : contact.name}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {selectedLanguage === "hindi" ? contact.roleHindi : contact.role}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-500" />
                          <span className="text-sm">{contact.phone}</span>
                        </div>
                        {contact.email && (
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-slate-500" />
                            <span className="text-sm">{contact.email}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <Phone className="h-4 w-4 mr-1" />
                          {selectedLanguage === "hindi" ? "कॉल करें" : "Call"}
                        </Button>
                        {contact.email && (
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {selectedLanguage === "hindi" ? "ईमेल" : "Email"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
