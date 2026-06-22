// https://fabricjs.com/docs/using-custom-properties/

import { FabricObject } from "fabric";

declare module "fabric" {
  // to have the properties recognized on the instance and in the constructor
  interface FabricObject {
    /** id of the layer, probably? exists on every object */
    layerId?: number;
    /** uuid of the object, probably? exists on every object */
    uuid?: string;
    /** special cases where name is necessary */
    name?: string;
  }
  // to have the properties typed in the exported object
  interface SerializedObjectProps {
    /** id of the layer, probably? exists on every object */
    layerId?: number;
    /** uuid of the object, probably? exists on every object */
    uuid?: string;
    /** special cases where name is necessary */
    name?: string;
  }
}

// to actually have the properties added to the serialized object
FabricObject.customProperties = ["layerId", "uuid", "name"];
