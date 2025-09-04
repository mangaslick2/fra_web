import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get recent claim status updates for the user
    const { data: claims, error: claimsError } = await supabase
      .from("claims")
      .select("id, claim_id, status, reviewed_at, reviewer_notes")
      .eq("claimant_id", user.id)
      .not("reviewed_at", "is", null)
      .order("reviewed_at", { ascending: false })
      .limit(10)

    if (claimsError) throw claimsError

    // Transform claims into notifications
    const notifications = claims.map((claim) => ({
      id: `claim-${claim.id}`,
      type: "claim_update",
      title: `Claim ${claim.claim_id} ${claim.status}`,
      message: claim.reviewer_notes || `Your claim status has been updated to ${claim.status}`,
      timestamp: claim.reviewed_at,
      read: false,
    }))

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
