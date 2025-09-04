import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(request.url)
  const claimId = searchParams.get("claimId")
  const assetType = searchParams.get("type")

  try {
    let query = supabase
      .from("assets")
      .select(`
        *,
        claims:claim_id(claim_id, location_description)
      `)
      .order("detected_at", { ascending: false })

    if (claimId) {
      query = query.eq("claim_id", claimId)
    }

    if (assetType) {
      query = query.eq("asset_type", assetType)
    }

    const { data: assets, error } = await query

    if (error) throw error

    return NextResponse.json({ assets })
  } catch (error) {
    console.error("Error fetching assets:", error)
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const body = await request.json()
    const { claim_id, asset_type, coordinates, confidence_score, satellite_image_url, detection_metadata } = body

    const { data: asset, error } = await supabase
      .from("assets")
      .insert({
        claim_id,
        asset_type,
        coordinates,
        confidence_score: Number.parseFloat(confidence_score),
        satellite_image_url,
        detection_metadata,
        detected_at: new Date().toISOString(),
        verification_status: "pending",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ asset })
  } catch (error) {
    console.error("Error creating asset:", error)
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 })
  }
}
