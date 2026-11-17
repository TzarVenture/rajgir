"use client";

import React from "react";
import { Button, Modal } from "@/components/ui";

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

export default function TShirtSizeModal({ isOpen, onClose, selectedSize, onSelectSize }: TShirtSizeModalProps) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Official race jersey sizing chart"
      footer={
        <Button type="button" variant="secondary" size="md" fullWidth onClick={onClose}>
          Close sizing chart
        </Button>
      }
    >
      <p className="mb-4 text-sm leading-relaxed text-charcoal-600">
        The official Rajgir Marathon dry-fit technical running tee is crafted from moisture-wicking fabric. Measure around the fullest part
        of your chest.
      </p>

      <div className="overflow-x-auto rounded-card border border-charcoal-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-charcoal-200 bg-surface-soft text-xs font-semibold text-charcoal-600">
            <tr>
              <th scope="col" className="px-3 py-2.5">Size</th>
              <th scope="col" className="px-3 py-2.5">Chest (in)</th>
              <th scope="col" className="px-3 py-2.5">Chest (cm)</th>
              <th scope="col" className="px-3 py-2.5">Length</th>
              <th scope="col" className="px-3 py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-200">
            {sizeChart.map((row) => {
              const isSelected = selectedSize === row.size;
              return (
                <tr key={row.size} className={isSelected ? "bg-brand-red-light" : "bg-white"}>
                  <td className="px-3 py-2 font-bold text-charcoal-900">{row.size}</td>
                  <td className="px-3 py-2 text-charcoal-700">{row.chestInches}</td>
                  <td className="px-3 py-2 text-charcoal-700">{row.chestCm}</td>
                  <td className="px-3 py-2 text-charcoal-700">
                    {row.lengthInches} ({row.lengthCm})
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant={isSelected ? "primary" : "secondary"}
                      aria-label={`${isSelected ? "Selected size" : "Select size"} ${row.size}`}
                      onClick={() => {
                        onSelectSize(row.size as "XS" | "S" | "M" | "L" | "XL" | "XXL" | "3XL");
                        onClose();
                      }}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-center text-xs text-charcoal-500">
        Unisex athletic fit. If you prefer a looser running jersey, we recommend ordering one size larger.
      </p>
    </Modal>
  );
}
