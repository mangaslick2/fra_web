"use client"

import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { TreePine, Users, Building, Volume2 } from "lucide-react"
import { useState } from "react"

interface ClaimTypeStepProps {
  data: any
  updateData: (updates: any) => void
}

export function ClaimTypeStep({ data, updateData }: ClaimTypeStepProps) {
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)

  const claimTypes = [
    {
      id: "ifr",
      title: "Individual Forest Rights (IFR)",
      description: "व्यक्तिगत वन अधिकार - Individual family rights",
      icon: TreePine,
      details: "For cultivation, habitation, and livelihood needs",
      audio: "Individual Forest Rights are for families who have been living in forest areas...",
    },
    {
      id: "cfr",
      title: "Community Forest Rights (CFR)",
      description: "सामुदायिक वन अधिकार - Community rights",
      icon: Users,
      details: "For grazing, fishing, water bodies, and community needs",
      audio: "Community Forest Rights are for entire villages and communities...",
    },
    {
      id: "cr",
      title: "Community Resource Rights (CR)",
      description: "सामुदायिक संसाधन अधिकार - Resource management",
      icon: Building,
      details: "For sustainable use and conservation of forest resources",
      audio: "Community Resource Rights allow communities to protect and manage forests...",
    },
  ]

  const playAudio = (typeId: string) => {
    setPlayingAudio(typeId)
    // Simulate audio playback
    setTimeout(() => setPlayingAudio(null), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">वन अधिकार का प्रकार चुनें</h2>
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Select Claim Type</h3>
        <p className="text-slate-600">Choose the type of forest rights you want to claim</p>
      </div>

      <RadioGroup
        value={data.claimType}
        onValueChange={(value) => updateData({ claimType: value })}
        className="space-y-4"
      >
        {claimTypes.map((type) => (
          <div key={type.id} className="relative">
            <RadioGroupItem value={type.id} id={type.id} className="peer sr-only" />
            <Label htmlFor={type.id} className="flex cursor-pointer">
              <Card className="w-full border-2 border-slate-200 peer-checked:border-green-600 peer-checked:bg-green-50 hover:border-slate-300 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-green-100 rounded-lg">
                      <type.icon className="h-8 w-8 text-green-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900 mb-2">{type.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">{type.description}</p>
                      <p className="text-xs text-slate-500 mb-3">{type.details}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          playAudio(type.id)
                        }}
                        className="flex items-center gap-2"
                        disabled={playingAudio === type.id}
                      >
                        <Volume2 className="h-4 w-4" />
                        {playingAudio === type.id ? "Playing..." : "Listen Explanation"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Label>
          </div>
        ))}
      </RadioGroup>

      {data.claimType && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <p className="text-sm text-green-800">
              <strong>Selected:</strong> {claimTypes.find((t) => t.id === data.claimType)?.title}
            </p>
            <p className="text-xs text-green-600 mt-1">आप बाद में इसे बदल सकते हैं - You can change this later if needed.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
