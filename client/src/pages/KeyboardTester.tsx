import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Keyboard, Mouse, RotateCcw, Check, ArrowUp, ArrowDown } from "lucide-react";

interface KeyData {
  code: string;
  label: string;
  width?: number;
}

const KEYBOARD_LAYOUT: KeyData[][] = [
  [
    { code: "Escape", label: "Esc", width: 1 },
    { code: "F1", label: "F1", width: 1 },
    { code: "F2", label: "F2", width: 1 },
    { code: "F3", label: "F3", width: 1 },
    { code: "F4", label: "F4", width: 1 },
    { code: "F5", label: "F5", width: 1 },
    { code: "F6", label: "F6", width: 1 },
    { code: "F7", label: "F7", width: 1 },
    { code: "F8", label: "F8", width: 1 },
    { code: "F9", label: "F9", width: 1 },
    { code: "F10", label: "F10", width: 1 },
    { code: "F11", label: "F11", width: 1 },
    { code: "F12", label: "F12", width: 1 },
  ],
  [
    { code: "Backquote", label: "`", width: 1 },
    { code: "Digit1", label: "1", width: 1 },
    { code: "Digit2", label: "2", width: 1 },
    { code: "Digit3", label: "3", width: 1 },
    { code: "Digit4", label: "4", width: 1 },
    { code: "Digit5", label: "5", width: 1 },
    { code: "Digit6", label: "6", width: 1 },
    { code: "Digit7", label: "7", width: 1 },
    { code: "Digit8", label: "8", width: 1 },
    { code: "Digit9", label: "9", width: 1 },
    { code: "Digit0", label: "0", width: 1 },
    { code: "Minus", label: "-", width: 1 },
    { code: "Equal", label: "=", width: 1 },
    { code: "Backspace", label: "Backspace", width: 2 },
  ],
  [
    { code: "Tab", label: "Tab", width: 1.5 },
    { code: "KeyQ", label: "Q", width: 1 },
    { code: "KeyW", label: "W", width: 1 },
    { code: "KeyE", label: "E", width: 1 },
    { code: "KeyR", label: "R", width: 1 },
    { code: "KeyT", label: "T", width: 1 },
    { code: "KeyY", label: "Y", width: 1 },
    { code: "KeyU", label: "U", width: 1 },
    { code: "KeyI", label: "I", width: 1 },
    { code: "KeyO", label: "O", width: 1 },
    { code: "KeyP", label: "P", width: 1 },
    { code: "BracketLeft", label: "[", width: 1 },
    { code: "BracketRight", label: "]", width: 1 },
    { code: "Backslash", label: "\\", width: 1.5 },
  ],
  [
    { code: "CapsLock", label: "Caps", width: 1.75 },
    { code: "KeyA", label: "A", width: 1 },
    { code: "KeyS", label: "S", width: 1 },
    { code: "KeyD", label: "D", width: 1 },
    { code: "KeyF", label: "F", width: 1 },
    { code: "KeyG", label: "G", width: 1 },
    { code: "KeyH", label: "H", width: 1 },
    { code: "KeyJ", label: "J", width: 1 },
    { code: "KeyK", label: "K", width: 1 },
    { code: "KeyL", label: "L", width: 1 },
    { code: "Semicolon", label: ";", width: 1 },
    { code: "Quote", label: "'", width: 1 },
    { code: "Enter", label: "Enter", width: 2.25 },
  ],
  [
    { code: "ShiftLeft", label: "Shift", width: 2.25 },
    { code: "KeyZ", label: "Z", width: 1 },
    { code: "KeyX", label: "X", width: 1 },
    { code: "KeyC", label: "C", width: 1 },
    { code: "KeyV", label: "V", width: 1 },
    { code: "KeyB", label: "B", width: 1 },
    { code: "KeyN", label: "N", width: 1 },
    { code: "KeyM", label: "M", width: 1 },
    { code: "Comma", label: ",", width: 1 },
    { code: "Period", label: ".", width: 1 },
    { code: "Slash", label: "/", width: 1 },
    { code: "ShiftRight", label: "Shift", width: 2.75 },
  ],
  [
    { code: "ControlLeft", label: "Ctrl", width: 1.25 },
    { code: "MetaLeft", label: "Win", width: 1.25 },
    { code: "AltLeft", label: "Alt", width: 1.25 },
    { code: "Space", label: "Space", width: 6.25 },
    { code: "AltRight", label: "Alt", width: 1.25 },
    { code: "MetaRight", label: "Win", width: 1.25 },
    { code: "ContextMenu", label: "Menu", width: 1.25 },
    { code: "ControlRight", label: "Ctrl", width: 1.25 },
  ],
];

const ARROW_KEYS: KeyData[][] = [
  [{ code: "ArrowUp", label: "↑", width: 1 }],
  [
    { code: "ArrowLeft", label: "←", width: 1 },
    { code: "ArrowDown", label: "↓", width: 1 },
    { code: "ArrowRight", label: "→", width: 1 },
  ],
];

const NAV_KEYS: KeyData[][] = [
  [
    { code: "Insert", label: "Ins", width: 1 },
    { code: "Home", label: "Home", width: 1 },
    { code: "PageUp", label: "PgUp", width: 1 },
  ],
  [
    { code: "Delete", label: "Del", width: 1 },
    { code: "End", label: "End", width: 1 },
    { code: "PageDown", label: "PgDn", width: 1 },
  ],
];

const TOTAL_KEYS = 87;

export default function KeyboardTester() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [currentlyPressed, setCurrentlyPressed] = useState<Set<string>>(new Set());
  const [leftClick, setLeftClick] = useState(false);
  const [rightClick, setRightClick] = useState(false);
  const [middleClick, setMiddleClick] = useState(false);
  const [scrollDetected, setScrollDetected] = useState<"up" | "down" | null>(null);
  const { toast } = useToast();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    const code = e.code;
    
    setPressedKeys((prev) => {
      const newSet = new Set(prev);
      newSet.add(code);
      return newSet;
    });
    
    setCurrentlyPressed((prev) => {
      const newSet = new Set(prev);
      newSet.add(code);
      return newSet;
    });
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setCurrentlyPressed((prev) => {
      const newSet = new Set(prev);
      newSet.delete(e.code);
      return newSet;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const handleReset = () => {
    setPressedKeys(new Set());
    setCurrentlyPressed(new Set());
    setLeftClick(false);
    setRightClick(false);
    setMiddleClick(false);
    setScrollDetected(null);
    toast({
      title: "Test Reset",
      description: "All keyboard and mouse tests have been cleared.",
    });
  };

  const handleMouseDown = (e: React.MouseEvent, target: HTMLDivElement) => {
    e.preventDefault();
    if (e.button === 0) setLeftClick(true);
    if (e.button === 1) setMiddleClick(true);
    if (e.button === 2) setRightClick(true);
  };

  const handleScroll = (e: React.WheelEvent) => {
    setScrollDetected(e.deltaY < 0 ? "up" : "down");
  };

  const progress = (pressedKeys.size / TOTAL_KEYS) * 100;

  const KeyComponent = ({ keyData }: { keyData: KeyData }) => {
    const isPressed = pressedKeys.has(keyData.code);
    const isCurrentlyPressed = currentlyPressed.has(keyData.code);
    const width = keyData.width || 1;

    return (
      <div
        className={`
          flex items-center justify-center rounded-md border-2 text-xs sm:text-sm font-medium
          transition-all duration-150 select-none
          ${isPressed 
            ? "bg-green-500 border-green-600 text-white" 
            : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-foreground"
          }
          ${isCurrentlyPressed ? "scale-95 shadow-inner" : "shadow-sm"}
        `}
        style={{ 
          width: `${width * 2.5}rem`,
          height: "2.5rem",
          minWidth: `${width * 2.5}rem`,
        }}
      >
        {keyData.label}
        {isPressed && <Check className="w-3 h-3 ml-1" />}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Keyboard className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Keyboard & Mouse Tester</h1>
          </div>
          <p className="text-muted-foreground">Test your keyboard and mouse buttons for proper functionality</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div className="text-center sm:text-left">
                <p className="text-3xl font-bold text-primary" data-testid="text-keys-tested">
                  {pressedKeys.size} / {TOTAL_KEYS}
                </p>
                <p className="text-sm text-muted-foreground">Keys Tested ({Math.round(progress)}% Complete)</p>
              </div>
              <Button onClick={handleReset} variant="outline" data-testid="button-reset">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Test
              </Button>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        <Card className="mb-6 overflow-x-auto">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Test
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Press each key on your keyboard. Keys will turn green when detected.
            </p>
            
            <div className="flex gap-6 min-w-max">
              <div className="space-y-1">
                {KEYBOARD_LAYOUT.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-1">
                    {row.map((keyData) => (
                      <KeyComponent key={keyData.code} keyData={keyData} />
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <div className="space-y-1">
                  {NAV_KEYS.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-1">
                      {row.map((keyData) => (
                        <KeyComponent key={keyData.code} keyData={keyData} />
                      ))}
                    </div>
                  ))}
                </div>

                <div className="mt-auto space-y-1">
                  {ARROW_KEYS.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-1 justify-center">
                      {row.map((keyData) => (
                        <KeyComponent key={keyData.code} keyData={keyData} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Mouse className="w-5 h-5" />
              Mouse Test
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click the boxes below to test your mouse buttons. Use scroll wheel in the scroll area.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div
                onClick={() => setLeftClick(true)}
                className={`
                  p-6 rounded-lg border-2 text-center cursor-pointer transition-all select-none
                  ${leftClick 
                    ? "bg-green-500 border-green-600 text-white" 
                    : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-primary"
                  }
                `}
                data-testid="mouse-left"
              >
                <p className="font-medium mb-1">Left Click</p>
                {leftClick ? (
                  <Check className="w-6 h-6 mx-auto" />
                ) : (
                  <p className="text-sm opacity-70">Click here</p>
                )}
              </div>

              <div
                onContextMenu={(e) => {
                  e.preventDefault();
                  setRightClick(true);
                }}
                className={`
                  p-6 rounded-lg border-2 text-center cursor-pointer transition-all select-none
                  ${rightClick 
                    ? "bg-green-500 border-green-600 text-white" 
                    : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-primary"
                  }
                `}
                data-testid="mouse-right"
              >
                <p className="font-medium mb-1">Right Click</p>
                {rightClick ? (
                  <Check className="w-6 h-6 mx-auto" />
                ) : (
                  <p className="text-sm opacity-70">Right-click here</p>
                )}
              </div>

              <div
                onMouseDown={(e) => {
                  if (e.button === 1) {
                    e.preventDefault();
                    setMiddleClick(true);
                  }
                }}
                className={`
                  p-6 rounded-lg border-2 text-center cursor-pointer transition-all select-none
                  ${middleClick 
                    ? "bg-green-500 border-green-600 text-white" 
                    : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-primary"
                  }
                `}
                data-testid="mouse-middle"
              >
                <p className="font-medium mb-1">Middle Click</p>
                {middleClick ? (
                  <Check className="w-6 h-6 mx-auto" />
                ) : (
                  <p className="text-sm opacity-70">Middle-click here</p>
                )}
              </div>

              <div
                onWheel={handleScroll}
                className={`
                  p-6 rounded-lg border-2 text-center cursor-pointer transition-all select-none
                  ${scrollDetected 
                    ? "bg-green-500 border-green-600 text-white" 
                    : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-primary"
                  }
                `}
                data-testid="mouse-scroll"
              >
                <p className="font-medium mb-1">Scroll Wheel</p>
                {scrollDetected ? (
                  <div className="flex items-center justify-center gap-1">
                    <Check className="w-5 h-5" />
                    {scrollDetected === "up" ? (
                      <ArrowUp className="w-5 h-5" />
                    ) : (
                      <ArrowDown className="w-5 h-5" />
                    )}
                  </div>
                ) : (
                  <p className="text-sm opacity-70">Scroll here</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-3">Instructions</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Keyboard Testing</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Press each key on your physical keyboard</li>
                  <li>Keys turn green when successfully detected</li>
                  <li>Test all modifier keys (Shift, Ctrl, Alt)</li>
                  <li>Some special keys may not be detectable in browsers</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Mouse Testing</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Click the designated areas for each button</li>
                  <li>Right-click in the right-click area</li>
                  <li>Press your scroll wheel for middle-click</li>
                  <li>Scroll up or down in the scroll area</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
