'use client';
import React, { createContext, ReactNode, useContext, useState, useCallback, useMemo } from 'react';

export type ProcessingType = {
  open: boolean;
};

interface ProcessingContextType {
  processingState: ProcessingType;
  openProcessing: () => void;
  closeProcessing: () => void;
}

const ProcessingContext = createContext<ProcessingContextType | null>(null);

export const ProcessingProvider = ({ children }: { children: ReactNode }) => {
  const [processingState, setProcessingState] = useState<ProcessingType>({ open: false });

  // 1. useCallback で関数を固定し、状態が変わらない限り再生成しない
  // かつ、既に open なら更新しないことでループを物理的に止める
  const openProcessing = useCallback(() => {
    setProcessingState((prev) => (prev.open ? prev : { open: true }));
  }, []);

  const closeProcessing = useCallback(() => {
    setProcessingState((prev) => (!prev.open ? prev : { open: false }));
  }, []);

  // 2. コンテキストに渡すオブジェクト自体もメモ化する
  const value = useMemo(() => ({
    processingState,
    openProcessing,
    closeProcessing
  }), [processingState, openProcessing, closeProcessing]);

  return (
    <ProcessingContext.Provider value={value}>
      {children}
    </ProcessingContext.Provider>
  );
};

export const useProcessing = (): ProcessingContextType => {
  const context = useContext(ProcessingContext);
  if (!context) {
    throw new Error('useProcessing must be used within a ProcessingContext');
  }
  return context;
};