"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PersonalInfoStepProps {
  data: any
  updateData: (updates: any) => void
}

export function PersonalInfoStep({ data, updateData }: PersonalInfoStepProps) {
  const districts = [
    "Bastar",
    "Bilaspur",
    "Dantewada",
    "Dhamtari",
    "Durg",
    "Jashpur",
    "Kanker",
    "Korba",
    "Raigarh",
    "Raipur",
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Personal Information</h2>
        <p className="text-slate-600">Enter your personal details for the claim</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Claimant Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="claimantName">Full Name *</Label>
              <Input
                id="claimantName"
                value={data.claimantName}
                onChange={(e) => updateData({ claimantName: e.target.value })}
                placeholder="Enter your full name"
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherName">Father's Name *</Label>
              <Input
                id="fatherName"
                value={data.fatherName}
                onChange={(e) => updateData({ fatherName: e.target.value })}
                placeholder="Enter father's name"
                className="text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={data.phone}
              onChange={(e) => updateData({ phone: e.target.value })}
              placeholder="Enter 10-digit mobile number"
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={data.address}
              onChange={(e) => updateData({ address: e.target.value })}
              placeholder="Enter your complete address"
              className="text-base min-h-20"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Location Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <Select value={data.district} onValueChange={(value) => updateData({ district: value })}>
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="block">Block/Tehsil *</Label>
              <Input
                id="block"
                value={data.block}
                onChange={(e) => updateData({ block: e.target.value })}
                placeholder="Enter block name"
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="village">Village *</Label>
              <Input
                id="village"
                value={data.village}
                onChange={(e) => updateData({ village: e.target.value })}
                placeholder="Enter village name"
                className="text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
