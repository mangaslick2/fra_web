"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Calendar,
  Camera,
  Mic,
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from "lucide-react"
import Link from "next/link"

interface Meeting {
  id: string
  title: string
  date: string
  time: string
  status: "scheduled" | "ongoing" | "completed"
  attendees: number
  agenda: string[]
  decisions: string[]
}

interface Evidence {
  id: string
  type: "photo" | "audio" | "document"
  description: string
  timestamp: string
  claimId?: string
}

export function GramSabhaHub() {
  const [activeTab, setActiveTab] = useState<"meetings" | "evidence" | "assist">("meetings")
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [assistMode, setAssistMode] = useState(false)

  const meetings: Meeting[] = [
    {
      id: "gs_001",
      title: "Monthly Gram Sabha Meeting",
      date: "2024-01-25",
      time: "10:00 AM",
      status: "scheduled",
      attendees: 0,
      agenda: ["FRA Claims Review", "MGNREGA Work Approval", "Village Development Plans"],
      decisions: [],
    },
    {
      id: "gs_002",
      title: "FRA Claims Special Meeting",
      date: "2024-01-15",
      time: "2:00 PM",
      status: "completed",
      attendees: 32,
      agenda: ["Review 5 new FRA claims", "Asset verification", "Boundary disputes"],
      decisions: [
        "Approved 3 individual claims",
        "Rejected 1 claim due to insufficient evidence",
        "Deferred 1 claim for additional documentation",
      ],
    },
  ]

  const evidence: Evidence[] = [
    {
      id: "ev_001",
      type: "photo",
      description: "Consent photo for Claim #FRA-2024-001",
      timestamp: "2024-01-15 14:30",
      claimId: "FRA-2024-001",
    },
    {
      id: "ev_002",
      type: "audio",
      description: "Verbal consent recording - Ramesh Kumar",
      timestamp: "2024-01-15 14:35",
      claimId: "FRA-2024-001",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "ongoing":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case "photo":
        return <Camera className="w-4 h-4" />
      case "audio":
        return <Mic className="w-4 h-4" />
      case "document":
        return <FileText className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Gram Sabha Hub</h1>
            <p className="text-sm text-gray-600">Meeting management & evidence capture</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex space-x-1">
          {[
            { id: "meetings", label: "Meetings", icon: Calendar },
            { id: "evidence", label: "Evidence", icon: Camera },
            { id: "assist", label: "Assist Mode", icon: HelpCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Meetings Tab */}
      {activeTab === "meetings" && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Scheduled Meetings ({meetings.length})</h3>
            <Button size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>

          {meetings.map((meeting) => (
            <Card
              key={meeting.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedMeeting(meeting)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{meeting.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {meeting.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {meeting.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {meeting.attendees} attendees
                      </span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(meeting.status)}>{meeting.status}</Badge>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Agenda:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {meeting.agenda.slice(0, 2).map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          {item}
                        </li>
                      ))}
                      {meeting.agenda.length > 2 && (
                        <li className="text-xs text-gray-500">+{meeting.agenda.length - 2} more items</li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Evidence Tab */}
      {activeTab === "evidence" && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Captured Evidence ({evidence.length})</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Camera className="w-4 h-4 mr-2" />
                Photo
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsRecording(!isRecording)}
                className={isRecording ? "bg-red-50 text-red-600" : ""}
              >
                <Mic className="w-4 h-4 mr-2" />
                {isRecording ? "Stop" : "Record"}
              </Button>
            </div>
          </div>

          {evidence.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">{getEvidenceIcon(item.type)}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">{item.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{item.timestamp}</span>
                      {item.claimId && (
                        <Badge variant="outline" className="text-xs">
                          {item.claimId}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assist Mode Tab */}
      {activeTab === "assist" && (
        <div className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Enumerator Assist Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Guide users through evidence capture and consent collection with step-by-step assistance.
              </p>

              <Button className="w-full" onClick={() => setAssistMode(!assistMode)}>
                {assistMode ? "Exit Assist Mode" : "Start Assist Mode"}
              </Button>

              {assistMode && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Active Assistance Session</h4>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Claimant identity verified</span>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm">Capture consent photo</span>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Mic className="w-4 h-4 mr-2" />
                        Record Audio
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="w-4 h-4 mr-3" />
                Upload Meeting Minutes
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Users className="w-4 h-4 mr-3" />
                Record Attendance
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <CheckCircle className="w-4 h-4 mr-3" />
                Capture Consent
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <Card className="w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedMeeting.title}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedMeeting(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-semibold">
                    {selectedMeeting.date} at {selectedMeeting.time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Attendees</p>
                  <p className="font-semibold">{selectedMeeting.attendees} people</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Agenda Items</h4>
                <ul className="space-y-2">
                  {selectedMeeting.agenda.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {selectedMeeting.decisions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Decisions Made</h4>
                  <ul className="space-y-2">
                    {selectedMeeting.decisions.map((decision, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {decision}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                {selectedMeeting.status === "scheduled" && <Button className="flex-1">Start Meeting</Button>}
                <Button variant="outline" className="flex-1 bg-transparent">
                  <FileText className="w-4 h-4 mr-2" />
                  View Minutes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
