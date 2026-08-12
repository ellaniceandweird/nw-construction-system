"use client";
import { Building2, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@/types/maintenance";

interface Props {
  property: Property;
  billingEntityName?: string;
  projectCount: number;
  openTaskCount: number;
  onClick: () => void;
}

export function PropertyCard({ property, billingEntityName, projectCount, openTaskCount, onClick }: Props) {
  return (
    <Card
      className="cursor-pointer overflow-hidden p-0 transition-all hover:-translate-y-0.5 hover:shadow-md"
      onClick={onClick}
    >
      <div className="flex aspect-[4/3] items-center justify-center bg-muted">
        {property.coverPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={property.coverPhotoUrl}
            alt={property.address}
            className="h-full w-full object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <Building2 className="size-10 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-3">
        <div className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          <h3 className="truncate text-sm font-semibold leading-tight text-foreground">{property.address || "No address"}</h3>
        </div>
        {property.name && (
          <span className="w-fit truncate rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
            {property.name}
          </span>
        )}
        {billingEntityName && (
          <p className="truncate text-xs text-muted-foreground">{billingEntityName}</p>
        )}
        <div className="mt-1 flex flex-wrap gap-1.5">
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
