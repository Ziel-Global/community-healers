import { useCallback, useRef, useState } from "react";
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { centerOnboardingService } from "@/services/centerOnboardingService";

// Must be a stable reference — useJsApiLoader reloads the script if this
// array's identity changes on every render.
const GOOGLE_MAPS_LIBRARIES: "places"[] = ["places"];

const DEFAULT_CENTER = { lat: 33.6844, lng: 73.0479 }; // Islamabad — used until a pin is dropped

const mapContainerStyle = { width: "100%", height: "320px", borderRadius: "0.75rem" };

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number, address: string | null) => void;
}

export function LocationPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [address, setAddress] = useState<string | null>(null);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const position =
    latitude != null && longitude != null ? { lat: latitude, lng: longitude } : null;

  // Reverse geocoding goes through our backend, which holds a separate,
  // server-side-only Geocoding API key — the browser never sees it.
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setResolving(true);
      try {
        const result = await centerOnboardingService.reverseGeocode(lat, lng);
        setAddress(result.formattedAddress);
        setPlaceName(null);
        onLocationChange(lat, lng, result.formattedAddress);
      } catch {
        setAddress(null);
      } finally {
        setResolving(false);
      }
    },
    [onLocationChange],
  );

  const handlePick = useCallback(
    (lat: number, lng: number) => {
      onLocationChange(lat, lng, address);
      void reverseGeocode(lat, lng);
    },
    [onLocationChange, address, reverseGeocode],
  );

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    handlePick(e.latLng.lat(), e.latLng.lng());
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    handlePick(e.latLng.lat(), e.latLng.lng());
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    const loc = place?.geometry?.location;
    if (!loc) return;
    const lat = loc.lat();
    const lng = loc.lng();
    onLocationChange(lat, lng, place.formatted_address ?? null);
    setAddress(place.formatted_address ?? null);
    setPlaceName(place.name ?? null);
    mapRef.current?.panTo({ lat, lng });
    mapRef.current?.setZoom(16);
  };

  if (loadError) {
    return (
      <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-sm text-destructive">
        Could not load Google Maps. Check the API key and that Maps JavaScript API / Places API
        are enabled.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[320px] rounded-xl border border-border/40 bg-secondary/20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Autocomplete
        onLoad={(ac) => (autocompleteRef.current = ac)}
        onPlaceChanged={handlePlaceChanged}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search for your center's location" className="pl-9" />
        </div>
      </Autocomplete>

      <div className="rounded-xl overflow-hidden border border-border/40">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={position ?? DEFAULT_CENTER}
          zoom={position ? 16 : 11}
          onClick={handleMapClick}
          onLoad={(map) => (mapRef.current = map)}
          options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
        >
          {position && (
            <Marker position={position} draggable onDragEnd={handleMarkerDragEnd} />
          )}
        </GoogleMap>
      </div>

      {position ? (
        <div className="flex items-start gap-2 p-3 rounded-lg border border-border/40 bg-secondary/30 text-sm">
          <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
          <div className="min-w-0">
            {placeName && <p className="font-medium">{placeName}</p>}
            {resolving ? (
              <p className="text-muted-foreground flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Looking up address…
              </p>
            ) : (
              <p className="text-muted-foreground">{address ?? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`}</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Search above or click on the map to drop a pin at your center's location.
        </p>
      )}
    </div>
  );
}
