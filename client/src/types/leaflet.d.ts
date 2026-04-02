declare module 'leaflet' {
  const L: {
    map: (element: HTMLElement, options: Record<string, unknown>) => unknown;
    tileLayer: (url: string, options: Record<string, unknown>) => { addTo: (map: unknown) => void };
    marker: (position: [number, number], options: Record<string, unknown>) => unknown;
    circle: (position: [number, number], options: Record<string, unknown>) => { addTo: (map: unknown) => void };
    divIcon: (options: Record<string, unknown>) => unknown;
    Icon: {
      Default: {
        prototype: Record<string, unknown>;
        mergeOptions: (options: Record<string, unknown>) => void;
      };
    };
  };
  export = L;
}