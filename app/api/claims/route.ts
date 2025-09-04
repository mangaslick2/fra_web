import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const status = searchParams.get("status")

  try {
    let query = supabase
      .from("claims")
      .select(`
        *,
        profiles:claimant_id(full_name, phone, village),
        documents(*)
      `)
      .order("created_at", { ascending: false })

    if (userId) {
      query = query.eq("claimant_id", userId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    const { data: claims, error } = await query

    if (error) throw error

    return NextResponse.json({ claims })
  } catch (error) {
    console.error("Error fetching claims:", error)
    return NextResponse.json({ error: "Failed to fetch claims" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const body = await request.json()
    const { claim_type, land_area, location_description, boundary_coordinates, claimant_id } = body

    // Generate claim ID
    const claimId = `FRA${Date.now()}`

    const { data: claim, error } = await supabase
      .from("claims")
      .insert({
        claim_id: claimId,
        claim_type,
        land_area: Number.parseFloat(land_area),
        location_description,
        boundary_coordinates,
        claimant_id,
        status: "submitted",
        submission_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ claim, claimId })
  } catch (error) {
    console.error("Error creating claim:", error)
    return NextResponse.json({ error: "Failed to create claim" }, { status: 500 })
  }
}
