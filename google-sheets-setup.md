# Setting Up Google Sheets for Beta Sign-ups

This guide explains how to set up a Google Sheet to collect StoryBuilder beta sign-ups.

## Step 1: Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it "StoryBuilder Beta Sign-ups"
3. Add these column headers in Row 1:
   - A1: `Timestamp`
   - B1: `Name`
   - C1: `Email`
   - D1: `Company`
   - E1: `Role`
   - F1: `Story Goals`

## Step 2: Create the Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code and paste this:

```javascript
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);

    // Get the active spreadsheet and sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Append a new row with the form data
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.company || '',
      data.role || '',
      data.storyGoals || ''
    ]);

    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (for testing)
function doGet(e) {
  return ContentService
    .createTextOutput('StoryBuilder Beta Sign-up endpoint is active.')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

3. Save the project (Ctrl/Cmd + S)

## Step 3: Deploy as Web App

1. Click **Deploy > New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Configure the deployment:
   - **Description**: "StoryBuilder Beta Sign-ups"
   - **Execute as**: "Me" (your account)
   - **Who has access**: "Anyone"
4. Click **Deploy**
5. Click **Authorize access** and grant permissions
6. **Copy the Web app URL** - it will look like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

## Step 4: Add URL to StoryBuilder

1. Open `index.html` in the StoryBuilder project
2. Find this line near the bottom:
   ```javascript
   const GOOGLE_SCRIPT_URL = '';
   ```
3. Replace it with your Web app URL:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
   ```
4. Save the file

## Step 5: Test It

1. Go to your StoryBuilder landing page
2. Fill out the sign-up form
3. Check your Google Sheet - a new row should appear!

## Troubleshooting

**Form submits but no data appears:**
- Make sure the Web app URL is correct
- Check that you deployed as "Anyone" can access
- Look at the Apps Script execution logs (View > Logs in Apps Script)

**CORS errors in browser console:**
- This is expected! We use `mode: 'no-cors'` which doesn't return data but still submits
- The form should still work - check the Google Sheet

**Need to update the script?**
- After making changes, you must create a **new deployment** for changes to take effect
- Or use the "Manage deployments" option to update the existing one
