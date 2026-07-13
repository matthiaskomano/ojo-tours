import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMinimumRole, AuthorizationError } from "@/lib/authorization";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    await requireMinimumRole("ADMIN");

    // Fetch all data
    const [bookings, tours, lodges, journals, gallery, team] =
      await Promise.all([
        prisma.booking.findMany({ orderBy: { createdAt: "desc" } }),
        prisma.tour.findMany(),
        prisma.lodge.findMany(),
        prisma.journal.findMany(),
        prisma.gallery.findMany(),
        prisma.team.findMany(),
      ]);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Bookings sheet
    const bookingsData = bookings.map((b) => ({
      "Customer Name": b.customerName,
      "Customer Email": b.customerEmail,
      Item: b.itemName,
      Type: b.itemType,
      Date: b.date,
      Guests: b.guests,
      "Total Price": b.totalPrice,
      Status: b.status,
      "Created At": b.createdAt.toISOString(),
    }));
    const bookingsSheet = XLSX.utils.json_to_sheet(bookingsData);
    XLSX.utils.book_append_sheet(workbook, bookingsSheet, "Bookings");

    // Tours sheet
    const toursData = tours.map((t) => ({
      Title: t.title,
      Location: t.location,
      Duration: t.duration,
      Price: t.price,
      Rating: t.rating,
      Category: t.category,
      "Created At": t.createdAt.toISOString(),
    }));
    const toursSheet = XLSX.utils.json_to_sheet(toursData);
    XLSX.utils.book_append_sheet(workbook, toursSheet, "Expeditions");

    // Lodges sheet
    const lodgesData = lodges.map((l) => ({
      Name: l.name,
      Location: l.location,
      Price: l.price,
      Amenities: l.amenities.join(", "),
      "Created At": l.createdAt.toISOString(),
    }));
    const lodgesSheet = XLSX.utils.json_to_sheet(lodgesData);
    XLSX.utils.book_append_sheet(workbook, lodgesSheet, "Properties");

    // Journals sheet
    const journalsData = journals.map((j) => ({
      Title: j.title,
      Category: j.category,
      Author: j.author,
      "Read Time": j.readTime,
      Featured: j.featured ? "Yes" : "No",
      "Created At": j.createdAt.toISOString(),
    }));
    const journalsSheet = XLSX.utils.json_to_sheet(journalsData);
    XLSX.utils.book_append_sheet(workbook, journalsSheet, "Editorial");

    // Gallery sheet
    const galleryData = gallery.map((g) => ({
      Title: g.title,
      Category: g.category,
      "Class Name": g.className,
      "Created At": g.createdAt.toISOString(),
    }));
    const gallerySheet = XLSX.utils.json_to_sheet(galleryData);
    XLSX.utils.book_append_sheet(workbook, gallerySheet, "Gallery");

    // Team sheet
    const teamData = team.map((t) => ({
      Name: t.name,
      Role: t.role,
      "Created At": t.createdAt.toISOString(),
    }));
    const teamSheet = XLSX.utils.json_to_sheet(teamData);
    XLSX.utils.book_append_sheet(workbook, teamSheet, "Team");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="ojo-tours-report-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to export to Excel:", error);
    return NextResponse.json(
      { error: "Failed to export to Excel" },
      { status: 500 },
    );
  }
}
