"use client";
import { Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@/types/maintenance";

interface Props {
  property: Property;
  projectCount: number;
  openTaskCount: number;
  onClick: () => void;
}

export function PropertyCard({ property, projectCount, openTaskCount, onClick }: Props) {
  return (
    <Card className="cursor-pointer overflow-hidden p-0 transition-shadow hover:shadow-md" onClick={onClick}>
      <div className="flex aspect-[4/3] items-center justify-center bg-muted">
        {property.coverPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={property.coverPhotoUrl} alt={property.name} className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
        ) : (
          <Building2 className="size-10 text-muted-foreground" />
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-foreground">{property.name}</h3>
        {property.address && <p className="truncate text-xs text-muted-foreground">{property.address}</p>}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {projectCount > 0 && (
            <Badge className="bg-info-soft text-info-foreground border-transparent text-[10px]">
              {projectCount} project{projectCount === 1 ? "" : "s"}
            </Badge>
          )}
          {openTaskCount > 0 && (
            <Badge className="bg-warning-soft text-warning-foreground border-transparent text-[10px]">
              {openTaskCount} open task{openTaskCount === 1 ? "" : "s"}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
