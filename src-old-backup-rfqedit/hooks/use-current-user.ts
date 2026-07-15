import { MOCK_CURRENT_USER, type CurrentUser } from "@/lib/constants/current-user";

/**
 * Returns the signed-in user. Backed by a mock until Phase 9 wires this to
 * real authentication. Keeping the hook boundary stable now means every
 * component built in earlier phases keeps working unchanged after Phase 9.
 */
export function useCurrentUser(): CurrentUser {
  return MOCK_CURRENT_USER;
}
