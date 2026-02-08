// File: src/editor.js
import { BLOCKS } from './blocks/index.js';
import { initTextToolbars } from './utils.js';

// tiny helper for nested keys like "panel.title"
function setByPath(obj, path, val) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = val;
}

export function initEditor({ state, root }) {
  root.innerHTML = '';
  const blocks = state.blocks || [];

  blocks.forEach((b, i) => {
    const card = document.createElement('div');
    card.className = 'border rounded p-3';

    // header with basic controls
    const head = document.createElement('div');
    head.className = 'flex items-center justify-between mb-2';
    head.innerHTML = `
      <div class="text-sm font-semibold">${i + 1}. ${b.type}</div>
      <div class="flex gap-2">
        <button data-up class="px-2 py-1 border rounded text-xs">↑</button>
        <button data-down class="px-2 py-1 border rounded text-xs">↓</button>
        <button data-del class="px-2 py-1 border rounded text-xs text-red-600">Delete</button>
      </div>
    `;

    // block-specific editor
    const body = document.createElement('div');
    body.className = 'space-y-3 text-sm';

    const mod = BLOCKS[b.type];
    if (mod?.editor) {
      body.innerHTML = mod.editor({ block: b, idx: i, onChange: () => {} });
      // Initialize text formatting toolbars
      initTextToolbars(body);
    } else {
      body.innerHTML = `<div class="text-slate-500">No editor for type "${b.type}".</div>`;
    }

    // --- Wipe controls (live on the NEXT block’s data, but toggled here) ---
    const wipeWrap = document.createElement('div');
    wipeWrap.className = 'mt-2 p-2 border rounded bg-slate-50';
    wipeWrap.innerHTML = `
      <label class="flex items-center gap-2">
        <input type="checkbox" data-wipe-flag ${b._wipeOverPrev ? 'checked' : ''} />
        <span>Wipe this block over the previous</span>
      </label>
      <div class="mt-2 grid grid-cols-[120px_1fr] items-center gap-2">
        <label class="text-xs text-slate-600">Wipe height</label>
        <input type="text" data-wipe-height class="border rounded px-2 py-1" placeholder="e.g. 200vh" value="${b.wipeHeight || ''}">
      </div>
      <p class="text-[11px] text-slate-500 mt-1">If enabled, this block will vertically wipe over the previous block. Height controls total scroll distance (e.g., 200vh, 240vh).</p>
    `;
    body.appendChild(wipeWrap);

    // assemble
    card.appendChild(head);
    card.appendChild(body);
    root.appendChild(card);

    // generic wiring for data-k inputs from block editors
    body.querySelectorAll('[data-k]').forEach((inp) => {
      const k = inp.getAttribute('data-k');
      const apply = (val) => {
        if (mod?.set) mod.set(b, k, val);
        else setByPath(b, k, val);
      };

      const onChange = () => {
        let v = inp.value;
        if (inp.type === 'checkbox') v = inp.checked;
        apply(v);
      };
      inp.addEventListener('input', onChange);
      inp.addEventListener('change', onChange);
    });

    // wipe controls wiring
    const wipeFlag = body.querySelector('[data-wipe-flag]');
    const wipeHeight = body.querySelector('[data-wipe-height]');
    if (wipeFlag) {
      wipeFlag.addEventListener('change', () => {
        b._wipeOverPrev = !!wipeFlag.checked;
      });
    }
    if (wipeHeight) {
      wipeHeight.addEventListener('input', () => {
        b.wipeHeight = wipeHeight.value || undefined;
      });
    }

    // move / delete
    head.querySelector('[data-up]').addEventListener('click', () => {
      if (i > 0) {
        const t = blocks[i];
        blocks[i] = blocks[i - 1];
        blocks[i - 1] = t;
        initEditor({ state, root });
      }
    });
    head.querySelector('[data-down]').addEventListener('click', () => {
      if (i < blocks.length - 1) {
        const t = blocks[i];
        blocks[i] = blocks[i + 1];
        blocks[i + 1] = t;
        initEditor({ state, root });
      }
    });
    head.querySelector('[data-del]').addEventListener('click', () => {
      blocks.splice(i, 1);
      initEditor({ state, root });
    });
  });
}