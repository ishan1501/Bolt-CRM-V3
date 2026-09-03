"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface PromptModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  placeholder?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function PromptModal({ isOpen, title, description, placeholder, onConfirm, onCancel }: PromptModalProps) {
  const [value, setValue] = useState("");

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-sm bg-[var(--bolt-bg-depth-2)] rounded-2xl border border-[var(--bolt-border-color)] shadow-2xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold text-[var(--bolt-text-primary)] mb-2">{title}</h3>
          {description && <p className="text-sm text-[var(--bolt-text-secondary)] mb-4">{description}</p>}
          
          <input
            autoFocus
            type="text"
            className="w-full surface-input px-4 py-3 rounded-xl text-sm font-medium mb-6"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onConfirm(value);
                setValue("");
              }
            }}
          />
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                onCancel();
                setValue("");
              }}
              className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-[var(--bolt-hover-overlay)] text-[var(--bolt-text-secondary)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm(value);
                setValue("");
              }}
              className="px-4 py-2 text-sm font-bold bg-[var(--bolt-accent)] text-black rounded-lg hover:brightness-110 transition-colors"
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
