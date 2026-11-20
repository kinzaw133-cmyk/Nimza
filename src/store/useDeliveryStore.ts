import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type DeliveryStatus =
  | "received"
  | "kitchen_prep"
  | "wood_fire_searing"
  | "dispatched"
  | "approaching"
  | "delivered";

export interface ActiveDelivery {
  orderId: string;
  customerName: string;
  address: string;
  status: DeliveryStatus;
  courierName: string;
  courierPhone: string;
  courierVehicle: string;
  etaMinutes: number;
  remainingSeconds: number;
  initialMinutes: number;
  driverLat: number;
  driverLng: number;
  destinationLat: number;
  destinationLng: number;
}

interface DeliveryStoreState {
  activeDelivery: ActiveDelivery | null;
  isRadarOpen: boolean;
  setRadarOpen: (open: boolean) => void;
  startLiveDelivery: (delivery: Partial<ActiveDelivery> & { orderId: string }) => void;
  updateStatus: (status: DeliveryStatus) => void;
  updateCoordinates: (lat: number, lng: number) => void;
  tickTimer: () => void;
  completeDelivery: () => void;
}

const DEFAULT_DELIVERY: ActiveDelivery = {
  orderId: "NZ-88942",
  customerName: "VIP Patron",
  address: "14 Andrássy Avenue, Budapest",
  status: "dispatched",
  courierName: "Marco Rossi (Express Courier)",
  courierPhone: "+1 718-904-4450",
  courierVehicle: "Vespa Elettrica 70km/h",
  etaMinutes: 18,
  remainingSeconds: 18 * 60,
  initialMinutes: 30,
  driverLat: 47.502,
  driverLng: 19.058,
  destinationLat: 47.507,
  destinationLng: 19.062,
};

export const useDeliveryStore = create<DeliveryStoreState>()(
  persist(
    (set, get) => ({
      activeDelivery: DEFAULT_DELIVERY,
      isRadarOpen: false,

      setRadarOpen: (open: boolean) => set({ isRadarOpen: open }),

      startLiveDelivery: (params) => {
        const full: ActiveDelivery = {
          ...DEFAULT_DELIVERY,
          ...params,
          remainingSeconds: (params.etaMinutes || 25) * 60,
          initialMinutes: params.etaMinutes || 30,
        };
        set({ activeDelivery: full, isRadarOpen: true });
      },

      updateStatus: (status: DeliveryStatus) => {
        const current = get().activeDelivery;
        if (!current) return;
        set({ activeDelivery: { ...current, status } });
      },

      updateCoordinates: (driverLat: number, driverLng: number) => {
        const current = get().activeDelivery;
        if (!current) return;
        set({ activeDelivery: { ...current, driverLat, driverLng } });
      },

      tickTimer: () => {
        const current = get().activeDelivery;
        if (!current || current.remainingSeconds <= 0) return;
        const remainingSeconds = Math.max(0, current.remainingSeconds - 1);
        const etaMinutes = Math.ceil(remainingSeconds / 60);
        let status = current.status;
        if (remainingSeconds < 180 && status === "dispatched") {
          status = "approaching";
        } else if (remainingSeconds === 0) {
          status = "delivered";
        }
        set({
          activeDelivery: {
            ...current,
            remainingSeconds,
            etaMinutes,
            status,
          },
        });
      },

      completeDelivery: () => {
        const current = get().activeDelivery;
        if (!current) return;
        set({
          activeDelivery: {
            ...current,
            status: "delivered",
            remainingSeconds: 0,
            etaMinutes: 0,
          },
        });
      },
    }),
    {
      name: "nimza-delivery-radar",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
