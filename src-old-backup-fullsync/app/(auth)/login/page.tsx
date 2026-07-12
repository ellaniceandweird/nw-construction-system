import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Static login screen. Wired to real authentication (credentials + session)
 * in Phase 9. Submitting currently does nothing — no client-side handler is
 * attached on purpose until the auth backend exists.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex-col items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Building2 className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Sign in to Project NW</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Nice &amp; Weird Construction Operations Platform
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input id="email" type="email" placeholder="you@niceandweird.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <Button className="mt-2 w-full">Sign in</Button>
          <p className="text-center text-xs text-muted-foreground">
            Authentication is stubbed — Phase 9 wires this to real sessions
            and role-based access control.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
