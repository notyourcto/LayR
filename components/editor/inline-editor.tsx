'use client'

import React, { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { PlusIcon, ReloadIcon } from '@radix-ui/react-icons'
import { removeBackground } from '@imgly/background-removal'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Accordion } from '@/components/ui/accordion'
import TextCustomizer from '@/components/editor/text-customizer'
import ImageControls from '@/components/editor/image-controls'
import '@/app/fonts.css'
import { APP_NAME } from '@/constants/branding'

type TextSet = {
  id: number
  text: string
  fontFamily: string
  top: number
  left: number
  color: string
  strokeColor: string
  strokeWidth: number
  fontSize: number
  fontWeight: number
  opacity: number
  shadowColor: string
  shadowSize: number
  scaleX?: number
  scaleY?: number
  blendMode?: string
  rotation: number
  tiltX: number
  tiltY: number
  letterSpacing: number
  layer: string
}

const InlineEditor = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isImageSetupDone, setIsImageSetupDone] = useState<boolean>(false)
  const [removedBgImageUrl, setRemovedBgImageUrl] = useState<string | null>(null)
  const [textSets, setTextSets] = useState<Array<TextSet>>([])
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [currentMessage, setCurrentMessage] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // Track preview render size to match export scaling
  const [previewSize, setPreviewSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })

  // Image adjustments
  const [rotationDeg, setRotationDeg] = useState<number>(0)
  const [brightness, setBrightness] = useState<number>(1)
  const [contrast, setContrast] = useState<number>(1)
  const [aspectRatio, setAspectRatio] = useState<string>('original')
  const [naturalImageSize, setNaturalImageSize] = useState<{ width: number; height: number } | null>(null)

  const messages = [
    "Analyzing your image...",
    "Removing background...",
    "Fine-tuning the edges...",
    "Almost ready! Polishing the result...",
    "Perfect! Just a few more seconds..."
  ]

  useEffect(() => {
    let messageInterval: NodeJS.Timeout
    let timeInterval: NodeJS.Timeout

    if (selectedImage && !isImageSetupDone) {
      messageInterval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % messages.length)
      }, 8000) // Change message every 8 seconds

      timeInterval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000) // Update time every second
    }

    return () => {
      clearInterval(messageInterval)
      clearInterval(timeInterval)
    }
  }, [selectedImage, isImageSetupDone, messages.length])

  // Measure preview area size for accurate export scaling
  useEffect(() => {
    const measure = () => {
      if (previewRef.current) {
        const rect = previewRef.current.getBoundingClientRect()
        setPreviewSize({ width: Math.round(rect.width), height: Math.round(rect.height) })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [isImageSetupDone, aspectRatio, naturalImageSize])

  const resetImageAdjustments = () => {
    setRotationDeg(0)
    setBrightness(1)
    setContrast(1)
    setAspectRatio('original')
  }

  const handleUploadImage = () => {
    if (fileInputRef.current) fileInputRef.current.click()
  }

  const loadImageFile = async (file: File) => {
    const imageUrl = URL.createObjectURL(file)
    setSelectedImage(imageUrl)
    try {
      const probe = new (window as any).Image()
      probe.onload = () => {
        setNaturalImageSize({ width: probe.naturalWidth, height: probe.naturalHeight })
      }
      probe.src = imageUrl
    } catch {}
    await setupImage(imageUrl)
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) await loadImageFile(file)
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) await loadImageFile(file)
  }

  const setupImage = async (imageUrl: string) => {
    try {
      // Reset states when starting new image processing
      setCurrentMessage(0)
      setTimeElapsed(0)
      
      const imageBlob = await removeBackground(imageUrl)
      const url = URL.createObjectURL(imageBlob)
      setRemovedBgImageUrl(url)
      setIsImageSetupDone(true)
    } catch (error) {
      console.error(error)
    }
  }

  const addNewTextSet = () => {
    const newId = Math.max(...textSets.map((set) => set.id), 0) + 1
    setTextSets((prev) => [
      ...prev,
      {
        id: newId,
        text: 'edit',
        fontFamily: 'Inter',
        top: 0,
        left: 0,
        color: 'white',
        strokeColor: 'black',
        strokeWidth: 0,
        fontSize: 200,
        fontWeight: 800,
        opacity: 1,
        shadowColor: 'rgba(0, 0, 0, 0.8)',
        shadowSize: 4,
        scaleX: 1,
        scaleY: 1,
        blendMode: 'normal',
        rotation: 0,
        tiltX: 0,
        tiltY: 0,
        letterSpacing: 0,
        layer: 'behind',
      },
    ])
  }

  const handleAttributeChange = (id: number, attribute: string, value: any) => {
    console.log(`INLINE-EDITOR: Changing ${attribute} to ${value} for text set ${id}`);
    setTextSets((prev) => prev.map((set) => (set.id === id ? { ...set, [attribute]: value } : set)))
  }

  const duplicateTextSet = (textSet: TextSet) => {
    const newId = Math.max(...textSets.map((set) => set.id), 0) + 1
    setTextSets((prev) => [...prev, { ...textSet, id: newId }])
  }

  const removeTextSet = (id: number) => {
    setTextSets((prev) => prev.filter((set) => set.id !== id))
  }

  const [exportScale] = useState<number>(1)

  const saveCompositeImage = () => {
    if (!canvasRef.current || !isImageSetupDone) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bgImg = new (window as any).Image()
    bgImg.crossOrigin = 'anonymous'
    bgImg.onload = () => {
      canvas.width = Math.floor(bgImg.width * exportScale)
      canvas.height = Math.floor(bgImg.height * exportScale)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Always reset to default state before drawing images
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.filter = 'none'

      // Multiplier to convert preview CSS px to export canvas px
      const sizeMultiplier = previewSize.height > 0 ? canvas.height / previewSize.height : 1
      if (rotationDeg !== 0 || brightness !== 1 || contrast !== 1) {
        ctx.save()
        ctx.filter = `brightness(${brightness}) contrast(${contrast})`
        const cx = canvas.width / 2
        const cy = canvas.height / 2
        ctx.translate(cx, cy)
        ctx.rotate((rotationDeg * Math.PI) / 180)
        ctx.translate(-cx, -cy)
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)
        ctx.restore()
      } else {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)
      }

      // Render behind layer text first (using offscreen canvas for CSS-like mix-blend isolation)
      textSets.filter(set => set.layer === 'behind').forEach((textSet) => {
        const off = document.createElement('canvas')
        off.width = canvas.width
        off.height = canvas.height
        const octx = off.getContext('2d')
        if (!octx) return

        const fontPx = Math.max(1, textSet.fontSize * sizeMultiplier)
        octx.font = `${textSet.fontWeight} ${fontPx}px ${textSet.fontFamily}`
        octx.fillStyle = textSet.color
        octx.globalAlpha = textSet.opacity
        octx.textAlign = 'center'
        octx.textBaseline = 'middle'

        const x = (off.width * (textSet.left + 50)) / 100
        const y = (off.height * (50 - textSet.top)) / 100

        octx.save()
        octx.translate(x, y)
        const tiltXRad = (-textSet.tiltX * Math.PI) / 180
        const tiltYRad = (-textSet.tiltY * Math.PI) / 180
        octx.transform(
          Math.cos(tiltYRad) * (textSet.scaleX ?? 1),
          Math.sin(0),
          -Math.sin(0),
          Math.cos(tiltXRad) * (textSet.scaleY ?? 1),
          0,
          0
        )
        octx.rotate((textSet.rotation * Math.PI) / 180)

        const letterSpacingPx = (textSet.letterSpacing || 0) * sizeMultiplier
        const drawWithLetterSpacing = (draw: (ch: string, x: number) => void) => {
          if (textSet.letterSpacing === 0) {
            draw(textSet.text, 0)
            return
          }
          const chars = textSet.text.split('')
          let currentX = 0
          const totalWidth = chars.reduce((width, char, i) => {
            const charWidth = octx.measureText(char).width
            return width + charWidth + (i < chars.length - 1 ? letterSpacingPx : 0)
          }, 0)
          currentX = -totalWidth / 2
          chars.forEach((char) => {
            const charWidth = octx.measureText(char).width
            draw(char, currentX + charWidth / 2)
            currentX += charWidth + letterSpacingPx
          })
        }

        if (textSet.shadowSize > 0) {
          octx.save()
          octx.shadowColor = textSet.shadowColor
          octx.shadowBlur = Math.max(0, textSet.shadowSize * sizeMultiplier)
          drawWithLetterSpacing((ch, x) => octx.fillText(ch, x, 0))
          octx.restore()
        }
        if (textSet.strokeWidth > 0) {
          octx.save()
          octx.lineWidth = Math.max(1, textSet.strokeWidth * sizeMultiplier)
          octx.strokeStyle = textSet.strokeColor
          octx.miterLimit = 2
          drawWithLetterSpacing((ch, x) => octx.strokeText(ch, x, 0))
          octx.restore()
        }
        drawWithLetterSpacing((ch, x) => octx.fillText(ch, x, 0))
        octx.restore()

        const blendMap: Record<string, GlobalCompositeOperation> = {
          normal: 'source-over',
          multiply: 'multiply',
          screen: 'screen',
          overlay: 'overlay',
          darken: 'darken',
          lighten: 'lighten',
          difference: 'difference',
          exclusion: 'exclusion',
        } as any
        const prevComposite = ctx.globalCompositeOperation
        ctx.globalCompositeOperation = (blendMap as any)[textSet.blendMode || 'normal'] ?? 'source-over'
        ctx.drawImage(off, 0, 0)
        ctx.globalCompositeOperation = prevComposite
      })

      if (removedBgImageUrl) {
        const removedBgImg = new (window as any).Image()
        removedBgImg.crossOrigin = 'anonymous'
        removedBgImg.onload = () => {
          // Ensure default state when drawing the foreground object image
          ctx.globalCompositeOperation = 'source-over'
          ctx.globalAlpha = 1
          ctx.filter = 'none'
          ctx.drawImage(removedBgImg, 0, 0, canvas.width, canvas.height)
          
          // Render front layer text after removed background (offscreen isolation)
          textSets.filter(set => set.layer === 'front').forEach((textSet) => {
            const off = document.createElement('canvas')
            off.width = canvas.width
            off.height = canvas.height
            const octx = off.getContext('2d')
            if (!octx) return

            const fontPx = Math.max(1, textSet.fontSize * sizeMultiplier)
            octx.font = `${textSet.fontWeight} ${fontPx}px ${textSet.fontFamily}`
            octx.fillStyle = textSet.color
            octx.globalAlpha = textSet.opacity
            octx.textAlign = 'center'
            octx.textBaseline = 'middle'

            const x = (off.width * (textSet.left + 50)) / 100
            const y = (off.height * (50 - textSet.top)) / 100

            octx.save()
            octx.translate(x, y)
            const tiltXRad = (-textSet.tiltX * Math.PI) / 180
            const tiltYRad = (-textSet.tiltY * Math.PI) / 180
            octx.transform(
              Math.cos(tiltYRad) * (textSet.scaleX ?? 1),
              Math.sin(0),
              -Math.sin(0),
              Math.cos(tiltXRad) * (textSet.scaleY ?? 1),
              0,
              0
            )
            octx.rotate((textSet.rotation * Math.PI) / 180)

            const letterSpacingPx = (textSet.letterSpacing || 0) * sizeMultiplier
            const drawWithLetterSpacing = (draw: (ch: string, x: number) => void) => {
              if (textSet.letterSpacing === 0) {
                draw(textSet.text, 0)
                return
              }
              const chars = textSet.text.split('')
              let currentX = 0
              const totalWidth = chars.reduce((width, char, i) => {
                const charWidth = octx.measureText(char).width
                return width + charWidth + (i < chars.length - 1 ? letterSpacingPx : 0)
              }, 0)
              currentX = -totalWidth / 2
              chars.forEach((char) => {
                const charWidth = octx.measureText(char).width
                draw(char, currentX + charWidth / 2)
                currentX += charWidth + letterSpacingPx
              })
            }

            if (textSet.shadowSize > 0) {
              octx.save()
              octx.shadowColor = textSet.shadowColor
              octx.shadowBlur = Math.max(0, textSet.shadowSize * sizeMultiplier)
              drawWithLetterSpacing((ch, x) => octx.fillText(ch, x, 0))
              octx.restore()
            }
            if (textSet.strokeWidth > 0) {
              octx.save()
              octx.lineWidth = Math.max(1, textSet.strokeWidth * sizeMultiplier)
              octx.strokeStyle = textSet.strokeColor
              octx.miterLimit = 2
              drawWithLetterSpacing((ch, x) => octx.strokeText(ch, x, 0))
              octx.restore()
            }
            drawWithLetterSpacing((ch, x) => octx.fillText(ch, x, 0))
            octx.restore()

            const blendMap: Record<string, GlobalCompositeOperation> = {
              normal: 'source-over',
              multiply: 'multiply',
              screen: 'screen',
              overlay: 'overlay',
              darken: 'darken',
              lighten: 'lighten',
              difference: 'difference',
              exclusion: 'exclusion',
            } as any
            const prevComposite = ctx.globalCompositeOperation
            ctx.globalCompositeOperation = (blendMap as any)[textSet.blendMode || 'normal'] ?? 'source-over'
            ctx.drawImage(off, 0, 0)
            ctx.globalCompositeOperation = prevComposite
          })
          
          triggerDownload()
        }
        removedBgImg.src = removedBgImageUrl
      } else {
        triggerDownload()
      }
    }
    bgImg.src = selectedImage || ''

    function triggerDownload() {
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `${APP_NAME.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = dataUrl
      link.click()
    }
  }

  return (
    <div className='w-full'>
      {selectedImage ? (
        <div className='flex flex-col md:flex-row items-start justify-start gap-6 w-full px-0 md:px-6'>
          <div className='flex flex-col items-start justify-start w-full md:w-1/2 gap-4'>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div className='flex items-center gap-2'>
              <Button onClick={saveCompositeImage} className='md:hidden bg-orange-600 hover:bg-orange-700 text-white'>
                Save image
              </Button>
            </div>
            <div className='min-h-[360px] w-full md:w-[80%] p-4 border border-border rounded-xl bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md shadow-sm'>
              <div
                ref={previewRef}
                className='relative w-full overflow-hidden rounded-lg'
                style={{
                  aspectRatio:
                    aspectRatio === '1:1' ? '1 / 1' :
                    aspectRatio === '4:5' ? '4 / 5' :
                    aspectRatio === '3:2' ? '3 / 2' :
                    aspectRatio === '16:9' ? '16 / 9' :
                    (naturalImageSize ? `${naturalImageSize.width} / ${naturalImageSize.height}` : undefined),
                }}
              >
                {isImageSetupDone ? (
                  <Image
                    src={selectedImage}
                    alt='Uploaded'
                    fill
                    style={{ objectFit: 'contain', objectPosition: 'center', filter: `brightness(${brightness}) contrast(${contrast})`, transform: `rotate(${rotationDeg}deg)` }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center space-x-2">
                        <ReloadIcon className="animate-spin h-6 w-6 text-orange-600" />
                        <span className="text-lg font-medium">{messages[currentMessage]}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        This usually takes 40-60 seconds.
                      </div>
                      <div className="text-sm text-orange-600">
                        Perfect time to grab a coffee!
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Processing time: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                )}
                {/* Render behind layer text */}
                {isImageSetupDone && textSets.filter(set => set.layer === 'behind').map((textSet) => (
                  <div
                    key={textSet.id}
                    style={{
                      position: 'absolute',
                      top: `${50 - textSet.top}%`,
                      left: `${textSet.left + 50}%`,
                      transform: `translate(-50%, -50%) rotate(${textSet.rotation}deg) perspective(1000px) rotateX(${textSet.tiltX}deg) rotateY(${textSet.tiltY}deg)`,
                      color: textSet.color,
                      textAlign: 'center',
                      fontSize: `${textSet.fontSize}px`,
                      fontWeight: textSet.fontWeight as any,
                      fontFamily: textSet.fontFamily,
                      opacity: textSet.opacity,
                      letterSpacing: `${textSet.letterSpacing}px`,
                      transformStyle: 'preserve-3d',
                      WebkitTextStrokeWidth: `${textSet.strokeWidth}px`,
                      WebkitTextStrokeColor: textSet.strokeColor,
                      textShadow: textSet.shadowSize > 0 ? `0 0 ${Math.max(1, textSet.shadowSize)}px ${textSet.shadowColor}` : undefined,
                      paintOrder: 'stroke fill',
                      mixBlendMode: (textSet.blendMode as any) || 'normal',
                      zIndex: 1,
                    }}
                  >
                    <span style={{ display: 'inline-block', transform: `scale(${textSet.scaleX ?? 1}, ${textSet.scaleY ?? 1})` }}>
                      {textSet.text}
                    </span>
                  </div>
                ))}
                {removedBgImageUrl && (
                  <Image
                    src={removedBgImageUrl}
                    alt='Removed bg'
                    fill
                    style={{ objectFit: 'contain', objectPosition: 'center', zIndex: 2 }}
                    className='absolute top-0 left-0 w-full h-full'
                  />
                )}
                {/* Render front layer text */}
                {isImageSetupDone && textSets.filter(set => set.layer === 'front').map((textSet) => (
                  <div
                    key={textSet.id}
                    style={{
                      position: 'absolute',
                      top: `${50 - textSet.top}%`,
                      left: `${textSet.left + 50}%`,
                      transform: `translate(-50%, -50%) rotate(${textSet.rotation}deg) perspective(1000px) rotateX(${textSet.tiltX}deg) rotateY(${textSet.tiltY}deg)`,
                      color: textSet.color,
                      textAlign: 'center',
                      fontSize: `${textSet.fontSize}px`,
                      fontWeight: textSet.fontWeight as any,
                      fontFamily: textSet.fontFamily,
                      opacity: textSet.opacity,
                      letterSpacing: `${textSet.letterSpacing}px`,
                      transformStyle: 'preserve-3d',
                      WebkitTextStrokeWidth: `${textSet.strokeWidth}px`,
                      WebkitTextStrokeColor: textSet.strokeColor,
                      textShadow: textSet.shadowSize > 0 ? `0 0 ${Math.max(1, textSet.shadowSize)}px ${textSet.shadowColor}` : undefined,
                      paintOrder: 'stroke fill',
                      mixBlendMode: (textSet.blendMode as any) || 'normal',
                      zIndex: 10,
                    }}
                  >
                    <span style={{ display: 'inline-block', transform: `scale(${textSet.scaleX ?? 1}, ${textSet.scaleY ?? 1})` }}>
                      {textSet.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className='flex flex-col w-full md:w-1/2 border rounded-2xl overflow-hidden bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md shadow-sm'>
            <Tabs defaultValue='text' className='w-full'>
              <TabsList className='grid grid-cols-3 m-4'>
                <TabsTrigger value='text'>Text</TabsTrigger>
                <TabsTrigger value='image'>Image</TabsTrigger>
                <TabsTrigger value='settings'>Settings</TabsTrigger>
              </TabsList>
              <ScrollArea className='h-[calc(100vh-18rem)] p-4 pt-0'>
                <TabsContent value='text' className='m-0'>
                  <Button className='w-full bg-orange-600 hover:bg-orange-700 text-white' onClick={addNewTextSet}><PlusIcon className='mr-2'/> Add New Text</Button>
                  <Accordion type='single' collapsible className='w-full mt-2'>
                    {textSets.map((textSet) => (
                      <TextCustomizer
                        key={textSet.id}
                        textSet={textSet as any}
                        handleAttributeChange={handleAttributeChange as any}
                        removeTextSet={removeTextSet as any}
                        duplicateTextSet={duplicateTextSet as any}
                        userId={'guest'}
                      />
                    ))}
                  </Accordion>
                </TabsContent>
                <TabsContent value='image' className='m-0'>
                  <ImageControls
                    rotationDeg={rotationDeg}
                    brightness={brightness}
                    contrast={contrast}
                    aspectRatio={aspectRatio}
                    onChangeRotation={setRotationDeg}
                    onChangeBrightness={setBrightness}
                    onChangeContrast={setContrast}
                    onChangeAspectRatio={setAspectRatio}
                    onReset={resetImageAdjustments}
                  />
                </TabsContent>
                <TabsContent value='settings' className='m-0'>
                  <div className='space-y-3'>
                    <Button className='w-full bg-orange-600 hover:bg-orange-700 text-white' onClick={saveCompositeImage}>Download Image</Button>
                    <div className='text-xs text-muted-foreground'>High quality PNG export</div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
            <div className='border-t p-4 flex items-center gap-2'>
              <input
                type='file'
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept='.jpg, .jpeg, .png'
              />
              <Button onClick={handleUploadImage} className='bg-orange-600 hover:bg-orange-700 text-white'>Upload background</Button>
              {selectedImage && (
                <Button onClick={saveCompositeImage} className='hidden md:flex bg-orange-600 hover:bg-orange-700 text-white'>
                  Export PNG
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center min-h-[28vh] md:min-h-[40vh] w-full text-center gap-4 px-6`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className={`w-full max-w-2xl rounded-2xl border-2 ${isDragging ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-900/20' : 'border-dashed'} p-8 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md`}>
            <div className='text-sm text-muted-foreground'>Drag and drop an image here</div>
            <div className='text-xs text-muted-foreground'>or click to select a file</div>
            <div className='mt-3'>
              <Button onClick={handleUploadImage} className='bg-orange-600 hover:bg-orange-700 text-white'>Select Image</Button>
            </div>
          </div>
          <input
            type='file'
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept='.jpg, .jpeg, .png'
          />
        </div>
      )}
    </div>
  )
}

export default InlineEditor


