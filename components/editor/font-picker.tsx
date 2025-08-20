'use client'

import React, { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { ALL_FONTS } from '@/constants/fonts';

interface FontFamilyPickerProps { 
  attribute: string;
  currentFont: string;
  handleAttributeChange: (attribute: string, value: string) => void;
  userId: string;
}

const FontFamilyPicker: React.FC<FontFamilyPickerProps> = ({
  attribute,
  currentFont,
  handleAttributeChange,
  userId
}) => {
  // Unlock fonts by default; keep hook for future gating
  const [isPaidUser, setIsPaidUser] = useState(true);

  useEffect(() => { 
    // Always unlocked for local testing
    setIsPaidUser(true);
  }, [userId]);

  // no-op
  useEffect(() => {}, [currentFont]);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filteredFonts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_FONTS;
    return ALL_FONTS.filter(f => f.toLowerCase().includes(q));
  }, [query]);
  const select = (font: string) => {
    try {
      console.log('[FontPicker] selecting font ->', font);
      handleAttributeChange(attribute, font);
      setOpen(false);
    } catch (e) {
      console.error('[FontPicker] select error', e);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>

      <div className='flex flex-col items-start justify-start my-8'>
        <Label>
          Font Family
        </Label>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-[200px] justify-between mt-3 p-2",
              !currentFont && "text-muted-foreground"
            )}
          >
            {currentFont ? currentFont : "Select font family"}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent align="start" sideOffset={6} className="w-[280px] p-0 z-50 bg-popover border rounded-md shadow-md">
        <div className="sticky top-0 z-10 p-2 bg-popover border-b">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search font family..."
            className="w-full h-9 px-2 rounded border bg-background text-sm"
          />
        </div>
        <div className="max-h-[320px] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' as any }}>
          <div className="px-3 py-2 text-xs text-muted-foreground">All Fonts</div>
          <div className="flex flex-col">
            {filteredFonts.map((font) => (
              <button
                key={font}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm rounded hover:bg-accent hover:text-accent-foreground",
                )}
                style={{ fontFamily: font }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); select(font); }}
              >
                <span className="flex-1">{font}</span>
                <CheckIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    font === currentFont ? "opacity-100" : "opacity-0"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

}

export default FontFamilyPicker;