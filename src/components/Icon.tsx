import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  filled?: boolean;
  style?: React.CSSProperties;
}

/**
 * Material Symbols wrapper with animated transitions.
 * Uses the 'material-symbols-rounded' variable font loaded via CSS.
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  className = '',
  filled = false,
  style,
}) => {
  return (
    <span
      className={`material-symbols-rounded icon-animated ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        flexShrink: 0,
        ...style,
      }}
    >
      {name}
    </span>
  );
};
