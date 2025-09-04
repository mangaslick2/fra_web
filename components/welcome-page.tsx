"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Map, FileText, User, Volume2, Globe, ChevronRight } from "lucide-react"
import Link from "next/link"

export function WelcomePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("हिंदी")

  const playAudioIntro = () => {
    setIsPlaying(true)
    // In real implementation, play actual audio file
    setTimeout(() => setIsPlaying(false), 30000) // Simulate 30-second audio
  }

  const languages = [
    { code: "hi", name: "हिंदी", label: "Hindi" },
    { code: "en", name: "English", label: "English" },
    { code: "or", name: "ଓଡ଼ିଆ", label: "Odia" },
    { code: "bn", name: "বাংলা", label: "Bengali" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      {/* Enhanced Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">FRA</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Forest Rights Portal</h1>
              <p className="text-sm text-slate-600">वन अधिकार पोर्टल</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="p-2 h-10 w-10 rounded-lg">
            <User className="h-5 w-5 text-slate-600" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        <div className="max-w-md mx-auto space-y-8">
          {/* Welcome Message */}
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Map className="h-12 w-12 text-green-600" />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-slate-900">स्वागत है</h2>
              <h3 className="text-xl font-semibold text-slate-800">Welcome to FRA Portal</h3>
              <p className="text-slate-600 text-base leading-relaxed px-4">
                File and track your forest rights claims with ease
              </p>
              <p className="text-slate-500 text-sm px-4">अपने वन अधिकार दावों को आसानी से दर्ज करें और ट्रैक करें</p>
            </div>

            {/* Enhanced Audio Introduction */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
              <div className="flex items-center gap-4">
                <Button
                  onClick={playAudioIntro}
                  disabled={isPlaying}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-12 w-12 rounded-xl shadow-sm"
                  size="sm"
                >
                  {isPlaying ? <Volume2 className="h-5 w-5 animate-pulse" /> : <Play className="h-5 w-5" />}
                </Button>
                <div className="text-left flex-1">
                  <p className="text-base font-medium text-blue-900">Audio Introduction</p>
                  <p className="text-sm text-blue-700">ऑडियो परिचय • Learn how to use this portal</p>
                  {isPlaying && (
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-1">
                      <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: "30%" }}></div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Enhanced Main Action Buttons */}
          <div className="space-y-4">
            <Link href="/map" className="block">
              <Card className="p-0 border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-green-600 to-green-700 text-white overflow-hidden">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <Map className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Open FRA Atlas</p>
                      <p className="text-sm opacity-90">एफआरए एटलस खोलें</p>
                      <p className="text-xs opacity-75 mt-1">View forest boundaries & claims</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 opacity-75" />
                </div>
              </Card>
            </Link>

            <Link href="/claims/new" className="block">
              <Card className="p-0 border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white overflow-hidden">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">File New Claim</p>
                      <p className="text-sm opacity-90">नया दावा दर्ज करें</p>
                      <p className="text-xs opacity-75 mt-1">Step-by-step guided process</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 opacity-75" />
                </div>
              </Card>
            </Link>

            <Link href="/my-claims" className="block">
              <Card className="p-0 border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-orange-600 to-orange-700 text-white overflow-hidden">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">My Claims</p>
                      <p className="text-sm opacity-90">मेरे दावे</p>
                      <p className="text-xs opacity-75 mt-1">Track status & updates</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 opacity-75" />
                </div>
              </Card>
            </Link>
          </div>

          {/* Enhanced Quick Stats */}
          <Card className="p-6 bg-white border-slate-200 shadow-sm">
            <h4 className="text-sm font-medium text-slate-900 mb-4 text-center">National Statistics</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">2.4M</p>
                <p className="text-xs text-slate-600 mt-1">Claims Filed</p>
                <p className="text-xs text-slate-500">दावे दर्ज</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">1.8M</p>
                <p className="text-xs text-slate-600 mt-1">Approved</p>
                <p className="text-xs text-slate-500">स्वीकृत</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-xl">
                <p className="text-2xl font-bold text-orange-600">156K</p>
                <p className="text-xs text-slate-600 mt-1">Pending</p>
                <p className="text-xs text-slate-500">लंबित</p>
              </div>
            </div>
          </Card>

          {/* Enhanced Language Selector */}
          <Card className="p-4 bg-white border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Select Language / भाषा चुनें</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={selectedLanguage === lang.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLanguage(lang.name)}
                  className="text-sm h-10 justify-start"
                >
                  <span className="font-medium">{lang.name}</span>
                </Button>
              ))}
            </div>
          </Card>

          {/* Quick Access Links */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/help">
              <Button variant="outline" className="w-full h-12 text-sm bg-white border-slate-200 shadow-sm">
                Help & Training
              </Button>
            </Link>
            <Link href="/gram-sabha">
              <Button variant="outline" className="w-full h-12 text-sm bg-white border-slate-200 shadow-sm">
                Gram Sabha
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
