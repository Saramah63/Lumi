import { motion } from "motion/react";
import { useState, useEffect } from "react";
import lumiImage from "@/assets/lumi-avatar.png";

interface LumiAvatarProps {
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  emotion?: "neutral" | "happy" | "calm" | "thinking";
  breathing?: boolean;
  speaking?: boolean;
  className?: string;
}

export function LumiAvatar({ 
  size = "lg", 
  emotion = "neutral", 
  breathing = false,
  speaking = false,
  className = "" 
}: LumiAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);

  const sizeMap = {
    sm: "w-32 h-32",      // 128px (was 96px)
    md: "w-48 h-48",      // 192px (was 128px)
    lg: "w-64 h-64",      // 256px (was 192px)
    xl: "w-80 h-80",      // 320px (was 256px)
    xxl: "w-96 h-96"      // 384px (NEW!)
  };

  // Blink animation every 3-5 seconds
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, Math.random() * 2000 + 3000); // Random between 3-5 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  const glowAnimation = breathing ? {
    scale: [1, 1.1, 1],
    opacity: [0.3, 0.6, 0.3],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};

  const floatAnimation = {
    y: [0, -12, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  // Lip sync animation when speaking - faster and more noticeable
  const speakingAnimation = speaking ? {
    scale: [1, 1.03, 0.98, 1.02, 1],
    transition: {
      duration: 0.4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};

  return (
    <motion.div 
      className={`relative flex items-center justify-center ${className}`}
      animate={floatAnimation}
    >
      {/* Larger Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{ 
          backgroundColor: "var(--lumi-glow)",
          width: "120%",
          height: "120%"
        }}
        animate={glowAnimation}
      />
      
      {/* Lumi character - Real Image with animations */}
      <motion.div 
        className={`relative ${sizeMap[size]} flex items-center justify-center`}
        animate={speakingAnimation}
      >
        <div className="relative w-full h-full">
          {/* Main Lumi Image */}
          <img 
            src={lumiImage} 
            alt="Lumi"
            className="w-full h-full object-contain"
            style={{
              filter: breathing 
                ? 'drop-shadow(0 0 30px rgba(135, 206, 235, 0.7))' 
                : 'drop-shadow(0 0 15px rgba(135, 206, 235, 0.4))'
            }}
          />

          {/* Eye Blink Overlay */}
          {isBlinking && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              {/* Semi-transparent overlay for blink effect */}
              <div 
                className="absolute"
                style={{
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(to bottom, transparent 35%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.3) 45%, transparent 50%)",
                  pointerEvents: "none"
                }}
              />
            </motion.div>
          )}

          {/* Lip Sync Indicator - animated mouth glow when speaking */}
          {speaking && (
            <motion.div
              className="absolute"
              style={{
                bottom: "35%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "15%",
                height: "8%",
                background: "radial-gradient(circle, rgba(255, 182, 193, 0.6) 0%, transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none"
              }}
              animate={{
                opacity: [0.3, 0.8, 0.4, 0.9, 0.3],
                scale: [1, 1.2, 0.9, 1.15, 1],
              }}
              transition={{
                duration: 0.4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}