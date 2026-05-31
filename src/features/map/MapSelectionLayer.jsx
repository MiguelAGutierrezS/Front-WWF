import { useEffect, useRef } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useMapStore } from '../../store/useMapStore';
import { camera_stations } from '../../data/mockDatabase';

// Utility to calculate distance between points (Haversine formula approximation)
const getDistance = (p1, p2) => {
  const R = 6371e3; // metres
  const φ1 = p1.lat * Math.PI / 180; // φ, λ in radians
  const φ2 = p2.lat * Math.PI / 180;
  const Δφ = (p2.lat - p1.lat) * Math.PI / 180;
  const Δλ = (p2.lng - p1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
};

export const MapSelectionLayer = () => {
  const map = useMap();
  const drawing = useMapsLibrary('drawing');
  const { drawingMode, selectionShape, setSelectionShape, setSelectedCameraIds, setDrawingMode } = useMapStore();
  const managerRef = useRef(null);
  const shapeRef = useRef(null);

  // Re-calculate intersected cameras when shape changes
  useEffect(() => {
    if (!selectionShape) {
      setSelectedCameraIds([]);
      return;
    }

    const capturedIds = [];
    camera_stations.forEach(cam => {
      const p = { lat: cam.latitude, lng: cam.longitude };
      if (selectionShape.type === 'circle') {
        const dist = getDistance(selectionShape.center, p);
        if (dist <= selectionShape.radius) capturedIds.push(cam.id);
      } else if (selectionShape.type === 'rectangle') {
        const { north, south, east, west } = selectionShape.bounds;
        if (p.lat <= north && p.lat >= south && p.lng <= east && p.lng >= west) {
          capturedIds.push(cam.id);
        }
      }
    });

    setSelectedCameraIds(capturedIds);
  }, [selectionShape, setSelectedCameraIds]);

  // Initialize Drawing Manager
  useEffect(() => {
    if (!map || !drawing) return;

    const manager = new drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false, // hide default controls, we use our own Toolbar
      circleOptions: {
        fillColor: '#00ff88',
        fillOpacity: 0.2,
        strokeWeight: 2,
        strokeColor: '#00ff88',
        editable: true,
        zIndex: 1,
      },
      rectangleOptions: {
        fillColor: '#00ff88',
        fillOpacity: 0.2,
        strokeWeight: 2,
        strokeColor: '#00ff88',
        editable: true,
        zIndex: 1,
      }
    });

    manager.setMap(map);
    managerRef.current = manager;

    // Listen for completion
    window.google.maps.event.addListener(manager, 'overlaycomplete', (e) => {
      // Clear any existing shape
      if (shapeRef.current) {
        shapeRef.current.setMap(null);
      }

      const newShape = e.overlay;
      shapeRef.current = newShape;

      // We turn off drawing mode on the manager so they don't accidentally draw another one
      manager.setDrawingMode(null);
      setDrawingMode(null); // Stop drawing mode in store too (button goes back to default)

      if (e.type === 'circle') {
        const updateCircle = () => {
          setSelectionShape({
            type: 'circle',
            center: { lat: newShape.getCenter().lat(), lng: newShape.getCenter().lng() },
            radius: newShape.getRadius()
          });
        };
        newShape.addListener('radius_changed', updateCircle);
        newShape.addListener('center_changed', updateCircle);
        updateCircle(); // Initial update
      } else if (e.type === 'rectangle') {
        const updateRect = () => {
          const b = newShape.getBounds();
          setSelectionShape({
            type: 'rectangle',
            bounds: {
              north: b.getNorthEast().lat(),
              south: b.getSouthWest().lat(),
              east: b.getNorthEast().lng(),
              west: b.getSouthWest().lng(),
            }
          });
        };
        newShape.addListener('bounds_changed', updateRect);
        updateRect(); // Initial update
      }
    });

    return () => {
      manager.setMap(null);
    };
  }, [map, drawing, setSelectionShape, setDrawingMode]);

  // Sync drawingMode from store to manager
  useEffect(() => {
    if (!managerRef.current || !drawing) return;

    if (drawingMode === 'circle') {
      // Clear current shape when starting new drawing
      if (shapeRef.current) {
        shapeRef.current.setMap(null);
        shapeRef.current = null;
        setSelectionShape(null);
      }
      managerRef.current.setDrawingMode(drawing.OverlayType.CIRCLE);
    } else if (drawingMode === 'rectangle') {
      if (shapeRef.current) {
        shapeRef.current.setMap(null);
        shapeRef.current = null;
        setSelectionShape(null);
      }
      managerRef.current.setDrawingMode(drawing.OverlayType.RECTANGLE);
    } else {
      managerRef.current.setDrawingMode(null);
    }
  }, [drawingMode, drawing, setSelectionShape]);

  // Handle external cancellation (e.g. from toolbar)
  useEffect(() => {
    if (!selectionShape && shapeRef.current) {
      shapeRef.current.setMap(null);
      shapeRef.current = null;
    }
  }, [selectionShape]);

  return null;
};
