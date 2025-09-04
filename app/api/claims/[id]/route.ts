import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient()

  try {
    const { data: claim, error } = await supabase
      .from("claims")
      .select(`
        *,
        profiles:claimant_id(full_name, phone, village, user_type),
        documents(*),
        assets(*)
      `)
      .eq("id", params.id)
      .single()

    if (error) throw error

    return NextResponse.json({ claim })
  } catch (error) {
    console.error("Error fetching claim:", error)
    return NextResponse.json({ error: "Failed to fetch claim" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient()

  try {
    const body = await request.json()
    const { status, reviewer_notes, reviewed_by } = body

    const { data: claim, error } = await supabase
      .from("claims")
      .update({
        status,
        reviewer_notes,
        reviewed_by,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ claim })
  } catch (error) {
    console.error("Error updating claim:", error)
    return NextResponse.json({ error: "Failed to update claim" }, { status: 500 })
  }
}
