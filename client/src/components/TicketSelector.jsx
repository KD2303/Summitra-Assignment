import React from 'react';
import { motion } from 'framer-motion';
import { Check, Plus, Minus, Ticket } from 'lucide-react';

const CATEGORY_PERKS = {
  'General': ['Full Day Summit Keynotes', 'Digital Session Recordings'],
  'VIP': ['Priority Front-Row Seating', 'VIP Lounge & Speaker Access'],
  'Executive': ['Private Roundtable Access', 'All-Inclusive VIP Dining'],
  'Default': ['Full Event Access', 'Keynote & Breakout Sessions']
};

export function TicketSelector({
  categories = [],
  basePrice = 0,
  selectedCategory,
  onSelectCategory,
  quantity,
  onChangeQuantity,
  maxAvailable = 10
}) {
  const effectiveMax = Math.min(20, Math.max(1, maxAvailable));

  const handleIncrement = () => {
    if (quantity < effectiveMax) {
      onChangeQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onChangeQuantity(quantity - 1);
    }
  };

  const currentPrice = selectedCategory
    ? parseFloat(selectedCategory.price)
    : parseFloat(basePrice);

  const totalPrice = currentPrice * quantity;

  const getPerks = (name) => {
    if (!name) return CATEGORY_PERKS.Default;
    const lower = name.toLowerCase();
    if (lower.includes('vip')) return CATEGORY_PERKS.VIP;
    if (lower.includes('exec') || lower.includes('pass')) return CATEGORY_PERKS.Executive;
    if (lower.includes('gen') || lower.includes('standard')) return CATEGORY_PERKS.General;
    return CATEGORY_PERKS.Default;
  };

  return (
    <div className="space-y-4">
      {/* Category selection */}
      {categories.length > 0 && (
        <fieldset className="space-y-2">
          <legend className="text-[12px] font-bold text-white/70 mb-1.5 uppercase tracking-wider flex items-center justify-between w-full">
            <span>Select Ticket Tier</span>
            <span className="text-[11px] font-medium text-white/40 normal-case">Dynamic Pricing</span>
          </legend>

          <div className="space-y-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id;
              const perks = getPerks(cat.name);

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat)}
                  aria-pressed={isSelected}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all duration-200 relative cursor-pointer outline-none ${
                    isSelected
                      ? 'border-[#9e6ce8] bg-[#171222] shadow-[0_4px_20px_rgba(134,23,208,0.25)] ring-1 ring-[#9e6ce8]'
                      : 'border-white/10 bg-[#121216] hover:border-white/20 hover:bg-[#16161c]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[14px] text-white">
                          {cat.name}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#8617d0] text-white">
                            Selected
                          </span>
                        )}
                      </div>

                      {/* Perks */}
                      <div className="space-y-0.5 pt-1 text-[11px] text-white/60">
                        {perks.map((perk, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-[#fdda7a] flex-shrink-0" />
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[17px] font-extrabold text-[#fdda7a] tracking-tight">
                        ${parseFloat(cat.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Smooth Quantity Stepper */}
      <div className="p-3 sm:p-3.5 rounded-xl border border-white/10 bg-[#121216] flex items-center justify-between gap-4">
        <div>
          <label htmlFor="ticket-quantity-stepper" className="block text-[13px] font-bold text-white">
            Quantity
          </label>
          <span className="text-[11px] text-white/50">
            Up to {effectiveMax} tickets per transaction
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={quantity <= 1}
            aria-label="Decrease ticket quantity by 1"
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 flex items-center justify-center text-white transition-colors focus-visible:ring-2 focus-visible:ring-[#8617d0]"
          >
            <Minus className="w-3 h-3" />
          </button>

          <span
            id="ticket-quantity-stepper"
            aria-live="polite"
            className="w-9 text-center text-[17px] font-extrabold text-[#fdda7a]"
          >
            {quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={quantity >= effectiveMax}
            aria-label="Increase ticket quantity by 1"
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 flex items-center justify-center text-white transition-colors focus-visible:ring-2 focus-visible:ring-[#8617d0]"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Dynamic Total Price Display with Exact Controlled Pixel Sizing */}
      <div
        role="region"
        aria-live="polite"
        className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-[#8617d0]/25 via-[#8617d0]/10 to-transparent border border-[#8617d0]/40 flex items-center justify-between shadow-inner"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#8617d0]/40 flex items-center justify-center text-white flex-shrink-0">
            <Ticket className="w-3.5 h-3.5 text-[#fdda7a]" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/60 block">
              Total Calculation
            </span>
            <span className="text-[11px] text-white/50">
              {quantity} × ${currentPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[24px] font-extrabold text-[#fdda7a] tracking-tight block leading-none">
            ${totalPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
