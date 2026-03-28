import { marked } from "marked";
import { puzzleLearningContent } from "../../content/puzzleLearningContent";
import { puzzleConcepts } from "../puzzleContent";
import { mountChromaTreeExplorer } from "../puzzles/ChromaTreeExplorer";

/** DOM elements required to operate the info modal. */
export type InfoModalElements = {
  modal: HTMLElement;
  title: HTMLElement;
  body: HTMLElement;
  closeBtn: HTMLButtonElement;
};

/** Public API returned by {@link initInfoModal}. */
export type InfoModalApi = {
  /** Open the info modal for a given puzzle, fetching its markdown file or falling back to inline content. */
  openInfoModal: (puzzleId: string) => Promise<void>;
  /** Create a button that opens the Chroma Tree Explorer inside the info modal. */
  createChromaTreeActionButton: () => HTMLButtonElement;
};

/**
 * Wire up the info modal DOM elements and return a set of functions for
 * opening and controlling the modal.  Event listeners for close-button,
 * backdrop-click, and Escape key are registered during initialisation.
 */
export function initInfoModal(elements: InfoModalElements): InfoModalApi {
  const { modal, title, body, closeBtn } = elements;
  let cleanup: (() => void) | null = null;

  /** Remove content and run any mounted-component cleanup. */
  function clearBody(): void {
    cleanup?.();
    cleanup = null;
    body.innerHTML = "";
  }

  /** Set the title text, reveal the modal, and focus the close button. */
  function show(titleText: string): void {
    title.textContent = titleText;
    modal.removeAttribute("hidden");
    closeBtn.focus();
  }

  /** Hide the modal and clear its body content. */
  function close(): void {
    clearBody();
    modal.setAttribute("hidden", "");
  }

  /** Open the Chroma Tree Explorer inside the modal. */
  function openChromaTree(): void {
    clearBody();

    const intro = document.createElement("p");
    intro.textContent =
      "Drag around the hue ring or use the quick-pick chips to compare where each hue reaches its highest chroma.";
    body.appendChild(intro);

    const mountDiv = document.createElement("div");
    body.appendChild(mountDiv);
    cleanup = mountChromaTreeExplorer(mountDiv);

    show("Explore Chroma Tree");
  }

  /**
   * Create a button that opens the Chroma Tree Explorer when clicked.
   * Used in learning intro cards and solved-puzzle controls for puzzle-06.
   */
  function createChromaTreeActionButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = "btn btn-secondary learning-tool-toggle-btn";
    button.textContent = "Explore Chroma Tree";
    button.addEventListener("click", openChromaTree);
    return button;
  }

  /** Append a standalone Chroma Tree action row to a container element. */
  function appendChromaTreeAction(container: HTMLElement): void {
    const controls = document.createElement("div");
    controls.className = "action-row";
    controls.appendChild(createChromaTreeActionButton());
    container.appendChild(controls);
  }

  /**
   * Open the info modal for the given puzzle.
   *
   * Resolution order:
   * 1. Fetch `public/puzzle-info/<puzzleId>.md` and render as HTML.
   * 2. Fall back to inline `puzzleLearningContent` if the fetch fails.
   * 3. Fall back to the legacy `puzzleConcepts` dictionary.
   */
  async function openInfoModal(puzzleId: string): Promise<void> {
    const url = new URL(`puzzle-info/${puzzleId}.md`, location.href).href;
    clearBody();

    try {
      const resp = await fetch(url);
      if (resp.ok) {
        const mdText = await resp.text();
        const lines = mdText.split("\n");
        const titleLine = lines[0].replace(/^#{1,6}\s*/, "").trim();
        const bodyMd = lines.slice(1).join("\n");
        const bodyHtml = await marked.parse(bodyMd);

        body.innerHTML = bodyHtml;

        body.querySelectorAll("a").forEach((a) => {
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
        });

        if (puzzleId === "puzzle-06") {
          appendChromaTreeAction(body);
        }

        show(titleLine);
        return;
      }
    } catch {
      // fall through to legacy content
    }

    const learning = puzzleLearningContent[puzzleId];
    if (learning) {
      const illustrationWrap = document.createElement("div");
      illustrationWrap.className = "learning-modal-illustration";
      illustrationWrap.innerHTML = learning.illustrationSvg;
      body.appendChild(illustrationWrap);

      learning.intro.forEach((paragraph) => {
        const p = document.createElement("p");
        p.textContent = paragraph;
        body.appendChild(p);
      });

      if (learning.howToWin) {
        const row = document.createElement("p");
        row.className = "learning-meta learning-meta--how";
        row.innerHTML = `<strong>How to win:</strong> ${learning.howToWin}`;
        body.appendChild(row);
      }

      if (learning.whyFailed) {
        const row = document.createElement("p");
        row.className = "learning-meta learning-meta--why";
        row.innerHTML = `<strong>Why this fails:</strong> ${learning.whyFailed}`;
        body.appendChild(row);
      }

      if (learning.tooltips && learning.tooltips.length > 0) {
        const row = document.createElement("p");
        row.className = "learning-meta learning-meta--tooltips";
        row.innerHTML = `<strong>Key terms:</strong> ${learning.tooltips.join(" · ")}`;
        body.appendChild(row);
      }

      if (puzzleId === "puzzle-06") {
        appendChromaTreeAction(body);
      }

      show(learning.title);
      return;
    }

    const concept = puzzleConcepts[puzzleId];
    if (!concept) {
      return;
    }

    for (const line of concept.body.split("\n")) {
      if (line.trim()) {
        const p = document.createElement("p");
        p.textContent = line;
        body.appendChild(p);
      }
    }

    if (puzzleId === "puzzle-06") {
      appendChromaTreeAction(body);
    }

    show(concept.title);
  }

  // Register event listeners for closing the modal.
  closeBtn.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      close();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hasAttribute("hidden")) {
      close();
    }
  });

  return { openInfoModal, createChromaTreeActionButton };
}
