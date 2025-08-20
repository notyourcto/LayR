import React, { useState, useEffect } from 'react';
import InputField from './input-field';
import SliderField from './slider-field';
import ColorPicker from './color-picker';
import FontFamilyPicker from './font-picker'; 
import { Button } from '../ui/button';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Move, Text, Bold, RotateCw, Palette, LightbulbIcon, CaseSensitive, TypeOutline, ArrowLeftRight, ArrowUpDown, AlignHorizontalSpaceAround, LockIcon, Layers, ChevronUp, ChevronDown } from 'lucide-react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TextCustomizerProps {
    textSet: {
        id: number;
        text: string;
        fontFamily: string;
        top: number;
        left: number;
        color: string;
        strokeColor: string;
        strokeWidth: number;
        fontSize: number;
        fontWeight: number;
        opacity: number;
        rotation: number;
        shadowColor: string;
        shadowSize: number;
        scaleX: number;
        scaleY: number;
        blendMode: string;
        tiltX: number;
        tiltY: number;
        letterSpacing: number;
        layer: string;
    };
    handleAttributeChange: (id: number, attribute: string, value: any) => void;
    removeTextSet: (id: number) => void;
    duplicateTextSet: (textSet: any) => void;
    userId: string;
}

const TextCustomizer: React.FC<TextCustomizerProps> = ({ textSet, handleAttributeChange, removeTextSet, duplicateTextSet, userId }) => {
    const [activeControl, setActiveControl] = useState<string | null>(null);
    const [isPaidUser, setIsPaidUser] = useState(true);

    useEffect(() => { 
        // Always unlocked for local testing
        setIsPaidUser(true);
    }, [userId]);

    const controls = [
        { id: 'text', icon: <CaseSensitive size={20} />, label: 'Text' },
        { id: 'fontFamily', icon: <TypeOutline size={20} />, label: 'Font' },
        { id: 'color', icon: <Palette size={20} />, label: 'Color' },
        { id: 'position', icon: <Move size={20} />, label: 'Position' },
        { id: 'fontSize', icon: <Text size={20} />, label: 'Size' },
        { id: 'fontWeight', icon: <Bold size={20} />, label: 'Weight' },
        { id: 'letterSpacing', icon: <AlignHorizontalSpaceAround size={20} />, label: 'Letter spacing', premium: true },
        { id: 'scaleX', icon: <ArrowLeftRight size={20} />, label: 'Width Scale' },
        { id: 'scaleY', icon: <ArrowUpDown size={20} />, label: 'Height Scale' },
        { id: 'opacity', icon: <LightbulbIcon size={20} />, label: 'Opacity' },
        { id: 'blendMode', icon: <LightbulbIcon size={20} />, label: 'Blend Mode' },
        { id: 'rotation', icon: <RotateCw size={20} />, label: 'Rotate' },
        { id: 'tiltX', icon: <ArrowLeftRight size={20} />, label: 'Tilt X (3D effect)', premium: true },
        { id: 'tiltY', icon: <ArrowUpDown size={20} />, label: 'Tilt Y (3D effect)', premium: true },
        { id: 'layer', icon: <Layers size={20} />, label: 'Layer' },
    ];  

    const handlePremiumAttributeChange = (attribute: string, value: any) => {
        if (isPaidUser || (attribute !== 'letterSpacing' && attribute !== 'tiltX' && attribute !== 'tiltY')) {
            handleAttributeChange(textSet.id, attribute, value);
        }
    };

    return (
        <AccordionItem value={`item-${textSet.id}`}>
            <AccordionTrigger>{textSet.text}</AccordionTrigger>
            <AccordionContent>
                {/* Mobile Controls */}
                <div className="md:hidden">
                    <ScrollArea className="w-full">
                        <div className="flex w-max gap-1 mb-2 p-1">
                            {controls.map((control) => (
                                <button
                                    key={control.id}
                                    onClick={() => setActiveControl(activeControl === control.id ? null : control.id)}
                                    className={`flex flex-col items-center justify-center min-w-[4.2rem] h-[4.2rem] rounded-lg ${
                                        activeControl === control.id ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                                    } ${control.premium && !isPaidUser ? 'opacity-70' : ''}`}
                                >
                                    {control.premium && !isPaidUser && <LockIcon size={12} className="absolute top-1 right-1" />}
                                    {control.icon}
                                    <span className="text-xs mt-1">{control.label}</span>
                                </button>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>

                    <div>
                        {activeControl === 'text' && (
                            <InputField
                                attribute="text"
                                label="Text"
                                currentValue={textSet.text}
                                handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                            />
                        )}

                        {activeControl === 'fontFamily' && (
                            <FontFamilyPicker
                                attribute="fontFamily"
                                currentFont={textSet.fontFamily}
                                handleAttributeChange={(attribute, value) => {
                                    console.log('[TextCustomizer][mobile] Font change ->', { id: textSet.id, attribute, value });
                                    handleAttributeChange(textSet.id, attribute, value)
                                }}
                                userId={userId}
                            />
                        )}

                        {activeControl === 'color' && (
                            <ColorPicker
                                attribute="color"
                                label="Text Color"
                                currentColor={textSet.color}
                                handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                            />
                        )}

                        {activeControl === 'position' && (
                            <div className="space-y-4">
                                <SliderField
                                    attribute="left"
                                    label="X Position"
                                    min={-200}
                                    max={200}
                                    step={1}
                                    currentValue={textSet.left}
                                    handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                                />
                                <SliderField
                                    attribute="top"
                                    label="Y Position"
                                    min={-100}
                                    max={100}
                                    step={1}
                                    currentValue={textSet.top}
                                    handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                                />
                            </div>
                        )}

                        {activeControl === 'fontSize' && (
                            <SliderField
                                attribute="fontSize"
                                label="Text Size"
                                min={10}
                                max={800}
                                step={1}
                                currentValue={textSet.fontSize}
                                handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                            />
                        )}

                        {activeControl === 'fontWeight' && (
                            <SliderField
                                attribute="fontWeight"
                                label="Font Weight"
                                min={100}
                                max={900}
                                step={100}
                                currentValue={textSet.fontWeight}
                                handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                            />
                        )}
                        {activeControl === 'scaleX' && (
                            <SliderField
                                attribute="scaleX"
                                label="Width Scale"
                                min={0.1}
                                max={5}
                                step={0.05}
                                currentValue={textSet.scaleX}
                                handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                            />
                        )}
                        {activeControl === 'scaleY' && (
                            <SliderField
                                attribute="scaleY"
                                label="Height Scale"
                                min={0.1}
                                max={5}
                                step={0.05}
                                currentValue={textSet.scaleY}
                                handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                            />
                        )}
                        
                        {activeControl === 'letterSpacing' && (
                            <SliderField
                                attribute="letterSpacing"
                                label="Letter Spacing"
                                min={-20}
                                max={100}
                                step={1}
                                currentValue={textSet.letterSpacing}
                                handleAttributeChange={(attribute, value) => handlePremiumAttributeChange(attribute, value)}
                                disabled={!isPaidUser}
                                premiumFeature={!isPaidUser}
                            />
                        )}

                        {activeControl === 'opacity' && (
                            <SliderField
                                attribute="opacity"
                                label="Text Opacity"
                                min={0}
                                max={1}
                                step={0.01}
                                currentValue={textSet.opacity}
                                handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                            />
                        )}

                        {activeControl === 'blendMode' && (
                            <div className="mt-4">
                                <label className="text-sm">Blend Mode</label>
                                <select
                                    className="mt-2 border rounded-md px-2 py-2 text-sm w-full"
                                    value={textSet.blendMode}
                                    onChange={(e) => handleAttributeChange(textSet.id, 'blendMode', e.target.value)}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="multiply">Multiply</option>
                                    <option value="screen">Screen</option>
                                    <option value="overlay">Overlay</option>
                                    <option value="darken">Darken</option>
                                    <option value="lighten">Lighten</option>
                                    <option value="color-dodge">Color Dodge</option>
                                    <option value="color-burn">Color Burn</option>
                                    <option value="hard-light">Hard Light</option>
                                    <option value="soft-light">Soft Light</option>
                                    <option value="difference">Difference</option>
                                    <option value="exclusion">Exclusion</option>
                                    <option value="hue">Hue</option>
                                    <option value="saturation">Saturation</option>
                                    <option value="color">Color</option>
                                    <option value="luminosity">Luminosity</option>
                                </select>
                            </div>
                        )}

                        {activeControl === 'rotation' && (
                            <SliderField
                                attribute="rotation"
                                label="Rotation"
                                min={-360}
                                max={360}
                                step={1}
                                currentValue={textSet.rotation}
                                handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                            />
                        )}

                        {activeControl === 'tiltX' && (
                            <SliderField
                                attribute="tiltX"
                                label="Horizontal Tilt"
                                min={-45}
                                max={45}
                                step={1}
                                currentValue={textSet.tiltX}
                                handleAttributeChange={(attribute, value) => handlePremiumAttributeChange(attribute, value)}
                                disabled={!isPaidUser}
                                premiumFeature={!isPaidUser}
                            />
                        )}

                        {activeControl === 'tiltY' && (
                            <SliderField
                                attribute="tiltY"
                                label="Vertical Tilt"
                                min={-45}
                                max={45}
                                step={1}
                                currentValue={textSet.tiltY}
                                handleAttributeChange={(attribute, value) => handlePremiumAttributeChange(attribute, value)}
                                disabled={!isPaidUser}
                                premiumFeature={!isPaidUser}
                            />
                        )}

                        {activeControl === 'layer' && (
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Button
                                        variant={textSet.layer === 'front' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => {
                                            console.log('FRONT button clicked for text:', textSet.text);
                                            handleAttributeChange(textSet.id, 'layer', 'front');
                                        }}
                                        className="flex-1"
                                    >
                                        <ChevronUp size={16} className="mr-1" />
                                        Bring to Front
                                    </Button>
                                    <Button
                                        variant={textSet.layer === 'behind' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => {
                                            console.log('BACK button clicked for text:', textSet.text);
                                            handleAttributeChange(textSet.id, 'layer', 'behind');
                                        }}
                                        className="flex-1"
                                    >
                                        <ChevronDown size={16} className="mr-1" />
                                        Send to Back
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:block">
                    <InputField
                        attribute="text"
                        label="Text"
                        currentValue={textSet.text}
                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                    />
                    <div className='flex flex-row items-center gap-6 w-full flex-wrap'>
                        <FontFamilyPicker
                            attribute="fontFamily"
                            currentFont={textSet.fontFamily}
                            handleAttributeChange={(attribute, value) => {
                                console.log('[TextCustomizer][desktop] Font change ->', { id: textSet.id, attribute, value });
                                handleAttributeChange(textSet.id, attribute, value)
                            }}
                            userId={userId}
                        />
                        <ColorPicker
                            attribute="color"
                            label="Text Color"
                            currentColor={textSet.color}
                            handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                        />
                        <ColorPicker
                            attribute="strokeColor"
                            label="Outline Color"
                            currentColor={textSet.strokeColor}
                            handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                        />
                    </div>
                    <div className="flex gap-2 mt-2">
                        <Button
                            variant='outline'
                            size="sm"
                            onClick={() => {
                                console.log('DESKTOP FRONT button clicked for text:', textSet.text);
                                console.log('handleAttributeChange function:', typeof handleAttributeChange);
                                console.log('handleAttributeChange function name:', handleAttributeChange.name);
                                console.log('handleAttributeChange function toString:', handleAttributeChange.toString().substring(0, 200));
                                try {
                                    console.log('About to call handleAttributeChange with:', textSet.id, 'layer', 'front');
                                    handleAttributeChange(textSet.id, 'layer', 'front');
                                    console.log('handleAttributeChange call completed');
                                } catch (error) {
                                    console.error('Error in handleAttributeChange:', error);
                                }
                            }}
                            className={`flex-1 ${textSet.layer === 'front' ? 'bg-orange-600 hover:bg-orange-700 text-white border-orange-600' : 'border-orange-600 text-orange-600 hover:bg-orange-50'}`}
                        >
                            <ChevronUp size={16} className='mr-1' />
                            Bring to Front
                        </Button>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                                console.log('DESKTOP BACK button clicked for text:', textSet.text);
                                console.log('handleAttributeChange function:', typeof handleAttributeChange);
                                try {
                                    console.log('About to call handleAttributeChange with:', textSet.id, 'layer', 'behind');
                                    handleAttributeChange(textSet.id, 'layer', 'behind');
                                    console.log('handleAttributeChange call completed');
                                } catch (error) {
                                    console.error('Error in handleAttributeChange:', error);
                                }
                            }}
                            className={`flex-1 ${textSet.layer === 'behind' ? 'bg-orange-600 hover:bg-orange-700 text-white border-orange-600' : 'border-orange-600 text-orange-600 hover:bg-orange-50'}`}
                        >
                            <ChevronDown size={16} className='mr-1' />
                            Send to Back
                        </Button>
                    </div>
                    <SliderField
                        attribute="strokeWidth"
                        label="Outline Width"
                        min={0}
                        max={40}
                        step={1}
                        currentValue={textSet.strokeWidth}
                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                    />
                    <SliderField
                        attribute="left"
                        label="X Position"
                        min={-200}
                        max={200}
                        step={1}
                        currentValue={textSet.left}
                        hasTopPadding={false}
                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                    />
                    <SliderField
                        attribute="top"
                        label="Y Position"
                        min={-100}
                        max={100}
                        step={1}
                        currentValue={textSet.top}
                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                    />
                    <SliderField
                        attribute="fontSize"
                        label="Text Size"
                        min={10}
                        max={800}
                        step={1}
                        currentValue={textSet.fontSize}
                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                    />
                    <SliderField
                        attribute="fontWeight"
                        label="Font Weight"
                        min={100}
                        max={900}
                        step={100}
                        currentValue={textSet.fontWeight}
                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                    />
                    <div className='grid md:grid-cols-2 gap-6'>
                        <SliderField
                            attribute="scaleX"
                            label="Width Scale"
                            min={0.1}
                            max={5}
                            step={0.05}
                            currentValue={textSet.scaleX}
                            handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                        />
                        <SliderField
                            attribute="scaleY"
                            label="Height Scale"
                            min={0.1}
                            max={5}
                            step={0.05}
                            currentValue={textSet.scaleY}
                            handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                        />
                    </div>
                    <SliderField
                        attribute="letterSpacing"
                        label="Letter Spacing"
                        min={-20}
                        max={100}
                        step={1}
                        currentValue={textSet.letterSpacing}
                        handleAttributeChange={(attribute, value) => handlePremiumAttributeChange(attribute, value)}
                        disabled={!isPaidUser}
                        premiumFeature={!isPaidUser}
                    />
                    <SliderField
                        attribute="opacity"
                        label="Text Opacity"
                        min={0}
                        max={1}
                        step={0.01}
                        currentValue={textSet.opacity}
                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                    />
                    
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <label className='text-sm font-medium'>Blend Mode</label>
                            <Select value={textSet.blendMode} onValueChange={(value) => handleAttributeChange(textSet.id, 'blendMode', value)}>
                                <SelectTrigger className="mt-2 w-full">
                                    <SelectValue placeholder="Select blend mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="multiply">Multiply</SelectItem>
                                    <SelectItem value="screen">Screen</SelectItem>
                                    <SelectItem value="overlay">Overlay</SelectItem>
                                    <SelectItem value="darken">Darken</SelectItem>
                                    <SelectItem value="lighten">Lighten</SelectItem>
                                    <SelectItem value="color-dodge">Color Dodge</SelectItem>
                                    <SelectItem value="color-burn">Color Burn</SelectItem>
                                    <SelectItem value="hard-light">Hard Light</SelectItem>
                                    <SelectItem value="soft-light">Soft Light</SelectItem>
                                    <SelectItem value="difference">Difference</SelectItem>
                                    <SelectItem value="exclusion">Exclusion</SelectItem>
                                    <SelectItem value="hue">Hue</SelectItem>
                                    <SelectItem value="saturation">Saturation</SelectItem>
                                    <SelectItem value="color">Color</SelectItem>
                                    <SelectItem value="luminosity">Luminosity</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <ColorPicker
                                attribute="shadowColor"
                                label="Shadow Color"
                                currentColor={textSet.shadowColor}
                                handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                            />
                        </div>
                    </div>
                    
                    <SliderField
                        attribute="shadowSize"
                        label="Shadow Size"
                        min={0}
                        max={50}
                        step={1}
                        currentValue={textSet.shadowSize}
                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                    />
                    <SliderField
                        attribute="rotation"
                        label="Rotation"
                        min={-360}
                        max={360}
                        step={1}
                        currentValue={textSet.rotation}
                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                    />
                    <SliderField
                        attribute="tiltX"
                        label="Horizontal Tilt (3D effect)"
                        min={-45}
                        max={45}
                        step={1}
                        currentValue={textSet.tiltX}
                        handleAttributeChange={(attribute, value) => handlePremiumAttributeChange(attribute, value)}
                        disabled={!isPaidUser}
                        premiumFeature={!isPaidUser}
                    />
                    <SliderField
                        attribute="tiltY"
                        label="Vertical Tilt (3D effect)"
                        min={-45}
                        max={45}
                        step={1}
                        currentValue={textSet.tiltY}
                        handleAttributeChange={(attribute, value) => handlePremiumAttributeChange(attribute, value)}
                        disabled={!isPaidUser}
                        premiumFeature={!isPaidUser}
                    />
                </div>

                <div className="flex flex-row gap-2 my-8">
                    <Button variant="destructive" onClick={() => duplicateTextSet(textSet)}>Duplicate Text Set</Button>
                    <Button variant="destructive" onClick={() => removeTextSet(textSet.id)}>Remove Text Set</Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

export default TextCustomizer;