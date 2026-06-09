// Run this function ONCE from the Apps Script editor to authorize scopes
// and configure Script Properties. After running, it can be deleted.
function setupAndAuthorize() {
  const props = PropertiesService.getScriptProperties();

  // ── Set Script Properties ─────────────────────────────────────────────────
  // Replace these values with your real Spreadsheet ID and desired staff key
  props.setProperties({
    SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
    STAFF_API_KEY: 'gpizza-staff-2026'
  });

  // ── Authorize scopes by touching each service ─────────────────────────────
  try { SpreadsheetApp.getActiveSpreadsheet(); }     catch (_) {}
  try { DriveApp.getRootFolder(); }                  catch (_) {}
  try { Tasks.Tasklists.list({ maxResults: 1 }); }   catch (_) {}

  Logger.log('Setup complete. Properties set:');
  Logger.log(props.getProperties());
}

// Fixes the fcm_token column header to be at column 19 (where appendRow writes it).
// Run once if the Orders sheet has "fcm_token" at column 20 and an unnamed column 19.
// Safe to run multiple times.
function fixFcmTokenColumn() {
  const sheet = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')
  ).getSheetByName('Orders');

  if (!sheet) { Logger.log('Orders sheet not found'); return; }

  const lastCol  = sheet.getLastColumn();
  const headers  = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const col19hdr = headers[18] || '';  // 0-indexed → column 19
  const fcmIdx   = headers.indexOf('fcm_token');

  Logger.log('Column 19 header: "' + col19hdr + '"');
  Logger.log('fcm_token header at column: ' + (fcmIdx + 1));

  // Already correct
  if (col19hdr === 'fcm_token') {
    Logger.log('✅ fcm_token is already at column 19. Nothing to do.');
    return;
  }

  // Set column 19 header to fcm_token
  sheet.getRange(1, 19).setValue('fcm_token');

  // Clear any duplicate fcm_token header at another column
  if (fcmIdx >= 0 && fcmIdx !== 18) {
    sheet.getRange(1, fcmIdx + 1).clearContent();
    Logger.log('Cleared duplicate fcm_token header at column ' + (fcmIdx + 1));
  }

  Logger.log('✅ fcm_token header set at column 19.');
}

// Checks FCM Script Properties and obtains a service-account access token.
// Run this first to confirm FCM credentials are wired correctly.
function testFcmConfig() {
  const projectId   = Config.fcmProjectId;
  const clientEmail = Config.fcmClientEmail;
  const privateKey  = Config.fcmPrivateKey;

  if (!projectId || !clientEmail || !privateKey) {
    Logger.log('❌ Missing Script Properties:');
    if (!projectId)   Logger.log('   FCM_PROJECT_ID');
    if (!clientEmail) Logger.log('   FCM_CLIENT_EMAIL');
    if (!privateKey)  Logger.log('   FCM_PRIVATE_KEY');
    return;
  }
  Logger.log('✅ Config found — project: ' + projectId);
  Logger.log('   client_email: ' + clientEmail);

  try {
    const token = NotificationService._getAccessToken();
    Logger.log('✅ Access token obtained: ' + token.substring(0, 30) + '...');
  } catch (ex) {
    Logger.log('❌ Failed to get access token: ' + ex.message);
  }
}

// Sends a test "baking" notification to a specific FCM device token.
// Paste a real token from the Flutter app debug log, then Run.
function testFcmSend() {
  const FCM_TOKEN = 'PASTE_DEVICE_TOKEN_HERE';

  if (FCM_TOKEN === 'PASTE_DEVICE_TOKEN_HERE') {
    Logger.log('Replace FCM_TOKEN with the token printed in the Flutter debug log, then run again.');
    return;
  }

  Logger.log('Sending test notification to: ' + FCM_TOKEN.substring(0, 20) + '...');
  NotificationService.send(FCM_TOKEN, 'baking', 'TEST-ORDER-000');
  Logger.log('Done — check your device.');
}

// Smoke test: verifies the web app router returns valid JSON for known actions.
// Run via: npx @google/clasp run ping
function ping() {
  return { ok: true, message: 'GPizza API is alive', ts: new Date().toISOString() };
}
