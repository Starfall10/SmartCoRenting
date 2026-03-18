import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

function generateICS(meeting: {
  title: string;
  description: string;
  location: string;
  startDate: string;
  startTime: string;
  durationMinutes?: number;
}): string {
  const {
    title,
    description,
    location,
    startDate,
    startTime,
    durationMinutes = 60,
  } = meeting;

  const [year, month, day] = startDate.split("-").map(Number);
  const [hours, minutes] = startTime.split(":").map(Number);

  const startDt = new Date(year, month - 1, day, hours, minutes);
  const endDt = new Date(startDt.getTime() + durationMinutes * 60 * 1000);

  const formatICSDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${y}${m}${d}T${h}${min}${s}`;
  };

  const uid = `meeting-${Date.now()}@smartcorenting.com`;
  const now = formatICSDate(new Date());

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SmartCoRenting//Meeting Scheduler//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatICSDate(startDt)}`,
    `DTEND:${formatICSDate(endDt)}`,
    `SUMMARY:${title.replace(/[,;\\]/g, "\\$&")}`,
    `DESCRIPTION:${description.replace(/[,;\\]/g, "\\$&").replace(/\n/g, "\\n")}`,
    `LOCATION:${location.replace(/[,;\\]/g, "\\$&")}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return icsContent;
}

export async function POST(request: NextRequest) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const resend = new Resend(resendApiKey);

    const body = await request.json();
    const {
      meetingId,
      title,
      locationName,
      locationAddress,
      scheduledDate,
      scheduledTime,
      inviteeName,
      creatorName,
    } = body;

    if (!meetingId || !title || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const location = locationAddress || locationName || "TBD";
    const meetingDescription = `Meeting between ${creatorName} and ${inviteeName}\nLocation: ${locationName || "TBD"}\nAddress: ${locationAddress || "N/A"}`;

    const icsContent = generateICS({
      title,
      description: meetingDescription,
      location,
      startDate: scheduledDate,
      startTime: scheduledTime,
      durationMinutes: 60,
    });

    const icsBase64 = Buffer.from(icsContent).toString("base64");

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: "yusei5283@gmail.com",
      subject: `Meeting Invite: ${title}`,
      html: `
        <h2>Meeting Invitation</h2>
        <p><strong>Event:</strong> ${title}</p>
        <p><strong>Date:</strong> ${scheduledDate}</p>
        <p><strong>Time:</strong> ${scheduledTime}</p>
        <p><strong>Location:</strong> ${locationName || "TBD"}</p>
        <p><strong>Address:</strong> ${locationAddress || "N/A"}</p>
        <p><strong>Participants:</strong> ${creatorName} & ${inviteeName}</p>
        <br/>
        <p>Please find the calendar invite attached to this email.</p>
        <p>Add it to your calendar by opening the .ics file.</p>
      `,
      attachments: [
        {
          filename: `meeting-${meetingId}.ics`,
          content: icsBase64,
          contentType: "text/calendar",
        },
      ],
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email", details: error },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, emailId: data?.id });
  } catch (error) {
    console.error("Error sending ICS email:", error);
    return NextResponse.json(
      { error: "Failed to send ICS email" },
      { status: 500 },
    );
  }
}
