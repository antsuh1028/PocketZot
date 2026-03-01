import { Box, Text, Button, Input } from "@chakra-ui/react";

export const FONT = "'Press Start 2P', monospace";

export function PixelWindow({ title, width = 375, children }) {
  return (
    <Box w={`${width}px`} bg="var(--bg)" border="3px solid var(--border)" boxShadow="4px 4px 0 #6a5a4a" fontFamily={FONT}>
      <Box bg="var(--panel)" borderBottom="3px solid var(--border)" px={2} py="4px"
        display="flex" alignItems="center" justifyContent="space-between">
        <Text fontSize="7px" fontFamily={FONT} color="var(--dark)">Pocket Zot</Text>
        <Box display="flex" gap="4px">
          {["◀","✕"].map(s => (
            <Box key={s} w="14px" h="14px" bg="var(--btn-bg)" border="2px solid var(--btn-border)"
              display="flex" alignItems="center" justifyContent="center"
              fontSize="6px" cursor="pointer" color="var(--dark)" fontFamily={FONT}>{s}</Box>
          ))}
        </Box>
      </Box>
      <Box p={3}>{children}</Box>
    </Box>
  );
}

export function PixelBtn({ children, onClick, fullWidth, color = "default" }) {
  const s = {
    default: { bg:"var(--btn-bg)", bc:"var(--btn-border)", c:"var(--dark)" },
    green:   { bg:"#7ab86a",       bc:"#4a8a3a",           c:"white" },
    red:     { bg:"#c45a4a",       bc:"#8a2a1a",           c:"white" },
  }[color] || { bg:"var(--btn-bg)", bc:"var(--btn-border)", c:"var(--dark)" };

  return (
    <Button onClick={onClick} w={fullWidth ? "full" : "auto"}
      bg={s.bg} border="3px solid" borderColor={s.bc} color={s.c}
      borderRadius={0} boxShadow="2px 2px 0 rgba(0,0,0,0.3)"
      fontFamily={FONT} fontSize="8px" px={3} py={2} h="auto"
      _hover={{ bg: s.bg, opacity: 0.85 }}
      _active={{ transform: "translate(1px,1px)", boxShadow: "none" }}>
      {children}
    </Button>
  );
}

export function PixelInput({ label, type = "text", value, onChange, placeholder }) {
  return (
    <Box mb={3}>
      {label && <Text fontFamily={FONT} fontSize="7px" color="var(--dark)" mb="4px">{label}:</Text>}
      <Input type={type} value={value} onChange={onChange} placeholder={placeholder}
        bg="var(--input-bg)" border="3px solid var(--border)" borderRadius={0}
        fontFamily={FONT} fontSize="7px" color="var(--dark)" h="auto" px={2} py="5px"
        _focus={{ boxShadow: "none", borderColor: "var(--dark)" }} />
    </Box>
  );
}

export function PixelText({ children, size = "8px", color = "var(--dark)", ...props }) {
  return <Text fontFamily={FONT} fontSize={size} color={color} lineHeight={1.8} {...props}>{children}</Text>;
}

export function AnteaterSprite({ size = 80 }) {
  return (
    <Box w={`${size}px`} h={`${size}px`} flexShrink={0}>
      <Box as="img" src="/Idle State.png" w="100%" h="100%"
        objectFit="contain" style={{ imageRendering:"pixelated" }} />
    </Box>
  );
}