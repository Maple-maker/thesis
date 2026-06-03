/**
 * Thesis Beta Feedback — Google Apps Script
 * ==========================================
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/15nXFqsIclsNqKk9nKAaArxqEvuFCa0SXzTEMUXEcfdE/edit
 * 2. Extensions → Apps Script
 * 3. Paste this entire file, replacing any default code
 * 4. Click Deploy → New Deployment → Type: Web App
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (or "Anyone with link")
 * 5. Copy the deployment URL (ends in /exec)
 * 6. Set FEEDBACK_WEBHOOK_URL=<that-url> on your server env
 *
 * The sheet should have these columns (row 1 = header):
 *   Timestamp | Category | Description | Steps to Reproduce | Device Info | App Version
 */

function doPost(e: GoogleAppsScript.Events.DoPost) {
  try {
    const data = JSON.parse(e.postData.contents);

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Ensure header row exists
    const headers = [
      "Timestamp",
      "Category",
      "Description",
      "Steps to Reproduce",
      "Device Info",
      "App Version",
    ];
    const existingRow1 = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    const hasHeaders = existingRow1.some((cell: string) => cell.toString().trim() !== "");
    if (!hasHeaders) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight("bold")
        .setBackground("#E8F5E9");
    }

    const row = [
      data.timestamp || new Date().toISOString(),
      data.category || "general",
      data.description || "",
      data.steps || "",
      data.deviceInfo || "unknown",
      data.appVersion || "unknown",
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err: any) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: err.message || "Unknown error" })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, message: "Thesis feedback endpoint is live." })
  ).setMimeType(ContentService.MimeType.JSON);
}
