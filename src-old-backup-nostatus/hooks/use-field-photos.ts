"use client";
import { useSyncExternalStore } from "react";
import { subscribePhotos, getPhotosSnapshot } from "@/lib/documents/photo-store";
import { MOCK_FIELD_PHOTOS } from "@/lib/data/mock/field-photos";
export function useFieldPhotos() {
  return useSyncExternalStore(subscribePhotos, getPhotosSnapshot, () => MOCK_FIELD_PHOTOS);
}
