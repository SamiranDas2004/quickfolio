"use client";
import { useState } from "react";

interface ThemeCustomizerProps {
  currentTheme: {
    background: string;
    color: string;
    font: string;
  };
  onSave: (theme: { background: string; color: string; font: string }) => void;
  onClose: () => void;
}

export default function ThemeCustomizer({ currentTheme, onSave, onClose }: ThemeCustomizerProps) {
  const [theme, setTheme] = useState(currentTheme);

  const backgrounds = [
    { id: "ripple", name: "Ripple Effect", preview: "🌊" },
    { id: "beams", name: "Beams Collision", preview: "✨" },
    { id: "lines", name: "Background Lines", preview: "📏" },
  ];

  const colors = [
    { id: "blue", name: "Blue", class: "from-blue-600 to-cyan-600" },
    { id: "purple", name: "Purple", class: "from-purple-600 to-pink-600" },
    { id: "green", name: "Green", class: "from-green-600 to-emerald-600" },
    { id: "orange", name: "Orange", class: "from-orange-600 to-red-600" },
    { id: "teal", name: "Teal", class: "from-teal-600 to-blue-600" },
  ];

  const fonts = [
    { id: "inter", name: "Inter", style: "font-sans" },
    { id: "mono", name: "Mono", style: "font-mono" },
    { id: "serif", name: "Serif", style: "font-serif" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-black/90 border border-white/20 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Customize Theme</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Settings */}
          <div className="space-y-6">
            {/* Background Effect */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-3">Background Effect</label>
              <div className="grid grid-cols-3 gap-3">
                {backgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setTheme({ ...theme, background: bg.id })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme.background === bg.id
                        ? "border-white bg-white/10"
                        : "border-white/20 hover:border-white/40"
                    }`}
                  >
                    <div className="text-3xl mb-2">{bg.preview}</div>
                    <div className="text-white text-xs">{bg.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Scheme */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-3">Color Scheme</label>
              <div className="grid grid-cols-3 gap-3">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setTheme({ ...theme, color: color.id })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme.color === color.id
                        ? "border-white"
                        : "border-white/20 hover:border-white/40"
                    }`}
                  >
                    <div className={`h-8 rounded-lg bg-gradient-to-r ${color.class} mb-2`} />
                    <div className="text-white text-xs">{color.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-3">Font Family</label>
              <div className="grid grid-cols-3 gap-3">
                {fonts.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setTheme({ ...theme, font: font.id })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme.font === font.id
                        ? "border-white bg-white/10"
                        : "border-white/20 hover:border-white/40"
                    }`}
                  >
                    <div className={`text-white text-lg mb-1 ${font.style}`}>Aa</div>
                    <div className="text-white text-xs">{font.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">Preview</label>
            <div className="bg-black rounded-xl border border-white/20 p-6 h-[400px] overflow-hidden relative">
              {/* Background preview */}
              <div className="absolute inset-0 bg-black">
                {theme.background === "ripple" && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                )}
                {theme.background === "beams" && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10" />
                )}
                {theme.background === "lines" && (
                  <div className="absolute inset-0" style={{
                    backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
                    backgroundSize: "40px 40px"
                  }} />
                )}
              </div>

              {/* Content preview */}
              <div className={`relative z-10 ${fonts.find(f => f.id === theme.font)?.style}`}>
                <h3 className="text-2xl font-bold text-white mb-2">Your Name</h3>
                <p className={`text-lg mb-4 bg-gradient-to-r ${colors.find(c => c.id === theme.color)?.class} bg-clip-text text-transparent`}>
                  Your Title
                </p>
                <p className="text-zinc-400 text-sm mb-4">
                  This is how your portfolio will look with the selected theme.
                </p>
                <button className={`px-4 py-2 rounded-lg bg-gradient-to-r ${colors.find(c => c.id === theme.color)?.class} text-white text-sm`}>
                  Sample Button
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(theme)}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Save Theme
          </button>
        </div>
      </div>
    </div>
  );
}
