import GlobalState from "@modules/globalState";
import { createHTMLElement } from "@utilities/createElement";
import type {
  PosterConfig,
  PosterConfigCluster,
  PosterElement,
  PosterSpacePosition,
} from "@type/PosterTypes";

function getPosterInitConfig() {
  const posterConfig: PosterConfig = {
    sizeMax: 9.25,
    sizeMin: 2,
  };
  const posterConfigCluster: PosterConfigCluster = {
    clusterWidth:
      50 - Math.sqrt(posterConfig.sizeMax * posterConfig.sizeMax * 2),
    clusterWidthOffset: 30,
    clusterHeight:
      85 - Math.sqrt(posterConfig.sizeMax * posterConfig.sizeMax * 2),
  };
  const posterSpacePosition: PosterSpacePosition = {
    z:
      (Math.random() * posterConfigCluster.clusterWidth) / 2 +
      posterConfigCluster.clusterWidthOffset / 2,
    y:
      Math.random() * posterConfigCluster.clusterHeight -
      posterConfigCluster.clusterHeight / 2,
    r: Math.random() * 360,
    s:
      Math.random() * (posterConfig.sizeMax - posterConfig.sizeMin) +
      posterConfig.sizeMin,
    rX: Math.random() * 90 - 45,
    rY: Math.random() * 180 - 95,
  };

  return { posterConfig, posterConfigCluster, posterSpacePosition };
}

function getPosterCameraDistanceFactor(
  posterConfigCluster: PosterConfigCluster,
  posterSpacePosition: PosterSpacePosition
) {
  const rotation = Math.abs(
    (GlobalState.getInstance().stateSpace.rotateDegFocus +
      posterSpacePosition.r) %
      360
  );
  const rotationCorrected =
    Math.floor(rotation / 180) === 0 ? rotation % 180 : 180 - (rotation % 180);
  const cameraDistance =
    rotationCorrected === 0
      ? 0
      : rotationCorrected === 90
      ? posterConfigCluster.clusterWidth / 2
      : rotationCorrected === 180
      ? posterConfigCluster.clusterWidth
      : (() => {
          const requireCorrection = Math.floor(rotationCorrected / 90) !== 0;
          const requireCorrectionCorrected = requireCorrection
            ? 90 - (rotationCorrected % 90)
            : rotationCorrected;

          const distance2Center =
            posterSpacePosition.z *
            Math.sin(((90 - requireCorrectionCorrected) * Math.PI) / 180);

          return requireCorrection
            ? distance2Center + posterConfigCluster.clusterWidth / 2
            : posterConfigCluster.clusterWidth / 2 - distance2Center;
        })();

  return Math.max(
    Math.min(cameraDistance / posterConfigCluster.clusterWidth, 1),
    0
  );
}

export function createPosterElement<T extends PosterElement = PosterElement>(
  type: "img" | "div",
  modifier: ((el: T) => void) | undefined = undefined
): T {
  const { posterConfigCluster, posterSpacePosition } = getPosterInitConfig();

  const posterInitStyle = {
    height: `${posterSpacePosition.s}em`,
    width: `${posterSpacePosition.s}em`,
    transform: `
        rotateY(${posterSpacePosition.r}deg)
        translateZ(${posterSpacePosition.z}vw)
        translateY(${posterSpacePosition.y}vh)
        rotateY(${posterSpacePosition.rY}deg)
        rotateX(${posterSpacePosition.rX}deg)`,
  };

  const el = createHTMLElement<T>({
    tag: type,
    attributes: { class: "poster" },
    modifier: (el) => {
      Object.assign(el.style, posterInitStyle);
      el.draggable = false;
      el.posterType = type;
      el.onerror = () => {
        el.style.display = "none";
      };
      el.updateAnimation = () => {
        // update brightness
        const cameraDistanceFactor = getPosterCameraDistanceFactor(
          posterConfigCluster,
          posterSpacePosition
        );
        el.style.filter = `brightness(${
          (1 - cameraDistanceFactor) * 0.65 + 0.05
        })`;
      };
      // chain modifer
      if (modifier !== undefined) {
        modifier(el);
      }
    },
  });

  return el;
}
