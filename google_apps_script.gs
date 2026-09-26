/*
  Sri Rajarajeshwari Adhyathmika & Ayurveda Dhama
  Google Apps Script appointment backend

  IMPORTANT:
  This is a standalone Apps Script project, so it explicitly opens the
  appointment spreadsheet by ID instead of using getActiveSpreadsheet().

  Spreadsheet ID:
  1yMesKTPyaTUd2pm3wihpU7SB3JtrqXYj

  SETUP:
  1. Paste this entire file into Code.gs in your Apps Script project.
  2. Save the project.
  3. Run setupSheet() once and authorize access to Google Sheets.
  4. Deploy > Manage deployments > Edit the existing Web App.
  5. Select "New version" and deploy.
  6. Keep Execute as: Me.
  7. Keep Who has access: Anyone.

  After deployment, copy the new /exec URL into script.js in this website.
*/

const SPREADSHEET_ID = "1yMesKTPyaTUd2pm3wihpU7SB3JtrqXYj";
const SHEET_NAME = "Appointments";
const TIMEZONE = "Asia/Kolkata";

function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  return sheet;
}

function setupSheet() {
  const sheet = getSheet();

  const headers = [
    "Appointment ID",
    "Taken On (Date)",
    "Taken On (Time)",
    "Taken Month",
    "Taken Year",
    "Appointment Date",
    "Appointment Time",
    "Appointment Month",
    "Appointment Year",
    "Patient Name",
    "Age",
    "Treatment",
    "Additional Message",
    "Status"
  ];

  // Do NOT clear the sheet. This preserves existing appointments.
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    // If row 1 is blank, add the headers without deleting data below.
    const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    const isBlank = firstRow.every(value => value === "");
    if (isBlank) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  sheet.setFrozenRows(1);

  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight("bold")
    .setBackground("#123b28")
    .setFontColor("#ffffff");

  sheet.getRange("B:B").setNumberFormat("dd-mm-yyyy");
  sheet.getRange("C:C").setNumberFormat("HH:mm:ss");
  sheet.getRange("F:F").setNumberFormat("dd-mm-yyyy");
  sheet.getRange("G:G").setNumberFormat("HH:mm");

  sheet.autoResizeColumns(1, headers.length);
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      service: "Sri Rajarajeshwari Appointment System"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const sheet = getSheet();

    // Make sure the header row exists without deleting existing appointments.
    if (sheet.getLastRow() === 0) {
      setupSheet();
    }

    // Accept both normal HTML form POSTs and JSON POSTs.
    // The website uses a normal form POST because it works reliably
    // from a static index.html without CORS problems.
    let body = {};

    if (e && e.parameter && Object.keys(e.parameter).length > 0) {
      body = {
        name: e.parameter.name || "",
        age: e.parameter.age || "",
        treatment: e.parameter.treatment || "",
        appointmentDate: e.parameter.date || e.parameter.appointmentDate || "",
        appointmentTime: e.parameter.time || e.parameter.appointmentTime || "",
        message: e.parameter.message || ""
      };
    } else if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }

    const now = new Date();
    const appointmentDateRaw = String(body.appointmentDate || "");
    const appointmentDate = formatAppointmentDate(appointmentDateRaw);
    const appointmentTime = body.appointmentTime || "";

    const takenDate = Utilities.formatDate(now, TIMEZONE, "dd-MM-yyyy");
    const takenTime = Utilities.formatDate(now, TIMEZONE, "HH:mm:ss");
    const takenMonth = Utilities.formatDate(now, TIMEZONE, "MMMM");
    const takenYear = Utilities.formatDate(now, TIMEZONE, "yyyy");

    const appointmentMonth = getAppointmentMonth(appointmentDateRaw);
    const appointmentYear = getAppointmentYear(appointmentDateRaw);

    const id = "SRAD-" + Utilities.formatDate(
      now,
      TIMEZONE,
      "yyyyMMdd-HHmmss"
    );

    sheet.appendRow([
      id,
      takenDate,
      takenTime,
      takenMonth,
      takenYear,
      appointmentDate || "",
      appointmentTime,
      appointmentMonth,
      appointmentYear,
      body.name || "",
      body.age || "",
      body.treatment || "",
      body.message || "",
      "Pending"
    ]);

    // Sort by requested appointment date and then time.
    const lastRow = sheet.getLastRow();
    if (lastRow > 2) {
      sheet
        .getRange(2, 1, lastRow - 1, sheet.getLastColumn())
        .sort([
          { column: 6, ascending: true },
          { column: 7, ascending: true }
        ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        appointmentId: id
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: String(err)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function formatAppointmentDate(value) {
  const parts = String(value || "").split("-");
  if (parts.length !== 3) return "";
  return parts[2] + "-" + parts[1] + "-" + parts[0];
}

function getAppointmentMonth(value) {
  const parts = String(value || "").split("-");
  if (parts.length !== 3) return "";
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const month = Number(parts[1]);
  return month >= 1 && month <= 12 ? months[month - 1] : "";
}

function getAppointmentYear(value) {
  const parts = String(value || "").split("-");
  return parts.length === 3 ? parts[0] : "";
}


/*
  Optional backend test.
  Run testAppointment() from the Apps Script editor after authorizing.
  It should create one TEST-... row in the Appointments sheet.
*/
function testAppointment() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    setupSheet();
  }

  const targetSheet = spreadsheet.getSheetByName(SHEET_NAME);
  const now = new Date();
  const appointmentDate = new Date(2026, 8, 30);

  const appointmentId = "TEST-" +
    Utilities.formatDate(now, TIMEZONE, "yyyyMMdd-HHmmss");

  targetSheet.appendRow([
    appointmentId,
    Utilities.formatDate(now, TIMEZONE, "dd-MM-yyyy"),
    Utilities.formatDate(now, TIMEZONE, "HH:mm:ss"),
    Utilities.formatDate(now, TIMEZONE, "MMMM"),
    Utilities.formatDate(now, TIMEZONE, "yyyy"),
    appointmentDate,
    "10:30",
    "September",
    "2026",
    "Test Patient",
    "25",
    "Ayurvedic Treatment",
    "This is a connection test.",
    "Pending"
  ]);

  return "TEST APPOINTMENT SAVED SUCCESSFULLY";
}
