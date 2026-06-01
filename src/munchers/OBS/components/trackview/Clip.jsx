import Box from "@mui/material/Box";
import ClipWaveform from "./ClipWaveform";

import { useRef, useEffect, useState } from "react";
import interact from "interactjs";
import { snapTime } from "../lib/snap";

// Un clip = un bloc visuel positionné en absolu sur la lane.
// left/width sont calculés depuis (seg.vStart, durée) et pxPerSec.
const INSET_X = 1;
const INSET_Y = 2;
const HEADER_HEIGHT = 12;

export default function Clip({
  segment,
  trackId,
  trackBuffer,
  pxPerSec,
  isSelected,
  onMove,
  onMoveAcrossTracks,
  onClipTrim,
  onSelect,
  getSnapCandidates,
  snapEnabled,
  snapStep,
  resizeBounds,
}) {
  const dur = segment.srcEnd - segment.srcStart;
  const left = segment.vStart * pxPerSec + INSET_X;
  const width = Math.max(0, dur * pxPerSec - INSET_X * 2);

  // Interact.js pour le draggable
  const ref = useRef(null);
  const dragDxRef = useRef(0);
  // Rect au début du resize. e.deltaRect d'interact.js est INCRÉMENTAL
  // (delta depuis le previous event), pas cumulatif. À end(), il vaut donc
  // ~0. On capture le rect initial pour calculer le total via (e.rect - startRect).
  const resizeStartRectRef = useRef(null);
  // Handle impératif vers ClipWaveform : permet de translater le canvas
  // (qui contient la waveform du buffer ENTIER) pendant le resize, sans
  // re-render React → animation 60fps sans tremblement.
  const waveformRef = useRef(null);

  const dragDyRef = useRef(0);
  const hoveredTrackIdRef = useRef(trackId);

  // Suppression du clic (sélection) si un drag interact.js a réellement eu lieu.
  // interact.js intercepte la propagation après le seuil, mais on garde un
  // garde-fou explicite via cette ref consultée dans onHeaderClick.
  const draggedRef = useRef(false);

  // Snap props refletées en refs pour que les listeners interact.js (capturés
  // une fois dans useEffect) lisent toujours la valeur courante sans devoir
  // ré-attacher interact.js à chaque toggle.
  const snapEnabledRef = useRef(snapEnabled);
  snapEnabledRef.current = snapEnabled;
  const snapStepRef = useRef(snapStep);
  snapStepRef.current = snapStep;
  const getSnapCandidatesRef = useRef(getSnapCandidates);
  getSnapCandidatesRef.current = getSnapCandidates;

  // Snap vertical
  const dragStartTopRef = useRef(null);

  // Resize bounds
  const resizeBoundsRef = useRef(resizeBounds);
  resizeBoundsRef.current = resizeBounds;
  const clampedRectRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Calcule le dx à afficher en pixels à partir du dx brut du curseur.
    // Applique le snap si activé et qu'on est resté sur la piste source
    // (les candidates de snap sont ceux de cette piste). Alt = bypass.
    // Snap aux deux bords (left/right) ; si les deux snappent, on prend
    // le plus proche du curseur ; si un seul snappe, on prend celui-là.
    const computeSnappedDx = (rawDx, altKey, dstTrackId) => {
      if (!snapEnabledRef.current || altKey || pxPerSec <= 0) {
        return rawDx;
      }

      const sameTrack = dstTrackId === trackId;
      const excludeId = sameTrack ? segment.id : null;
      const rawCandidates =
        getSnapCandidatesRef.current?.(dstTrackId, excludeId) ?? [];
      const segDur = segment.srcEnd - segment.srcStart;
      const rawV = segment.vStart + rawDx / pxPerSec;
      const snapStepCur = snapStepRef.current;

      // Snap UNIQUEMENT par le bord gauche (vStart) : ça garantit que la
      // position visuelle du clip s'aligne sur les ticks affichés.
      // Pour préserver le snap "bord droit touche un voisin", on étend
      // les candidates avec `c - segDur` : ces valeurs représentent les
      // positions où vStart doit être pour que vEnd s'aligne sur `c`.
      const candidates = [
        ...rawCandidates,
        ...rawCandidates.map((c) => c - segDur),
      ];

      // Threshold = snapStep / 2 → la grille la plus proche gagne TOUJOURS.
      // Le clip est en permanence sur un tick pendant le drag (hard snap).
      // Pas de filtre directionnel : la nearest-grid attire des deux côtés,
      // comportement standard "always-on-grid". Alt = bypass.
      const thresholdSec = snapStepCur / 2;

      const snapped = snapTime(rawV, {
        snapStep: snapStepCur / 2,
        candidates,
        thresholdSec,
      });
      return (snapped - segment.vStart) * pxPerSec;
    };

    interact(el).draggable({
      // Le drag-move ne s'arme qu'à partir du header. Un drag sur le corps
      // bubble vers la lane pour devenir une sélection de région intra-clip.
      allowFrom: "[data-clip-header]",
      listeners: {
        start() {
          const clipRect = el.getBoundingClientRect();
          dragStartTopRef.current = clipRect.top;

          draggedRef.current = true;
          el.classList.add("dragging");
          document.body.classList.add("clip-dragging");
          // Élève le clip au-dessus des autres pendant le drag pour qu'il
          // passe visuellement par-dessus les autres lanes.
          el.style.zIndex = "10";
          el.style.pointerEvents = "none"; // pour que elementFromPoint voie la lane sous le clip
        },
        move(e) {
          // dragDxRef = cumul brut du curseur, JAMAIS écrasé par le snap.
          // Sinon le snap suivant se calcule par rapport à la position
          // snappée et il faut s'éloigner du threshold depuis là pour
          // libérer — au lieu de se baser sur la position du curseur.
          dragDxRef.current += e.dx;
          dragDyRef.current += e.dy;

          // Hit-test : trouve la lane sous le pointeur.
          const under = document.elementFromPoint(e.client.x, e.client.y);
          const laneEl = under?.closest("[data-lane-id]");
          const overTrackId =
            laneEl?.dataset.laneId ?? hoveredTrackIdRef.current;
          hoveredTrackIdRef.current = overTrackId;

          const altKey = e.altKey ?? e.originalEvent?.altKey ?? false;
          const displayDx = computeSnappedDx(
            dragDxRef.current,
            altKey,
            overTrackId,
          );

          let displayDy = dragDyRef.current; // fallback
          if (laneEl) {
            const laneRect = laneEl.getBoundingClientRect();
            displayDy = laneRect.top - dragStartTopRef.current + INSET_Y;
          }

          el.style.transform = `translate(${displayDx}px, ${displayDy}px)`;
        },
        end(e) {
          const dstTrackId = hoveredTrackIdRef.current;
          const altKey = e.altKey ?? e.originalEvent?.altKey ?? false;
          const finalDx = computeSnappedDx(
            dragDxRef.current,
            altKey,
            dstTrackId,
          );
          const deltaSec = pxPerSec > 0 ? finalDx / pxPerSec : 0;

          // Reset visuel.
          el.style.transform = "";
          el.style.zIndex = "";
          el.style.pointerEvents = "";
          el.classList.remove("dragging");
          document.body.classList.remove("clip-dragging");
          document
            .querySelectorAll("[data-lane-id].drop-target")
            .forEach((n) => n.classList.remove("drop-target"));
          dragDxRef.current = 0;
          dragDyRef.current = 0;
          hoveredTrackIdRef.current = trackId;

          if (Math.abs(deltaSec) < 0.001 && dstTrackId === trackId) return;
          // Position absolue dans la piste cible. Vrai pour same-track et
          // cross-track : le drop "remplace" la zone d'arrivée (punch-in).
          const newVStart = Math.max(0, segment.vStart + deltaSec);
          if (dstTrackId === trackId) {
            onMove?.(trackId, segment.id, newVStart);
          } else {
            onMoveAcrossTracks?.(trackId, dstTrackId, segment.id, newVStart);
          }
        },
      },
    });
    interact(el).resizable({
      edges: { left: true, right: true, top: false, bottom: false },
      listeners: {
        start(e) {
          resizeStartRectRef.current = {
            left: e.rect.left,
            right: e.rect.right,
          };
        },
        move(e) {
          const start = resizeStartRectRef.current;
          if (!start || pxPerSec <= 0) return;

          const { minVStart, maxVEnd } = resizeBoundsRef.current?.(
            trackId,
            segment.id,
          ) ?? { minVStart: 0, maxVEnd: Infinity };

          // Convertit les bornes (en secondes vTime) → en pixels relatifs au clip
          const segLeftPx0 = segment.vStart * pxPerSec + INSET_X; // position d'origine
          const minLeftPx = minVStart * pxPerSec + INSET_X;
          const maxRightPx =
            (maxVEnd === Infinity
              ? Number.MAX_SAFE_INTEGER
              : maxVEnd * pxPerSec) - INSET_X;

          // Clamp e.rect.left / e.rect.right (en coordonnées viewport)
          // Utiliser laneEl.getBoundingClientRect().left pour convertir
          const laneEl = el.parentElement; // ou via data-lane-id
          const laneLeft = laneEl.getBoundingClientRect().left;
          const clampedLeft = Math.max(laneLeft + minLeftPx, e.rect.left);
          const clampedRight = Math.min(laneLeft + maxRightPx, e.rect.right);

          // Largeur minimale = 1px pour ne pas inverser le clip
          if (clampedRight - clampedLeft < 1) return;

          const dxLeft = clampedLeft - start.left;
          el.style.transform = `translateX(${dxLeft}px)`;
          el.style.width = `${clampedRight - clampedLeft}px`;

          clampedRectRef.current = {
            left: clampedLeft,
            right: clampedRight,
          };

          const newSrcStartPx = segment.srcStart * pxPerSec + dxLeft;
          waveformRef.current?.setSrcStartPx(newSrcStartPx);
        },
        end(e) {
          const start = resizeStartRectRef.current;
          el.style.transform = "";
          el.style.width = "";
          resizeStartRectRef.current = null;
          if (!start || pxPerSec <= 0) return;
          const finalRect = clampedRectRef.current ?? {
            left: e.rect.left,
            right: e.rect.right,
          };
          const deltaLeft = (finalRect.left - start.left) / pxPerSec;
          const deltaRight = (finalRect.right - start.right) / pxPerSec;
          if (Math.abs(deltaLeft) > 0.001 || Math.abs(deltaRight) > 0.001) {
            onClipTrim?.(trackId, segment.id, deltaLeft, deltaRight);
          }
          // La waveform sera repositionnée par React au prochain
          // render via la prop left de ClipWaveform.
        },
      },
    });
    return () => interact(el).unset();
  }, [pxPerSec, onMove, onMoveAcrossTracks, onClipTrim, trackId, segment.id]);

  const onHeaderClick = (e) => {
    // Si un drag interact.js a eu lieu, on n'enclenche pas la sélection.
    // Pas de stopPropagation : interact.js (attaché au parent) doit pouvoir
    // recevoir le pointerdown. La lane ignore déjà les pointerdown issus
    // du header via [data-clip-header].
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    onSelect?.(trackId, segment.id, {
      ctrlKey: e.ctrlKey || e.metaKey,
      shiftKey: e.shiftKey,
    });
  };

  return (
    <Box
      ref={ref}
      data-clip-id={segment.id}
      sx={{
        position: "absolute",
        left: `${left}px`,
        width: `${width}px`,
        top: INSET_Y,
        bottom: INSET_Y,
        border: isSelected
          ? "1.5px solid #1565c0"
          : "1px solid rgb(21, 119, 137)",
        borderRadius: "5px",
        background: isSelected
          ? "rgba(34, 173, 197, 0.32)"
          : "rgba(34, 173, 197, 0.22)",
        boxShadow: isSelected
          ? "0 0 0 1px #1565c0, 0 2px 4px rgba(0, 0, 0, 0.22)"
          : "0 1px 2px rgba(0, 0, 0, 0.18)",
        overflow: "hidden",
        transition: "box-shadow 120ms ease, background 120ms ease",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          boxShadow:
            "0 0 0 1px rgba(34, 173, 197, 0.7), 0 1px 2px rgba(0, 0, 0, 0.22)",
          background: "rgba(34, 173, 197, 0.28)",
        },
      }}
    >
      <Box
        data-clip-header={segment.id}
        onClick={onHeaderClick}
        sx={{
          height: HEADER_HEIGHT,
          background: isSelected
            ? "linear-gradient(180deg, rgba(21,119,137,0.95), rgba(21,119,137,0.75))"
            : "linear-gradient(180deg, rgba(21,119,137,0.85), rgba(21,119,137,0.55))",
          borderBottom: "1px solid rgba(0, 0, 0, 0.15)",
          flexShrink: 0,
          cursor: "grab",
          "&:active": { cursor: "grabbing" },
        }}
      />
      <Box sx={{ flex: 1, minHeight: 0, position: "relative" }}>
        <ClipWaveform
          ref={waveformRef}
          segment={segment}
          trackBuffer={trackBuffer}
          pxPerSec={pxPerSec}
        />
      </Box>
    </Box>
  );
}
