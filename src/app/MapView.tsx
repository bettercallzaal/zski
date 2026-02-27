"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons in bundled environments
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Post {
  id: number;
  image_url: string;
  caption: string;
  author: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export default function MapView({ posts }: { posts: Post[] }) {
  const ATTITASH: [number, number] = [44.0832, -71.2298];
  const geoPosts = posts.filter((p) => p.latitude != null && p.longitude != null);

  return (
    <MapContainer
      center={ATTITASH}
      zoom={14}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {geoPosts.map((post) => (
        <Marker
          key={post.id}
          position={[post.latitude!, post.longitude!]}
          icon={markerIcon}
        >
          <Popup>
            <div style={{ maxWidth: 200, textAlign: "center" }}>
              <img
                src={post.image_url}
                alt={post.caption || "Photo"}
                style={{ width: "100%", borderRadius: 6, marginBottom: 6 }}
              />
              <strong>{post.author}</strong>
              {post.location && <div style={{ fontSize: 12, color: "#666" }}>📍 {post.location}</div>}
              {post.caption && <div style={{ fontSize: 12, marginTop: 4 }}>{post.caption}</div>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
