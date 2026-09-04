import { useEffect, useRef, useState, type ReactElement } from "react";
import { marked } from "marked";
import { Button, Dialog } from "../design-system";
import { useSession } from "../state/contexts";
import { usePuzzle } from "../state/selectors";
import { puzzleLearningContent } from "../../content/puzzleLearningContent";
import { puzzleConcepts } from "../puzzleContent";
import { ChromaTreeExplorer } from "../puzzles/ChromaTreeExplorer";

/**
 * "How this works" learning card (FR-018), rendered in the design-system
 * `Dialog` (which brings the focus trap, scroll lock and `Escape` handling).
 * Mounted once in `App.tsx`; driven by `session.modal`.
 *
 * Resolution order matches the retired `src/web/legacy/infoModal.ts`:
 *   1. fetch `puzzle-info/<id>.md` → render markdown
 *   2. fall back to inline `puzzleLearningContent`
 *   3. fall back to `puzzleConcepts`
 */

type Content = { title: string; html: string };

async function loadContent(puzzleId: string): Promise<Content> {
  try {
    const url = new URL(`puzzle-info/${puzzleId}.md`, location.href).href;
    const resp = await fetch(url);
    if (resp.ok) {
      const md = await resp.text();
      const lines = md.split("\n");
      const title = lines[0].replace(/^#{1,6}\s*/, "").trim();
      const html = await marked.parse(lines.slice(1).join("\n"));
      return { title, html };
    }
  } catch {
    // fall through
  }

  const learning = puzzleLearningContent[puzzleId];
  if (learning) {
    const body = [
      learning.illustrationSvg,
      ...learning.intro.map((p) => `<p>${p}</p>`),
      learning.howToWin ? `<p><strong>How to win:</strong> ${learning.howToWin}</p>` : "",
      learning.whyFailed ? `<p><strong>Why this fails:</strong> ${learning.whyFailed}</p>` : "",
      learning.tooltips?.length ? `<p><strong>Key terms:</strong> ${learning.tooltips.join(" · ")}</p>` : "",
    ].join("");
    return { title: learning.title, html: body };
  }

  const concept = puzzleConcepts[puzzleId];
  if (concept) {
    const html = concept.body
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => `<p>${line}</p>`)
      .join("");
    return { title: concept.title, html };
  }

  return { title: "How this works", html: "<p>No extra notes for this puzzle yet.</p>" };
}

export function InfoModal(): ReactElement | null {
  const { state, dispatch } = useSession();
  const modal = state.modal;
  const puzzleId = modal?.puzzleId ?? "";
  const puzzle = usePuzzle(puzzleId || undefined);

  const [content, setContent] = useState<Content | null>(null);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Learning-card markdown can contain external links; open them in a new
  // tab rather than navigating the SPA away, and suppress the referrer.
  useEffect(() => {
    bodyRef.current?.querySelectorAll("a").forEach((a) => {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });
  }, [content]);

  useEffect(() => {
    if (!modal) {
      setContent(null);
      setExplorerOpen(false);
      return;
    }
    let active = true;
    setContent(null);
    void loadContent(modal.puzzleId).then((next) => {
      if (active) {
        setContent(next);
      }
    });
    return () => {
      active = false;
    };
  }, [modal]);

  if (!modal) {
    return null;
  }

  const close = (): void => dispatch({ type: "CLOSE_MODAL" });
  const title = content?.title ?? puzzle?.title ?? "How this works";

  return (
    <Dialog open onClose={close} title={title}>
      {explorerOpen ? (
        <ChromaTreeExplorer />
      ) : (
        <>
          {content ? (
            <div
              ref={bodyRef}
              className="info-modal-body"
              // Content is repo-authored markdown / learning copy, not user input.
              dangerouslySetInnerHTML={{ __html: content.html }}
            />
          ) : (
            <p>Loading…</p>
          )}
          {modal.puzzleId === "puzzle-06" ? (
            <div className="check-row" style={{ marginTop: "var(--space-md)" }}>
              <Button variant="secondary" onClick={() => setExplorerOpen(true)}>
                Open Chroma Tree explorer
              </Button>
            </div>
          ) : null}
        </>
      )}
    </Dialog>
  );
}
