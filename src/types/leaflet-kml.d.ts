declare module "leaflet-kml" {
  import * as L from "leaflet";

  interface KMLOptions {
    [key: string]: unknown;
  }

  class KML extends L.FeatureGroup {
    constructor(kml: Document | Element, options?: KMLOptions);
    addKML(xml: Document | Element): void;
    latLngs: L.LatLng[];
  }

  namespace KML {
    function parseKML(xml: Document | Element): L.Layer[];
    function getLatLngs(xml: Document | Element): L.LatLng[];
    function parseStyles(xml: Document | Element): Record<string, unknown>;
  }

  export = KML;
}
