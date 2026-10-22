import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { AvatarConfig } from '../types/game';
import { AvatarDisplay } from './AvatarDisplay';
import { playSound } from '../utils/audio';

interface AvatarEditorModalProps {
  initialConfig: AvatarConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: AvatarConfig) => void;
}

const HAIR_STYLES = [
  { id: 'short_fade', label: 'Corte Degradê' },
  { id: 'spiky', label: 'Espetado' },
  { id: 'curls', label: 'Cachos' },
  { id: 'buzz', label: 'Raspado' },
  { id: 'mohawk', label: 'Moicano' },
  { id: 'dreadlocks', label: 'Dreadlocks' },
  { id: 'afro', label: 'Black Power' },
  { id: 'samurai', label: 'Coque Samurai' },
  { id: 'long_band', label: 'Longo c/ Faixa' },
  { id: 'platinum_crop', label: 'Crop Platinado' },
  { id: 'bald', label: 'Careca' },
] as const;

const BEARD_STYLES = [
  { id: 'goatee', label: 'Cavanhaque' },
  { id: 'stubble', label: 'Barba Rala' },
  { id: 'full', label: 'Barba Cheia' },
  { id: 'mustache', label: 'Bigode Clássico' },
  { id: 'spartan', label: 'Barba Espartana' },
  { id: 'line_up', label: 'Barba Alinhada' },
  { id: 'van_dyke', label: 'Van Dyke' },
  { id: 'clean', label: 'Sem Barba' },
] as const;

const SKIN_TONES = [
  { color: '#FCD5B5', label: 'Claro' },
  { color: '#EAC096', label: 'Dourado' },
  { color: '#D49D6A', label: 'Moreno' },
  { color: '#A0683E', label: 'Pardo' },
  { color: '#684025', label: 'Negro' },
];

const HAIR_COLORS = [
  { color: '#F2E8CF', label: 'Platinado' },
  { color: '#F59E0B', label: 'Loiro Ouro' },
  { color: '#1E1B18', label: 'Preto' },
  { color: '#663B19', label: 'Castanho' },
  { color: '#B91C1C', label: 'Ruivo' },
  { color: '#2563EB', label: 'Azul Elétrico' },
];

const BOOT_COLORS = [
  { color: '#1A1A1A', label: 'Preto Clássico' },
  { color: '#FACC15', label: 'Ouro Campeão' },
  { color: '#EF4444', label: 'Vermelho Fogo' },
  { color: '#10B981', label: 'Verde Neon' },
  { color: '#FFFFFF', label: 'Branco Pérola' },
];

export const AvatarEditorModal: React.FC<AvatarEditorModalProps> = ({
  initialConfig,
  isOpen,
  onClose,
  onSave,
}) => {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig);

  if (!isOpen) return null;

  const handleSave = () => {
    playSound('click');
    onSave(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] bg-[#0E1A35] border border-blue-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-900 to-indigo-900 border-b border-blue-500/20">
          <div className="flex items-center gap-2">
            <span className="text-xl">👕</span>
            <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-amber-400">
              Personalizar Jogador
            </h2>
          </div>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col md:flex-row gap-5">
          {/* Avatar Preview Box */}
          <div className="w-full md:w-5/12 flex flex-col items-center justify-center bg-slate-900/80 rounded-xl p-3 border border-slate-700/60 shadow-inner">
            <div className="w-full h-64 sm:h-72">
              <AvatarDisplay config={config} showBackdrop={true} />
            </div>
            <div className="mt-2 text-center">
              <span className="text-base font-bold font-heading text-amber-300 block">
                {config.name || 'Gabriel M.'} #{config.number}
              </span>
              <span className="text-xs text-slate-400">Atacante · Manaus Gold</span>
            </div>
          </div>

          {/* Form Options */}
          <div className="w-full md:w-7/12 flex flex-col gap-4">
            {/* Name & Number */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nome no Uniforme</label>
                <input
                  type="text"
                  maxLength={14}
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Número</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={config.number}
                  onChange={(e) => setConfig({ ...config, number: parseInt(e.target.value) || 9 })}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Hair Style */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Estilo de Cabelo</label>
              <div className="grid grid-cols-2 gap-1.5">
                {HAIR_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setConfig({ ...config, hairStyle: style.id });
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-all ${
                      config.hairStyle === style.id
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Color */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Cor do Cabelo</label>
              <div className="flex items-center gap-2">
                {HAIR_COLORS.map((item) => (
                  <button
                    key={item.color}
                    type="button"
                    title={item.label}
                    onClick={() => {
                      playSound('click');
                      setConfig({ ...config, hairColor: item.color });
                    }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      config.hairColor === item.color ? 'scale-110 border-white shadow-lg' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: item.color }}
                  />
                ))}
              </div>
            </div>

            {/* Beard Style */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Barba / Cavanhaque</label>
              <div className="grid grid-cols-2 gap-1.5">
                {BEARD_STYLES.map((beard) => (
                  <button
                    key={beard.id}
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setConfig({ ...config, beardStyle: beard.id });
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-all ${
                      config.beardStyle === beard.id
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {beard.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Tone */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Tom de Pele</label>
              <div className="flex items-center gap-2">
                {SKIN_TONES.map((item) => (
                  <button
                    key={item.color}
                    type="button"
                    title={item.label}
                    onClick={() => {
                      playSound('click');
                      setConfig({ ...config, skinTone: item.color });
                    }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      config.skinTone === item.color ? 'scale-110 border-white shadow-lg' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: item.color }}
                  />
                ))}
              </div>
            </div>

            {/* Boots Color */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Chuteiras</label>
              <div className="flex items-center gap-2">
                {BOOT_COLORS.map((item) => (
                  <button
                    key={item.color}
                    type="button"
                    title={item.label}
                    onClick={() => {
                      playSound('click');
                      setConfig({ ...config, bootColor: item.color });
                    }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      config.bootColor === item.color ? 'scale-110 border-white shadow-lg' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: item.color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-300"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-sm font-bold shadow-lg"
          >
            <Check className="w-4 h-4" />
            Salvar Jogador
          </button>
        </div>
      </div>
    </div>
  );
};
