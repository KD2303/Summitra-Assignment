import React from 'react';
import { Check, Plus, Minus, Ticket } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Category selection */}
      {categories.length > 0 && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-bold text-text-primary mb-3">
            Select Ticket Category
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {categories.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat)}
                  aria-pressed={isSelected}
                  className={`relative p-4 rounded-xl border text-left transition-all duration-fast flex flex-col justify-between min-h-[90px] focus-visible:ring-2 focus-visible:ring-brand-light ${
                    isSelected
                      ? 'border-brand-purple bg-surface-raised/20 ring-1 ring-brand-purple'
                      : 'border-surface-border bg-surface-card hover:border-surface-strong'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-sm text-text-primary truncate">
                      {cat.name}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-surface-raised flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-text-primary" />
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-lg font-extrabold text-text-primary">
                      ${parseFloat(cat.price).toFixed(2)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Quantity Stepper */}
      <div className="p-5 rounded-xl border border-surface-border bg-surface-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <label htmlFor="ticket-quantity-stepper" className="block text-sm font-bold text-text-primary">
            Ticket Quantity
          </label>
          <span className="text-xs text-text-tertiary">
            Maximum {effectiveMax} tickets per booking
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={quantity <= 1}
            aria-label="Decrease ticket quantity by 1"
            className="w-11 h-11 rounded-xl bg-surface-subtle hover:bg-surface-border disabled:opacity-40 disabled:cursor-not-allowed border border-surface-border flex items-center justify-center text-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span
            id="ticket-quantity-stepper"
            aria-live="polite"
            className="w-12 text-center text-xl font-extrabold text-text-primary"
          >
            {quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={quantity >= effectiveMax}
            aria-label="Increase ticket quantity by 1"
            className="w-11 h-11 rounded-xl bg-surface-subtle hover:bg-surface-border disabled:opacity-40 disabled:cursor-not-allowed border border-surface-border flex items-center justify-center text-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Total Price Display */}
      <div
        role="region"
        aria-live="polite"
        className="p-5 rounded-xl bg-surface-subtle border border-surface-border flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-brand-light" />
          <span className="text-sm font-semibold text-text-tertiary">
            Total Calculation:
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-text-tertiary block">
            {quantity} × ${currentPrice.toFixed(2)}
          </span>
          <span className="text-2xl font-extrabold text-text-primary">
            ${totalPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
