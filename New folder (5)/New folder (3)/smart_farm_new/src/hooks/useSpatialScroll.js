import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const useSpatialScroll = (options = {}) => {
  const {
    containerRef,
    perspective = 1200,
    depthSpacing = 100,
    smoothScrub = true,
  } = options;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray(".spatial-section");
      
      sections.forEach((section, i) => {
        const depth = i * depthSpacing;
        
        gsap.fromTo(section,
          {
            opacity: 0,
            transform: `translateZ(${depth - 200}px) scale(0.9)`,
          },
          {
            opacity: 1,
            transform: `translateZ(${depth}px) scale(1)`,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "center center",
              scrub: smoothScrub ? 1 : false,
            },
          }
        );
      });

      gsap.to(".spatial-bg", {
        transform: "translateZ(-500px) scale(1.5)",
        ease: "none",
        scrollTrigger: {
          trigger: containerRef?.current || "body",
          start: "top top",
          end: "bottom bottom",
          scrub: smoothScrub ? 1 : false,
        },
      });
    }, containerRef?.current);

    return () => ctx.revert();
  }, [perspective, depthSpacing, smoothScrub, containerRef]);
};

export const createSceneTransition = (
  trigger,
  options
) => {
  return gsap.fromTo(
    trigger,
    {
      opacity: options.from.opacity,
      scale: options.from.scale,
      transform: `translateZ(${options.from.z}px)`,
    },
    {
      opacity: options.to.opacity,
      scale: options.to.scale,
      transform: `translateZ(${options.to.z}px)`,
      duration: options.duration || 1,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger,
        start: "top 80%",
        end: "top 40%",
        scrub: 1,
      },
    }
  );
};

export default useSpatialScroll;