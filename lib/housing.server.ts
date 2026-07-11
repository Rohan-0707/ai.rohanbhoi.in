import { HousingType } from "@/generated/prisma/client";
import type { HousingOption } from "@/lib/housing";

export function mapHousingTypeToEnum(housingType: HousingOption | string): HousingType {
  switch (housingType) {
    case "Apartment":
      return HousingType.APARTMENT;
    case "Independent House":
      return HousingType.HOUSE;
    case "Ground Floor":
      return HousingType.GROUND_FLOOR;
    default:
      return HousingType.APARTMENT;
  }
}
