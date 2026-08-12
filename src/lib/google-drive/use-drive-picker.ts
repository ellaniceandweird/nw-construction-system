"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Google Drive file/folder picker — lets someone browse their own Drive
 * and select a file visually instead of copy-pasting a share link by
 * hand. This is a REAL integration, not a demo: it requires your own
 * Google Cloud project with the Drive API + Picker API enabled, and an
 * OAuth Client ID + API key set as NEXT_PUBLIC_GOOGLE_CLIENT_ID and
 * NEXT_PUBLIC_GOOGLE_API_KEY in .env.local. Without those, the button
 * shows setup instructions instead of silently failing.
 */

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export interface DrivePickedFile {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  iconUrl?: string;
  thumbnailUrl?: string;
}

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

export function useDrivePicker() {
  const isConfigured = !!GOOGLE_API_KEY && !!GOOGLE_CLIENT_ID;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const tokenClientRef = useRef<any>(null);

  const getAccessToken = useCallback((): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        await loadScript("https://accounts.google.com/gsi/client");
        if (!tokenClientRef.current) {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            // drive.readonly: browse/pick existing files & folders.
            // drive.file: upload/create files the app itself creates — a narrower,
            // safer grant than full Drive write access.
            scope: "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file",
            callback: "",
          });
        }
        tokenClientRef.current.callback = (response: { error?: string; access_token: string }) => {
          if (response.error) {
            reject(new Error("Google sign-in was cancelled or failed."));
            return;
          }
          resolve(response.access_token);
        };
        tokenClientRef.current.requestAccessToken();
      } catch (e) {
        reject(e);
      }
    });
  }, []);

  /**
   * Uploads a local File object straight into a chosen Drive folder using
   * the drive.file scope, and returns the new file's id/link — this is a
   * real multipart upload to the Drive API, not a picker over existing
   * files.
   */
  const uploadFile = useCallback(
    async (file: File, folderId?: string): Promise<DrivePickedFile> => {
      setError("");
      setLoading(true);
      try {
        const accessToken = await getAccessToken();
        const metadata = {
          name: file.name,
          ...(folderId ? { parents: [folderId] } : {}),
        };
        const form = new FormData();
        form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
        form.append("file", file);

        const response = await fetch(
          "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,mimeType",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
            body: form,
          }
        );
        if (!response.ok) {
          throw new Error("Upload to Google Drive failed. Please try again.");
        }
        const data = await response.json();
        return {
          id: data.id,
          name: data.name,
          url: data.webViewLink,
          mimeType: data.mimeType,
        };
      } finally {
        setLoading(false);
      }
    },
    [getAccessToken]
  );

  const openPicker = useCallback(
    async (
      onSelect: (files: DrivePickedFile[]) => void,
      options?: { multiple?: boolean; imagesOnly?: boolean; foldersOnly?: boolean }
    ) => {
      if (!isConfigured) return;
      setError("");
      setLoading(true);

      try {
        await loadScript("https://apis.google.com/js/api.js");
        await new Promise<void>((resolve) => window.gapi.load("picker", () => resolve()));
        await loadScript("https://accounts.google.com/gsi/client");

        if (!tokenClientRef.current) {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file",
            callback: "",
          });
        }

        tokenClientRef.current.callback = (response: { error?: string; access_token: string }) => {
          setLoading(false);
          if (response.error) {
            setError("Google sign-in was cancelled or failed.");
            return;
          }

          let view;
          if (options?.foldersOnly) {
            view = new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS)
              .setSelectFolderEnabled(true)
              .setIncludeFolders(true);
          } else if (options?.imagesOnly) {
            view = new window.google.picker.View(window.google.picker.ViewId.DOCS_IMAGES);
          } else {
            view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
          }

          const builder = new window.google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(response.access_token)
            .setDeveloperKey(GOOGLE_API_KEY)
            .setCallback((data: { action: string; docs?: Array<Record<string, unknown>> }) => {
              if (data.action === window.google.picker.Action.PICKED && data.docs) {
                const files: DrivePickedFile[] = data.docs.map((doc) => ({
                  id: doc.id as string,
                  name: doc.name as string,
                  url: doc.url as string,
                  mimeType: doc.mimeType as string,
                  iconUrl: doc.iconUrl as string | undefined,
                  thumbnailUrl: (doc.thumbnails as Array<{ url: string }> | undefined)?.[0]?.url,
                }));
                onSelect(files);
              }
            });

          if (options?.multiple) {
            builder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
          }

          builder.build().setVisible(true);
        };

        tokenClientRef.current.requestAccessToken();
      } catch {
        setLoading(false);
        setError("Couldn't load Google Drive. Check your connection and try again.");
      }
    },
    [isConfigured]
  );

  return { isConfigured, openPicker, uploadFile, loading, error };
}
