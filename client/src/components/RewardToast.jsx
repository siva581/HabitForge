import { AnimatePresence, motion } from "framer-motion";

export function RewardToast({ reward, onDismiss }) {
  return (
    <AnimatePresence>
      {reward && (
        <motion.div
          className="reward-toast"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -18, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
        >
          <div className="reward-toast__icon">{reward.icon || "✨"}</div>
          <div className="reward-toast__content">
            <p className="eyebrow">Quest reward</p>
            <strong>{reward.title}</strong>
            <span>{reward.message}</span>
          </div>
          <button className="reward-toast__close" type="button" onClick={onDismiss} aria-label="Dismiss reward">
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}