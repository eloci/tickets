import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/database";
import { Event, User } from "@/lib/schemas";
import mongoose from "mongoose";

interface EventData {
  title: string;
  description: string;
  date: Date;
  time: string;
  venue: string;
  address: string;
  city: string;
  imageUrl: string;
  status: string;
  organizer?: mongoose.Types.ObjectId;
}

export async function GET(request: NextRequest) {
  try {
    console.log("Events fetch request received...");
    
    // Set proper content type header to ensure JSON response
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      console.log("User not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
    }
    console.log("User authenticated:", userId);

    // Connect to database
    await connectDB();
    console.log("Database connected");

    // Get all events
    const events = await Event.find().sort({ createdAt: -1 });
    console.log("Retrieved events:", events.length);

    return NextResponse.json({ 
      success: true,
      events 
    }, { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch events",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Event creation request received...");
    
    // Set proper content type header to ensure JSON response
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      console.log("User not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
    }
    console.log("User authenticated:", userId);

    // Connect to database
    await connectDB();
    console.log("Database connected");

    // Parse request body
    const body = await request.json();
    console.log("Event data received:", body);

    // Minimal validation
    if (!body.title || !body.date) {
      return NextResponse.json({ error: "Missing required fields: title and date" }, { status: 400, headers });
    }

    // Extract only the fields that belong to the Event schema
    // Ignore ticketTiers and other fields that should be in separate collections
    let eventDate: Date;
    try {
      eventDate = new Date(body.date);
      if (isNaN(eventDate.getTime())) {
        throw new Error("Invalid date format");
      }
    } catch (err) {
      console.error("Invalid date provided:", body.date);
      return NextResponse.json({ error: "Invalid date format. Please provide a valid date." }, { status: 400, headers });
    }

    const eventFields = {
      title: body.title,
      description: body.description || "",
      date: eventDate,
      time: body.time || "",
      venue: body.venue || "",
      address: body.address || "",
      city: body.city || "",
      imageUrl: body.imageUrl || body.image || "", // Support both imageUrl and image for compatibility
      status: body.status || "DRAFT"
    };

    // Try to resolve organizer to User ObjectId (required for MongoDB schema)
    let organizerId = undefined;
    try {
      const organizer = await User.findOne({ clerkId: userId });
      if (organizer?._id) {
        organizerId = organizer._id;
        console.log("Found user in database, using ObjectId:", organizerId);
      } else {
        console.log("User not found in database, organizer will be omitted");
      }
    } catch (err) {
      console.log("Error finding user:", err);
      // Don't fall back to using clerkId directly since it's not an ObjectId
    }

    // Create new event - map to actual schema fields
    const eventData: EventData = {
      ...eventFields
    };
    
    // Only add organizer if we found a valid ObjectId
    if (organizerId) {
      eventData.organizer = organizerId;
    }
    
    const event = new Event(eventData);

    const savedEvent = await event.save();
    console.log("Event created successfully:", savedEvent._id);

    return NextResponse.json({ 
      success: true,
      event: savedEvent 
    }, { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to create event",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("Event deletion request received...");
    
    // Set proper content type header to ensure JSON response
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      console.log("User not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
    }
    console.log("User authenticated:", userId);

    // Connect to database
    await connectDB();
    console.log("Database connected");

    // Get event ID from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const eventId = pathParts[pathParts.length - 1]; // Get the last part of the path
    
    if (!eventId || eventId === 'events') {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400, headers });
    }

    console.log("Attempting to delete event:", eventId);

    // Find and delete the event
    const deletedEvent = await Event.findByIdAndDelete(eventId);
    
    if (!deletedEvent) {
      console.log("Event not found:", eventId);
      return NextResponse.json({ error: "Event not found" }, { status: 404, headers });
    }

    console.log("Event deleted successfully:", deletedEvent._id);

    return NextResponse.json({ 
      success: true,
      message: "Event deleted successfully",
      event: deletedEvent
    }, { 
      status: 200,
      headers
    });

  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to delete event",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}