// Shell shared by every page: theme, sheet, modal, delegation, initial render.
import {$, esc, empty, toast, refreshIcons, closeModal, initTheme, initSheet} from "./core.js";
import {studentForm} from "./forms.js";

export function boot(page) {
  const content = $("#pageContent");
  if (!content) return;

  async function refresh() {
    try {
      content.innerHTML = await page.render();
      refreshIcons();
      await page.afterRender?.();
    } catch (e) {
      content.innerHTML = empty("Could not load this page", esc(e.message));
    }
  }

  initTheme();
  initSheet();

  // Modal: clicking inside the dialog must not close it.
  $("#modalRoot").addEventListener("click", e => {
    if (e.target.closest(".modal")) {
      if (e.target.closest("button[data-close]")) closeModal();
      return;
    }
    if (e.target.closest("[data-close]")) closeModal();
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal() });

  $("#quickAdd")?.addEventListener("click", () => studentForm()());

  content.addEventListener("click", async e => {
    const b = e.target.closest("[data-action]");
    if (!b || !page.act) return;
    try { await page.act(b.dataset.action, b) } catch (err) { toast(err.message, true) }
  });

  content.addEventListener("input", async e => {
    if (!page.onInput) return;
    const id = e.target.id, val = e.target.value;
    if ((await page.onInput(e)) !== true) return;
    await refresh();
    // Re-rendering drops the focused input, and Chrome's focus fixup can run
    // after a synchronous focus() call, so restore it on the next frame.
    requestAnimationFrame(() => {
      const el = $("#" + id);
      if (!el) return;
      el.focus();
      if (el.setSelectionRange) el.setSelectionRange(val.length, val.length);
    });
  });

  content.addEventListener("change", async e => {
    if (!page.onChange) return;
    if ((await page.onChange(e)) === true) await refresh();
  });

  document.addEventListener("app:refresh", refresh);

  const dl = $("#dateLabel");
  if (dl) dl.textContent = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  refresh();
}
