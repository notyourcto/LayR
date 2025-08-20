'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SliderField from './slider-field'

interface ImageControlsProps {
  rotationDeg: number
  brightness: number
  contrast: number
  aspectRatio: string
  onChangeRotation: (value: number) => void
  onChangeBrightness: (value: number) => void
  onChangeContrast: (value: number) => void
  onChangeAspectRatio: (value: string) => void
  onReset: () => void
}

const ImageControls: React.FC<ImageControlsProps> = ({
  rotationDeg,
  brightness,
  contrast,
  aspectRatio,
  onChangeRotation,
  onChangeBrightness,
  onChangeContrast,
  onChangeAspectRatio,
  onReset,
}) => {
  return (
    <div className="mt-4 space-y-6">
      <h3 className="font-semibold text-base">Image</h3>
      
      {/* Basic Adjustments */}
      <div className="space-y-4">
        <SliderField
          attribute="brightness"
          label="Brightness"
          min={0}
          max={2}
          step={0.01}
          currentValue={brightness}
          handleAttributeChange={(_, v) => onChangeBrightness(v)}
        />
        <SliderField
          attribute="contrast"
          label="Contrast"
          min={0}
          max={2}
          step={0.01}
          currentValue={contrast}
          handleAttributeChange={(_, v) => onChangeContrast(v)}
        />
        <SliderField
          attribute="rotation"
          label="Rotation"
          min={-180}
          max={180}
          step={1}
          currentValue={rotationDeg}
          handleAttributeChange={(_, v) => onChangeRotation(v)}
        />
      </div>

      {/* Layout & Effects */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Aspect Ratio</Label>
          <Select value={aspectRatio} onValueChange={onChangeAspectRatio}>
            <SelectTrigger className="mt-2 w-full">
              <SelectValue placeholder="Select aspect ratio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="original">Original</SelectItem>
              <SelectItem value="1:1">1:1 Square</SelectItem>
              <SelectItem value="4:5">4:5 Portrait</SelectItem>
              <SelectItem value="3:2">3:2 Landscape</SelectItem>
              <SelectItem value="16:9">16:9 Widescreen</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={onReset}>Reset All</Button>
      </div>
    </div>
  )
}

export default ImageControls


