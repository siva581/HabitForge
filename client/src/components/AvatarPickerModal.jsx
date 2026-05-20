import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "./Avatar.jsx";

const adjectives = ["swift", "noble", "brave", "wise", "calm", "fierce", "bright", "keen", "eager", "bold", "vivid", "happy", "cool", "smart", "quick"];
const nouns = ["eagle", "lion", "wolf", "bear", "phoenix", "dragon", "hawk", "tiger", "hunter", "explorer", "warrior", "sage", "knight", "master", "forge"];
const presetSeeds = ["phoenix-fire-42", "noble-eagle-88", "wise-dragon-15", "brave-wolf-73", "swift-hawk-29", "keen-tiger-56"];

function generateRandomSeed() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);

  return `${adjective}-${noun}-${number}`;
}

export function AvatarPickerModal({ currentSeed, onConfirm, onClose }) {
  const [selectedSeed, setSelectedSeed] = useState(currentSeed);
  const [previewSeed, setPreviewSeed] = useState(currentSeed);
  const [isLoading, setIsLoading] = useState(false);

  function handleRandomize() {
    const newSeed = generateRandomSeed();
    setSelectedSeed(newSeed);
    setPreviewSeed(newSeed);
  }

  async function handleConfirm() {
    setIsLoading(true);
    try {
      await onConfirm(selectedSeed);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-content avatar-picker-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>Choose Your Avatar</h2>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          <div className="modal-body">
            <div className="avatar-preview-section">
              <p className="section-label">Preview</p>
              <div className="avatar-preview-display">
                <Avatar seed={previewSeed} size={120} />
              </div>
              <p className="avatar-seed-label">{previewSeed}</p>
            </div>

            <div className="avatar-input-section">
              <p className="section-label">Custom Seed</p>
              <input
                type="text"
                placeholder="Enter custom seed (e.g., my-awesome-avatar)"
                value={selectedSeed}
                onChange={(e) => {
                  setSelectedSeed(e.target.value);
                  setPreviewSeed(e.target.value);
                }}
                className="avatar-seed-input"
              />
              <p className="input-hint">Use letters, numbers, and hyphens</p>
            </div>

            <div className="avatar-presets-section">
              <p className="section-label">Quick Picks</p>
              <div className="avatar-presets-grid">
                {presetSeeds.map((seed) => (
                  <button
                    key={seed}
                    className={`avatar-preset ${selectedSeed === seed ? "active" : ""}`}
                    onClick={() => {
                      setSelectedSeed(seed);
                      setPreviewSeed(seed);
                    }}
                  >
                    <Avatar seed={seed} size={60} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button className="btn-randomize" onClick={handleRandomize} disabled={isLoading}>
              🎲 Randomize
            </button>
            <button className="btn-primary" onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? "Saving..." : "Confirm Avatar"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
