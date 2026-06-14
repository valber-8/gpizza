#!/usr/bin/env python3
"""
Upload GPizza APK to Google Drive and print a shareable link.
Run once: python3 scripts/upload_to_drive.py
First run opens a browser for Google auth; token saved to .gdrive_token.json
"""
import os, sys, json, webbrowser
from pathlib import Path

APK = Path(__file__).parent.parent / "mobile/android/app/build/outputs/apk/debug/app-debug.apk"
TOKEN_FILE = Path.home() / ".gdrive_gpizza_token.json"
CREDS_FILE = Path(__file__).parent / "gdrive_credentials.json"
FOLDER_NAME = "GPizza APK"

def main():
    if not APK.exists():
        print(f"APK not found: {APK}")
        print("Build first: cd mobile/android && ./gradlew assembleDebug")
        sys.exit(1)

    try:
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from google.auth.transport.requests import Request
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaFileUpload
    except ImportError:
        print("pip3 install --break-system-packages google-api-python-client google-auth-oauthlib")
        sys.exit(1)

    SCOPES = ["https://www.googleapis.com/auth/drive.file"]
    creds = None

    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not CREDS_FILE.exists():
                print(f"""
credentials.json not found at {CREDS_FILE}

Steps:
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID → Desktop app
3. Download JSON → save as scripts/gdrive_credentials.json
4. Enable Google Drive API: https://console.cloud.google.com/apis/library/drive.googleapis.com
""")
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(str(CREDS_FILE), SCOPES)
            creds = flow.run_local_server(port=0)
        TOKEN_FILE.write_text(creds.to_json())

    service = build("drive", "v3", credentials=creds)

    # Find or create GPizza APK folder
    res = service.files().list(
        q=f"name='{FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields="files(id,name)"
    ).execute()
    folders = res.get("files", [])
    if folders:
        folder_id = folders[0]["id"]
        print(f"Using existing folder: {FOLDER_NAME}")
    else:
        folder_meta = {"name": FOLDER_NAME, "mimeType": "application/vnd.google-apps.folder"}
        folder = service.files().create(body=folder_meta, fields="id").execute()
        folder_id = folder["id"]
        print(f"Created folder: {FOLDER_NAME}")

    # Delete old APK files in folder
    old = service.files().list(
        q=f"'{folder_id}' in parents and name='gpizza.apk' and trashed=false",
        fields="files(id)"
    ).execute().get("files", [])
    for f in old:
        service.files().delete(fileId=f["id"]).execute()
    if old:
        print(f"Removed {len(old)} old version(s)")

    # Upload
    print(f"Uploading {APK} ({APK.stat().st_size // 1024 // 1024} MB)...")
    meta = {"name": "gpizza.apk", "parents": [folder_id]}
    media = MediaFileUpload(str(APK), mimetype="application/vnd.android.package-archive", resumable=True)
    file = service.files().create(body=meta, media_body=media, fields="id").execute()
    file_id = file["id"]

    # Make publicly readable
    service.permissions().create(
        fileId=file_id,
        body={"type": "anyone", "role": "reader"}
    ).execute()

    # Direct download link (works for APK files on Drive)
    direct_link = f"https://drive.google.com/uc?export=download&id={file_id}"
    view_link = f"https://drive.google.com/file/d/{file_id}/view"

    print(f"\n✓ Uploaded successfully!")
    print(f"  View:     {view_link}")
    print(f"  Download: {direct_link}")
    print(f"\nAdd to Google Sheets Settings tab:")
    print(f"  Key: android_app_url   Value: {direct_link}")

if __name__ == "__main__":
    main()
