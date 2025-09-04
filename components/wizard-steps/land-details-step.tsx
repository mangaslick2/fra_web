"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface LandDetailsStepProps {
  data: any
  updateData: (updates: any) => void
}

export function LandDetailsStep({ data, updateData }: LandDetailsStepProps) {
  const landTypes = [
    { id: "agricultural", label: "Agricultural Land", description: "For farming and cultivation" },
    { id: "habitation", label: "Habitation", description: "For housing and settlement" },
    { id: "grazing", label: "Grazing Land", description: "For cattle and livestock" },
    { id: "water_body", label: "Water Body", description: "Ponds, wells, streams" },
    { id: "burial_ground", label: "Burial Ground", description: "Traditional burial sites" },
    { id: "other", label: "Other", description: "Other traditional uses" },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Land Details</h2>
        <p className="text-slate-600">Provide details about the land you are claiming</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Land Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="surveyNumber">Survey Number</Label>
              <Input
                id="surveyNumber"
                value={data.surveyNumber}
                onChange={(e) => updateData({ surveyNumber: e.target.value })}
                placeholder="Enter survey number (if known)"
                className="text-base"
              />
              <p className="text-xs text-slate-500">Leave blank if not available</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="areaClaimed">Area Claimed (in hectares) *</Label>
              <Input
                id="areaClaimed"
                type="number"
                step="0.01"
                value={data.areaClaimed}
                onChange={(e) => updateData({ areaClaimed: e.target.value })}
                placeholder="0.00"
                className="text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Land Use Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={data.landType}
            onValueChange={(value) => updateData({ landType: value })}
            className="space-y-3"
          >
            {landTypes.map((type) => (
              <div key={type.id} className="flex items-start space-x-3">
                <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                <Label htmlFor={type.id} className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium text-slate-900">{type.label}</p>
                    <p className="text-sm text-slate-600">{type.description}</p>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {data.landType && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <p className="text-sm text-green-800">
              <strong>Selected Land Use:</strong> {landTypes.find((t) => t.id === data.landType)?.label}
            </p>
            <p className="text-xs text-green-600 mt-1">Make sure this matches your intended use of the land.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
