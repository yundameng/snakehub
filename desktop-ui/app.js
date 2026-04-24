const el = {
  refreshBtn: document.getElementById("refreshBtn"),
  summaryBadge: document.getElementById("summaryBadge"),
  overviewCards: document.getElementById("overviewCards"),
  toolScanList: document.getElementById("toolScanList"),
  toolBrowserSelect: document.getElementById("toolBrowserSelect"),
  toolBrowserTypeSelect: document.getElementById("toolBrowserTypeSelect"),
  toolBrowserMeta: document.getElementById("toolBrowserMeta"),
  toolBrowserContent: document.getElementById("toolBrowserContent"),
  toolScopePath: document.getElementById("toolScopePath"),
  linkScopePath: document.getElementById("linkScopePath"),
  toolScopeClearBtn: document.getElementById("toolScopeClearBtn"),
  linkScopeClearBtn: document.getElementById("linkScopeClearBtn"),
  resourceSelect: document.getElementById("resourceSelect"),
  eventLog: document.getElementById("eventLog"),
  operationRecords: document.getElementById("operationRecords"),
  wizardPanel: document.getElementById("wizardPanel"),
  wizardHint: document.getElementById("wizardHint"),
  gitCandidates: document.getElementById("gitCandidates"),
  pathTable: document.getElementById("pathTable"),
  conflictSection: document.getElementById("conflictSection"),
  conflictSummary: document.getElementById("conflictSummary"),
  conflictTypeFilter: document.getElementById("conflictTypeFilter"),
  conflictSearchInput: document.getElementById("conflictSearchInput"),
  conflictToolTabs: document.getElementById("conflictToolTabs"),
  conflictList: document.getElementById("conflictList"),
  conflictDetail: document.getElementById("conflictDetail"),
  localDropZone: document.getElementById("localDropZone"),
  localRepoDropZone: document.getElementById("localRepoDropZone"),
  localPathInput: document.getElementById("localPathInput"),
  localRepoPathInput: document.getElementById("localRepoPathInput"),
  localRepoClearDirBtn: document.getElementById("localRepoClearDirBtn"),
  localImportPanel: document.getElementById("localImportPanel"),
  localImportTabs: document.getElementById("localImportTabs"),
  localSingleTabBtn: document.getElementById("localSingleTabBtn"),
  localRepoTabBtn: document.getElementById("localRepoTabBtn"),
  localSingleImportPane: document.getElementById("localSingleImportPane"),
  localRepoImportPane: document.getElementById("localRepoImportPane"),
  rollbackBtn: document.getElementById("rollbackBtn"),
  repoScanForm: document.getElementById("repoScanForm"),
  repoPanel: document.getElementById("repoPanel"),
  repoHistoryBadge: document.getElementById("repoHistoryBadge"),
  repoHistoryCount: document.getElementById("repoHistoryCount"),
  repoHistoryBackdrop: document.getElementById("repoHistoryBackdrop"),
  repoHistoryOverlay: document.getElementById("repoHistoryOverlay"),
  repoHistoryCloseBtn: document.getElementById("repoHistoryCloseBtn"),
  repoScanMeta: document.getElementById("repoScanMeta"),
  repoCandidates: document.getElementById("repoCandidates"),
  repoSelectAllBtn: document.getElementById("repoSelectAllBtn"),
  repoClearBtn: document.getElementById("repoClearBtn"),
  repoImportBtn: document.getElementById("repoImportBtn"),
  repoMultiToolset: document.getElementById("repoMultiToolset"),
  repoRulesCanonical: document.getElementById("repoRulesCanonical"),
  repoTargetPath: document.getElementById("repoTargetPath"),
  repoClearDirBtn: document.getElementById("repoClearDirBtn"),
  localImportForm: document.getElementById("localImportForm"),
  localRepoScanForm: document.getElementById("localRepoScanForm"),
  localRepoMultiToolset: document.getElementById("localRepoMultiToolset"),
  localRepoRulesCanonical: document.getElementById("localRepoRulesCanonical"),
  gitForm: document.getElementById("gitForm"),
  gitListBtn: document.getElementById("gitListBtn"),
  linkForm: document.getElementById("linkForm"),
  linkAllModeToggle: document.getElementById("linkAllModeToggle"),
  linkResourceRow: document.getElementById("linkResourceRow"),
  linkAllTypesRow: document.getElementById("linkAllTypesRow"),
  linkCreateBtn: document.getElementById("linkCreateBtn"),
  pathSetForm: document.getElementById("pathSetForm"),
  pathUnsetBtn: document.getElementById("pathUnsetBtn"),
};

const typeText = {
  skills: "skill",
  hooks: "hook",
  rules: "rule",
  agents: "agent",
  commands: "command",
};

const sourceText = {
  default: "默认",
  override: "覆盖",
  project: "项目",
  disabled: "禁用",
};

let currentOverview = null;
let toolBrowserPickMap = new Map();
let toolBrowserTypePickMap = new Map();
let currentBrowserScopePath = "";
let currentLinkScopePath = "";
let repoScanState = {
  repoPath: "",
  repoId: "",
  repoUrl: "",
  ref: "",
  multiToolset: false,
  rulesCanonicalValidation: true,
  candidates: [],
  selectedKeys: new Set(),
};
let currentProjectGlobalConflicts = [];
let currentConflictRecords = [];
let mergeConflictIdByAssetKey = new Map();
let selectedConflictToolId = "cursor";
let selectedConflictType = "all";
let selectedConflictSearch = "";
let selectedConflictId = "";
let localBatchImportContext = null;
let localImportTab = "single";
const REPO_HISTORY_STORAGE_KEY = "snakehub_repo_history_v1";
const REPO_OVERLAY_EXPAND_MS = 280;
const REPO_OVERLAY_WIDE_DELAY_MS = 140;
const REPO_OVERLAY_BACKDROP_SHOW_DELAY_MS = 40;
const REPO_OVERLAY_BACKDROP_FADE_OUT_MS = 120;
const REPO_OVERLAY_SHRINK_MS = 280;
let repoHistoryEntries = [];
let repoOverlayOpenTimer = 0;
let repoOverlayWideTimer = 0;
let repoOverlayBackdropTimer = 0;
let repoOverlayCloseTimer = 0;
let repoOverlayHideTimer = 0;
let repoOverlayWide = false;
let rollbackBusy = false;
const REPO_GROUP_ONLY_TYPES = new Set(["hooks", "rules"]);

function setRepoActionButtonsEnabled(enabled) {
  if (el.repoSelectAllBtn) el.repoSelectAllBtn.disabled = !enabled;
  if (el.repoClearBtn) el.repoClearBtn.disabled = !enabled;
  if (el.repoImportBtn) el.repoImportBtn.disabled = !enabled;
}

function loadRepoHistoryEntries() {
  try {
    const raw = window.localStorage.getItem(REPO_HISTORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => ({
        repoId: String(item.repoId || ""),
        repoUrl: String(item.repoUrl || ""),
        repoPath: String(item.repoPath || ""),
        scannedAt: Number(item.scannedAt || 0),
      }))
      .filter((item) => item.repoId || item.repoUrl || item.repoPath);
  } catch {
    return [];
  }
}

function saveRepoHistoryEntries() {
  try {
    window.localStorage.setItem(REPO_HISTORY_STORAGE_KEY, JSON.stringify(repoHistoryEntries.slice(0, 100)));
  } catch {
    // Ignore localStorage write failures.
  }
}

function renderRepoHistoryCount() {
  if (el.repoHistoryCount) {
    const count = Array.isArray(repoScanState.candidates) ? repoScanState.candidates.length : 0;
    el.repoHistoryCount.textContent = String(count);
  }
}

function recordRepoHistoryEntry(entry) {
  const key = entry.repoId || entry.repoUrl || entry.repoPath;
  if (!key) {
    return;
  }
  repoHistoryEntries = repoHistoryEntries.filter((item) => (item.repoId || item.repoUrl || item.repoPath) !== key);
  repoHistoryEntries.unshift({
    repoId: entry.repoId || "",
    repoUrl: entry.repoUrl || "",
    repoPath: entry.repoPath || "",
    scannedAt: Date.now(),
  });
  saveRepoHistoryEntries();
  renderRepoHistoryCount();
}

function clearRepoOverlayTimers() {
  if (repoOverlayOpenTimer) {
    window.clearTimeout(repoOverlayOpenTimer);
    repoOverlayOpenTimer = 0;
  }
  if (repoOverlayBackdropTimer) {
    window.clearTimeout(repoOverlayBackdropTimer);
    repoOverlayBackdropTimer = 0;
  }
  if (repoOverlayWideTimer) {
    window.clearTimeout(repoOverlayWideTimer);
    repoOverlayWideTimer = 0;
  }
  if (repoOverlayCloseTimer) {
    window.clearTimeout(repoOverlayCloseTimer);
    repoOverlayCloseTimer = 0;
  }
  if (repoOverlayHideTimer) {
    window.clearTimeout(repoOverlayHideTimer);
    repoOverlayHideTimer = 0;
  }
}

function isRepoHistoryOverlayVisible() {
  return document.body.classList.contains("repo-overlay-active") || document.body.classList.contains("repo-overlay-open");
}

function updateRepoHistoryOverlayLayout() {
  if (!el.repoPanel || !el.repoHistoryOverlay) {
    return;
  }
  const anchorRect = el.repoPanel.getBoundingClientRect();
  const rawTop = Math.round(anchorRect.top - 1);
  const left = Math.max(8, Math.round(anchorRect.left - 1));
  const rawHeight = Math.round(anchorRect.height + 2);
  const top = Math.max(0, rawTop);
  let rightEdge = Math.round(anchorRect.right + 1);
  if (repoOverlayWide && el.localImportPanel) {
    const importRect = el.localImportPanel.getBoundingClientRect();
    if (importRect.width > 0) {
      rightEdge = Math.max(rightEdge, Math.round(importRect.right + 1));
    }
  }
  const maxRightEdge = window.innerWidth - 8;
  rightEdge = Math.min(maxRightEdge, rightEdge);
  const width = Math.max(360, rightEdge - left);
  const right = Math.max(8, Math.round(window.innerWidth - rightEdge));
  const maxHeightByViewport = window.innerHeight - top - 8;
  const height = Math.max(280, Math.min(rawHeight, maxHeightByViewport));
  el.repoHistoryOverlay.style.setProperty("--repo-overlay-top", `${top}px`);
  el.repoHistoryOverlay.style.setProperty("--repo-overlay-right", `${right}px`);
  el.repoHistoryOverlay.style.setProperty("--repo-overlay-width", `${width}px`);
  el.repoHistoryOverlay.style.setProperty("--repo-overlay-height", `${height}px`);
}

function openRepoHistoryOverlay() {
  if (!el.repoPanel || !el.repoHistoryOverlay) {
    return;
  }
  clearRepoOverlayTimers();
  repoOverlayWide = false;
  document.body.classList.remove("repo-overlay-wide");
  updateRepoHistoryOverlayLayout();

  el.repoPanel.classList.remove("overlay-open");
  el.repoPanel.classList.add("overlay-active");
  document.body.classList.remove("repo-overlay-backdrop-fast");
  document.body.classList.remove("repo-overlay-backdrop-visible");
  document.body.classList.remove("repo-overlay-open");
  document.body.classList.add("repo-overlay-active");
  el.repoHistoryOverlay.setAttribute("aria-hidden", "false");
  if (el.repoHistoryBackdrop) {
    el.repoHistoryBackdrop.setAttribute("aria-hidden", "false");
  }

  repoOverlayOpenTimer = window.setTimeout(() => {
    el.repoPanel.classList.add("overlay-open");
    document.body.classList.add("repo-overlay-open");
    repoOverlayWideTimer = window.setTimeout(() => {
      repoOverlayWide = true;
      document.body.classList.add("repo-overlay-wide");
      updateRepoHistoryOverlayLayout();
      repoOverlayWideTimer = 0;
    }, REPO_OVERLAY_WIDE_DELAY_MS);
    repoOverlayOpenTimer = 0;
  }, REPO_OVERLAY_EXPAND_MS);
  repoOverlayBackdropTimer = window.setTimeout(() => {
    document.body.classList.add("repo-overlay-backdrop-visible");
    repoOverlayBackdropTimer = 0;
  }, REPO_OVERLAY_EXPAND_MS + REPO_OVERLAY_BACKDROP_SHOW_DELAY_MS);
}

function closeRepoHistoryOverlay() {
  if (!el.repoPanel || !el.repoHistoryOverlay) {
    return;
  }
  clearRepoOverlayTimers();
  repoOverlayWide = false;
  document.body.classList.remove("repo-overlay-wide");

  document.body.classList.add("repo-overlay-backdrop-fast");
  document.body.classList.remove("repo-overlay-backdrop-visible");

  repoOverlayCloseTimer = window.setTimeout(() => {
    el.repoPanel.classList.remove("overlay-open");
    document.body.classList.remove("repo-overlay-open");
    el.repoPanel.classList.remove("overlay-active");
    document.body.classList.remove("repo-overlay-active");
    repoOverlayCloseTimer = 0;

    repoOverlayHideTimer = window.setTimeout(() => {
      el.repoHistoryOverlay.setAttribute("aria-hidden", "true");
      if (el.repoHistoryBackdrop) {
        el.repoHistoryBackdrop.setAttribute("aria-hidden", "true");
      }
      document.body.classList.remove("repo-overlay-backdrop-fast");
      repoOverlayHideTimer = 0;
    }, REPO_OVERLAY_SHRINK_MS);
  }, REPO_OVERLAY_BACKDROP_FADE_OUT_MS);
}

function toggleRepoHistoryOverlay() {
  if (isRepoHistoryOverlayVisible()) {
    closeRepoHistoryOverlay();
  } else {
    openRepoHistoryOverlay();
  }
}

function readTrimmedInputValue(form, selector) {
  if (!form) {
    return "";
  }
  const input = form.querySelector(selector);
  if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
    return input.value.trim();
  }
  return "";
}

function activateLocalImportTab(tabValue) {
  const nextTab = tabValue === "repo" ? "repo" : "single";
  localImportTab = nextTab;
  const singleActive = nextTab === "single";
  const repoActive = nextTab === "repo";

  if (el.localSingleTabBtn) {
    el.localSingleTabBtn.classList.toggle("active", singleActive);
    el.localSingleTabBtn.setAttribute("aria-selected", String(singleActive));
  }
  if (el.localRepoTabBtn) {
    el.localRepoTabBtn.classList.toggle("active", repoActive);
    el.localRepoTabBtn.setAttribute("aria-selected", String(repoActive));
  }

  if (el.localSingleImportPane) {
    el.localSingleImportPane.classList.toggle("active", singleActive);
    el.localSingleImportPane.hidden = !singleActive;
  }
  if (el.localRepoImportPane) {
    el.localRepoImportPane.classList.toggle("active", repoActive);
    el.localRepoImportPane.hidden = !repoActive;
  }

  if (repoActive) {
    localBatchImportContext = null;
  }
  updateActionButtonsState();
}

function updateRepoScanButtonState() {
  if (!el.repoScanForm) {
    return;
  }
  const submitBtn = el.repoScanForm.querySelector("button[type=submit]");
  if (!(submitBtn instanceof HTMLButtonElement)) {
    return;
  }
  const repoUrl = readTrimmedInputValue(el.repoScanForm, 'input[name="repoUrl"]');
  submitBtn.disabled = !repoUrl;
}

function updateLocalImportButtonState() {
  if (!el.localImportForm) {
    return;
  }
  const submitBtn = el.localImportForm.querySelector("button[type=submit]");
  if (!(submitBtn instanceof HTMLButtonElement)) {
    return;
  }
  const sourcePath = readTrimmedInputValue(el.localImportForm, 'input[name="sourcePath"]');
  submitBtn.disabled = !sourcePath;
}

function updateLocalRepoScanButtonState() {
  if (!el.localRepoScanForm) {
    return;
  }
  const submitBtn = el.localRepoScanForm.querySelector("button[type=submit]");
  if (!(submitBtn instanceof HTMLButtonElement)) {
    return;
  }
  const repoPath = readTrimmedInputValue(el.localRepoScanForm, 'input[name="repoPath"]');
  submitBtn.disabled = !repoPath;
}

function updateGitImportButtonsState() {
  if (!el.gitForm) {
    return;
  }
  const submitBtn = el.gitForm.querySelector("button[type=submit]");
  const repoUrl = readTrimmedInputValue(el.gitForm, 'input[name="repoUrl"]');
  const disabled = !repoUrl;
  if (submitBtn instanceof HTMLButtonElement) {
    submitBtn.disabled = disabled;
  }
  if (el.gitListBtn) {
    el.gitListBtn.disabled = disabled;
  }
}

function updateLinkCreateButtonState() {
  if (!el.linkCreateBtn || !el.linkForm) {
    return;
  }
  const allMode = Boolean(el.linkAllModeToggle && el.linkAllModeToggle.checked);
  if (allMode) {
    const selectedTypes = getSelectedLinkTypes();
    const toolSelect = el.linkForm.querySelector('select[name="toolId"]');
    const toolId = toolSelect instanceof HTMLSelectElement ? toolSelect.value.trim() : "";
    el.linkCreateBtn.disabled = selectedTypes.length === 0 || !toolId;
    return;
  }

  const toolSelect = el.linkForm.querySelector('select[name="toolId"]');
  const toolId = toolSelect instanceof HTMLSelectElement ? toolSelect.value.trim() : "";
  const resourceId = el.resourceSelect ? String(el.resourceSelect.value || "").trim() : "";
  el.linkCreateBtn.disabled = !resourceId || !toolId;
}

function updatePathSetButtonsState() {
  if (!el.pathSetForm) {
    return;
  }
  const submitBtn = el.pathSetForm.querySelector("button[type=submit]");
  if (!(submitBtn instanceof HTMLButtonElement)) {
    return;
  }
  const targetPath = readTrimmedInputValue(el.pathSetForm, 'input[name="targetPath"]');
  submitBtn.disabled = !targetPath;
}

function updateActionButtonsState() {
  updateRepoScanButtonState();
  updateLocalImportButtonState();
  updateLocalRepoScanButtonState();
  updateGitImportButtonsState();
  updateLinkCreateButtonState();
  updatePathSetButtonsState();
}

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function toSingleType(typeValue) {
  if (typeValue === "skills") return "skill";
  if (typeValue === "hooks") return "hook";
  if (typeValue === "rules") return "rule";
  if (typeValue === "agents") return "agent";
  if (typeValue === "commands") return "command";
  return typeValue;
}

function toPluralType(typeValue) {
  if (typeValue === "skill" || typeValue === "skills") return "skills";
  if (typeValue === "hook" || typeValue === "hooks") return "hooks";
  if (typeValue === "rule" || typeValue === "rules") return "rules";
  if (typeValue === "agent" || typeValue === "agents") return "agents";
  if (typeValue === "command" || typeValue === "commands") return "commands";
  return typeValue;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function detectRuleToolByPath(filePath) {
  const normalized = String(filePath || "").trim().toLowerCase();
  if (normalized.endsWith(".mdc")) return "cursor";
  if (normalized.endsWith(".md")) return "claude";
  if (normalized.endsWith(".rules")) return "codex";
  return "";
}

function renderRuleToolBadgeByPath(type, filePath) {
  if (type !== "rules") {
    return "";
  }
  const toolTag = detectRuleToolByPath(filePath);
  if (!toolTag) {
    return "";
  }
  return ` <span class="asset-tag linked">${escapeHtml(toolTag)}</span>`;
}

function expectedRuleExtensionForTool(toolId) {
  if (toolId === "cursor") return ".mdc";
  if (toolId === "claude") return ".md";
  if (toolId === "codex") return ".rules";
  return "";
}

function log(message) {
  const ts = new Date().toLocaleTimeString();
  el.eventLog.textContent = `[${ts}] ${message}\n${el.eventLog.textContent}`.slice(0, 12000);
}

function formatOperationTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso || "-";
  }
  return date.toLocaleString();
}

function renderOperationRecords(operations) {
  if (!el.operationRecords) {
    return;
  }

  const list = Array.isArray(operations) ? operations.slice().reverse() : [];
  if (list.length === 0) {
    el.operationRecords.innerHTML = `<div class="asset-empty">暂无可展示的操作记录。</div>`;
    return;
  }

  const operationTypeText = {
    import: "导入",
    link: "链接",
    rollback: "回滚",
  };

  el.operationRecords.innerHTML = list
    .map((op) => {
      const details = op && typeof op === "object" ? op.details || {} : {};
      const opType = String(op.type || "");
      const operationId = String(op.id || "");
      const linkPath = String(details.linkPath || "");
      const toolId = String(details.toolId || "");
      const sourcePath = String(details.sourcePath || "");
      const sourceOperationId = String(details.sourceOperationId || "");
      const typeLabel = operationTypeText[opType] || opType || "未知";

      let summary = "";
      if (opType === "link") {
        summary = `${toolId ? `${toolId} · ` : ""}${linkPath || "(缺少 linkPath)"}`;
      } else if (opType === "rollback") {
        summary = `${linkPath || "(缺少 linkPath)"}${sourceOperationId ? ` · 来源 ${sourceOperationId}` : ""}`;
      } else {
        summary = sourcePath || "(无附加信息)";
      }

      const rollbackable = opType === "link" && operationId && linkPath;
      const rollbackClass = rollbackable ? " rollbackable" : "";
      const rollbackData = rollbackable
        ? ` data-operation-id="${escapeHtml(operationId)}" data-link-path="${escapeHtml(linkPath)}"`
        : "";
      const rollbackHint = rollbackable ? `<div class="operation-action">点击回滚此条</div>` : "";

      return `
        <article class="operation-item${rollbackClass}"${rollbackData}>
          <div class="operation-head">
            <span class="operation-type ${escapeHtml(opType)}">${escapeHtml(typeLabel)}</span>
            <span class="operation-time">${escapeHtml(formatOperationTime(String(op.createdAt || "")))}</span>
          </div>
          <div class="operation-summary mono">${escapeHtml(summary)}</div>
          <div class="operation-id">ID: <span class="mono">${escapeHtml(operationId)}</span></div>
          ${rollbackHint}
        </article>
      `;
    })
    .join("");
}

function getBrowserScopePayload() {
  if (!currentBrowserScopePath) {
    return {};
  }
  return { projectPath: currentBrowserScopePath };
}

function renderScopeInputs() {
  if (el.toolScopePath) {
    el.toolScopePath.value = currentBrowserScopePath || "";
  }
  if (el.linkScopePath) {
    el.linkScopePath.value = currentLinkScopePath || "";
  }
}

function getDirectoryPicker() {
  if (window.cowhubDesktop && typeof window.cowhubDesktop.pickDirectory === "function") {
    return window.cowhubDesktop.pickDirectory;
  }
  return null;
}

function getSelectedLinkTypes() {
  if (!el.linkForm) {
    return [];
  }
  const checks = [...el.linkForm.querySelectorAll('input[name="linkTypes"]')];
  return checks.filter((item) => item instanceof HTMLInputElement && item.checked).map((item) => item.value);
}

function syncLinkModeUI() {
  const allMode = Boolean(el.linkAllModeToggle && el.linkAllModeToggle.checked);
  if (el.linkResourceRow) {
    el.linkResourceRow.style.display = allMode ? "none" : "";
  }
  if (el.resourceSelect) {
    el.resourceSelect.disabled = allMode;
    el.resourceSelect.required = !allMode;
  }
  const aliasInput = el.linkForm ? el.linkForm.querySelector('input[name="aliasName"]') : null;
  if (aliasInput instanceof HTMLInputElement) {
    aliasInput.disabled = allMode;
  }
  if (el.linkAllTypesRow) {
    el.linkAllTypesRow.style.display = allMode ? "flex" : "none";
  }
  updateLinkCreateButtonState();
}

function setLinkAllTypeSelection(typeValue, toolId) {
  const type = toPluralType(typeValue);
  if (el.linkAllModeToggle) {
    el.linkAllModeToggle.checked = true;
  }
  if (toolId && el.linkForm) {
    const toolSelect = el.linkForm.querySelector('select[name="toolId"]');
    if (toolSelect instanceof HTMLSelectElement) {
      toolSelect.value = toolId;
    }
  }
  if (el.linkForm) {
    const checks = [...el.linkForm.querySelectorAll('input[name="linkTypes"]')];
    checks.forEach((item) => {
      if (item instanceof HTMLInputElement) {
        item.checked = item.value === type;
      }
    });
  }
  syncLinkModeUI();
}

function toolSortOrder(toolId) {
  if (toolId === "cursor") return 0;
  if (toolId === "claude") return 1;
  if (toolId === "codex") return 2;
  return 99;
}

function buildMappingIndex(state) {
  const byToolAndPath = new Map();
  for (const mapping of state.mappings || []) {
    if (!mapping.active) {
      continue;
    }
    byToolAndPath.set(`${mapping.toolId}|${mapping.linkPath}`, mapping);
  }
  return byToolAndPath;
}

function buildConflictRecords() {
  mergeConflictIdByAssetKey = new Map();
  currentConflictRecords = [];
  if (!currentOverview) {
    return;
  }

  const resourceById = new Map((currentOverview.state.resources || []).map((resource) => [resource.id, resource]));
  const mappingIndex = buildMappingIndex(currentOverview.state);
  const scanAssetByToolAndPath = new Map();
  for (const tool of currentOverview.scan || []) {
    for (const asset of tool.assets || []) {
      scanAssetByToolAndPath.set(`${tool.toolId}|${asset.path}`, asset);
    }
  }

  const projectGlobal = [];
  for (const item of currentProjectGlobalConflicts) {
    const assetKey = `${item.toolId}|${item.projectAssetPath}`;
    const asset = scanAssetByToolAndPath.get(assetKey);
    const linkedMapping = mappingIndex.get(assetKey);
    const isLinkedByCowHub = Boolean(
      asset && asset.duplicateResourceId && linkedMapping && linkedMapping.resourceId === asset.duplicateResourceId,
    );
    if (isLinkedByCowHub) {
      continue;
    }

    const orderText =
      item.order === "project_first"
        ? "项目目录先存在，全局后存在"
        : item.order === "global_first"
          ? "全局目录先存在，项目后存在"
          : "先后顺序未知";

    projectGlobal.push({
      id: `pg:${item.id}`,
      kind: "project_global",
      toolId: item.toolId,
      toolName: item.toolName,
      type: item.type,
      name: item.name,
      assetPath: item.projectAssetPath,
      counterpartPath: item.globalAssetPath,
      counterpartSource: "global",
      orderText,
      firstPath: item.firstPath || "",
      laterPath: item.laterPath || "",
    });
  }

  const hubConflicts = [];
  for (const tool of currentOverview.scan || []) {
    for (const asset of tool.assets || []) {
      if (!asset.duplicateResourceId) {
        continue;
      }

      const assetKey = `${tool.toolId}|${asset.path}`;
      const linkedMapping = mappingIndex.get(assetKey);
      const isLinkedByCowHub = Boolean(linkedMapping && linkedMapping.resourceId === asset.duplicateResourceId);
      if (isLinkedByCowHub) {
        continue;
      }

      const resource = resourceById.get(asset.duplicateResourceId);
      if (!resource) {
        continue;
      }

      hubConflicts.push({
        id: `hub:${tool.toolId}:${asset.type}:${asset.path}:${asset.duplicateResourceId}`,
        kind: "hub",
        toolId: tool.toolId,
        toolName: tool.toolName,
        type: asset.type,
        name: asset.name,
        assetPath: asset.path,
        counterpartPath: resource.storePath,
        counterpartSource: "hub",
        orderText: "先后顺序未知（中心仓库记录不参与文件时间对比）",
        firstPath: "",
        laterPath: "",
      });
    }
  }

  currentConflictRecords = [...projectGlobal, ...hubConflicts].sort((a, b) =>
    `${a.toolId}|${a.type}|${a.name}|${a.assetPath}`.localeCompare(`${b.toolId}|${b.type}|${b.name}|${b.assetPath}`),
  );

  for (const item of projectGlobal) {
    mergeConflictIdByAssetKey.set(`${item.toolId}|${item.assetPath}`, item.id);
  }
  for (const item of hubConflicts) {
    const key = `${item.toolId}|${item.assetPath}`;
    if (!mergeConflictIdByAssetKey.has(key)) {
      mergeConflictIdByAssetKey.set(key, item.id);
    }
  }
}

function renderConflictModule() {
  if (!el.conflictSummary || !el.conflictToolTabs || !el.conflictList || !el.conflictDetail) {
    return;
  }

  const tools = [...new Set(currentConflictRecords.map((item) => item.toolId))].sort(
    (a, b) => toolSortOrder(a) - toolSortOrder(b),
  );
  if (!tools.includes(selectedConflictToolId)) {
    selectedConflictToolId = tools[0] || "cursor";
  }

  el.conflictToolTabs.innerHTML = tools.length
    ? tools
        .map((toolId) => {
          const active = toolId === selectedConflictToolId ? "active" : "";
          return `<button type="button" class="tool-tab ${active}" data-tool-id="${escapeHtml(toolId)}">${escapeHtml(toolId)}</button>`;
        })
        .join("")
    : `<div class="asset-empty">当前筛选下无冲突工具</div>`;

  const keyword = selectedConflictSearch.trim().toLowerCase();
  const filtered = currentConflictRecords.filter((item) => {
    if (selectedConflictToolId && item.toolId !== selectedConflictToolId) {
      return false;
    }
    if (selectedConflictType !== "all" && item.type !== selectedConflictType) {
      return false;
    }
    if (keyword && !item.name.toLowerCase().includes(keyword) && !item.assetPath.toLowerCase().includes(keyword)) {
      return false;
    }
    return true;
  });

  const scopeHint = currentBrowserScopePath ? "" : "（未选项目目录，仅展示中心仓库重复）";
  el.conflictSummary.textContent = `总冲突 ${currentConflictRecords.length} / 当前 ${filtered.length}${scopeHint}`;

  if (!filtered.length) {
    el.conflictList.innerHTML = `<div class="asset-empty">当前筛选下暂无冲突项。</div>`;
    el.conflictDetail.innerHTML = `<div class="asset-empty">暂无冲突详情。</div>`;
    selectedConflictId = "";
    return;
  }

  if (!filtered.find((item) => item.id === selectedConflictId)) {
    selectedConflictId = filtered[0].id;
  }

  el.conflictList.innerHTML = filtered
    .map((item) => {
      const active = item.id === selectedConflictId ? "active" : "";
      const kindLabel = item.kind === "project_global" ? "项目-全局重复" : "中心仓库重复";
      return `
        <button type="button" class="conflict-item ${active}" data-conflict-id="${escapeHtml(item.id)}">
          <div class="conflict-item-main">
            <span class="mono">${escapeHtml(item.name)}</span>
            <span class="conflict-kind">${kindLabel}</span>
          </div>
          <div class="asset-path">${escapeHtml(item.assetPath)}</div>
        </button>
      `;
    })
    .join("");

  const picked = filtered.find((item) => item.id === selectedConflictId) || filtered[0];
  const renderPathWithGlobalMark = (pathValue) => {
    if (picked.counterpartSource === "global" && pathValue === picked.counterpartPath) {
      return `<span class="path-global">${escapeHtml(pathValue)}</span>`;
    }
    return escapeHtml(pathValue);
  };
  const globalPathHtml =
    picked.counterpartSource === "global"
      ? `<span class="path-global">${escapeHtml(picked.counterpartPath)}</span>`
      : escapeHtml(picked.counterpartPath);

  const firstLine = picked.firstPath
    ? `<div><strong>先存在：</strong>${renderPathWithGlobalMark(picked.firstPath)}</div>`
    : "";
  const laterLine = picked.laterPath
    ? `<div><strong>后存在：</strong>${renderPathWithGlobalMark(picked.laterPath)}</div>`
    : "";
  const kindLabel = picked.kind === "project_global" ? "项目-全局重复" : "中心仓库重复";

  el.conflictDetail.innerHTML = `
    <div class="conflict-detail-body">
      <div><strong>名称：</strong>${escapeHtml(picked.name)}</div>
      <div><strong>工具/分类：</strong>${escapeHtml(picked.toolId)} / ${escapeHtml(picked.type)}</div>
      <div><strong>冲突类型：</strong>${kindLabel}</div>
      <div><strong>当前项目路径：</strong>${escapeHtml(picked.assetPath)}</div>
      <div><strong>对比路径：</strong>${globalPathHtml}</div>
      <div><strong>先后关系：</strong>${escapeHtml(picked.orderText)}</div>
      ${firstLine}
      ${laterLine}
    </div>
  `;
}

function focusConflict(conflictId, toolId, type) {
  if (toolId) {
    selectedConflictToolId = toolId;
  }
  if (type) {
    selectedConflictType = type;
  }
  if (el.conflictTypeFilter) {
    el.conflictTypeFilter.value = selectedConflictType;
  }

  const found = currentConflictRecords.find((item) => item.id === conflictId);
  if (found) {
    selectedConflictId = found.id;
  }

  renderConflictModule();
  if (el.conflictSection) {
    el.conflictSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

async function api(urlPath, options = {}) {
  const res = await fetch(urlPath, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

function setBusy(button, busyText) {
  const original = button.textContent;
  button.disabled = true;
  button.textContent = busyText;
  return () => {
    button.disabled = false;
    button.textContent = original;
  };
}

function renderCards(state, scan) {
  const stats = [
    { label: "资源总数", value: state.resources.length },
    { label: "链接总数", value: state.mappings.length },
    { label: "已检测工具", value: scan.filter((t) => t.detected).length },
  ];

  el.overviewCards.innerHTML = stats
    .map((s) => `<article class="card"><div>${s.label}</div><strong>${s.value}</strong></article>`)
    .join("");
}

function renderHubStoreResources(resources) {
  const order = ["skills", "commands", "hooks", "rules", "agents"];
  const grouped = {
    skills: [],
    commands: [],
    hooks: [],
    rules: [],
    agents: [],
  };

  for (const resource of resources) {
    if (grouped[resource.type]) {
      grouped[resource.type].push(resource);
    }
  }

  for (const key of order) {
    grouped[key].sort((a, b) => a.name.localeCompare(b.name));
  }

  const groups = order
    .map((type) => {
      const list = grouped[type];
      const label = type;
      const rows = list
        .map(
          (item) => `
          <li class="hub-row">
            <div class="hub-row-head">
              <span class="mono">${escapeHtml(item.name)}</span>${renderRuleToolBadgeByPath(item.type, item.sourcePath)}
              <span class="hub-row-id">${escapeHtml(item.id)}</span>
            </div>
            <div class="asset-path">${escapeHtml(item.storePath)}</div>
          </li>
        `,
        )
        .join("");

      return `
        <section class="hub-group">
          <div class="hub-group-title">${label}（${list.length}）</div>
          ${
            rows
              ? `<ul class="asset-list">${rows}</ul>`
              : `<div class="asset-empty">中心仓库中当前无 ${label}</div>`
          }
        </section>
      `;
    })
    .join("");

  el.toolScanList.innerHTML = `
    <div class="tool-meta">以下为中心仓库（~/.snakehub/store）中的资源分组：</div>
    <div class="hub-grid">${groups}</div>
  `;
}

function renderResourceOptions(resources) {
  const previousValue = el.resourceSelect ? String(el.resourceSelect.value || "") : "";
  const toolSelect = el.linkForm ? el.linkForm.querySelector('select[name="toolId"]') : null;
  const toolId = toolSelect instanceof HTMLSelectElement ? toolSelect.value.trim() : "";
  const expectedRuleExt = expectedRuleExtensionForTool(toolId);

  const filtered = resources.filter((resource) => {
    if (resource.type !== "rules") {
      return true;
    }
    if (!expectedRuleExt) {
      return true;
    }
    return String(resource.sourcePath || "").toLowerCase().endsWith(expectedRuleExt);
  });

  if (filtered.length === 0) {
    el.resourceSelect.innerHTML = `<option value="">（当前无可链接资源）</option>`;
    updateLinkCreateButtonState();
    return;
  }

  el.resourceSelect.innerHTML = filtered
    .map((r) => {
      const toolTag = r.type === "rules" ? detectRuleToolByPath(r.sourcePath) : "";
      const label = toolTag ? `${r.name}（${r.type}/${toolTag}）` : `${r.name}（${r.type}）`;
      return `<option value="${r.id}">${escapeHtml(label)}</option>`;
    })
    .join("");
  if (previousValue && filtered.some((resource) => resource.id === previousValue)) {
    el.resourceSelect.value = previousValue;
  }
  updateLinkCreateButtonState();
}

function typeSortOrder(type) {
  if (type === "skills") return 0;
  if (type === "commands") return 1;
  if (type === "hooks") return 2;
  if (type === "rules") return 3;
  if (type === "agents") return 4;
  return 99;
}

function renderRepoCandidates() {
  const { candidates, selectedKeys } = repoScanState;
  if (!candidates || candidates.length === 0) {
    el.repoCandidates.innerHTML = `<div class="asset-empty">尚未扫描到可导入项</div>`;
    setRepoActionButtonsEnabled(false);
    renderRepoHistoryCount();
    return;
  }

  const grouped = new Map();
  for (const item of candidates) {
    const list = grouped.get(item.type) || [];
    list.push(item);
    grouped.set(item.type, list);
  }

  for (const type of REPO_GROUP_ONLY_TYPES) {
    const list = grouped.get(type) || [];
    if (list.length === 0) {
      continue;
    }
    const selectedCount = list.filter((item) => selectedKeys.has(item.key)).length;
    if (selectedCount > 0 && selectedCount < list.length) {
      list.forEach((item) => selectedKeys.add(item.key));
    }
  }

  const sections = [...grouped.entries()]
    .sort((a, b) => typeSortOrder(a[0]) - typeSortOrder(b[0]))
    .map(([type, list]) => {
      list.sort((x, y) => x.relativePath.localeCompare(y.relativePath));
      const groupOnly = REPO_GROUP_ONLY_TYPES.has(type);
      const allChecked = list.length > 0 && list.every((item) => selectedKeys.has(item.key));
      const rows = list
        .map((item) => {
          const checked = selectedKeys.has(item.key) ? "checked" : "";
          const badge = renderRuleToolBadgeByPath(type, item.relativePath);
          return `
            ${
              groupOnly
                ? `
            <div class="repo-item">
              <span class="repo-item-body">
                <span class="mono">${escapeHtml(item.name)}</span>${badge}
                <span class="asset-path">${escapeHtml(item.relativePath)}</span>
              </span>
            </div>
            `
                : `
            <label class="repo-item">
              <input type="checkbox" class="repo-candidate-check" data-key="${escapeHtml(item.key)}" ${checked} />
              <span class="repo-item-body">
                <span class="mono">${escapeHtml(item.name)}</span>${badge}
                <span class="asset-path">${escapeHtml(item.relativePath)}</span>
              </span>
            </label>
            `
            }
          `;
        })
        .join("");

      return `
        <section class="repo-group">
          ${
            groupOnly
              ? `
          <label class="repo-group-title">
            <input type="checkbox" class="repo-type-check" data-type="${escapeHtml(type)}" ${allChecked ? "checked" : ""} />
            ${escapeHtml(type)}（${list.length}）
          </label>
          `
              : `<div class="repo-group-title">${type}（${list.length}）</div>`
          }
          <div class="repo-group-list">${rows}</div>
        </section>
      `;
    })
    .join("");

  el.repoCandidates.innerHTML = `<div class="repo-grid">${sections}</div>`;
  if (el.repoSelectAllBtn) el.repoSelectAllBtn.disabled = false;
  if (el.repoClearBtn) el.repoClearBtn.disabled = false;
  if (el.repoImportBtn) el.repoImportBtn.disabled = selectedKeys.size === 0;
  renderRepoHistoryCount();
}

function groupAssetsByType(assets) {
  const map = {
    skills: [],
    hooks: [],
    rules: [],
    agents: [],
    commands: [],
  };
  for (const asset of assets) {
    if (map[asset.type]) {
      map[asset.type].push(asset);
    }
  }
  for (const key of Object.keys(map)) {
    map[key].sort((a, b) => a.name.localeCompare(b.name));
  }
  return map;
}

function renderToolBrowser() {
  if (!currentOverview) {
    return;
  }

  const selectedToolId = el.toolBrowserSelect.value || "cursor";
  const selectedType = el.toolBrowserTypeSelect.value || "skills";
  const tool = currentOverview.scan.find((item) => item.toolId === selectedToolId);
  const pathItems = currentOverview.paths.filter((item) => item.toolId === selectedToolId);

  if (!tool) {
    el.toolBrowserMeta.textContent = `未找到工具 ${selectedToolId} 的扫描数据。`;
    el.toolBrowserContent.innerHTML = "";
    toolBrowserPickMap = new Map();
    toolBrowserTypePickMap = new Map();
    return;
  }

  if (!tool.detected) {
    el.toolBrowserMeta.textContent = `${tool.toolName}（${tool.toolId}）当前未检测到。`;
    el.toolBrowserContent.innerHTML = "";
    toolBrowserPickMap = new Map();
    toolBrowserTypePickMap = new Map();
    return;
  }

  const byType = groupAssetsByType(tool.assets);
  const pathHint = pathItems
    .map((p) => {
      const label = typeText[p.type] || p.type;
      const src = sourceText[p.source] || p.source;
      const value = p.path || "未启用";
      return `${label}: ${value} (${src})`;
    })
    .join(" | ");
  const list = byType[selectedType] || [];
  const selectedTypePath = pathItems.find((item) => item.type === selectedType)?.path || "";
  const canPickItemByType = selectedType !== "hooks" && selectedType !== "rules";
  const selectedTypeLabel = typeText[selectedType] || selectedType;
  el.toolBrowserMeta.textContent =
    `${tool.toolName}（${tool.toolId}）` +
    ` · 当前筛选：${selectedTypeLabel}` +
    ` · 目录：${pathHint || "无路径信息"}`;

  const nextPickMap = new Map();
  const linkedSourcePaths = [];
  let importableCount = 0;
  const items = list
    .map((asset, index) => {
      const pickKey = `${selectedToolId}:${selectedType}:${index}`;
      const assetKey = `${selectedToolId}|${asset.path}`;
      const linkedMapping = (currentOverview.state.mappings || []).find(
        (mapping) =>
          mapping.active &&
          mapping.toolId === selectedToolId &&
          mapping.linkPath === asset.path &&
          asset.duplicateResourceId &&
          mapping.resourceId === asset.duplicateResourceId,
      );
      const isLinkedByCowHub = Boolean(linkedMapping);
      if (isLinkedByCowHub) {
        linkedSourcePaths.push(asset.path);
      } else {
        importableCount += 1;
      }
      const showItemPickButton = canPickItemByType && !isLinkedByCowHub;
      if (showItemPickButton) {
        nextPickMap.set(pickKey, asset);
      }
      const mergeConflictId = mergeConflictIdByAssetKey.get(assetKey);
      const ruleToolBadge = renderRuleToolBadgeByPath(asset.type, asset.path);
      let statusTag = "";
      if (isLinkedByCowHub) {
        statusTag = ` <span class="asset-tag linked">已链接</span>`;
      } else if (mergeConflictId) {
        statusTag = `
          <button
            type="button"
            class="asset-tag mergeable conflict-jump-btn"
            data-conflict-id="${escapeHtml(mergeConflictId)}"
            data-tool-id="${escapeHtml(selectedToolId)}"
            data-type="${escapeHtml(selectedType)}"
          >
            可合并
          </button>
        `;
      }
      return `
        <li class="asset-row">
          <div class="asset-row-head">
            <span class="mono">${escapeHtml(asset.name)}</span>${ruleToolBadge}${statusTag}
            ${
              showItemPickButton
                ? `
            <button
              type="button"
              class="asset-pick-btn"
              data-pick-key="${escapeHtml(pickKey)}"
              title="填入“从本地路径导入”表单"
            >
              ->
            </button>
            `
                : ""
            }
          </div>
          <div class="asset-path">${escapeHtml(asset.path)}</div>
        </li>
      `;
    })
    .join("");
  toolBrowserPickMap = nextPickMap;
  const typeDirPickKey = `${selectedToolId}:${selectedType}:${selectedTypePath || "-"}`;
  const canPickTypeDir = Boolean(selectedTypePath) && importableCount > 0;
  const nextTypePickMap = new Map();
  if (canPickTypeDir) {
    nextTypePickMap.set(typeDirPickKey, {
      type: selectedType,
      sourcePath: selectedTypePath,
      excludeSourcePaths: linkedSourcePaths,
    });
  }
  toolBrowserTypePickMap = nextTypePickMap;

  el.toolBrowserContent.innerHTML = `
    <article class="browser-col">
      <div class="browser-type-head">
        <h3>${selectedType}（${list.length}）</h3>
        ${
          canPickTypeDir
            ? `
        <button
          type="button"
          class="asset-pick-btn type-dir-pick-btn"
          data-type="${escapeHtml(selectedType)}"
          data-tool-id="${escapeHtml(selectedToolId)}"
          data-type-dir-path="${escapeHtml(selectedTypePath)}"
          data-type-pick-key="${escapeHtml(typeDirPickKey)}"
          title="填入“从本地路径导入”并按该类型启用批量导入/批量链接（已链接项将自动跳过）"
        >
          ->
        </button>
        `
            : ""
        }
      </div>
      ${items ? `<ul class="asset-list">${items}</ul>` : `<div class="asset-empty">当前无 ${selectedType}</div>`}
    </article>
  `;
}

function renderPaths(paths) {
  el.pathTable.innerHTML = paths
    .map(
      (p) => `
      <div class="path-row">
        <div><strong>${p.toolId}</strong></div>
        <div>${(typeText[p.type] || p.type).replace(/s$/, "")}</div>
        <div>${p.path || "未启用"}</div>
        <div class="path-source ${p.source}">${sourceText[p.source] || p.source}</div>
      </div>
    `,
    )
    .join("");
}

function renderWizard(state, scan) {
  if (state.resources.length > 0) {
    el.wizardPanel.classList.add("hidden");
    return;
  }

  const detected = scan.filter((t) => t.detected).map((t) => t.toolId);
  const detectedText = detected.length ? detected.join("，") : "无";
  el.wizardHint.textContent = `已检测工具：${detectedText}。建议下一步：先创建或导入第一个资源（skill/hook/agent/command）。`;
  el.wizardPanel.classList.remove("hidden");
}

async function refreshOverview(mode = "auto") {
  const conflictPromise = currentBrowserScopePath
    ? api("/api/conflicts", {
        method: "POST",
        body: JSON.stringify(getBrowserScopePayload()),
      })
    : Promise.resolve({ conflicts: [] });

  const [overviewData, toolScanData, conflictsData] = await Promise.all([
    api("/api/overview"),
    api("/api/tool-scan", {
      method: "POST",
      body: JSON.stringify(getBrowserScopePayload()),
    }),
    conflictPromise,
  ]);
  currentOverview = {
    state: overviewData.state,
    scan: toolScanData.scan,
    paths: toolScanData.paths,
  };
  currentProjectGlobalConflicts = conflictsData.conflicts || [];
  const { state, scan, paths } = currentOverview;

  const modeLabel = mode === "manual" ? "手动" : "自动";
  const scannedAt = new Date().toLocaleTimeString();
  const scopeLabel = currentBrowserScopePath ? "项目" : "全局";
  el.summaryBadge.textContent =
    `${state.resources.length} 资源 / ${state.mappings.length} 链接 · ${scopeLabel}范围 · ${modeLabel}扫描 ${scannedAt}`;

  renderCards(state, scan);
  renderHubStoreResources(state.resources);
  renderResourceOptions(state.resources);
  renderOperationRecords(state.operations);
  renderPaths(paths);
  buildConflictRecords();
  renderToolBrowser();
  renderConflictModule();
  renderWizard(state, scan);
  renderScopeInputs();
  updateActionButtonsState();
  if (isRepoHistoryOverlayVisible()) {
    updateRepoHistoryOverlayLayout();
  }
}

function normalizeDroppedPath(inputPath) {
  if (!inputPath) return "";
  if (/^\/[A-Za-z]:\//.test(inputPath)) {
    return inputPath.slice(1);
  }
  return inputPath;
}

function extractDroppedPath(event) {
  const dt = event.dataTransfer;
  if (!dt) return "";

  const normalizePossiblePath = (rawValue) => {
    const value = String(rawValue || "").trim();
    if (!value) {
      return "";
    }
    if (value.startsWith("file://")) {
      try {
        const url = new URL(value);
        return normalizeDroppedPath(decodeURIComponent(url.pathname));
      } catch {
        return "";
      }
    }
    return normalizeDroppedPath(value);
  };

  const firstLine = (rawValue) =>
    String(rawValue || "")
      .split(/\r?\n/)
      .map((x) => x.trim())
      .find((x) => x && !x.startsWith("#")) || "";

  const getPathFromFile = (file) => {
    if (!file) {
      return "";
    }
    if (
      window.cowhubDesktop &&
      typeof window.cowhubDesktop.getPathForFile === "function"
    ) {
      const electronPath = window.cowhubDesktop.getPathForFile(file);
      if (typeof electronPath === "string" && electronPath.trim()) {
        return normalizeDroppedPath(electronPath);
      }
    }
    if (typeof file.path === "string" && file.path.trim()) {
      return normalizeDroppedPath(file.path);
    }
    if (typeof file.name === "string" && file.name.trim()) {
      return "";
    }
    return "";
  };

  const files = dt.files ? [...dt.files] : [];
  for (const file of files) {
    const filePath = getPathFromFile(file);
    if (filePath) {
      return filePath;
    }
  }

  const items = dt.items ? [...dt.items] : [];
  for (const item of items) {
    if (!item || item.kind !== "file") {
      continue;
    }
    const file = item.getAsFile();
    const filePath = getPathFromFile(file);
    if (filePath) {
      return filePath;
    }
  }

  const uriList = dt.getData("text/uri-list");
  if (uriList) {
    const candidate = normalizePossiblePath(firstLine(uriList));
    if (candidate) {
      return candidate;
    }
  }

  const plainText = firstLine(dt.getData("text/plain"));
  const plainPath = normalizePossiblePath(plainText);
  if (plainPath) {
    return plainPath;
  }

  const downloadUrl = firstLine(dt.getData("DownloadURL"));
  if (downloadUrl) {
    const segments = downloadUrl.split(":");
    const possiblePath = normalizePossiblePath(segments.slice(2).join(":"));
    if (possiblePath) {
      return possiblePath;
    }
  }

  return "";
}

function bindDropZone(zone, onDropPath) {
  if (!zone) {
    return;
  }
  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    zone.classList.add("active");
  });
  zone.addEventListener("dragleave", () => {
    zone.classList.remove("active");
  });
  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    zone.classList.remove("active");
    const dropped = extractDroppedPath(event);
    if (!dropped) {
      log("拖拽已忽略：未提取到有效路径");
      return;
    }
    onDropPath(dropped);
  });
}

function bindDnD() {
  const isAbsolutePath = (pathValue) => {
    if (!pathValue) return false;
    if (/^[A-Za-z]:\\/.test(pathValue)) return true;
    if (pathValue.startsWith("/")) return true;
    if (pathValue.startsWith("\\\\")) return true;
    return false;
  };
  bindDropZone(el.localDropZone, (dropped) => {
    if (!isAbsolutePath(dropped)) {
      log(`拖拽路径无效（非绝对路径）：${dropped}。请改用点击输入框选择目录。`);
      return;
    }
    if (el.localPathInput) {
      el.localPathInput.value = dropped;
    }
    localBatchImportContext = null;
    updateLocalImportButtonState();
    log(`已捕获拖拽路径：${dropped}`);
  });
  bindDropZone(el.localRepoDropZone, (dropped) => {
    if (!isAbsolutePath(dropped)) {
      log(`拖拽路径无效（非绝对路径）：${dropped}。请点击“技能仓库路径”选择目录。`);
      return;
    }
    activateLocalImportTab("repo");
    if (el.localRepoPathInput) {
      el.localRepoPathInput.value = dropped;
    }
    updateLocalRepoScanButtonState();
    log(`已捕获技能仓库路径：${dropped}`);
    submitLocalRepoScanForm();
  });
}

function submitLocalRepoScanForm() {
  if (!el.localRepoScanForm) {
    return;
  }
  const submitBtn = el.localRepoScanForm.querySelector("button[type=submit]");
  if (submitBtn instanceof HTMLButtonElement && submitBtn.disabled) {
    return;
  }
  log("已自动触发“扫描并选择导入项”");
  if (typeof el.localRepoScanForm.requestSubmit === "function") {
    el.localRepoScanForm.requestSubmit(submitBtn instanceof HTMLElement ? submitBtn : undefined);
    return;
  }
  el.localRepoScanForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

async function onRepoScanSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type=submit]");
  const done = setBusy(button, "下载并扫描中...");

  try {
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.rulesCanonicalValidation = Boolean(el.repoRulesCanonical && el.repoRulesCanonical.checked);
    const result = await api("/api/repo/scan", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    applyRepoScanResult(result.result, "GitLab 下载并扫描");
    log(`仓库扫描完成：${repoScanState.candidates.length} 项，默认全选`);
  } catch (error) {
    log(`仓库扫描失败：${getErrorMessage(error)}`);
    el.repoScanMeta.textContent = `扫描失败：${getErrorMessage(error)}`;
    repoScanState = {
      repoPath: "",
      repoId: "",
      repoUrl: "",
      ref: "",
      multiToolset: false,
      rulesCanonicalValidation: true,
      candidates: [],
      selectedKeys: new Set(),
    };
    renderRepoCandidates();
  } finally {
    done();
  }
}

function applyRepoScanResult(scanResult, sourceLabel = "") {
  const result = scanResult || {};
  const candidates = Array.isArray(result.candidates) ? result.candidates : [];
  repoScanState = {
    repoPath: result.repoPath || "",
    repoId: result.repoId || "",
    repoUrl: result.repoUrl || "",
    ref: result.ref || "",
    multiToolset: Boolean(result.multiToolset),
    rulesCanonicalValidation: result.rulesCanonicalValidation !== false,
    candidates,
    selectedKeys: new Set(candidates.map((item) => item.key)),
  };

  const selectedCount = repoScanState.selectedKeys.size;
  const modeText = repoScanState.multiToolset ? "多端工具集" : "标准模式";
  const rulesModeText = repoScanState.rulesCanonicalValidation ? "rules范式校验开" : "rules范式校验关";
  const sourceText = sourceLabel ? `来源：${sourceLabel} | ` : "";
  el.repoScanMeta.textContent =
    `${sourceText}仓库：${repoScanState.repoUrl || "(本地路径)"} | ` +
    `本地目录：${repoScanState.repoPath} | ` +
    `模式：${modeText}/${rulesModeText} | ` +
    `候选：${repoScanState.candidates.length} | ` +
    `已勾选：${selectedCount}`;
  recordRepoHistoryEntry({
    repoId: repoScanState.repoId,
    repoUrl: repoScanState.repoUrl,
    repoPath: repoScanState.repoPath,
  });
  renderRepoCandidates();
  openRepoHistoryOverlay();
}

async function onLocalRepoScanSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type=submit]");
  const done = setBusy(button, "扫描中...");
  try {
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.repoPath = String(payload.repoPath || "").trim();
    payload.multiToolset = Boolean(el.localRepoMultiToolset && el.localRepoMultiToolset.checked);
    payload.rulesCanonicalValidation = Boolean(el.localRepoRulesCanonical && el.localRepoRulesCanonical.checked);
    const result = await api("/api/repo/scan", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    applyRepoScanResult(result.result, "本地技能仓库扫描");
    log(`本地技能仓库扫描完成：${repoScanState.candidates.length} 项，默认全选`);
  } catch (error) {
    log(`本地技能仓库扫描失败：${getErrorMessage(error)}`);
    el.repoScanMeta.textContent = `扫描失败：${getErrorMessage(error)}`;
    repoScanState = {
      repoPath: "",
      repoId: "",
      repoUrl: "",
      ref: "",
      multiToolset: false,
      rulesCanonicalValidation: true,
      candidates: [],
      selectedKeys: new Set(),
    };
    renderRepoCandidates();
  } finally {
    done();
  }
}

function onRepoCandidatesChange(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }
  if (target.classList.contains("repo-type-check")) {
    const type = target.getAttribute("data-type") || "";
    if (!type) {
      return;
    }
    const keys = repoScanState.candidates.filter((item) => item.type === type).map((item) => item.key);
    if (target.checked) {
      keys.forEach((key) => repoScanState.selectedKeys.add(key));
    } else {
      keys.forEach((key) => repoScanState.selectedKeys.delete(key));
    }
    renderRepoCandidates();
    return;
  }
  if (!target.classList.contains("repo-candidate-check")) {
    return;
  }

  const key = target.getAttribute("data-key") || "";
  if (!key) {
    return;
  }

  if (target.checked) {
    repoScanState.selectedKeys.add(key);
  } else {
    repoScanState.selectedKeys.delete(key);
  }

  if (el.repoImportBtn) {
    el.repoImportBtn.disabled = repoScanState.selectedKeys.size === 0;
  }
}

function selectAllRepoCandidates() {
  const keys = repoScanState.candidates.map((item) => item.key);
  repoScanState.selectedKeys = new Set(keys);
  renderRepoCandidates();
  log(`已全选 ${repoScanState.selectedKeys.size} 项`);
}

function clearRepoCandidateSelection() {
  repoScanState.selectedKeys = new Set();
  renderRepoCandidates();
  log("已清空导入勾选");
}

async function onPickRepoDirectory() {
  const picker = getDirectoryPicker();

  if (!picker) {
    log("当前运行环境不支持目录选择器，请使用 Electron 桌面应用");
    return;
  }

  try {
    const selected = await picker();
    if (!selected) {
      return;
    }
    el.repoTargetPath.value = selected;
    log(`已选择下载目录：${selected}`);
  } catch (error) {
    log(`选择目录失败：${getErrorMessage(error)}`);
  }
}

function onClearRepoDirectory() {
  if (el.repoTargetPath) {
    el.repoTargetPath.value = "";
  }
  log("已清空下载目录，将使用默认受管目录");
}

async function onPickLocalRepoDirectory() {
  const picker = getDirectoryPicker();

  if (!picker) {
    log("当前运行环境不支持目录选择器，请使用 Electron 桌面应用");
    return;
  }

  try {
    const selected = await picker();
    if (!selected) {
      return;
    }
    activateLocalImportTab("repo");
    if (el.localRepoPathInput) {
      el.localRepoPathInput.value = selected;
    }
    updateLocalRepoScanButtonState();
    log(`已选择技能仓库目录：${selected}`);
  } catch (error) {
    log(`选择技能仓库目录失败：${getErrorMessage(error)}`);
  }
}

function onClearLocalRepoDirectory() {
  if (el.localRepoPathInput) {
    el.localRepoPathInput.value = "";
  }
  updateLocalRepoScanButtonState();
  log("已清空技能仓库路径");
}

async function onImportRepoCandidates() {
  if (!repoScanState.repoPath) {
    log("请先执行下载并扫描");
    return;
  }

  const selectedKeys = [...repoScanState.selectedKeys];
  if (selectedKeys.length === 0) {
    log("请先勾选要导入的资源");
    return;
  }

  const done = setBusy(el.repoImportBtn, "导入中...");
  try {
    const result = await api("/api/repo/import-selected", {
      method: "POST",
      body: JSON.stringify({
        repoPath: repoScanState.repoPath,
        selectedKeys,
        multiToolset: repoScanState.multiToolset,
        rulesCanonicalValidation: repoScanState.rulesCanonicalValidation,
      }),
    });
    const imported = result.result.imported || [];
    const reused = imported.filter((x) => x.reused).length;
    const created = imported.length - reused;
    log(`导入中心仓库完成：新增 ${created}，复用 ${reused}，总计 ${imported.length}`);
    if (result.result.hooksSnapshot) {
      log(`hooks 配置与目录结构已归档：${result.result.hooksSnapshot.snapshotDir}`);
    }
    if (result.result.rulesSnapshot) {
      log(`rules 目录结构已归档：${result.result.rulesSnapshot.snapshotDir}`);
    }
    await refreshOverview("auto");
  } catch (error) {
    log(`导入中心仓库失败：${getErrorMessage(error)}`);
  } finally {
    done();
  }
}

async function onLocalImport(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type=submit]");
  const done = setBusy(button, "导入中...");
  try {
    const payload = Object.fromEntries(new FormData(form).entries());
    const payloadType = toPluralType(String(payload.type || ""));
    const payloadSourcePath = String(payload.sourcePath || "").trim();
    const isHooksType = payloadType === "hooks";
    const isRulesType = payloadType === "rules";
    const isBatchByType =
      Boolean(localBatchImportContext) &&
      localBatchImportContext.type === payloadType &&
      localBatchImportContext.sourcePath === payloadSourcePath;

    if (isHooksType || isRulesType || isBatchByType) {
      if (isBatchByType && localBatchImportContext && Array.isArray(localBatchImportContext.excludeSourcePaths)) {
        payload.excludeSourcePaths = localBatchImportContext.excludeSourcePaths;
      }
      const result = await api("/api/import/local/batch", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const summary = result.result || {};
      log(
        `本地批量导入完成：尝试 ${summary.attempted || 0}，新增 ${summary.created || 0}，复用 ${summary.reused || 0}`,
      );
      if (summary.hooksSnapshot) {
        log(`hooks 配置与目录结构已归档：${summary.hooksSnapshot.snapshotDir}`);
      }
      if (summary.rulesSnapshot) {
        log(`rules 目录结构已归档：${summary.rulesSnapshot.snapshotDir}`);
      }
      if (summary.rulesCompanionNotice) {
        log(summary.rulesCompanionNotice);
      }
      if (summary.skippedLinked && summary.skippedLinked > 0) {
        log(`已自动跳过已链接项：${summary.skippedLinked}`);
      }
      localBatchImportContext = null;
    } else {
      const result = await api("/api/import/local", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      log(`本地导入成功：${result.result.resource.id}`);
    }
    form.reset();
    updateActionButtonsState();
    await refreshOverview("auto");
  } catch (error) {
    log(`本地导入失败：${getErrorMessage(error)}`);
  } finally {
    done();
  }
}

async function onGitList() {
  const form = el.gitForm;
  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    const result = await api("/api/import/git/candidates", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const candidates = result.result.candidates || [];
    if (candidates.length === 0) {
      el.gitCandidates.textContent = "未找到候选目录。";
      return;
    }

    el.gitCandidates.textContent = candidates.map((c) => `${c.relativePath} (${c.name})`).join("\n");
    log(`仓库候选加载完成：${candidates.length} 个`);
  } catch (error) {
    el.gitCandidates.textContent = `错误：${getErrorMessage(error)}`;
    log(`列出候选失败：${getErrorMessage(error)}`);
  }
}

async function onGitImport(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type=submit]");
  const done = setBusy(button, "导入中...");

  try {
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.all = formData.get("all") === "on";

    const result = await api("/api/import/git", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    log(`仓库导入成功：本次选中 ${result.result.selectedCandidates.length} 个`);
    await refreshOverview("auto");
  } catch (error) {
    log(`仓库导入失败：${getErrorMessage(error)}`);
  } finally {
    done();
  }
}

async function onLinkSubmitSingle() {
  const form = el.linkForm;
  const done = setBusy(el.linkCreateBtn, "链接中...");

  try {
    const payload = Object.fromEntries(new FormData(form).entries());
    if (currentLinkScopePath) {
      payload.projectPath = currentLinkScopePath;
    }
    const result = await api("/api/link", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const scopeLabel = currentLinkScopePath ? `项目 ${currentLinkScopePath}` : "全局";
    if (result.result && result.result.mode === "hooks-batch") {
      log(
        `hooks 批量链接完成（${scopeLabel}）：尝试 ${result.result.attempted || 0}，新建 ${result.result.linked || 0}，已存在 ${result.result.alreadyLinked || 0}，失败 ${(result.result.failed || []).length}`,
      );
      if (result.result.config) {
        log(`hooks 配置文件已链接：${result.result.config.path}`);
      }
    } else if (result.result && result.result.mode === "rules-batch") {
      log(
        `rules 批量链接完成（${scopeLabel}）：尝试 ${result.result.attempted || 0}，新建 ${result.result.linked || 0}，已存在 ${result.result.alreadyLinked || 0}，失败 ${(result.result.failed || []).length}`,
      );
      const companionFiles = result.result.companionFiles || [];
      if (companionFiles.length > 0) {
        log(`检测到源地址有配置文件和规则文件：${companionFiles.map((item) => item.name).join(", ")}，将跟随rules一起链接`);
      }
    } else {
      log(`链接成功（${scopeLabel}）：${result.result.mapping.linkPath}`);
    }
    await refreshOverview("auto");
  } catch (error) {
    log(`链接失败：${getErrorMessage(error)}`);
  } finally {
    done();
  }
}

async function onLinkAllRun() {
  if (!(el.linkAllModeToggle && el.linkAllModeToggle.checked)) {
    log("请先勾选“链接所有（按类型）”");
    return;
  }
  const selectedTypes = getSelectedLinkTypes();
  if (selectedTypes.length === 0) {
    log("请至少选择一个类型（skills/commands/hooks/rules/agents）");
    return;
  }

  const toolSelect = el.linkForm ? el.linkForm.querySelector('select[name="toolId"]') : null;
  const toolId = toolSelect instanceof HTMLSelectElement ? toolSelect.value : "";
  if (!toolId) {
    log("未选择工具，无法批量链接");
    return;
  }

  const done = setBusy(el.linkCreateBtn, "批量链接中...");
  try {
    const includesHooks = selectedTypes.includes("hooks");
    const includesRules = selectedTypes.includes("rules");
    const getSourcePathByType = (typeValue) => {
      if (localBatchImportContext && localBatchImportContext.type === typeValue) {
        return localBatchImportContext.sourcePath;
      }
      if (!(currentOverview && el.resourceSelect)) {
        return "";
      }
      const resource = (currentOverview.state.resources || []).find(
        (item) => item.id === el.resourceSelect.value && item.type === typeValue,
      );
      return resource ? resource.sourcePath : "";
    };
    const payload = {
      toolId,
      types: selectedTypes,
    };
    if (includesHooks) {
      const hooksSourcePath = getSourcePathByType("hooks");

      if (!hooksSourcePath) {
        log("批量链接 hooks 需要来源 hooks 目录。请先在浏览器中选择一个 hooks 条目或使用类型箭头填充。");
        return;
      }
      payload.hooksSourcePath = hooksSourcePath;
    }
    if (includesRules) {
      const rulesSourcePath = getSourcePathByType("rules");
      if (!rulesSourcePath) {
        log("批量链接 rules 需要来源 rules 目录。请先在浏览器中选择一个 rules 条目或使用类型箭头填充。");
        return;
      }
      payload.rulesSourcePath = rulesSourcePath;
    }
    if (currentLinkScopePath) {
      payload.projectPath = currentLinkScopePath;
    }

    const result = await api("/api/link/batch", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const summary = result.result || {};
    const scopeLabel = currentLinkScopePath ? `项目 ${currentLinkScopePath}` : "全局";
    log(
      `批量链接完成（${scopeLabel}）：尝试 ${summary.attempted || 0}，新建 ${summary.linked || 0}，已存在 ${summary.alreadyLinked || 0}，失败 ${(summary.failed || []).length}`,
    );
    if (summary.failed && summary.failed.length > 0) {
      const first = summary.failed[0];
      log(`失败示例：${first.type}/${first.name} - ${first.error}`);
    }
    if (summary.hooksConfig) {
      log(`hooks 配置文件已链接：${summary.hooksConfig.path}`);
    }
    if (summary.rulesCompanionNotice) {
      log(summary.rulesCompanionNotice);
    } else if (summary.rulesCompanions && summary.rulesCompanions.length > 0) {
      log(`检测到源地址有配置文件和规则文件：${summary.rulesCompanions.map((item) => item.name).join(", ")}，将跟随rules一起链接`);
    }
    await refreshOverview("auto");
  } catch (error) {
    log(`批量链接失败：${getErrorMessage(error)}`);
  } finally {
    done();
  }
}

async function onLinkCreate(event) {
  event.preventDefault();
  const allMode = Boolean(el.linkAllModeToggle && el.linkAllModeToggle.checked);
  if (allMode) {
    await onLinkAllRun();
    return;
  }
  await onLinkSubmitSingle();
}

async function onPickBrowserScopeDirectory() {
  const picker = getDirectoryPicker();

  if (!picker) {
    log("当前运行环境不支持目录选择器，请使用 Electron 桌面应用");
    return;
  }

  try {
    const selected = await picker();
    if (!selected) {
      return;
    }

    currentBrowserScopePath = selected;
    renderScopeInputs();
    log(`浏览器项目范围已切换：${selected}`);
    await refreshOverview("manual");
  } catch (error) {
    log(`选择项目目录失败：${getErrorMessage(error)}`);
  }
}

async function onClearBrowserScopeDirectory() {
  currentBrowserScopePath = "";
  renderScopeInputs();
  log("浏览器项目范围已切回全局");
  try {
    await refreshOverview("manual");
  } catch (error) {
    log(`刷新失败：${getErrorMessage(error)}`);
  }
}

async function onPickLinkScopeDirectory() {
  const picker = getDirectoryPicker();

  if (!picker) {
    log("当前运行环境不支持目录选择器，请使用 Electron 桌面应用");
    return;
  }

  try {
    const selected = await picker();
    if (!selected) {
      return;
    }
    currentLinkScopePath = selected;
    renderScopeInputs();
    log(`链接项目范围已切换：${selected}`);
  } catch (error) {
    log(`选择目录失败：${getErrorMessage(error)}`);
  }
}

function onClearLinkScopeDirectory() {
  currentLinkScopePath = "";
  renderScopeInputs();
  log("链接项目范围已切回全局");
}

async function onPathSet(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type=submit]");
  const done = setBusy(button, "设置中...");

  try {
    const payload = Object.fromEntries(new FormData(form).entries());
    await api("/api/paths/set", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    log(`路径覆盖已设置：${payload.toolId}/${payload.type}`);
    await refreshOverview("auto");
  } catch (error) {
    log(`设置路径失败：${getErrorMessage(error)}`);
  } finally {
    done();
  }
}

async function onPathUnset() {
  const form = el.pathSetForm;
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    await api("/api/paths/unset", {
      method: "POST",
      body: JSON.stringify({ toolId: payload.toolId, type: payload.type }),
    });
    log(`路径覆盖已取消：${payload.toolId}/${payload.type}`);
    await refreshOverview("auto");
  } catch (error) {
    log(`取消路径失败：${getErrorMessage(error)}`);
  }
}

async function onRollback() {
  if (rollbackBusy) {
    log("回滚进行中，请稍候");
    return;
  }
  const done = setBusy(el.rollbackBtn, "回滚中...");
  rollbackBusy = true;
  try {
    const result = await api("/api/rollback", {
      method: "POST",
      body: JSON.stringify({}),
    });
    log(`回滚成功：${result.result.rolledBackOperationId}`);
    await refreshOverview("auto");
  } catch (error) {
    log(`回滚失败：${getErrorMessage(error)}`);
  } finally {
    rollbackBusy = false;
    done();
  }
}

async function onRollbackByOperation(operationId, linkPath) {
  if (!operationId) {
    return;
  }
  if (rollbackBusy) {
    log("回滚进行中，请稍候");
    return;
  }
  const ok = window.confirm(`是否回滚该次链接？\n${linkPath}`);
  if (!ok) {
    return;
  }
  const done = setBusy(el.rollbackBtn, "回滚中...");
  rollbackBusy = true;
  try {
    const result = await api("/api/rollback", {
      method: "POST",
      body: JSON.stringify({ operationId }),
    });
    log(`按记录回滚成功：${result.result.rolledBackOperationId}`);
    await refreshOverview("auto");
  } catch (error) {
    log(`按记录回滚失败：${getErrorMessage(error)}`);
  } finally {
    rollbackBusy = false;
    done();
  }
}

function bindEvents() {
  el.refreshBtn.addEventListener("click", async () => {
    try {
      await refreshOverview("manual");
      log("已手动触发扫描并刷新页面");
    } catch (error) {
      log(`刷新失败：${getErrorMessage(error)}`);
    }
  });

  if (el.repoScanForm) {
    el.repoScanForm.addEventListener("submit", onRepoScanSubmit);
    el.repoScanForm.addEventListener("input", updateRepoScanButtonState);
    el.repoScanForm.addEventListener("change", updateRepoScanButtonState);
  }
  if (el.repoHistoryBadge) {
    el.repoHistoryBadge.addEventListener("click", toggleRepoHistoryOverlay);
  }
  if (el.repoHistoryCloseBtn) {
    el.repoHistoryCloseBtn.addEventListener("click", closeRepoHistoryOverlay);
  }
  if (el.repoHistoryBackdrop) {
    el.repoHistoryBackdrop.addEventListener("click", closeRepoHistoryOverlay);
  }
  window.addEventListener("resize", () => {
    if (isRepoHistoryOverlayVisible()) {
      updateRepoHistoryOverlayLayout();
    }
  });
  window.addEventListener("scroll", () => {
    if (isRepoHistoryOverlayVisible()) {
      updateRepoHistoryOverlayLayout();
    }
  }, { passive: true });
  if (el.repoCandidates) {
    el.repoCandidates.addEventListener("change", onRepoCandidatesChange);
  }
  if (el.repoSelectAllBtn) {
    el.repoSelectAllBtn.addEventListener("click", selectAllRepoCandidates);
    el.repoSelectAllBtn.disabled = true;
  }
  if (el.repoClearBtn) {
    el.repoClearBtn.addEventListener("click", clearRepoCandidateSelection);
    el.repoClearBtn.disabled = true;
  }
  if (el.repoImportBtn) {
    el.repoImportBtn.addEventListener("click", onImportRepoCandidates);
    el.repoImportBtn.disabled = true;
  }
  if (el.repoClearDirBtn) {
    el.repoClearDirBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClearRepoDirectory();
    });
  }
  if (el.repoTargetPath) {
    el.repoTargetPath.addEventListener("click", onPickRepoDirectory);
  }
  if (el.localRepoPathInput) {
    el.localRepoPathInput.addEventListener("click", onPickLocalRepoDirectory);
  }
  if (el.localRepoClearDirBtn) {
    el.localRepoClearDirBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClearLocalRepoDirectory();
    });
  }
  if (el.toolScopePath) {
    el.toolScopePath.addEventListener("click", onPickBrowserScopeDirectory);
  }
  if (el.linkScopePath) {
    el.linkScopePath.addEventListener("click", onPickLinkScopeDirectory);
  }
  if (el.toolScopeClearBtn) {
    el.toolScopeClearBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClearBrowserScopeDirectory();
    });
  }
  if (el.linkScopeClearBtn) {
    el.linkScopeClearBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClearLinkScopeDirectory();
    });
  }
  if (el.conflictTypeFilter) {
    el.conflictTypeFilter.addEventListener("change", (event) => {
      const target = event.target;
      selectedConflictType = target instanceof HTMLSelectElement ? target.value : "all";
      renderConflictModule();
    });
  }
  if (el.conflictSearchInput) {
    el.conflictSearchInput.addEventListener("input", (event) => {
      const target = event.target;
      selectedConflictSearch = target instanceof HTMLInputElement ? target.value : "";
      renderConflictModule();
    });
  }
  if (el.conflictToolTabs) {
    el.conflictToolTabs.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const btn = target.closest(".tool-tab");
      if (!btn) {
        return;
      }
      const toolId = btn.getAttribute("data-tool-id") || "";
      if (!toolId) {
        return;
      }
      selectedConflictToolId = toolId;
      selectedConflictId = "";
      renderConflictModule();
    });
  }
  if (el.conflictList) {
    el.conflictList.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const btn = target.closest(".conflict-item");
      if (!btn) {
        return;
      }
      const conflictId = btn.getAttribute("data-conflict-id") || "";
      if (!conflictId) {
        return;
      }
      selectedConflictId = conflictId;
      renderConflictModule();
    });
  }
  if (el.localImportTabs) {
    el.localImportTabs.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const tabBtn = target.closest("[data-tab]");
      if (!tabBtn) {
        return;
      }
      const tab = tabBtn.getAttribute("data-tab") || "single";
      activateLocalImportTab(tab);
    });
  }
  if (el.localImportForm) {
    el.localImportForm.addEventListener("submit", onLocalImport);
    el.localImportForm.addEventListener("input", updateLocalImportButtonState);
    el.localImportForm.addEventListener("change", updateLocalImportButtonState);
    const localTypeSelect = el.localImportForm.querySelector('select[name="type"]');
    if (localTypeSelect) {
      localTypeSelect.addEventListener("change", () => {
        localBatchImportContext = null;
      });
    }
  }
  if (el.localPathInput) {
    el.localPathInput.addEventListener("input", () => {
      localBatchImportContext = null;
    });
  }
  if (el.localRepoScanForm) {
    el.localRepoScanForm.addEventListener("submit", onLocalRepoScanSubmit);
    el.localRepoScanForm.addEventListener("input", updateLocalRepoScanButtonState);
    el.localRepoScanForm.addEventListener("change", updateLocalRepoScanButtonState);
  }
  el.gitForm.addEventListener("submit", onGitImport);
  el.gitForm.addEventListener("input", updateGitImportButtonsState);
  el.gitForm.addEventListener("change", updateGitImportButtonsState);
  el.gitListBtn.addEventListener("click", onGitList);
  el.linkForm.addEventListener("submit", onLinkCreate);
  el.linkForm.addEventListener("input", updateLinkCreateButtonState);
  el.linkForm.addEventListener("change", updateLinkCreateButtonState);
  const linkToolSelect = el.linkForm ? el.linkForm.querySelector('select[name="toolId"]') : null;
  if (linkToolSelect instanceof HTMLSelectElement) {
    linkToolSelect.addEventListener("change", () => {
      if (currentOverview && currentOverview.state) {
        renderResourceOptions(currentOverview.state.resources || []);
      }
    });
  }
  if (el.linkAllModeToggle) {
    el.linkAllModeToggle.addEventListener("change", syncLinkModeUI);
  }
  el.pathSetForm.addEventListener("submit", onPathSet);
  el.pathSetForm.addEventListener("input", updatePathSetButtonsState);
  el.pathSetForm.addEventListener("change", updatePathSetButtonsState);
  el.pathUnsetBtn.addEventListener("click", onPathUnset);
  el.rollbackBtn.addEventListener("click", onRollback);
  if (el.operationRecords) {
    el.operationRecords.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const item = target.closest(".operation-item.rollbackable");
      if (!item || !el.operationRecords.contains(item)) {
        return;
      }
      const operationId = item.getAttribute("data-operation-id") || "";
      const linkPath = item.getAttribute("data-link-path") || "";
      onRollbackByOperation(operationId, linkPath);
    });
  }
  el.toolBrowserSelect.addEventListener("change", () => {
    renderToolBrowser();
  });
  el.toolBrowserTypeSelect.addEventListener("change", () => {
    renderToolBrowser();
  });
  el.toolBrowserContent.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const conflictBtn = target.closest(".conflict-jump-btn");
    if (conflictBtn) {
      const conflictId = conflictBtn.getAttribute("data-conflict-id") || "";
      const toolId = conflictBtn.getAttribute("data-tool-id") || "";
      const type = conflictBtn.getAttribute("data-type") || "all";
      if (!conflictId) {
        log("跳转失败：冲突信息已失效，请刷新后重试");
        return;
      }
      focusConflict(conflictId, toolId, type);
      return;
    }
    const typeDirBtn = target.closest(".type-dir-pick-btn");
    if (typeDirBtn) {
      const typeValue = typeDirBtn.getAttribute("data-type") || "";
      const toolId = typeDirBtn.getAttribute("data-tool-id") || "";
      const dirPath = typeDirBtn.getAttribute("data-type-dir-path") || "";
      const typePickKey = typeDirBtn.getAttribute("data-type-pick-key") || "";
      const pickContext = toolBrowserTypePickMap.get(typePickKey);
      if (!typeValue || !dirPath || !pickContext) {
        log("选择失败：当前类型目录不可用，请刷新后重试");
        return;
      }

      activateLocalImportTab("single");
      const form = el.localImportForm;
      const typeSelect = form.querySelector('select[name="type"]');
      const sourceInput = form.querySelector('input[name="sourcePath"]');
      const nameInput = form.querySelector('input[name="name"]');

      if (typeSelect) {
        typeSelect.value = toSingleType(typeValue);
      }
      if (sourceInput) {
        sourceInput.value = dirPath;
      }
      if (nameInput) {
        nameInput.value = "";
      }

      localBatchImportContext = {
        type: toPluralType(typeValue),
        sourcePath: dirPath,
        excludeSourcePaths: Array.isArray(pickContext.excludeSourcePaths) ? pickContext.excludeSourcePaths : [],
      };
      setLinkAllTypeSelection(typeValue, toolId);
      log(`已填充本地导入目录：${typeValue} / ${dirPath}（将按该类型批量导入并可批量链接）`);
      form.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const btn = target.closest(".asset-pick-btn");
    if (!btn) {
      return;
    }

    const pickKey = btn.getAttribute("data-pick-key") || "";
    const asset = toolBrowserPickMap.get(pickKey);
    if (!asset) {
      log("选择失败：该条目已过期，请先刷新扫描结果");
      return;
    }

    activateLocalImportTab("single");
    const form = el.localImportForm;
    const typeSelect = form.querySelector('select[name="type"]');
    const sourceInput = form.querySelector('input[name="sourcePath"]');
    const nameInput = form.querySelector('input[name="name"]');

    if (typeSelect) {
      typeSelect.value = toSingleType(asset.type);
    }
    if (sourceInput) {
      sourceInput.value = asset.path || "";
    }
    if (nameInput) {
      nameInput.value = asset.name || "";
    }

    localBatchImportContext = null;
    log(`已填充本地导入表单：${toSingleType(asset.type)} / ${asset.path}`);
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  bindDnD();
}

async function boot() {
  repoHistoryEntries = loadRepoHistoryEntries();
  renderRepoHistoryCount();
  activateLocalImportTab("single");
  bindEvents();
  if (el.conflictTypeFilter) {
    el.conflictTypeFilter.value = selectedConflictType;
  }
  syncLinkModeUI();
  updateActionButtonsState();
  try {
    await refreshOverview("auto");
    el.toolBrowserSelect.value = "cursor";
    el.toolBrowserTypeSelect.value = "skills";
    renderToolBrowser();
    log("页面已启动，已自动扫描一次");
  } catch (error) {
    log(`初始化失败：${getErrorMessage(error)}`);
  }
}

boot();
