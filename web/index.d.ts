// https://fabricjs.com/docs/using-custom-properties/

import { FabricObject } from "fabric";

declare module "fabric" {
  // to have the properties recognized on the instance and in the constructor
  interface FabricObject {
    layerId?: number;
    id?: string;
  }
  // to have the properties typed in the exported object
  interface SerializedObjectProps {
    layerId?: number;
    id?: string;
  }
}

// to actually have the properties added to the serialized object
FabricObject.customProperties = ["layerId", "id"];
