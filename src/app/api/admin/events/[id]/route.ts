import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from "@/lib/database";
import { Event } from "@/lib/schemas";
import mongoose from "mongoose";

// DELETE /api/admin/events/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const headers = { "Content-Type": "application/json" } as const;

  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
    }

    // Validate id param
    const id = params?.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid or missing event id" }, { status: 400, headers });
    }

    // DB and delete
    await connectDB();
    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Event not found" }, { status: 404, headers });
    }

    return NextResponse.json(
      { success: true, message: "Event deleted", event: deleted },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete event",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers }
    );
  }
}