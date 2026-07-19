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

  const openPicker = useCallback(
    async (onSelect: (files: DrivePickedFile[]) => void, options?: { multiple?: boolean; imagesOnly?: boolean }) => {
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
            scope: "https://www.googleapis.com/auth/drive.readonly",
            callback: "",
          });
        }

        tokenClientRef.current.callback = (response: { error?: string; access_token: string }) => {
          setLoading(false);
          if (response.error) {
            setError("Google sign-in was cancelled or failed.");
            return;
          }

          const view = options?.imagesOnly
            ? new window.google.picker.View(window.google.picker.ViewId.DOCS_IMAGES)
            : new window.google.picker.View(window.google.picker.ViewId.DOCS);

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

  return { isConfigured, openPicker, loading, error };
}
