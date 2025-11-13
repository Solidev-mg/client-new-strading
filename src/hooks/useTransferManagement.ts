import {
  GetTransfersUsecase,
  transferRepository,
} from "@/app/modules/transfer";
import { Transfer } from "@/app/modules/transfer/domain/entities/transfer.entity";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface TransferState {
  transfers: Transfer[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  total: number;
}

export const useTransferManagement = () => {
  const [state, setState] = useState<TransferState>({
    transfers: [],
    loading: false,
    loadingMore: false,
    error: null,
    hasMore: true,
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Ref pour accéder au state actuel sans dépendances
  const stateRef = useRef(state);
  stateRef.current = state;

  // Instance du use case - créée une seule fois
  const getTransfersUsecase = useMemo(
    () => new GetTransfersUsecase(transferRepository),
    []
  );

  const updateState = useCallback((updates: Partial<TransferState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleError = useCallback(
    (error: unknown, context: string) => {
      console.error(`Erreur dans ${context}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Une erreur est survenue";
      updateState({ error: errorMessage, loading: false, loadingMore: false });
    },
    [updateState]
  );

  const getAllTransfers = useCallback(
    async (page: number = 1, limit: number = 20, append: boolean = false) => {
      try {
        if (append) {
          updateState({ loadingMore: true, error: null });
        } else {
          updateState({ loading: true, error: null });
        }

        const response = await getTransfersUsecase.execute({ page, limit });

        updateState({
          transfers: append
            ? [...stateRef.current.transfers, ...response.transfers]
            : response.transfers,
          loading: false,
          loadingMore: false,
          hasMore: page < response.totalPages,
          currentPage: response.page,
          totalPages: response.totalPages,
          total: response.total,
        });
      } catch (error) {
        handleError(error, "getAllTransfers");
      }
    },
    [updateState, handleError, getTransfersUsecase]
  );

  const loadMore = useCallback(async () => {
    if (stateRef.current.loadingMore || !stateRef.current.hasMore) return;

    const nextPage = stateRef.current.currentPage + 1;
    await getAllTransfers(nextPage, 20, true);
  }, [getAllTransfers]);

  const refresh = useCallback(async () => {
    await getAllTransfers(1, 20, false);
  }, [getAllTransfers]);

  // Initialisation - ne s'exécute qu'une fois au montage
  useEffect(() => {
    const initialize = async () => {
      try {
        await getAllTransfers(1, 20, false);
        setIsInitialized(true);
      } catch (error) {
        handleError(error, "initialization");
        setIsInitialized(true); // Même en cas d'erreur, considérer comme initialisé
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dépendance vide intentionnelle pour n'exécuter qu'une fois

  return {
    // State
    ...state,
    isInitialized,

    // Actions
    getAllTransfers,
    loadMore,
    refresh,
  };
};
