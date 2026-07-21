/**
 * DebtProof — iCalendar (.ics) File Generator
 * Converts EMI events into standard .ics format for Google Calendar, Apple iCal, Outlook.
 */

interface CalendarEventItem {
  loan_name: string;
  lender_name?: string;
  emi_amount: number;
  due_date: string;
}

export function downloadEMICalendarICS(events: CalendarEventItem[]) {
  if (!events || events.length === 0) {
    alert("No EMI events available to export.");
    return;
  }

  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DebtProof//EMI Reminder Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:DebtProof EMI Reminders",
  ];

  events.forEach((evt, idx) => {
    // Format YYYYMMDD
    const dateStr = evt.due_date.replace(/-/g, "");
    const uid = `debtproof-emi-${idx}-${dateStr}@debtproof.local`;

    icsContent.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${dateStr}`,
      `SUMMARY:💳 EMI Due: ${evt.loan_name} (₹${evt.emi_amount.toLocaleString("en-IN")})`,
      `DESCRIPTION:EMI Payment reminder for ${evt.loan_name} (${evt.lender_name || "Lender"}). Amount due: ₹${evt.emi_amount}. Log in to DebtProof to record your payment and anchor receipt.`,
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      `DESCRIPTION:Reminder: EMI due tomorrow for ${evt.loan_name}`,
      "END:VALARM",
      "END:VEVENT"
    );
  });

  icsContent.push("END:VCALENDAR");

  const blob = new Blob([icsContent.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", "debtproof_emi_schedule.ics");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
