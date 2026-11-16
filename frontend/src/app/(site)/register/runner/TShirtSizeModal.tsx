"use client";

import React from "react";
import { FiX } from "react-icons/fi";
import { FaTshirt } from "react-icons/fa";

interface TShirtSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSize: string;
  onSelectSize: (size: "XS" | "S" | "M" | "L" | "XL" | "XXL" | "3XL") => void;
}

const sizeChart = [
  { size: "XS", chestInches: '34"', chestCm: "86 cm", lengthInches: '26"', lengthCm: "66 cm" },
  { size: "S", chestInches: '36"', chestCm: "91 cm", lengthInches: '27"', lengthCm: "68 cm" },
  { size: "M", chestInches: '38"', chestCm: "96 cm", lengthInches: '28"', lengthCm: "71 cm" },
  { size: "L", chestInches: '40"', chestCm: "102 cm", lengthInches: '29"', lengthCm: "74 cm" },
  { size: "XL", chestInches: '42"', chestCm: "107 cm", lengthInches: '30"', lengthCm: "76 cm" },
  { size: "XXL", chestInches: '44"', chestCm: "112 cm", lengthInches: '31"', lengthCm: "79 cm" },
  { size: "3XL", chestInches: '46"', chestCm: "117 cm", lengthInches: '32"', lengthCm: "81 cm" },
] as const;

export default function TShirtSizeModal({
  isOpen,
  onClose,
  selectedSize,
  onSelectSize,
}: TShirtSizeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#cca043]/40 bg-[#0f0c09] p-6 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white text-lg p-1"
          aria-label="Close size chart modal"
        >
          <FiX />
        </button>

        <div className="flex items-center gap-2.5 text-[#cca043] mb-2">
          <FaTshirt className="text-xl" />
          <h3 className="text-lg font-black uppercase font-graduate tracking-wide">
            Official Race Jersey Sizing Chart
          </h3>
        </div>
        <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
          The official Rajgir Marathon dry-fit technical running tee is crafted from moisture-wicking aerodynamic fabric. Measure around the fullest part of your chest.
        </p>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#1a140e] text-[#cca043] font-bold uppercase tracking-wider border-b border-white/10 text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Chest (Inches)</th>
                <th className="py-2.5 px-3">Chest (CM)</th>
                <th className="py-2.5 px-3">Length</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sizeChart.map((row) => {
                const isSelected = selectedSize === row.size;
                return (
                  <tr
                    key={row.size}
                    className={`hover:bg-white/5 transition-colors ${
                      isSelected ? "bg-[#cca043]/15 font-bold" : ""
                    }`}
                  >
                    <td className="py-2.5 px-3 font-black text-white">{row.size}</td>
                    <td className="py-2.5 px-3 text-neutral-300">{row.chestInches}</td>
                    <td className="py-2.5 px-3 text-neutral-300">{row.chestCm}</td>
                    <td className="py-2.5 px-3 text-neutral-300">{row.lengthInches} ({row.lengthCm})</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSize(row.size as "XS" | "S" | "M" | "L" | "XL" | "XXL" | "3XL");
                          onClose();
                        }}
                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                          isSelected
                            ? "bg-[#cca043] text-black"
                            : "bg-white/10 text-white hover:bg-[#cca043] hover:text-black"
                        }`}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-[10px] text-neutral-500 mt-4 text-center">
          * Unisex athletic fit. If you prefer a looser running jersey, we recommend ordering one size larger.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all"
        >
          Close Sizing Chart
        </button>
      </div>
    </div>
  );
}

