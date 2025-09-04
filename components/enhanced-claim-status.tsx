"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Clock, XCircle, AlertCircle, FileText, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Claim {
  id: string
  claim_id: string
  claim_type: string
  status: string
  submission_date: string
  reviewed_at?: string
  reviewer_notes?: string
  land_area: number
  location_description: string
}

interface EnhancedClaimStatusProps {
  claimId: string
}

export function EnhancedClaimStatus({ claimId }: EnhancedClaimStatusProps) {
  const [claim, setClaim] = useState<Claim | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClaimDetails()
  }, [claimId])

  const fetchClaimDetails = async () => {
    try {
      const response = await fetch(`/api/claims/${claimId}`)
      const data = await response.json()

      if (data.claim) {
        setClaim(data.claim)
      }
    } catch (error) {
      console.error("Error fetching claim details:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "under_review":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "under_review":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!claim) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Claim not found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Claim {claim.claim_id}</span>
          <Badge className={getStatusColor(claim.status)}>{claim.status.replace("_", " ").toUpperCase()}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon(claim.status)}
          <div>
            <p className="font-medium">Current Status</p>
            <p className="text-sm text-gray-600">
              {claim.status === "approved" && "Your claim has been approved!"}
              {claim.status === "rejected" && "Your claim has been rejected"}
              {claim.status === "under_review" && "Your claim is being reviewed"}
              {claim.status === "submitted" && "Your claim has been submitted"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Claim Type</p>
              <p className="text-sm text-gray-600">{claim.claim_type.toUpperCase()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Land Area</p>
              <p className="text-sm text-gray-600">{claim.land_area} hectares</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Location</p>
          <p className="text-sm text-gray-600">{claim.location_description}</p>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Submitted</p>
          <p className="text-sm text-gray-600">{new Date(claim.submission_date).toLocaleDateString()}</p>
        </div>

        {claim.reviewer_notes && (
          <div>
            <p className="text-sm font-medium mb-1">Review Notes</p>
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{claim.reviewer_notes}</p>
          </div>
        )}

        {claim.reviewed_at && (
          <div>
            <p className="text-sm font-medium mb-1">Last Updated</p>
            <p className="text-sm text-gray-600">{new Date(claim.reviewed_at).toLocaleDateString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
