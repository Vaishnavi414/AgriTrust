import { ReactNode } from "react";

export const SpatialContainer = ({ children, className = "" }) => {
  return (
    <div
      className={`relative ${className}`}
      style={{
        perspective: "1200px",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
};

export const SpatialLayer = ({
  children,
  className = "",
  z = 0,
}) => {
  return (
    <div
      className={className}
      style={{
        transform: `translateZ(${z}px)`,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
};

export default SpatialContainer;