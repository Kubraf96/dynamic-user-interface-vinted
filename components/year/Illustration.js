import styles from "./Story.module.css";

// One layer of a story illustration, positioned in card coordinates (353 × 679).
// Mirrors the Figma structure: an outer bounding box with a centred, rotated inner frame,
// and the asset placed inside that frame (optionally with a "draw" animation).
//   inset    – [top, right, bottom, left] of the asset relative to the frame (stroke overshoot)
//   imgStyle – explicit crop/placement for photos (used instead of inset)
export default function Illustration({ box, frame, transform, src, imgStyle, inset, draw, clip = false, cover = false }) {
  const [left, top, width, height] = box;
  const [frameWidth, frameHeight] = frame;
  const [insetTop, insetRight, insetBottom, insetLeft] = inset ?? [0, 0, 0, 0];

  return (
    <div className={styles.layer} style={{ left, top, width, height }} aria-hidden="true">
      <div
        className={`${styles.layerFrame} ${clip ? styles.clip : ""}`}
        style={{ width: frameWidth, height: frameHeight, transform }}
      >
        {imgStyle ? (
          <img className={styles.layerPhoto} style={imgStyle} src={src} alt="" />
        ) : (
          <div
            className={`${styles.layerAsset} ${draw ? styles[draw] : ""}`}
            style={{ top: insetTop, right: insetRight, bottom: insetBottom, left: insetLeft }}
          >
            <img className={cover ? styles.cover : ""} src={src} alt="" />
          </div>
        )}
      </div>
    </div>
  );
}
