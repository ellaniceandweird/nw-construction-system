"use client";
import { useSyncExternalStore } from "react";
import { subscribeContacts, getContactsSnapshot } from "@/lib/contacts/contact-store";
import { MOCK_CONTACTS } from "@/lib/data/mock/contacts";
export function useContacts() {
  return useSyncExternalStore(subscribeContacts, getContactsSnapshot, () => MOCK_CONTACTS);
}
