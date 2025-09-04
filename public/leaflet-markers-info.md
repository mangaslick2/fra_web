# Leaflet Marker Images

This directory contains the default Leaflet marker images that are required for the map functionality.

The following files are needed:
- marker-icon.png (25x41px)
- marker-icon-2x.png (50x82px) 
- marker-shadow.png (41x41px)

These are standard Leaflet assets. In production, you should:

1. Copy the official Leaflet marker images to this public directory
2. Or use the CDN versions by configuring Leaflet's default icon path
3. Or create custom marker icons that match your government portal branding

For now, we'll configure Leaflet to use CDN versions to prevent 404 errors.
