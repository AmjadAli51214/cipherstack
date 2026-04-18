const ciphers = {
  caesar: {
    name: 'Caesar Cipher',
    typeLabel: 'Configurable',
    description: 'Shift letters by a fixed amount.',
    defaultConfig: { shift: 3 },
    encrypt(text, config) {
      return shiftText(text, getInteger(config.shift, 3));
    },
    decrypt(text, config) {
      return shiftText(text, -getInteger(config.shift, 3));
    },
  },
  xor: {
    name: 'XOR Cipher',
    typeLabel: 'Configurable',
    description: 'XOR each UTF-16 code unit with a repeating key.',
    defaultConfig: { key: 'key' },
    encrypt(text, config) {
      return xorText(text, String(config.key ?? 'key'));
    },
    decrypt(text, config) {
      return xorText(text, String(config.key ?? 'key'));
    },
  },
  vigenere: {
    name: 'Vigenère Cipher',
    typeLabel: 'Configurable',
    description: 'Polyalphabetic substitution with a keyword.',
    defaultConfig: { keyword: 'cipher' },
    encrypt(text, config) {
      return vigenereText(text, String(config.keyword ?? 'cipher'), 1);
    },
    decrypt(text, config) {
      return vigenereText(text, String(config.keyword ?? 'cipher'), -1);
    },
  },
  railFence: {
    name: 'Rail Fence',
    typeLabel: 'Configurable',
    description: 'Write zigzag patterns across rails.',
    defaultConfig: { rails: 3 },
    encrypt(text, config) {
      return railFenceEncrypt(text, getInteger(config.rails, 3));
    },
    decrypt(text, config) {
      return railFenceDecrypt(text, getInteger(config.rails, 3));
    },
  },
  base64: {
    name: 'Base64',
    typeLabel: 'Bonus',
    description: 'Encode or decode using base64.',
    defaultConfig: {},
    encrypt(text) {
      return encodeBase64(text);
    },
    decrypt(text) {
      return decodeBase64(text);
    },
  },
  reverse: {
    name: 'Reverse',
    typeLabel: 'Bonus',
    description: 'Reverse the string exactly.',
    defaultConfig: {},
    encrypt(text) {
      return reverseText(text);
    },
    decrypt(text) {
      return reverseText(text);
    },
  },
};

const state = {
  mode: 'encrypt',
  plaintext: '',
  nodes: [createNode('caesar'), createNode('xor'), createNode('reverse')],
  results: {},
  output: '',
  error: '',
};

const elements = {
  libraryList: document.getElementById('libraryList'),
  pipelineList: document.getElementById('pipelineList'),
  sourceText: document.getElementById('sourceText'),
  finalOutput: document.getElementById('finalOutput'),
  validationError: document.getElementById('validationError'),
  inputLabel: document.getElementById('inputLabel'),
  inputHelp: document.getElementById('inputHelp'),
  modeBadge: document.getElementById('modeBadge'),
  nodeCountBadge: document.getElementById('nodeCountBadge'),
  encryptModeBtn: document.getElementById('encryptModeBtn'),
  decryptModeBtn: document.getElementById('decryptModeBtn'),
  runBtn: document.getElementById('runBtn'),
  copyOutputBtn: document.getElementById('copyOutputBtn'),
  exportJsonBtn: document.getElementById('exportJsonBtn'),
  importJsonBtn: document.getElementById('importJsonBtn'),
  clearJsonBtn: document.getElementById('clearJsonBtn'),
  jsonBox: document.getElementById('jsonBox'),
  toast: document.getElementById('toast'),
};

const libraryOrder = ['caesar', 'xor', 'vigenere', 'railFence', 'base64', 'reverse'];

function createNode(type) {
  return {
    id: createId(),
    type,
    config: { ...cloneDefaultConfig(type) },
  };
}

function cloneDefaultConfig(type) {
  return JSON.parse(JSON.stringify(ciphers[type].defaultConfig));
}

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function shiftText(text, shiftAmount) {
  const normalizedShift = ((shiftAmount % 26) + 26) % 26;
  let result = '';
  for (const character of text) {
    if (character >= 'A' && character <= 'Z') {
      const code = character.charCodeAt(0) - 65;
      result += String.fromCharCode(((code + normalizedShift) % 26) + 65);
    } else if (character >= 'a' && character <= 'z') {
      const code = character.charCodeAt(0) - 97;
      result += String.fromCharCode(((code + normalizedShift) % 26) + 97);
    } else {
      result += character;
    }
  }
  return result;
}

function xorText(text, key) {
  if (!key || key.length === 0) {
    return text;
  }
  let result = '';
  for (let index = 0; index < text.length; index += 1) {
    const textCode = text.charCodeAt(index);
    const keyCode = key.charCodeAt(index % key.length);
    result += String.fromCharCode(textCode ^ keyCode);
  }
  return result;
}

function vigenereText(text, keyword, direction) {
  const keyLetters = Array.from(keyword.toLowerCase()).filter((character) => /[a-z]/.test(character));
  if (keyLetters.length === 0) {
    return text;
  }

  let keyIndex = 0;
  let output = '';

  for (const character of text) {
    if (/[a-z]/i.test(character)) {
      const keyShift = keyLetters[keyIndex % keyLetters.length].charCodeAt(0) - 97;
      const baseCode = character === character.toUpperCase() ? 65 : 97;
      const letterCode = character.toLowerCase().charCodeAt(0) - 97;
      const nextCode = ((letterCode + direction * keyShift) % 26 + 26) % 26;
      output += String.fromCharCode(baseCode + nextCode);
      keyIndex += 1;
    } else {
      output += character;
    }
  }

  return output;
}

function railFenceEncrypt(text, rails) {
  if (rails < 2 || text.length <= 1) {
    return text;
  }

  const railRows = Array.from({ length: rails }, () => []);
  let rail = 0;
  let direction = 1;

  for (const character of Array.from(text)) {
    railRows[rail].push(character);
    if (rail === 0) {
      direction = 1;
    } else if (rail === rails - 1) {
      direction = -1;
    }
    rail += direction;
  }

  return railRows.flat().join('');
}

function railFenceDecrypt(text, rails) {
  if (rails < 2 || text.length <= 1) {
    return text;
  }

  const characters = Array.from(text);
  const pattern = [];
  let rail = 0;
  let direction = 1;

  for (let index = 0; index < characters.length; index += 1) {
    pattern.push(rail);
    if (rail === 0) {
      direction = 1;
    } else if (rail === rails - 1) {
      direction = -1;
    }
    rail += direction;
  }

  const counts = Array.from({ length: rails }, () => 0);
  pattern.forEach((railIndex) => {
    counts[railIndex] += 1;
  });

  const slices = [];
  let pointer = 0;
  for (let railIndex = 0; railIndex < rails; railIndex += 1) {
    slices[railIndex] = characters.slice(pointer, pointer + counts[railIndex]);
    pointer += counts[railIndex];
  }

  const positions = Array.from({ length: rails }, () => 0);
  return pattern.map((railIndex) => {
    const value = slices[railIndex][positions[railIndex]];
    positions[railIndex] += 1;
    return value;
  }).join('');
}

function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64(text) {
  try {
    const normalized = text.replace(/\s+/g, '');
    const binary = atob(normalized);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch (error) {
    throw new Error('Invalid Base64 input.');
  }
}

function reverseText(text) {
  return Array.from(text).reverse().join('');
}

function cloneNodeConfig(node) {
  return JSON.parse(JSON.stringify(node.config || {}));
}

function renderLibrary() {
  elements.libraryList.innerHTML = '';

  libraryOrder.forEach((type) => {
    const cipher = ciphers[type];
    const row = document.createElement('div');
    row.className = 'library-item';
    row.innerHTML = `
      <div class="library-meta">
        <p class="library-name">${cipher.name}</p>
        <p class="library-desc">${cipher.description}</p>
      </div>
      <button class="library-add-btn" type="button" data-add-cipher="${type}">Add</button>
    `;
    elements.libraryList.appendChild(row);
  });
}

function renderPipeline() {
  elements.pipelineList.innerHTML = '';
  elements.nodeCountBadge.textContent = `${state.nodes.length} node${state.nodes.length === 1 ? '' : 's'}`;

  state.nodes.forEach((node, index) => {
    const cipher = ciphers[node.type];
    const result = state.results[node.id] || { input: '', output: '' };
    const card = document.createElement('article');
    card.className = 'node-card';
    card.dataset.nodeId = node.id;
    const hasResult = Object.prototype.hasOwnProperty.call(state.results, node.id);
    const inputPreview = hasResult ? formatPreview(result.input) : 'Waiting for a run...';
    const outputPreview = hasResult ? formatPreview(result.output) : 'Waiting for a run...';
    card.innerHTML = `
      <div class="node-head">
        <div class="node-title">
          <h3>${cipher.name}</h3>
          <span class="type-badge">${cipher.typeLabel}</span>
        </div>
        <div class="node-actions">
          <button class="node-btn" type="button" data-action="move-up" data-node-id="${node.id}" ${index === 0 ? 'disabled' : ''}>Move Up</button>
          <button class="node-btn" type="button" data-action="move-down" data-node-id="${node.id}" ${index === state.nodes.length - 1 ? 'disabled' : ''}>Move Down</button>
          <button class="node-btn" type="button" data-action="delete" data-node-id="${node.id}">Delete</button>
        </div>
      </div>
      <div class="node-content">
        ${renderConfig(node)}
        <div class="node-io">
          <div class="io-label">Input received</div>
          <pre data-empty="${hasResult && result.input !== '' ? 'false' : 'true'}">${escapeHtml(inputPreview)}</pre>
        </div>
        <div class="node-io">
          <div class="io-label">Output produced</div>
          <pre data-empty="${hasResult && result.output !== '' ? 'false' : 'true'}">${escapeHtml(outputPreview)}</pre>
        </div>
      </div>
    `;
    elements.pipelineList.appendChild(card);
  });
}

function formatPreview(value) {
  return value === '' ? '(empty)' : value;
}

function renderConfig(node) {
  const cipher = ciphers[node.type];
  if (node.type === 'caesar') {
    return `
      <div class="config-grid">
        <div class="field">
          <label for="config-${node.id}-shift">Shift amount</label>
          <input id="config-${node.id}-shift" type="number" step="1" value="${escapeAttribute(node.config.shift ?? cipher.defaultConfig.shift)}" data-node-id="${node.id}" data-config-key="shift" />
        </div>
      </div>
    `;
  }

  if (node.type === 'xor') {
    return `
      <div class="config-grid">
        <div class="field">
          <label for="config-${node.id}-key">Key</label>
          <input id="config-${node.id}-key" type="text" value="${escapeAttribute(node.config.key ?? cipher.defaultConfig.key)}" data-node-id="${node.id}" data-config-key="key" />
        </div>
      </div>
    `;
  }

  if (node.type === 'vigenere') {
    return `
      <div class="config-grid">
        <div class="field">
          <label for="config-${node.id}-keyword">Keyword</label>
          <input id="config-${node.id}-keyword" type="text" value="${escapeAttribute(node.config.keyword ?? cipher.defaultConfig.keyword)}" data-node-id="${node.id}" data-config-key="keyword" />
        </div>
      </div>
    `;
  }

  if (node.type === 'railFence') {
    return `
      <div class="config-grid">
        <div class="field">
          <label for="config-${node.id}-rails">Rails</label>
          <input id="config-${node.id}-rails" type="number" min="2" step="1" value="${escapeAttribute(node.config.rails ?? cipher.defaultConfig.rails)}" data-node-id="${node.id}" data-config-key="rails" />
        </div>
      </div>
    `;
  }

  return `
    <div class="config-grid">
      <div class="field">
        <label>Configuration</label>
        <input type="text" value="No config required" disabled />
      </div>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function renderMode() {
  const isEncrypt = state.mode === 'encrypt';
  elements.encryptModeBtn.classList.toggle('active', isEncrypt);
  elements.decryptModeBtn.classList.toggle('active', !isEncrypt);
  elements.inputLabel.textContent = isEncrypt ? 'Plaintext Input' : 'Ciphertext Input';
  elements.inputHelp.textContent = isEncrypt
    ? 'Enter plaintext and run the pipeline forward through each cipher.'
    : 'Enter ciphertext and run the pipeline in reverse using each inverse operation.';
  elements.modeBadge.textContent = isEncrypt ? 'Encrypt mode' : 'Decrypt mode';
}

function renderOutput() {
  elements.finalOutput.textContent = state.error
    ? ''
    : (state.output === '' ? '(empty)' : (state.output || 'Output will appear here after a successful run.'));
  elements.validationError.textContent = state.error || '';
}

function renderApp() {
  renderMode();
  renderPipeline();
  renderOutput();
}

function syncSourceText() {
  elements.sourceText.value = state.plaintext;
}

function updateStateFromConfigInput(target) {
  const nodeId = target.dataset.nodeId;
  const configKey = target.dataset.configKey;
  const node = state.nodes.find((item) => item.id === nodeId);
  if (!node || !configKey) {
    return;
  }

  if (node.type === 'caesar' || node.type === 'railFence') {
    node.config[configKey] = target.value;
  } else {
    node.config[configKey] = target.value;
  }

  runPipeline({ silent: true });
}

function addNode(type) {
  state.nodes.push(createNode(type));
  runPipeline({ silent: true });
  showToast(`${ciphers[type].name} added`);
}

function moveNode(nodeId, offset) {
  const index = state.nodes.findIndex((node) => node.id === nodeId);
  const targetIndex = index + offset;
  if (index < 0 || targetIndex < 0 || targetIndex >= state.nodes.length) {
    return;
  }
  const [node] = state.nodes.splice(index, 1);
  state.nodes.splice(targetIndex, 0, node);
  runPipeline({ silent: true });
}

function deleteNode(nodeId) {
  state.nodes = state.nodes.filter((node) => node.id !== nodeId);
  runPipeline({ silent: true });
}

function runPipeline(options = {}) {
  const { silent = false } = options;

  if (state.nodes.length < 3) {
    state.results = {};
    state.output = '';
    state.error = 'Add at least 3 cipher nodes before running the pipeline.';
    renderApp();
    if (!silent) {
      showToast('Pipeline needs at least 3 nodes');
    }
    return;
  }

  const results = {};
  const sequence = state.mode === 'encrypt' ? [...state.nodes] : [...state.nodes].reverse();
  let current = state.plaintext;

  try {
    sequence.forEach((node) => {
      const cipher = ciphers[node.type];
      const method = state.mode === 'encrypt' ? 'encrypt' : 'decrypt';
      const input = current;
      current = cipher[method](current, node.config);
      results[node.id] = { input, output: current };
    });

    state.results = results;
    state.output = current;
    state.error = '';
    renderApp();
    if (!silent) {
      showToast('Pipeline complete');
    }
  } catch (error) {
    state.results = results;
    state.output = '';
    state.error = error.message || 'Pipeline failed.';
    renderApp();
    if (!silent) {
      showToast(state.error);
    }
  }
}

function serializeState() {
  return JSON.stringify(
    {
      version: 1,
      mode: state.mode,
      plaintext: state.plaintext,
      nodes: state.nodes,
    },
    null,
    2,
  );
}

function loadStateFromJson(source) {
  const parsed = JSON.parse(source);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid pipeline JSON.');
  }

  if (!Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
    throw new Error('Pipeline JSON must include a nodes array.');
  }

  const nextNodes = parsed.nodes.map((node) => validateImportedNode(node));
  state.mode = parsed.mode === 'decrypt' ? 'decrypt' : 'encrypt';
  state.plaintext = typeof parsed.plaintext === 'string' ? parsed.plaintext : '';
  state.nodes = nextNodes;
  syncSourceText();
  runPipeline({ silent: true });
}

function validateImportedNode(node) {
  if (!node || typeof node !== 'object') {
    throw new Error('Invalid node in imported pipeline.');
  }

  if (!node.type || !ciphers[node.type]) {
    throw new Error('Imported pipeline contains an unknown cipher type.');
  }

  return {
    id: typeof node.id === 'string' && node.id ? node.id : createId(),
    type: node.type,
    config: mergeConfig(node.type, node.config),
  };
}

function mergeConfig(type, config) {
  const defaults = cloneDefaultConfig(type);
  if (!config || typeof config !== 'object') {
    return defaults;
  }

  return {
    ...defaults,
    ...config,
  };
}

function showToast(message) {
  if (!message) {
    return;
  }
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 1800);
}

function copyOutput() {
  if (!state.output) {
    showToast('Nothing to copy yet');
    return;
  }
  navigator.clipboard.writeText(state.output)
    .then(() => showToast('Final output copied'))
    .catch(() => showToast('Copy failed'));
}

function exportJson() {
  const serialized = serializeState();
  elements.jsonBox.value = serialized;
  elements.jsonBox.focus();
  elements.jsonBox.select();
  navigator.clipboard.writeText(serialized).catch(() => {});
  showToast('Pipeline exported');
}

function importJson() {
  const source = elements.jsonBox.value.trim();
  if (!source) {
    showToast('Paste pipeline JSON first');
    return;
  }

  try {
    loadStateFromJson(source);
    showToast('Pipeline imported');
  } catch (error) {
    state.error = error.message || 'Import failed.';
    renderApp();
    showToast(state.error);
  }
}

function wireEvents() {
  elements.sourceText.addEventListener('input', (event) => {
    state.plaintext = event.target.value;
    runPipeline({ silent: true });
  });

  elements.encryptModeBtn.addEventListener('click', () => {
    state.mode = 'encrypt';
    runPipeline({ silent: true });
  });

  elements.decryptModeBtn.addEventListener('click', () => {
    state.mode = 'decrypt';
    runPipeline({ silent: true });
  });

  elements.runBtn.addEventListener('click', () => {
    runPipeline({ silent: false });
  });

  elements.copyOutputBtn.addEventListener('click', copyOutput);
  elements.exportJsonBtn.addEventListener('click', exportJson);
  elements.importJsonBtn.addEventListener('click', importJson);
  elements.clearJsonBtn.addEventListener('click', () => {
    elements.jsonBox.value = '';
    showToast('JSON box cleared');
  });

  elements.libraryList.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const cipherType = target.dataset.addCipher;
    if (cipherType) {
      addNode(cipherType);
    }
  });

  elements.pipelineList.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const action = target.dataset.action;
    const nodeId = target.dataset.nodeId;
    if (!action || !nodeId) {
      return;
    }

    if (action === 'move-up') {
      moveNode(nodeId, -1);
    }

    if (action === 'move-down') {
      moveNode(nodeId, 1);
    }

    if (action === 'delete') {
      deleteNode(nodeId);
    }
  });

  elements.pipelineList.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    updateStateFromConfigInput(target);
  });
}

function initialize() {
  renderLibrary();
  syncSourceText();
  renderApp();
  wireEvents();
  runPipeline({ silent: true });
}

initialize();
