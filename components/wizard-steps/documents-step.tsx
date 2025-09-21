"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Camera, Mic, CheckCircle, Loader2, Wand2 } from "lucide-react"
import { useState, useRef } from "react"
import { nerService, ExtractedEntities } from "@/lib/ner-service"
import { useToast } from "@/hooks/use-toast"

interface DocumentsStepProps {
  data: any
  updateData: (updates: any) => void
}

export function DocumentsStep({ data, updateData }: DocumentsStepProps) {
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)
  const [ocrProcessing, setOcrProcessing] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const requiredDocs = [
    {
      id: "identity",
      name: "पहचान प्रमाण / Identity Proof",
      required: true,
      description: "आधार, वोटर आईडी, या राशन कार्ड / Aadhaar, Voter ID, or Ration Card",
      uploaded: false,
    },
    {
      id: "residence",
      name: "निवास प्रमाण / Residence Proof",
      required: true,
      description: "क्षेत्र में निवास दिखाने वाला कोई दस्तावेज / Any document showing residence in the area",
      uploaded: false,
    },
    {
      id: "land_records",
      name: "भूमि रिकॉर्ड / Land Records",
      required: false,
      description: "राजस्व रिकॉर्ड, बंदोबस्त रिकॉर्ड (यदि उपलब्ध हो) / Revenue records, settlement records (if available)",
      uploaded: false,
    },
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleFileUpload = async (file: File) => {
    setOcrProcessing(file.name)
    try {
      const extractedData = await nerService.extractEntitiesFromFile(file)

      // Update the main claim data with extracted entities
      const updates: Partial<any> = {}
      if (extractedData.claimantName) updates.claimantName = extractedData.claimantName
      if (extractedData.fatherName) updates.fatherName = extractedData.fatherName
      if (extractedData.address) updates.address = extractedData.address
      if (extractedData.village) updates.village = extractedData.village
      if (extractedData.district) updates.district = extractedData.district
      if (extractedData.block) updates.block = extractedData.block
      updateData(updates)

      // Add the document to the list
      const newDocument = {
        id: file.name,
        name: file.name,
        file: file,
        ocrData: extractedData,
      }
      const updatedDocs = [...(data.documents || []), newDocument]
      updateData({ documents: updatedDocs })

      toast({
        title: "AI Analysis Complete",
        description: "Information has been automatically extracted from your document.",
      })
    } catch (error) {
      console.error("NER processing failed:", error)
      toast({
        title: "AI Analysis Failed",
        description: "Could not extract information from the document. Please enter it manually.",
        variant: "destructive",
      })
    } finally {
      setOcrProcessing(null)
    }
  }

  const captureDocument = (docId: string) => {
    setUploadingDoc(docId)
    // Simulate camera capture
    setTimeout(() => {
      setUploadingDoc(null)
      setOcrProcessing(docId)
      // Simulate OCR processing
      setTimeout(() => {
        const updatedDocs = data.documents || []
        updatedDocs.push({
          id: docId,
          name: `${docId}_document.jpg`,
          ocrData: {
            name: "राम कुमार Singh",
            fatherName: "श्याम लाल Singh",
            address: "Village Saraykela, Block Saraykela",
          },
        })
        updateData({ documents: updatedDocs })
        setOcrProcessing(null)
      }, 3000)
    }, 1500)
  }

  const toggleAudioRecording = () => {
    setRecording(!recording)
    if (!recording) {
      setTimeout(() => {
        setRecording(false)
        updateData({
          audioTestimony: new File([], "gram_sabha_testimony.mp3"),
          audioTranscript:
            "मैं राम कुमार, पुत्र श्याम लाल, गांव सरायकेला का निवासी हूं। मैं पिछले 20 सालों से इस जमीन पर खेती कर रहा हूं...",
        })
      }, 5000)
    }
  }

  const isDocUploaded = (docId: string) => {
    return data.documents?.some((doc: any) => doc.id === docId)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">दस्तावेज़ स्कैन करें</h2>
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Scan Documents</h3>
        <p className="text-slate-600">Take photos of your supporting documents</p>
      </div>

      {/* AI-Powered Digitization Card */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Wand2 className="h-5 w-5" />
            AI-Powered Digitization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-purple-800 mb-4">
            Upload a document (like an Aadhaar card or land record) and our AI will automatically fill in the details
            for you.
          </p>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,.pdf" />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={!!ocrProcessing}
            className="w-full h-16 text-lg bg-purple-600 hover:bg-purple-700"
          >
            {ocrProcessing ? (
              <>
                <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                Analyzing Document...
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 mr-2" />
                Upload and Analyze Document
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Audio Testimony Card */}
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <Mic className="h-5 w-5" />
            ग्राम सभा गवाही / Audio Testimony
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-orange-800">
            Record your testimony about living in the forest area (optional but helpful)
          </p>

          {!data.audioTestimony ? (
            <Button
              onClick={toggleAudioRecording}
              disabled={recording}
              className={`w-full h-16 text-lg ${recording ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"}`}
            >
              {recording ? (
                <>
                  <div className="animate-pulse w-3 h-3 bg-white rounded-full mr-2" />
                  Recording... ({recording ? "0:05" : "0:00"})
                </>
              ) : (
                <>
                  <Mic className="h-6 w-6 mr-2" />
                  Record Audio Testimony
                </>
              )}
            </Button>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-800 font-medium">Audio testimony recorded!</p>
              </div>
              <p className="text-sm text-green-600 mt-1">Duration: 5 minutes</p>
              <Button variant="outline" size="sm" onClick={toggleAudioRecording} className="mt-2 bg-transparent">
                Record Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Upload Cards */}
      <div className="space-y-4">
        {requiredDocs.map((doc) => (
          <Card key={doc.id} className={isDocUploaded(doc.id) ? "border-green-200 bg-green-50" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {doc.name}
                  {doc.required && !isDocUploaded(doc.id) && (
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  )}
                  {isDocUploaded(doc.id) && (
                    <Badge className="text-xs bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Uploaded
                    </Badge>
                  )}
                </CardTitle>
              </div>
              <p className="text-sm text-slate-600">{doc.description}</p>
            </CardHeader>
            <CardContent className="pt-0">
              {!isDocUploaded(doc.id) ? (
                <div className="space-y-4">
                  {/* Camera-First Approach */}
                  <Button
                    onClick={() => captureDocument(doc.id)}
                    disabled={uploadingDoc === doc.id || ocrProcessing === doc.id}
                    className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700"
                  >
                    {uploadingDoc === doc.id ? (
                      <>
                        <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                        Taking Photo...
                      </>
                    ) : ocrProcessing === doc.id ? (
                      <>
                        <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                        Processing OCR...
                      </>
                    ) : (
                      <>
                        <Camera className="h-6 w-6 mr-2" />
                        Take Photo of Document
                      </>
                    )}
                  </Button>

                  {/* Alternative Upload */}
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                    <Upload className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-2">Or choose from gallery</p>
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-green-800 font-medium">Document captured successfully!</p>
                  </div>

                  {/* Show OCR extracted data */}
                  {data.documents?.find((d: any) => d.id === doc.id)?.ocrData && (
                    <div className="bg-white p-3 rounded border mt-2">
                      <p className="text-xs text-slate-500 mb-1">OCR Extracted Data:</p>
                      <div className="text-sm space-y-1">
                        <p>
                          <strong>Name:</strong> {data.documents.find((d: any) => d.id === doc.id).ocrData.claimantName}
                        </p>
                        <p>
                          <strong>Father's Name:</strong>{" "}
                          {data.documents.find((d: any) => d.id === doc.id).ocrData.fatherName}
                        </p>
                        <p>
                          <strong>Address:</strong> {data.documents.find((d: any) => d.id === doc.id).ocrData.address}
                        </p>
                        <p>
                          <strong>Village:</strong> {data.documents.find((d: any) => d.id === doc.id).ocrData.village}
                        </p>
                        <p>
                          <strong>District:</strong> {data.documents.find((d: any) => d.id === doc.id).ocrData.district}
                        </p>
                        <p>
                          <strong>Block:</strong> {data.documents.find((d: any) => d.id === doc.id).ocrData.block}
                        </p>
                      </div>
                    </div>
                  )}

                  <Button variant="outline" size="sm" onClick={() => captureDocument(doc.id)} className="mt-2">
                    Retake Photo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">📸 Photo Guidelines:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Hold camera steady and ensure good lighting</li>
            <li>• Make sure all text is clearly visible</li>
            <li>• OCR will automatically extract information</li>
            <li>• You can retake photos if needed</li>
            <li>• Audio testimony helps strengthen your case</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
