import { useState, useCallback } from "react";
import { getAllPromoCodes } from "../api/promo.api";

export const usePromoData = () => {
  const [promoCodes, setPromoCodes] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllPromoCodes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllPromoCodes();
      setPromoCodes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    promoCodes,
    isLoading,
    setPromoCodes,
    fetchAllPromoCodes,
  };
};
