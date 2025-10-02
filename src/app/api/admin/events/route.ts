import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/database";
import { Event, User, Category } from "@/lib/schemas";
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

    // Get all events with category data
    const events = await Event.find().sort({ createdAt: -1 });
    console.log("Retrieved events:", events.length);

    // Calculate ticket data for each event
    const eventsWithTicketData = await Promise.all(
      events.map(async (event) => {
        // Get categories for this event
        const categories = await Category.find({ event: event._id });

        // Calculate totals
        const totalCapacity = categories.reduce((sum, cat) => sum + cat.totalTickets, 0);
        const totalSold = categories.reduce((sum, cat) => sum + cat.soldTickets, 0);
        const minPrice = categories.length > 0 ? Math.min(...categories.map(cat => cat.price)) : 0;
        const remainingSpots = Math.max(0, totalCapacity - totalSold);

        // Calculate availability status
        let availabilityStatus = 'available';
        if (remainingSpots === 0 && totalCapacity > 0) {
          availabilityStatus = 'sold_out';
        } else if (totalCapacity > 0 && (remainingSpots / totalCapacity) <= 0.1) {
          availabilityStatus = 'limited';
        }

        console.log(`Event ${event.title}: ${categories.length} categories, ${totalSold}/${totalCapacity} sold, status: ${availabilityStatus}`);

        return {
          ...event.toObject(),
          // Add calculated fields
          totalCapacity,
          totalSold,
          remainingSpots,
          minPrice,
          categoriesCount: categories.length,
          availabilityStatus,
          ticketTiers: categories.map(cat => ({
            id: cat._id,
            name: cat.name,
            price: cat.price,
            capacity: cat.totalTickets,
            sold: cat.soldTickets,
            remaining: Math.max(0, cat.totalTickets - cat.soldTickets)
          }))
        };
      })
    );

    return NextResponse.json({
      success: true,
      events: eventsWithTicketData
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

    // Create ticket categories (tiers) if provided in request body
    try {
      const rawCategories = Array.isArray((body as any).categories)
        ? (body as any).categories
        : (Array.isArray((body as any).ticketTiers) ? (body as any).ticketTiers : []);
      if (rawCategories.length > 0) {
        const validCategories = rawCategories
          .filter((c: any) => c && typeof c.name === 'string' && c.name.trim().length > 0)
          .map((c: any) => ({
            name: c.name,
            description: c.description || '',
            price: typeof c.price === 'number' ? c.price : parseFloat(c.price) || 0,
            totalTickets: typeof c.capacity === 'number' ? c.capacity : parseInt(c.capacity) || 0,
            benefits: Array.isArray(c.benefits) ? c.benefits.filter((b: any) => typeof b === 'string') : [],
          }))
          .filter((c: any) => c.price >= 0 && c.totalTickets > 0);

        if (validCategories.length > 0) {
          const created = await Promise.all(validCategories.map(async (c: any) => {
            const cat = new Category({
              name: c.name,
              description: c.description,
              price: c.price,
              totalTickets: c.totalTickets,
              soldTickets: 0,
              benefits: c.benefits || [],
              event: savedEvent._id,
            });
            return cat.save();
          }));
          console.log(`Created ${created.length} categories for event ${savedEvent._id}`);
        } else {
          console.log('No valid categories found in request body; skipping category creation');
        }
      }
    } catch (catErr) {
      console.error('Error creating categories for event:', catErr);
      // Do not fail the whole request if categories fail; event is created.
    }

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