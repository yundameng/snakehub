const el = {
  refreshBtn: document.getElementById("refreshBtn"),
  summaryBadge: document.getElementById("summaryBadge"),
  overviewCards: document.getElementById("overviewCards"),
  toolScanList: document.getElementById("toolScanList"),
  toolBrowserSelect: document.getElementById("toolBrowserSelect"),
  toolBrowserTypeSelect: document.getElementById("toolBrowserTypeSelect"),
  toolBrowserToolTabs: document.getElementById("toolBrowserToolTabs"),
  toolBrowserTypeTabs: document.getElementById("toolBrowserTypeTabs"),
  toolBrowserMeta: document.getElementById("toolBrowserMeta"),
  toolBrowserContent: document.getElementById("toolBrowserContent"),
  toolScopePath: document.getElementById("toolScopePath"),
  linkScopePath: document.getElementById("linkScopePath"),
  toolScopeClearBtn: document.getElementById("toolScopeClearBtn"),
  linkScopeClearBtn: document.getElementById("linkScopeClearBtn"),
  resourceChecklist: document.getElementById("resourceChecklist"),
  eventLog: document.getElementById("eventLog"),
  operationRecords: document.getElementById("operationRecords"),
  wizardPanel: document.getElementById("wizardPanel"),
  wizardHint: document.getElementById("wizardHint"),
  gitCandidates: document.getElementById("gitCandidates"),
  pathTable: document.getElementById("pathTable"),
  conflictSection: document.getElementById("conflictSection"),
  conflictSummary: document.getElementById("conflictSummary"),
  conflictTypeTabs: document.getElementById("conflictTypeTabs"),
  conflictToolTabs: document.getElementById("conflictToolTabs"),
  conflictList: document.getElementById("conflictList"),
  conflictDetail: document.getElementById("conflictDetail"),
  docsWritebackSection: document.getElementById("docsWritebackSection"),
  docsWritebackSummary: document.getElementById("docsWritebackSummary"),
  docsWritebackPathDisplay: document.getElementById("docsWritebackPathDisplay"),
  docsDetectBtn: document.getElementById("docsDetectBtn"),
  docsApplyBtn: document.getElementById("docsApplyBtn"),
  docsRemoteSyncBtn: document.getElementById("docsRemoteSyncBtn"),
  docsWritebackMeta: document.getElementById("docsWritebackMeta"),
  docsWritebackTree: document.getElementById("docsWritebackTree"),
  remoteSyncBanner: document.getElementById("remoteSyncBanner"),
  remoteSyncBannerText: document.getElementById("remoteSyncBannerText"),
  remoteSyncCommitBtn: document.getElementById("remoteSyncCommitBtn"),
  resourceImportPanel: document.getElementById("resourceImportPanel"),
  resourceImportTabs: document.getElementById("resourceImportTabs"),
  resourceImportCurrentTitle: document.getElementById("resourceImportCurrentTitle"),
  resourceImportGitlabTabBtn: document.getElementById("resourceImportGitlabTabBtn"),
  resourceImportLocalTabBtn: document.getElementById("resourceImportLocalTabBtn"),
  resourceImportGithubTabBtn: document.getElementById("resourceImportGithubTabBtn"),
  resourceImportGitlabPane: document.getElementById("resourceImportGitlabPane"),
  resourceImportLocalPane: document.getElementById("resourceImportLocalPane"),
  resourceImportGithubPane: document.getElementById("resourceImportGithubPane"),
  resourceImportDropOverlay: document.getElementById("resourceImportDropOverlay"),
  moduleNav: document.getElementById("moduleNav"),
  moduleNavIndicator: document.getElementById("moduleNavIndicator"),
  logDrawerBackdrop: document.getElementById("logDrawerBackdrop"),
  logShelf: document.getElementById("logShelf"),
  logDock: document.getElementById("logDock"),
  latestLogPreview: document.getElementById("latestLogPreview"),
  logDrawer: document.getElementById("logDrawer"),
  logDrawerCloseBtn: document.getElementById("logDrawerCloseBtn"),
  terminalPanel: document.getElementById("terminalPanel"),
  terminalToggleBtn: document.getElementById("terminalToggleBtn"),
  terminalCloseBtn: document.getElementById("terminalCloseBtn"),
  terminalOutput: document.getElementById("terminalOutput"),
  terminalInputForm: document.getElementById("terminalInputForm"),
  terminalInput: document.getElementById("terminalInput"),
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
  linkRulesHint: document.getElementById("linkRulesHint"),
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

const TOOL_CONFIG_DIR_BY_ID = {
  claude: ".claude",
  cursor: ".cursor",
  codex: ".codex",
  opencow: ".opencow",
};

let currentOverview = null;
let toolBrowserPickMap = new Map();
let toolBrowserTypePickMap = new Map();
let currentBrowserScopePath = "";
let currentLinkScopePath = "";
let currentLinkProjectType = "";
let currentLinkRulesBucket = "";
let linkProjectDetecting = false;
let linkProjectDetectSeq = 0;
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
const DOCS_WRITEBACK_PATH_STORAGE_KEY = "snakehub_docs_writeback_project_path_v1";
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
let hubRemoveBusy = false;
const REPO_REQUIRED_TYPES = new Set(["docs"]);
const DOCS_AUTO_DETECT_INTERVAL_MS = 6 * 60 * 60 * 1000;
let docsWritebackProjectPath = "";
let docsWritebackDetection = null;
let docsWritebackDetecting = false;
let docsWritebackApplying = false;
let docsWritebackLastDetectedAt = 0;
let docsWritebackAutoTimer = 0;
let docsWritebackGitEnv = {
  projectPath: "",
  isGitRepo: false,
  hasRemote: false,
  repoRoot: "",
  remoteUrl: "",
};
let remoteSyncPendingContext = null;
let remoteSyncSubmitting = false;
let logDrawerExpanded = false;
let activeModule = "overview";
let moduleNavIndicatorRaf = 0;
let activeHubType = "skills";
let activeResourceImportTab = "gitlab";
let terminalOpen = false;
let terminalRunning = false;
let removeTerminalDataListener = null;
let removeTerminalExitListener = null;
let resourceImportDragDepth = 0;
let terminalShell = "";
let terminalDataBuffer = "";
let pendingRepoScanAfterTerminal = null;
const REPO_SCAN_DONE_MARKER = "__COWHUB_REPO_SCAN_DONE__:";

function isRepoGroupOnlyType(type) {
  if (type === "hooks") return true;
  if (type === "rules") return !repoScanState.rulesCanonicalValidation;
  return false;
}

function getRequiredRepoCandidateKeys(candidates = repoScanState.candidates) {
  return (Array.isArray(candidates) ? candidates : [])
    .filter((item) => REPO_REQUIRED_TYPES.has(item.type))
    .map((item) => item.key);
}

function hasRequiredRepoCandidates(candidates = repoScanState.candidates) {
  return getRequiredRepoCandidateKeys(candidates).length > 0;
}

function getEffectiveRepoSelectedKeys() {
  const selected = new Set(repoScanState.selectedKeys);
  for (const key of getRequiredRepoCandidateKeys(repoScanState.candidates)) {
    selected.add(key);
  }
  return [...selected];
}

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
  if (!el.repoHistoryOverlay) {
    return;
  }
  const anchor = el.resourceImportPanel || el.repoPanel;
  if (!anchor) {
    return;
  }
  const anchorRect = anchor.getBoundingClientRect();
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

  const badgeRect =
    el.repoHistoryBadge instanceof HTMLElement ? el.repoHistoryBadge.getBoundingClientRect() : null;
  const badgeCenterX = badgeRect ? badgeRect.left + badgeRect.width / 2 : left + width;
  const badgeCenterY = badgeRect ? badgeRect.top + badgeRect.height / 2 : top;
  const originX = Math.max(0, Math.min(width, badgeCenterX - left));
  const originY = Math.max(0, Math.min(height, badgeCenterY - top));
  const scaleX = badgeRect ? Math.max(0.05, Math.min(1, badgeRect.width / width)) : 0.09;
  const scaleY = badgeRect ? Math.max(0.08, Math.min(1, badgeRect.height / height)) : 0.58;

  el.repoHistoryOverlay.style.setProperty("--repo-overlay-top", `${top}px`);
  el.repoHistoryOverlay.style.setProperty("--repo-overlay-right", `${right}px`);
  el.repoHistoryOverlay.style.setProperty("--repo-overlay-width", `${width}px`);
  el.repoHistoryOverlay.style.setProperty("--repo-overlay-height", `${height}px`);
  el.repoHistoryOverlay.style.setProperty("--repo-overlay-origin-x", `${originX}px`);
  el.repoHistoryOverlay.style.setProperty("--repo-overlay-origin-y", `${originY}px`);
  el.repoHistoryOverlay.style.setProperty("--repo-overlay-scale-x", `${scaleX}`);
  el.repoHistoryOverlay.style.setProperty("--repo-overlay-scale-y", `${scaleY}`);
  el.repoHistoryOverlay.style.setProperty("--repo-overlay-from-x", "0px");
  el.repoHistoryOverlay.style.setProperty("--repo-overlay-from-y", "0px");
}

function openRepoHistoryOverlay() {
  if (!el.repoHistoryOverlay) {
    return;
  }
  const overlayHost = el.resourceImportPanel || el.repoPanel;
  if (!overlayHost) {
    return;
  }
  setLogDrawerExpanded(false);
  clearRepoOverlayTimers();
  repoOverlayWide = false;
  document.body.classList.remove("repo-overlay-wide");
  updateRepoHistoryOverlayLayout();

  overlayHost.classList.remove("overlay-open");
  overlayHost.classList.add("overlay-active");
  document.body.classList.remove("repo-overlay-backdrop-fast");
  document.body.classList.remove("repo-overlay-backdrop-visible");
  document.body.classList.remove("repo-overlay-open");
  document.body.classList.add("repo-overlay-active");
  el.repoHistoryOverlay.setAttribute("aria-hidden", "false");
  if (el.repoHistoryBackdrop) {
    el.repoHistoryBackdrop.setAttribute("aria-hidden", "false");
  }

  repoOverlayOpenTimer = window.setTimeout(() => {
    overlayHost.classList.add("overlay-open");
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
  if (!el.repoHistoryOverlay) {
    return;
  }
  const overlayHost = el.resourceImportPanel || el.repoPanel;
  if (!overlayHost) {
    return;
  }
  clearRepoOverlayTimers();
  repoOverlayWide = false;
  document.body.classList.remove("repo-overlay-wide");

  document.body.classList.add("repo-overlay-backdrop-fast");
  document.body.classList.remove("repo-overlay-backdrop-visible");

  repoOverlayCloseTimer = window.setTimeout(() => {
    overlayHost.classList.remove("overlay-open");
    document.body.classList.remove("repo-overlay-open");
    overlayHost.classList.remove("overlay-active");
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

function setResourceImportTab(tabValue) {
  const nextTab = tabValue === "local" || tabValue === "github" ? tabValue : "gitlab";
  activeResourceImportTab = nextTab;
  const gitlabActive = nextTab === "gitlab";
  const localActive = nextTab === "local";
  const githubActive = nextTab === "github";

  if (el.resourceImportGitlabTabBtn) {
    el.resourceImportGitlabTabBtn.classList.toggle("active", gitlabActive);
    el.resourceImportGitlabTabBtn.setAttribute("aria-selected", String(gitlabActive));
  }
  if (el.resourceImportLocalTabBtn) {
    el.resourceImportLocalTabBtn.classList.toggle("active", localActive);
    el.resourceImportLocalTabBtn.setAttribute("aria-selected", String(localActive));
  }
  if (el.resourceImportGithubTabBtn) {
    el.resourceImportGithubTabBtn.classList.toggle("active", githubActive);
    el.resourceImportGithubTabBtn.setAttribute("aria-selected", String(githubActive));
  }

  if (el.resourceImportGitlabPane) {
    el.resourceImportGitlabPane.classList.toggle("active", gitlabActive);
    el.resourceImportGitlabPane.hidden = !gitlabActive;
  }
  if (el.resourceImportLocalPane) {
    el.resourceImportLocalPane.classList.toggle("active", localActive);
    el.resourceImportLocalPane.hidden = !localActive;
  }
  if (el.resourceImportGithubPane) {
    el.resourceImportGithubPane.classList.toggle("active", githubActive);
    el.resourceImportGithubPane.hidden = !githubActive;
  }

  const showHistoryBadge = gitlabActive || localActive;
  if (el.repoHistoryBadge) {
    el.repoHistoryBadge.hidden = !showHistoryBadge;
  }
  if (el.resourceImportCurrentTitle) {
    if (gitlabActive) {
      el.resourceImportCurrentTitle.textContent = "从GitLab下载并导入中心仓库（内部）";
    } else if (localActive) {
      el.resourceImportCurrentTitle.textContent = "从本地路径导入";
    } else {
      el.resourceImportCurrentTitle.textContent = "从GitHub仓库导入（外部）";
    }
  }
  if (!showHistoryBadge && isRepoHistoryOverlayVisible()) {
    closeRepoHistoryOverlay();
  }
}

function appendTerminalOutput(text) {
  if (!el.terminalOutput) {
    return;
  }
  const content = String(text || "");
  if (!content) {
    return;
  }
  el.terminalOutput.textContent = `${el.terminalOutput.textContent}${content}`.slice(-120000);
  el.terminalOutput.scrollTop = el.terminalOutput.scrollHeight;
}

function setTerminalOpen(nextOpen) {
  terminalOpen = Boolean(nextOpen);
  document.body.classList.toggle("terminal-open", terminalOpen);
  if (el.terminalPanel) {
    el.terminalPanel.setAttribute("aria-hidden", terminalOpen ? "false" : "true");
  }
  if (el.terminalToggleBtn) {
    el.terminalToggleBtn.setAttribute("aria-expanded", terminalOpen ? "true" : "false");
  }
  if (terminalOpen && el.terminalInput instanceof HTMLInputElement) {
    window.setTimeout(() => {
      el.terminalInput.focus();
    }, 30);
  }
}

function isWindowsShell(shellPath) {
  const normalized = String(shellPath || "").toLowerCase();
  return normalized.includes("cmd.exe") || normalized.endsWith("\\cmd") || normalized.endsWith("/cmd");
}

function wrapTerminalCommandWithDoneMarker(command) {
  const text = String(command || "").trim();
  if (!text) {
    return "";
  }
  if (isWindowsShell(terminalShell)) {
    return `${text} & echo ${REPO_SCAN_DONE_MARKER}%errorlevel%`;
  }
  return `${text}; __cowhub_code=$?; echo ${REPO_SCAN_DONE_MARKER}$__cowhub_code`;
}

async function runRepoScanAfterTerminal(payload) {
  const requestPayload = {
    ...payload,
    rulesCanonicalValidation: Boolean(el.repoRulesCanonical && el.repoRulesCanonical.checked),
  };
  const result = await api("/api/repo/scan", {
    method: "POST",
    body: JSON.stringify(requestPayload),
  });
  applyRepoScanResult(result.result, "终端 git clone 后自动扫描");
  log(`仓库扫描完成：${repoScanState.candidates.length} 项，已默认全选可选项（docs 如存在为必选）`);
}

async function handleTerminalDataPayload(payload) {
  const chunk = payload && payload.data ? String(payload.data) : "";
  if (!chunk) {
    return;
  }
  appendTerminalOutput(chunk);
  terminalDataBuffer = `${terminalDataBuffer}${chunk}`.slice(-4096);

  const markerIndex = terminalDataBuffer.lastIndexOf(REPO_SCAN_DONE_MARKER);
  if (markerIndex === -1) {
    return;
  }
  const tail = terminalDataBuffer.slice(markerIndex + REPO_SCAN_DONE_MARKER.length);
  const match = tail.match(/^(\d+)/);
  if (!match) {
    return;
  }
  const exitCode = Number(match[1] || "1");
  terminalDataBuffer = "";

  if (!pendingRepoScanAfterTerminal) {
    return;
  }
  const pending = pendingRepoScanAfterTerminal;
  pendingRepoScanAfterTerminal = null;

  if (exitCode !== 0) {
    log(`终端回退命令执行失败（exit=${exitCode}），请在终端修复后重试扫描。`);
    return;
  }
  try {
    await runRepoScanAfterTerminal(pending);
  } catch (error) {
    log(`终端回退后自动扫描失败：${getErrorMessage(error)}`);
  }
}

function bindTerminalListeners() {
  if (!window.cowhubDesktop) {
    return;
  }
  if (typeof window.cowhubDesktop.onTerminalData === "function" && !removeTerminalDataListener) {
    removeTerminalDataListener = window.cowhubDesktop.onTerminalData((payload) => {
      handleTerminalDataPayload(payload).catch(() => undefined);
    });
  }
  if (typeof window.cowhubDesktop.onTerminalExit === "function" && !removeTerminalExitListener) {
    removeTerminalExitListener = window.cowhubDesktop.onTerminalExit((payload) => {
      terminalRunning = false;
      pendingRepoScanAfterTerminal = null;
      const code = payload && typeof payload.code === "number" ? payload.code : 0;
      const signal = payload && payload.signal ? String(payload.signal) : "";
      appendTerminalOutput(`\n[terminal exited] code=${code}${signal ? ` signal=${signal}` : ""}\n`);
    });
  }
}

async function ensureTerminalStarted() {
  if (!window.cowhubDesktop || typeof window.cowhubDesktop.terminalStart !== "function") {
    appendTerminalOutput("[terminal unavailable] 仅在 Electron 桌面环境可用。\n");
    return false;
  }
  bindTerminalListeners();
  if (terminalRunning) {
    return true;
  }
  try {
    const result = await window.cowhubDesktop.terminalStart();
    terminalRunning = true;
    const shell = result && result.shell ? String(result.shell) : "";
    terminalShell = shell;
    appendTerminalOutput(`[terminal started] ${shell || "shell"}\n`);
    return true;
  } catch (error) {
    appendTerminalOutput(`[terminal error] ${getErrorMessage(error)}\n`);
    return false;
  }
}

function isResourceImportModuleActive() {
  return activeModule === "resource-import";
}

function hasFileDrag(event) {
  const dt = event.dataTransfer;
  if (!dt || !dt.types) {
    return false;
  }
  const types = Array.from(dt.types);
  return types.includes("Files");
}

function setResourceImportDropOverlayVisible(visible) {
  if (!el.resourceImportDropOverlay) {
    return;
  }
  el.resourceImportDropOverlay.classList.toggle("visible", Boolean(visible));
  el.resourceImportDropOverlay.setAttribute("aria-hidden", visible ? "false" : "true");
}

async function inspectDroppedPath(pathValue) {
  if (!window.cowhubDesktop || typeof window.cowhubDesktop.inspectPath !== "function") {
    return { exists: false, isDirectory: false, hasImportDirs: false };
  }
  try {
    const result = await window.cowhubDesktop.inspectPath(pathValue);
    return {
      exists: Boolean(result && result.exists),
      isDirectory: Boolean(result && result.isDirectory),
      hasImportDirs: Boolean(result && result.hasImportDirs),
    };
  } catch {
    return { exists: false, isDirectory: false, hasImportDirs: false };
  }
}

function shellEscape(value) {
  const text = String(value || "");
  if (!text) {
    return "''";
  }
  return `'${text.replaceAll("'", `'\\''`)}'`;
}

function shouldFallbackToTerminalClone(errorMessage) {
  const text = String(errorMessage || "").toLowerCase();
  if (!text) {
    return false;
  }
  const patterns = ["permission", "eacces", "eperm", "denied", "not permitted", "operation not permitted", "权限"];
  return patterns.some((token) => text.includes(token));
}

async function buildGitCloneCommand(input) {
  const repoUrl = String(input.repoUrl || "").trim();
  const ref = String(input.ref || "").trim();
  const requestedTargetPath = String(input.targetPath || "").trim();
  let targetPath = requestedTargetPath;
  if (!targetPath && window.cowhubDesktop && typeof window.cowhubDesktop.getManagedRepoPath === "function") {
    try {
      targetPath = String(await window.cowhubDesktop.getManagedRepoPath(repoUrl) || "").trim();
    } catch {
      targetPath = "";
    }
  }
  if (!targetPath) {
    targetPath = "~/.snakehub/repos/repo-fallback";
  }
  if (!repoUrl) {
    return { command: "", targetPath: "" };
  }
  let cloneCommand = "git clone";
  if (ref) {
    cloneCommand += ` --branch ${shellEscape(ref)} --single-branch`;
  }
  cloneCommand += ` ${shellEscape(repoUrl)}`;
  if (!targetPath) {
    return { command: cloneCommand, targetPath: "" };
  }
  return {
    command: `mkdir -p ${shellEscape(targetPath)} && cd ${shellEscape(targetPath)} && ${cloneCommand}`,
    targetPath,
  };
}

async function fallbackRepoScanByTerminalClone(payload, errorMessage) {
  if (activeResourceImportTab !== "gitlab") {
    return false;
  }
  if (!shouldFallbackToTerminalClone(errorMessage)) {
    return false;
  }
  const built = await buildGitCloneCommand(payload);
  const command = built.command;
  if (!command) {
    return false;
  }

  const started = await ensureTerminalStarted();
  if (!started || !window.cowhubDesktop || typeof window.cowhubDesktop.terminalWrite !== "function") {
    return false;
  }

  const wrappedCommand = wrapTerminalCommandWithDoneMarker(command);
  if (!wrappedCommand) {
    return false;
  }
  setTerminalOpen(true);
  appendTerminalOutput(`\n[fallback] 检测到权限问题，尝试使用本地终端执行 git clone：\n$ ${command}\n`);
  pendingRepoScanAfterTerminal = {
    ...payload,
    targetPath: String(payload.targetPath || "").trim() || built.targetPath,
  };
  try {
    await window.cowhubDesktop.terminalWrite(`${wrappedCommand}\n`);
    return true;
  } catch (error) {
    pendingRepoScanAfterTerminal = null;
    appendTerminalOutput(`[fallback write error] ${getErrorMessage(error)}\n`);
    return false;
  }
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
  if (linkProjectDetecting) {
    el.linkCreateBtn.disabled = true;
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
  const selectedResourceIds = getSelectedResourceIds();
  el.linkCreateBtn.disabled = selectedResourceIds.length === 0 || !toolId;
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
  updateDocsWritebackButtonsState();
}

function loadDocsWritebackProjectPath() {
  try {
    return String(window.localStorage.getItem(DOCS_WRITEBACK_PATH_STORAGE_KEY) || "").trim();
  } catch {
    return "";
  }
}

function saveDocsWritebackProjectPath(pathValue) {
  try {
    if (!pathValue) {
      window.localStorage.removeItem(DOCS_WRITEBACK_PATH_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(DOCS_WRITEBACK_PATH_STORAGE_KEY, pathValue);
  } catch {
    // Ignore localStorage write failures.
  }
}

async function loadDocsWritebackProjectPathFromServer() {
  try {
    const result = await api("/api/docs-writeback/config");
    return String(result.result && result.result.projectPath ? result.result.projectPath : "").trim();
  } catch {
    return "";
  }
}

async function saveDocsWritebackProjectPathToServer(pathValue) {
  try {
    await api("/api/docs-writeback/config", {
      method: "POST",
      body: JSON.stringify({ projectPath: String(pathValue || "").trim() }),
    });
  } catch (error) {
    log(`保存 docs 文档回写项目地址失败：${getErrorMessage(error)}`);
  }
}

async function detectDocsWritebackGitEnv(projectPath, { silent = true } = {}) {
  const normalized = String(projectPath || "").trim();
  if (!normalized) {
    docsWritebackGitEnv = {
      projectPath: "",
      isGitRepo: false,
      hasRemote: false,
      repoRoot: "",
      remoteUrl: "",
    };
    renderDocsWritebackModule();
    return docsWritebackGitEnv;
  }
  try {
    const result = await api("/api/project/git-env", {
      method: "POST",
      body: JSON.stringify({ projectPath: normalized }),
    });
    const payload = result.result || {};
    docsWritebackGitEnv = {
      projectPath: normalized,
      isGitRepo: Boolean(payload.isGitRepo),
      hasRemote: Boolean(payload.hasRemote),
      repoRoot: String(payload.repoRoot || ""),
      remoteUrl: String(payload.remoteUrl || ""),
    };
    if (!silent) {
      if (docsWritebackGitEnv.isGitRepo && docsWritebackGitEnv.hasRemote) {
        log(`检测到 Git 远端仓库：${docsWritebackGitEnv.remoteUrl || docsWritebackGitEnv.repoRoot}`);
      } else if (docsWritebackGitEnv.isGitRepo) {
        log("当前项目是 Git 仓库，但未检测到 origin 远端。");
      } else {
        log("当前项目目录未检测到 Git 环境。");
      }
    }
  } catch (error) {
    docsWritebackGitEnv = {
      projectPath: normalized,
      isGitRepo: false,
      hasRemote: false,
      repoRoot: "",
      remoteUrl: "",
    };
    if (!silent) {
      log(`检测 Git 环境失败：${getErrorMessage(error)}`);
    }
  }
  renderDocsWritebackModule();
  return docsWritebackGitEnv;
}

function hideRemoteSyncBanner() {
  remoteSyncPendingContext = null;
  if (el.remoteSyncBanner) {
    el.remoteSyncBanner.hidden = true;
  }
}

function showRemoteSyncBanner(message, context) {
  if (el.remoteSyncBannerText) {
    el.remoteSyncBannerText.textContent = String(message || "请检查改动文件是否正确");
  }
  if (el.remoteSyncBanner) {
    el.remoteSyncBanner.hidden = false;
  }
  remoteSyncPendingContext = context || null;
}

function renderDocsWritebackTreeNodes(nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return `
      <ul class="docs-tree-list">
        <li class="asset-empty">空目录</li>
      </ul>
    `;
  }
  return `
    <ul class="docs-tree-list">
      ${nodes
        .map((node) => {
          const nameText = escapeHtml(node.name || "");
          if (node.kind === "dir") {
            return `
              <li class="docs-tree-node docs-tree-dir">
                <details open>
                  <summary><span class="mono">${nameText}/</span></summary>
                  ${renderDocsWritebackTreeNodes(Array.isArray(node.children) ? node.children : [])}
                </details>
              </li>
            `;
          }
          const changedTag = node.changed ? `<span class="asset-tag docs-changed-tag">已改动</span>` : "";
          const projectChangedTag = node.projectChanged ? `<span class="asset-tag docs-project-changed-tag">项目目录有改动</span>` : "";
          const projectOnlyClass = node.projectOnly ? " docs-project-only-name" : "";
          return `
            <li class="docs-tree-node docs-tree-file">
              <span class="mono${projectOnlyClass}">${nameText}</span>
              ${changedTag}
              ${projectChangedTag}
            </li>
          `;
        })
        .join("")}
    </ul>
  `;
}

function renderDocsWritebackModule() {
  if (!el.docsWritebackSummary || !el.docsWritebackPathDisplay || !el.docsWritebackMeta || !el.docsWritebackTree) {
    return;
  }

  el.docsWritebackPathDisplay.textContent = docsWritebackProjectPath || "--";
  el.docsWritebackPathDisplay.title = docsWritebackProjectPath || "--";

  if (!docsWritebackProjectPath) {
    hideRemoteSyncBanner();
    el.docsWritebackSummary.textContent = "未就绪";
    el.docsWritebackMeta.textContent = "请先使用“GitLab 下载并导入中心仓库（内部）”或“从本地路径导入 > 技能仓库导入”生成项目地址。";
    el.docsWritebackTree.innerHTML = `<div class="asset-empty">当前无项目地址。</div>`;
    updateDocsWritebackButtonsState();
    return;
  }

  if (docsWritebackDetecting) {
    el.docsWritebackSummary.textContent = "检测中";
  } else if (docsWritebackDetection) {
    const changedCount = Array.isArray(docsWritebackDetection.changedFiles)
      ? docsWritebackDetection.changedFiles.length
      : 0;
    const projectChangedCount = Array.isArray(docsWritebackDetection.projectChangedFiles)
      ? docsWritebackDetection.projectChangedFiles.length
      : 0;
    const projectOnlyCount = Array.isArray(docsWritebackDetection.projectOnlyFiles)
      ? docsWritebackDetection.projectOnlyFiles.length
      : 0;
    if (changedCount === 0 && projectChangedCount === 0 && projectOnlyCount === 0) {
      el.docsWritebackSummary.textContent = "已同步";
    } else {
      el.docsWritebackSummary.textContent = `待同步 ${changedCount + projectChangedCount + projectOnlyCount}`;
    }
  } else {
    el.docsWritebackSummary.textContent = "待检测";
  }

  if (!docsWritebackDetection) {
    el.docsWritebackMeta.textContent = "尚未检测。该项目地址每6小时会自动检测一次中心仓库目录改动。";
    el.docsWritebackTree.innerHTML = `<div class="asset-empty">点击“检测 docs 改动”开始比对。</div>`;
    updateDocsWritebackButtonsState();
    return;
  }

  const changedCount = Array.isArray(docsWritebackDetection.changedFiles)
    ? docsWritebackDetection.changedFiles.length
    : 0;
  const projectChangedCount = Array.isArray(docsWritebackDetection.projectChangedFiles)
    ? docsWritebackDetection.projectChangedFiles.length
    : 0;
  const projectOnlyCount = Array.isArray(docsWritebackDetection.projectOnlyFiles)
    ? docsWritebackDetection.projectOnlyFiles.length
    : 0;
  const lastDetectedText = docsWritebackLastDetectedAt
    ? new Date(docsWritebackLastDetectedAt).toLocaleString()
    : "未检测";
  el.docsWritebackMeta.textContent =
    `中心仓库目录(source)：${docsWritebackDetection.docsStorePath || "-"} | ` +
    `中心仓库目录(runtime)：${docsWritebackDetection.runtimeStorePath || "-"} | ` +
    `项目目录：${docsWritebackDetection.projectDocsPath || "-"} | ` +
    `Git远端：${docsWritebackGitEnv.isGitRepo ? (docsWritebackGitEnv.hasRemote ? "是" : "否") : "否"} | ` +
    `中心改动：${changedCount} | 项目改动：${projectChangedCount} | 项目新增：${projectOnlyCount} | 最近检测：${lastDetectedText}`;

  const treeHtml = renderDocsWritebackTreeNodes(Array.isArray(docsWritebackDetection.tree) ? docsWritebackDetection.tree : []);
  el.docsWritebackTree.innerHTML = `
    <div class="docs-tree-root">
      <div class="mono docs-tree-root-title">store/</div>
      ${treeHtml}
    </div>
  `;
  updateDocsWritebackButtonsState();
}

function updateDocsWritebackButtonsState() {
  if (el.docsDetectBtn) {
    el.docsDetectBtn.disabled = !docsWritebackProjectPath || docsWritebackDetecting || docsWritebackApplying;
  }
  if (el.docsApplyBtn) {
    el.docsApplyBtn.disabled = !docsWritebackProjectPath || docsWritebackDetecting || docsWritebackApplying;
  }
  if (el.docsRemoteSyncBtn) {
    const enabled =
      Boolean(docsWritebackProjectPath) &&
      docsWritebackGitEnv.isGitRepo &&
      docsWritebackGitEnv.hasRemote &&
      !docsWritebackDetecting &&
      !docsWritebackApplying &&
      !remoteSyncSubmitting;
    el.docsRemoteSyncBtn.hidden = !Boolean(docsWritebackProjectPath) || !docsWritebackGitEnv.isGitRepo || !docsWritebackGitEnv.hasRemote;
    el.docsRemoteSyncBtn.disabled = !enabled;
  }
}

function syncDocsWritebackAutoTimer() {
  if (docsWritebackProjectPath) {
    if (!docsWritebackAutoTimer) {
      docsWritebackAutoTimer = window.setInterval(() => {
        detectDocsWritebackChanges("auto");
      }, DOCS_AUTO_DETECT_INTERVAL_MS);
    }
    return;
  }

  if (docsWritebackAutoTimer) {
    window.clearInterval(docsWritebackAutoTimer);
    docsWritebackAutoTimer = 0;
  }
}

function setDocsWritebackProjectPath(pathValue, sourceLabel = "", options = {}) {
  const persistServer = options.persistServer !== false;
  const silentLog = options.silentLog === true;
  const detectNow = options.detectNow === true;
  const normalized = String(pathValue || "").trim();
  if (normalized === docsWritebackProjectPath) {
    syncDocsWritebackAutoTimer();
    renderDocsWritebackModule();
    if (normalized && docsWritebackGitEnv.projectPath !== normalized) {
      detectDocsWritebackGitEnv(normalized, { silent: true });
    }
    if (detectNow && normalized) {
      detectDocsWritebackChanges("auto");
    }
    return;
  }

  docsWritebackProjectPath = normalized;
  docsWritebackDetection = null;
  docsWritebackLastDetectedAt = 0;
  hideRemoteSyncBanner();
  saveDocsWritebackProjectPath(docsWritebackProjectPath);
  if (persistServer) {
    saveDocsWritebackProjectPathToServer(docsWritebackProjectPath);
  }
  syncDocsWritebackAutoTimer();
  renderDocsWritebackModule();

  if (!silentLog && docsWritebackProjectPath) {
    const sourcePrefix = sourceLabel ? `${sourceLabel}：` : "";
    log(`${sourcePrefix}docs文档回写项目地址已更新：${docsWritebackProjectPath}`);
  }
  if (docsWritebackProjectPath) {
    detectDocsWritebackGitEnv(docsWritebackProjectPath, { silent: true });
  } else {
    docsWritebackGitEnv = {
      projectPath: "",
      isGitRepo: false,
      hasRemote: false,
      repoRoot: "",
      remoteUrl: "",
    };
  }
  if (detectNow && docsWritebackProjectPath) {
    detectDocsWritebackChanges("auto");
  }
}

async function detectDocsWritebackChanges(trigger = "manual") {
  if (!docsWritebackProjectPath) {
    if (trigger === "manual") {
      log("请先通过仓库导入功能生成项目地址");
    }
    return;
  }
  if (docsWritebackDetecting || docsWritebackApplying) {
    return;
  }

  docsWritebackDetecting = true;
  updateDocsWritebackButtonsState();
  renderDocsWritebackModule();

  const detectButton = el.docsDetectBtn instanceof HTMLButtonElement ? el.docsDetectBtn : null;
  const done = detectButton
    ? setBusy(detectButton, trigger === "auto" ? "自动检测中..." : "检测中...")
    : () => {};
  try {
    const result = await api("/api/docs-writeback/detect", {
      method: "POST",
      body: JSON.stringify({ projectPath: docsWritebackProjectPath }),
    });
    docsWritebackDetection = result.result || null;
    docsWritebackLastDetectedAt = Date.now();
    renderDocsWritebackModule();

    const changedCount = Array.isArray(docsWritebackDetection && docsWritebackDetection.changedFiles)
      ? docsWritebackDetection.changedFiles.length
      : 0;
    const projectChangedCount = Array.isArray(docsWritebackDetection && docsWritebackDetection.projectChangedFiles)
      ? docsWritebackDetection.projectChangedFiles.length
      : 0;
    const projectOnlyCount = Array.isArray(docsWritebackDetection && docsWritebackDetection.projectOnlyFiles)
      ? docsWritebackDetection.projectOnlyFiles.length
      : 0;
    if (trigger === "manual") {
      log(`docs 检测完成：中心改动 ${changedCount}，项目改动 ${projectChangedCount}，项目新增 ${projectOnlyCount}`);
    } else if (changedCount > 0 || projectChangedCount > 0 || projectOnlyCount > 0) {
      log(`自动检测到 docs 待同步：中心改动 ${changedCount}，项目改动 ${projectChangedCount}，项目新增 ${projectOnlyCount}`);
    }
  } catch (error) {
    if (trigger === "manual") {
      log(`docs 改动检测失败：${getErrorMessage(error)}`);
    } else {
      log(`docs 自动检测失败：${getErrorMessage(error)}`);
    }
  } finally {
    done();
    docsWritebackDetecting = false;
    updateDocsWritebackButtonsState();
    renderDocsWritebackModule();
  }
}

async function applyDocsWriteback() {
  if (!docsWritebackProjectPath) {
    log("请先通过仓库导入功能生成项目地址");
    return;
  }
  if (docsWritebackApplying || docsWritebackDetecting) {
    return;
  }

  docsWritebackApplying = true;
  updateDocsWritebackButtonsState();
  const applyButton = el.docsApplyBtn instanceof HTMLButtonElement ? el.docsApplyBtn : null;
  const done = applyButton ? setBusy(applyButton, "同步中...") : () => {};
  try {
    const result = await api("/api/docs-writeback/apply", {
      method: "POST",
      body: JSON.stringify({ projectPath: docsWritebackProjectPath }),
    });
    const payload = result.result || {};
    const wroteToProjectFiles = Array.isArray(payload.wroteToProjectFiles) ? payload.wroteToProjectFiles : [];
    const wroteToStoreFiles = Array.isArray(payload.wroteToStoreFiles) ? payload.wroteToStoreFiles : [];
    docsWritebackDetection = payload.detection || docsWritebackDetection;
    docsWritebackLastDetectedAt = Date.now();
    renderDocsWritebackModule();
    log(`docs 文件同步完成：中心->项目 ${wroteToProjectFiles.length}，项目->中心 ${wroteToStoreFiles.length}`);
  } catch (error) {
    log(`docs 文件同步失败：${getErrorMessage(error)}`);
  } finally {
    done();
    docsWritebackApplying = false;
    updateDocsWritebackButtonsState();
    renderDocsWritebackModule();
  }
}

async function onDocsRemoteSync() {
  if (!docsWritebackProjectPath) {
    log("请先通过仓库导入功能生成项目地址");
    return;
  }
  if (docsWritebackDetecting || docsWritebackApplying || remoteSyncSubmitting) {
    return;
  }

  remoteSyncSubmitting = true;
  updateDocsWritebackButtonsState();
  try {
    const gitEnv = await detectDocsWritebackGitEnv(docsWritebackProjectPath, { silent: true });
    if (!gitEnv.isGitRepo || !gitEnv.hasRemote) {
      log("当前项目未检测到可用的 Git 远端仓库，无法执行远端同步。");
      return;
    }

    const result = await api("/api/docs-writeback/remote-prepare", {
      method: "POST",
      body: JSON.stringify({ projectPath: docsWritebackProjectPath }),
    });
    const payload = result.result || {};
    const hasSyncableFiles = Boolean(payload.hasSyncableFiles);
    const storeChangedFiles = Array.isArray(payload.storeChangedFiles) ? payload.storeChangedFiles : [];
    const unsyncedFiles = Array.isArray(payload.unsyncedFiles) ? payload.unsyncedFiles : [];
    const syncedToProjectFiles = Array.isArray(payload.syncedToProjectFiles) ? payload.syncedToProjectFiles : [];

    docsWritebackDetection = payload.detection || docsWritebackDetection;
    docsWritebackLastDetectedAt = Date.now();
    renderDocsWritebackModule();

    if (!hasSyncableFiles || storeChangedFiles.length === 0) {
      log("当前无可同步文件");
      return;
    }

    if (unsyncedFiles.length > 0) {
      log(`已将中心仓库改动同步到项目目录：${syncedToProjectFiles.length} 个文件`);
    } else {
      log(`检测到中心仓库改动 ${storeChangedFiles.length} 个文件，项目目录已是最新，跳过覆盖同步`);
    }

    const started = await ensureTerminalStarted();
    if (!started || !window.cowhubDesktop || typeof window.cowhubDesktop.terminalWrite !== "function") {
      log("终端不可用，无法继续执行远端仓库同步。");
      return;
    }
    const repoRoot = gitEnv.repoRoot || docsWritebackProjectPath;
    setTerminalOpen(true);
    const statusCommand = `cd ${shellEscape(repoRoot)} && git status`;
    appendTerminalOutput(`$ ${statusCommand}\n`);
    await window.cowhubDesktop.terminalWrite(`${statusCommand}\n`);
    showRemoteSyncBanner("请检查改动文件是否正确", {
      repoRoot,
    });
    log("请检查改动文件是否正确，确认后点击页面顶部横幅中的“提交”。");
  } catch (error) {
    log(`同步到远端仓库失败：${getErrorMessage(error)}`);
  } finally {
    remoteSyncSubmitting = false;
    updateDocsWritebackButtonsState();
  }
}

async function onRemoteSyncCommit() {
  if (!remoteSyncPendingContext || remoteSyncSubmitting) {
    return;
  }
  remoteSyncSubmitting = true;
  if (el.remoteSyncCommitBtn) {
    el.remoteSyncCommitBtn.disabled = true;
  }
  updateDocsWritebackButtonsState();
  try {
    const started = await ensureTerminalStarted();
    if (!started || !window.cowhubDesktop || typeof window.cowhubDesktop.terminalWrite !== "function") {
      log("终端不可用，无法提交到远端仓库。");
      return;
    }
    const repoRoot = String(remoteSyncPendingContext.repoRoot || docsWritebackProjectPath || "").trim();
    if (!repoRoot) {
      log("缺少项目路径，无法执行 Git 提交。");
      return;
    }
    setTerminalOpen(true);
    const commands = [
      `cd ${shellEscape(repoRoot)}`,
      "git add .",
      "git commit -m '同步修改'",
      "git push",
    ];
    for (const command of commands) {
      appendTerminalOutput(`$ ${command}\n`);
      await window.cowhubDesktop.terminalWrite(`${command}\n`);
    }
    hideRemoteSyncBanner();
    log("已在终端依次执行 git add / git commit / git push，请关注执行结果。");
  } catch (error) {
    log(`远端提交失败：${getErrorMessage(error)}`);
  } finally {
    remoteSyncSubmitting = false;
    if (el.remoteSyncCommitBtn) {
      el.remoteSyncCommitBtn.disabled = false;
    }
    updateDocsWritebackButtonsState();
  }
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
  const unixPath = normalized.replaceAll("\\", "/");
  if (normalized.endsWith(".mdc")) return "cursor";
  if (normalized.endsWith(".rules")) return "codex";
  if (normalized.endsWith(".md")) {
    if (unixPath.includes("/.opencow/")) return "opencow";
    return "claude";
  }
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
  if (toolId === "opencow") return ".md";
  return "";
}

function detectRuleBucketByText(value) {
  const normalized = String(value || "").trim().toLowerCase().replaceAll("\\", "/");
  if (!normalized) {
    return "";
  }
  const tagged = normalized.match(/\[(api_tools|vue_tools|mini_tools)\]/);
  if (tagged && tagged[1]) {
    return tagged[1];
  }
  for (const bucket of ["api_tools", "vue_tools", "mini_tools"]) {
    if (
      normalized.includes(`/${bucket}/`) ||
      normalized.includes(`-${bucket}`) ||
      normalized.includes(`_${bucket}`) ||
      normalized.endsWith(bucket)
    ) {
      return bucket;
    }
  }
  return "";
}

function detectRuleBucketForResource(resource) {
  if (!resource || resource.type !== "rules") {
    return "";
  }
  return (
    detectRuleBucketByText(resource.name) ||
    detectRuleBucketByText(resource.sourcePath) ||
    detectRuleBucketByText(resource.storePath)
  );
}

function setLatestLogPreview(text) {
  if (!el.latestLogPreview) {
    return;
  }
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  const content = normalized || "暂无日志";
  el.latestLogPreview.textContent = content;
  el.latestLogPreview.title = content;
}

function setLogDrawerExpanded(expanded) {
  const next = Boolean(expanded);
  logDrawerExpanded = next;
  document.body.classList.toggle("log-drawer-open", next);
  if (el.logShelf) {
    el.logShelf.classList.toggle("expanded", next);
  }
  if (el.logDrawer) {
    el.logDrawer.setAttribute("aria-hidden", next ? "false" : "true");
  }
  if (el.logDrawerBackdrop) {
    el.logDrawerBackdrop.setAttribute("aria-hidden", next ? "false" : "true");
  }
  if (el.logDock) {
    el.logDock.setAttribute("aria-expanded", next ? "true" : "false");
  }
}

function toggleLogDrawer() {
  setLogDrawerExpanded(!logDrawerExpanded);
}

function log(message) {
  const ts = new Date().toLocaleTimeString();
  const logLine = `[${ts}] ${message}`;
  el.eventLog.textContent = `${logLine}\n${el.eventLog.textContent}`.slice(0, 12000);
  setLatestLogPreview(logLine);
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

  const mappingList =
    currentOverview && currentOverview.state && Array.isArray(currentOverview.state.mappings)
      ? currentOverview.state.mappings
      : [];
  const mappingActiveById = new Map(
    mappingList
      .map((mapping) => ({
        id: String(mapping && mapping.id ? mapping.id : ""),
        active: Boolean(mapping && mapping.active),
      }))
      .filter((item) => item.id),
  );

  const list = Array.isArray(operations) ? operations.slice().reverse() : [];
  if (list.length === 0) {
    el.operationRecords.innerHTML = `<div class="asset-empty">暂无可展示的操作记录。</div>`;
    return;
  }

  const operationTypeText = {
    import: "导入",
    link: "链接",
    rollback: "回滚",
    remove: "移除",
  };
  el.operationRecords.innerHTML = list
    .map((op, index) => {
      const details = op && typeof op === "object" ? op.details || {} : {};
      const opType = String(op.type || "");
      const operationId = String(op.id || "");
      const mappingId = String(details.mappingId || "");
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
      } else if (opType === "remove") {
        const resourceType = String(details.resourceType || "");
        const resourceName = String(details.resourceName || details.resourceId || "");
        const deactivatedMappings = Number(details.deactivatedMappings || 0);
        const base = `${resourceType || "resource"} · ${resourceName || "(缺少 resourceId)"}`;
        summary = sourcePath || linkPath || "";
        if (summary) {
          summary = `${base} · ${summary}`;
        } else {
          summary = base;
        }
        if (deactivatedMappings > 0) {
          summary += ` · 停用链接 ${deactivatedMappings}`;
        }
      } else {
        summary = sourcePath || "(无附加信息)";
      }

      const isInvalidLink =
        opType === "link" &&
        Boolean(mappingId) &&
        mappingActiveById.has(mappingId) &&
        mappingActiveById.get(mappingId) === false;
      const rollbackable = opType === "link" && operationId && linkPath && !isInvalidLink;
      const rollbackClass = rollbackable ? " rollbackable" : "";
      const invalidClass = isInvalidLink ? " invalid" : "";
      const rollbackData = rollbackable
        ? ` data-operation-id="${escapeHtml(operationId)}" data-link-path="${escapeHtml(linkPath)}"`
        : "";
      const rollbackHint = isInvalidLink
        ? `<div class="operation-action invalid">已失效</div>`
        : rollbackable
          ? `<div class="operation-action">点击回滚此条</div>`
          : "";

      return `
        <article class="operation-item${rollbackClass}${invalidClass}"${rollbackData}>
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
  if (el.toolScopePath instanceof HTMLButtonElement) {
    el.toolScopePath.textContent = currentBrowserScopePath || "点击选择项目目录，未选则展示全局技能";
    el.toolScopePath.classList.toggle("active", Boolean(currentBrowserScopePath));
  }
  if (el.linkScopeClearBtn) {
    el.linkScopeClearBtn.hidden = !currentLinkScopePath;
  }
  if (el.toolScopeClearBtn) {
    el.toolScopeClearBtn.hidden = !currentBrowserScopePath;
  }
  if (el.linkScopePath instanceof HTMLButtonElement) {
    el.linkScopePath.textContent = currentLinkScopePath || "点击选择项目目录，未选则展示全局技能";
    el.linkScopePath.classList.toggle("active", Boolean(currentLinkScopePath));
  }
}

function syncToolBrowserTabs() {
  const selectedToolId = (el.toolBrowserSelect && "value" in el.toolBrowserSelect ? el.toolBrowserSelect.value : "") || "cursor";
  const selectedType = (el.toolBrowserTypeSelect && "value" in el.toolBrowserTypeSelect ? el.toolBrowserTypeSelect.value : "") || "skills";
  if (el.toolBrowserToolTabs) {
    [...el.toolBrowserToolTabs.querySelectorAll("[data-tool-id]")].forEach((btn) => {
      const active = (btn.getAttribute("data-tool-id") || "") === selectedToolId;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
  }
  if (el.toolBrowserTypeTabs) {
    [...el.toolBrowserTypeTabs.querySelectorAll("[data-type-id]")].forEach((btn) => {
      const active = (btn.getAttribute("data-type-id") || "") === selectedType;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
  }
}

function setActiveModule(moduleKey, smoothScroll = true) {
  const target = String(moduleKey || "");
  const navButtons = el.moduleNav ? [...el.moduleNav.querySelectorAll("[data-module-target]")] : [];
  const available = new Set(navButtons.map((btn) => btn.getAttribute("data-module-target") || ""));
  const next = available.has(target) ? target : "overview";
  activeModule = next;

  const panels = document.querySelectorAll(".module-panel");
  panels.forEach((panel) => {
    const key = panel.getAttribute("data-module") || "";
    panel.classList.toggle("active", key === next);
  });

  navButtons.forEach((btn) => {
    const matched = (btn.getAttribute("data-module-target") || "") === next;
    btn.classList.toggle("active", matched);
    btn.setAttribute("aria-selected", matched ? "true" : "false");
  });
  updateModuleNavIndicator();

  if (isRepoHistoryOverlayVisible()) {
    closeRepoHistoryOverlay();
  }

  if (smoothScroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function updateModuleNavIndicator() {
  if (moduleNavIndicatorRaf) {
    window.cancelAnimationFrame(moduleNavIndicatorRaf);
    moduleNavIndicatorRaf = 0;
  }
  moduleNavIndicatorRaf = window.requestAnimationFrame(() => {
    moduleNavIndicatorRaf = 0;
    if (!el.moduleNav || !el.moduleNavIndicator) {
      return;
    }
    const activeBtn = el.moduleNav.querySelector(".module-nav-btn.active");
    if (!(activeBtn instanceof HTMLElement)) {
      el.moduleNavIndicator.style.opacity = "0";
      return;
    }
    const navRect = el.moduleNav.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const top = btnRect.top - navRect.top;
    el.moduleNavIndicator.style.top = `${Math.max(0, Math.round(top))}px`;
    el.moduleNavIndicator.style.height = `${Math.max(0, Math.round(btnRect.height))}px`;
    el.moduleNavIndicator.style.opacity = "1";
  });
}

function getSelectedLinkToolId() {
  if (!el.linkForm) {
    return "";
  }
  const toolSelect = el.linkForm.querySelector('select[name="toolId"]');
  return toolSelect instanceof HTMLSelectElement ? toolSelect.value.trim() : "";
}

function updateLinkRulesHint() {
  if (!el.linkRulesHint) {
    return;
  }
  const toolId = getSelectedLinkToolId() || "当前工具";
  if (linkProjectDetecting) {
    el.linkRulesHint.textContent = "正在识别项目类型...";
    el.linkRulesHint.classList.add("loading");
    return;
  }
  el.linkRulesHint.classList.remove("loading");
  if (!currentLinkScopePath) {
    el.linkRulesHint.textContent = `适配 ${toolId} 的「全局」rules匹配项默认已勾选，可取消`;
    return;
  }
  if (currentLinkRulesBucket) {
    el.linkRulesHint.textContent = `适配 ${toolId} 的「${currentLinkRulesBucket}」rules匹配项默认已勾选，可取消`;
    return;
  }
  el.linkRulesHint.textContent = "未识别项目类型，创建链接时将再次检测";
}

async function detectLinkProjectType(projectPath) {
  const normalized = String(projectPath || "").trim();
  const requestId = ++linkProjectDetectSeq;
  if (!normalized) {
    currentLinkProjectType = "";
    currentLinkRulesBucket = "";
    linkProjectDetecting = false;
    updateLinkRulesHint();
    updateLinkCreateButtonState();
    return;
  }

  linkProjectDetecting = true;
  currentLinkProjectType = "";
  currentLinkRulesBucket = "";
  updateLinkRulesHint();
  updateLinkCreateButtonState();

  try {
    const result = await api("/api/project/detect-type", {
      method: "POST",
      body: JSON.stringify({ projectPath: normalized }),
    });
    if (requestId !== linkProjectDetectSeq) {
      return;
    }
    const payload = result.result || {};
    if (payload.detected) {
      currentLinkProjectType = String(payload.projectType || "").trim();
      currentLinkRulesBucket = String(payload.rulesBucket || "").trim();
      log(`项目类型识别完成：${currentLinkProjectType}（rules来源 ${currentLinkRulesBucket || "全局"}）`);
    } else {
      currentLinkProjectType = "";
      currentLinkRulesBucket = "";
      log("项目类型未识别：支持 php / vue / 微信小程序");
    }
  } catch (error) {
    if (requestId !== linkProjectDetectSeq) {
      return;
    }
    currentLinkProjectType = "";
    currentLinkRulesBucket = "";
    log(`项目类型识别失败：${getErrorMessage(error)}`);
  } finally {
    if (requestId !== linkProjectDetectSeq) {
      return;
    }
    linkProjectDetecting = false;
    updateLinkRulesHint();
    if (currentOverview && currentOverview.state) {
      renderResourceOptions(currentOverview.state.resources || []);
    }
    updateLinkCreateButtonState();
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

function getSelectedResourceIds() {
  if (!(el.resourceChecklist instanceof HTMLElement)) {
    return [];
  }
  const selected = [...el.resourceChecklist.querySelectorAll('input[name="resourceTokens"]:checked')]
    .map((input) => String(input.value || "").trim())
    .filter(Boolean);
  return [...new Set(selected)];
}

function syncLinkModeUI() {
  const allMode = Boolean(el.linkAllModeToggle && el.linkAllModeToggle.checked);
  if (el.linkResourceRow) {
    el.linkResourceRow.style.display = allMode ? "none" : "";
  }
  if (el.linkRulesHint) {
    el.linkRulesHint.style.display = allMode ? "none" : "inline";
  }
  if (el.resourceChecklist) {
    const checks = [...el.resourceChecklist.querySelectorAll('input[name="resourceTokens"]')];
    checks.forEach((item) => {
      if (item instanceof HTMLInputElement) {
        item.disabled = allMode;
      }
    });
  }
  if (el.linkForm) {
    const checks = [...el.linkForm.querySelectorAll('input[name="linkTypes"][value="rules"]')];
    checks.forEach((item) => {
      if (!(item instanceof HTMLInputElement)) {
        return;
      }
      if (allMode) {
        item.checked = true;
        item.disabled = true;
      } else {
        item.disabled = false;
      }
    });
  }
  const aliasInput = el.linkForm ? el.linkForm.querySelector('input[name="aliasName"]') : null;
  if (aliasInput instanceof HTMLInputElement) {
    aliasInput.disabled = allMode;
  }
  if (el.linkAllTypesRow) {
    el.linkAllTypesRow.style.display = allMode ? "flex" : "none";
  }
  updateLinkRulesHint();
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
  if (toolId === "opencow") return 3;
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

  const filtered = currentConflictRecords.filter((item) => {
    if (selectedConflictToolId && item.toolId !== selectedConflictToolId) {
      return false;
    }
    if (selectedConflictType !== "all" && item.type !== selectedConflictType) {
      return false;
    }
    return true;
  });

  if (el.conflictTypeTabs) {
    [...el.conflictTypeTabs.querySelectorAll("[data-conflict-type]")].forEach((btn) => {
      const type = btn.getAttribute("data-conflict-type") || "all";
      const active = type === selectedConflictType;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

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
  setActiveModule("conflict", false);
  if (toolId) {
    selectedConflictToolId = toolId;
  }
  if (type) {
    selectedConflictType = type;
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
  const tabTypes = ["skills", "commands", "hooks", "rules"];
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

  if (!tabTypes.includes(activeHubType)) {
    activeHubType = "skills";
  }
  const currentType = activeHubType;
  const currentList = grouped[currentType] || [];
  const rows = currentList
    .map(
      (item) => `
      <li class="hub-row">
        <div class="hub-row-head">
          <span class="mono">${escapeHtml(item.name)}</span>${renderRuleToolBadgeByPath(item.type, item.sourcePath)}
          <span class="hub-row-id">${escapeHtml(item.id)}</span>
          <button
            type="button"
            class="hub-delete-btn"
            data-resource-id="${escapeHtml(item.id)}"
            data-resource-type="${escapeHtml(item.type)}"
            data-resource-name="${escapeHtml(item.name)}"
            title="移出中心仓库"
            aria-label="移出中心仓库"
          >
            🗑
          </button>
        </div>
        <div class="hub-row-time">导入时间：${escapeHtml(formatOperationTime(String(item.createdAt || "")))}</div>
        <div class="asset-path">${escapeHtml(item.storePath)}</div>
      </li>
    `,
    )
    .join("");

  const tabs = tabTypes
    .map((type) => {
      const count = (grouped[type] || []).length;
      const active = type === currentType;
      return `<button
        type="button"
        class="hub-tab${active ? " active" : ""}"
        data-hub-type="${escapeHtml(type)}"
        aria-selected="${active ? "true" : "false"}"
      >${escapeHtml(type)}（${count}）</button>`;
    })
    .join("");

  el.toolScanList.innerHTML = `
    <div class="hub-tabs" role="tablist" aria-label="中心仓库资源分类">${tabs}</div>
    <div class="tool-meta">以下为中心仓库（~/.snakehub/store）中的资源分组：</div>
    <section class="hub-group">
      ${
        rows
          ? `<ul class="asset-list">${rows}</ul>`
          : `<div class="asset-empty">中心仓库中当前无 ${escapeHtml(currentType)}</div>`
      }
    </section>
  `;
}

function renderResourceOptions(resources) {
  const previousValues = new Set(getSelectedResourceIds());
  const selectedToolId = getSelectedLinkToolId();
  const visibleTypes = ["skills", "commands", "hooks", "rules"];
  const grouped = {
    skills: [],
    commands: [],
    hooks: [],
    rules: [],
  };
  for (const resource of resources || []) {
    if (grouped[resource.type]) {
      grouped[resource.type].push(resource);
    }
  }
  for (const type of visibleTypes) {
    grouped[type].sort((a, b) => a.name.localeCompare(b.name));
  }
  const filtered = visibleTypes.flatMap((type) => grouped[type]);

  if (filtered.length === 0) {
    el.resourceChecklist.innerHTML = `<div class="asset-empty">（当前无可链接资源）</div>`;
    updateLinkCreateButtonState();
    return;
  }

  const nextSelectionSet = new Set(
    filtered
      .filter((resource) => resource.type !== "rules" && previousValues.has(resource.id))
      .map((resource) => resource.id),
  );
  const incompatibleRuleIds = new Set();
  if (nextSelectionSet.size === 0) {
    const firstNonRule = filtered.find((resource) => resource.type !== "rules");
    if (firstNonRule) {
      nextSelectionSet.add(firstNonRule.id);
    }
  }

  const expectedRuleTool = selectedToolId || "";
  for (const ruleItem of grouped.rules) {
    const ruleBucket = detectRuleBucketForResource(ruleItem);
    const bucketMismatch =
      Boolean(currentLinkScopePath) &&
      Boolean(currentLinkRulesBucket) &&
      Boolean(ruleBucket) &&
      ruleBucket !== currentLinkRulesBucket;
    if (bucketMismatch) {
      incompatibleRuleIds.add(ruleItem.id);
      continue;
    }
    const pathValue = String(ruleItem.sourcePath || ruleItem.storePath || ruleItem.path || "");
    const detectedTool = detectRuleToolByPath(pathValue);
    if (detectedTool && detectedTool === expectedRuleTool) {
      nextSelectionSet.add(ruleItem.id);
      continue;
    }
    if (!detectedTool) {
      const ext = expectedRuleExtensionForTool(expectedRuleTool);
      if (ext && pathValue.toLowerCase().endsWith(ext)) {
        nextSelectionSet.add(ruleItem.id);
      }
    }
  }

  const sections = visibleTypes
    .map((type) => {
      const list = grouped[type];
      const rows = list
        .map((r) => {
          const incompatibleRule = r.type === "rules" && incompatibleRuleIds.has(r.id);
          const checked = nextSelectionSet.has(r.id) ? "checked" : "";
          const disabled = incompatibleRule ? "disabled" : "";
          const ruleToolBadge = renderRuleToolBadgeByPath(r.type, String(r.sourcePath || r.storePath || ""));
          const incompatibleTag = incompatibleRule
            ? ` <span class="asset-tag">不匹配 ${escapeHtml(currentLinkRulesBucket || "")}</span>`
            : "";
          return `
            <label class="resource-check-item">
              <input type="checkbox" name="resourceTokens" value="${escapeHtml(r.id)}" ${checked} ${disabled} />
              <span>${escapeHtml(r.name)}${ruleToolBadge}${incompatibleTag}</span>
            </label>
          `;
        })
        .join("");
      return `
        <section class="resource-check-group">
          <div class="resource-check-title">${escapeHtml(type)}（${list.length}）</div>
          <div class="resource-check-items">
            ${rows || `<div class="asset-empty">无</div>`}
          </div>
        </section>
      `;
    })
    .join("");
  el.resourceChecklist.innerHTML = `<div class="resource-check-grid">${sections}</div>`;

  updateLinkRulesHint();
  updateLinkCreateButtonState();
}

function typeSortOrder(type) {
  if (type === "skills") return 0;
  if (type === "docs") return 1;
  if (type === "commands") return 2;
  if (type === "hooks") return 3;
  if (type === "rules") return 4;
  if (type === "agents") return 5;
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

  for (const type of [...grouped.keys()]) {
    const list = grouped.get(type) || [];
    if (type === "rules" && list.length > 0) {
      list.forEach((item) => selectedKeys.add(item.key));
      continue;
    }
    if (!isRepoGroupOnlyType(type)) {
      continue;
    }
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
      const groupOnly = isRepoGroupOnlyType(type);
      const requiredType = REPO_REQUIRED_TYPES.has(type);
      const lockedType = type === "rules";
      const allChecked = list.length > 0 && list.every((item) => selectedKeys.has(item.key));
      const typeCheckedAttrs = lockedType ? "checked disabled" : allChecked ? "checked" : "";
      const rows = list
        .map((item) => {
          const checked = lockedType || selectedKeys.has(item.key) ? "checked" : "";
          const itemDisabled = lockedType ? "disabled" : "";
          const badge =
            type === "rules" && repoScanState.rulesCanonicalValidation
              ? ""
              : renderRuleToolBadgeByPath(type, item.relativePath);
          return `
            ${
              groupOnly || requiredType
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
              <input type="checkbox" class="repo-candidate-check" data-key="${escapeHtml(item.key)}" ${checked} ${itemDisabled} />
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
          <div class="repo-group-head">
            <div class="repo-group-title">${escapeHtml(type)}（${list.length}）</div>
            <label class="repo-group-toggle">
              <span>全选</span>
              <input type="checkbox" class="repo-type-check" data-type="${escapeHtml(type)}" ${typeCheckedAttrs} />
            </label>
          </div>
          `
              : type === "rules" && repoScanState.rulesCanonicalValidation
                ? `
          <div class="repo-group-head">
            <div class="repo-group-title">${escapeHtml(type)}（${list.length}）</div>
            <label class="repo-group-toggle">
              <span>全选</span>
              <input type="checkbox" class="repo-type-check" data-type="${escapeHtml(type)}" ${typeCheckedAttrs} />
            </label>
          </div>
          `
              : requiredType
                ? `
          <div class="repo-group-title">${type}（${list.length}）</div>
          <div class="hint-line">该目录必须导入，不可取消</div>
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
  if (el.repoImportBtn) {
    el.repoImportBtn.disabled = selectedKeys.size === 0 && !hasRequiredRepoCandidates(candidates);
  }
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

function normalizePathForMatch(value) {
  return String(value || "").replaceAll("\\", "/");
}

function getScopedProjectGroupKey(assetPath, projectRoot, configDirName) {
  const normalizedAsset = normalizePathForMatch(assetPath);
  const normalizedRoot = normalizePathForMatch(projectRoot).replace(/\/+$/, "");
  if (!normalizedAsset || !normalizedRoot || !configDirName) {
    return "";
  }
  const rootPrefix = `${normalizedRoot}/`;
  if (!normalizedAsset.startsWith(rootPrefix)) {
    return "";
  }
  const rel = normalizedAsset.slice(rootPrefix.length);
  if (rel === configDirName || rel.startsWith(`${configDirName}/`)) {
    return ".";
  }
  const marker = `/${configDirName}/`;
  const idx = rel.indexOf(marker);
  if (idx === -1) {
    return "";
  }
  return rel.slice(0, idx);
}

function collectScopedProjectGroups(allAssets, selectedAssets, projectRoot, configDirName) {
  const keySet = new Set();
  for (const asset of allAssets) {
    const key = getScopedProjectGroupKey(asset.path, projectRoot, configDirName);
    if (key) {
      keySet.add(key);
    }
  }

  const sortedKeys = [...keySet].sort((a, b) => {
    if (a === ".") return -1;
    if (b === ".") return 1;
    return a.localeCompare(b);
  });

  return sortedKeys.map((key) => {
    const label = key === "." ? configDirName : `${key}/${configDirName}`;
    const items = selectedAssets.filter((asset) => getScopedProjectGroupKey(asset.path, projectRoot, configDirName) === key);
    return { key, label, items };
  });
}

function renderToolBrowser() {
  if (!currentOverview) {
    return;
  }

  const selectedToolId = (el.toolBrowserSelect && "value" in el.toolBrowserSelect ? el.toolBrowserSelect.value : "") || "cursor";
  const selectedType = (el.toolBrowserTypeSelect && "value" in el.toolBrowserTypeSelect ? el.toolBrowserTypeSelect.value : "") || "skills";
  syncToolBrowserTabs();
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
  const configDirName = TOOL_CONFIG_DIR_BY_ID[selectedToolId] || "";
  const scopedGroups =
    currentBrowserScopePath && configDirName
      ? collectScopedProjectGroups(tool.assets || [], list, currentBrowserScopePath, configDirName)
      : [];
  const isMultiProject = scopedGroups.length > 1;

  el.toolBrowserMeta.textContent =
    `${tool.toolName}（${tool.toolId}）` +
    ` · 当前筛选：${selectedTypeLabel}` +
    ` · 目录：${pathHint || "无路径信息"}` +
    (isMultiProject ? " · 多项目树模式" : "");

  const nextPickMap = new Map();
  const linkedSourcePaths = [];
  let importableCount = 0;

  const renderAssetRows = (assetList, groupToken) =>
    assetList
      .map((asset, index) => {
        const pickKey = `${selectedToolId}:${selectedType}:${groupToken}:${index}`;
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
          <div class="browser-table-row">
            <div class="browser-cell browser-cell-name mono">${escapeHtml(asset.name)}${ruleToolBadge}${statusTag}</div>
            <div class="browser-cell browser-cell-path">${escapeHtml(asset.path)}</div>
            <div class="browser-cell browser-cell-action">
              ${
                showItemPickButton
                  ? `
              <button
                type="button"
                class="asset-pick-btn browser-link-btn"
                data-pick-key="${escapeHtml(pickKey)}"
                title="填入“从本地路径导入”表单"
              >
                链接
              </button>
              `
                  : ""
              }
            </div>
          </div>
        `;
      })
      .join("");

  let contentHtml = "";
  if (isMultiProject) {
    const groupItems = scopedGroups
      .map((group) => {
        const rows = renderAssetRows(group.items || [], group.key || "root");
        return `
          <li class="browser-tree-node">
            <details open>
              <summary class="mono">${escapeHtml(group.label)}</summary>
              ${rows ? `<div class="browser-table">${rows}</div>` : `<div class="asset-empty">当前无 ${escapeHtml(selectedType)}</div>`}
            </details>
          </li>
        `;
      })
      .join("");
    contentHtml = groupItems ? `<ul class="browser-tree">${groupItems}</ul>` : `<div class="asset-empty">当前无 ${selectedType}</div>`;
  } else {
    const rows = renderAssetRows(list, "single");
    contentHtml = rows ? `<div class="browser-table">${rows}</div>` : `<div class="asset-empty">当前无 ${selectedType}</div>`;
  }

  toolBrowserPickMap = nextPickMap;
  const typeDirPickKey = `${selectedToolId}:${selectedType}:${selectedTypePath || "-"}`;
  const canPickTypeDir = !isMultiProject && Boolean(selectedTypePath) && importableCount > 0;
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
          链接所有
        </button>
        `
            : ""
        }
      </div>
      ${contentHtml}
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
    setResourceImportTab("local");
    activateLocalImportTab("repo");
    if (el.localRepoPathInput) {
      el.localRepoPathInput.value = dropped;
    }
    updateLocalRepoScanButtonState();
    log(`已捕获技能仓库路径：${dropped}`);
    submitLocalRepoScanForm();
  });

  const onDragEnter = (event) => {
    if (!isResourceImportModuleActive() || !hasFileDrag(event)) {
      return;
    }
    event.preventDefault();
    resourceImportDragDepth += 1;
    setResourceImportDropOverlayVisible(true);
  };
  const onDragOver = (event) => {
    if (!isResourceImportModuleActive() || !hasFileDrag(event)) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
    setResourceImportDropOverlayVisible(true);
  };
  const onDragLeave = (event) => {
    if (!isResourceImportModuleActive()) {
      return;
    }
    event.preventDefault();
    resourceImportDragDepth = Math.max(0, resourceImportDragDepth - 1);
    if (resourceImportDragDepth === 0) {
      setResourceImportDropOverlayVisible(false);
    }
  };
  const onDrop = async (event) => {
    if (!isResourceImportModuleActive() || !hasFileDrag(event)) {
      return;
    }
    event.preventDefault();
    resourceImportDragDepth = 0;
    setResourceImportDropOverlayVisible(false);

    const dropped = extractDroppedPath(event);
    if (!dropped) {
      log("拖拽已忽略：未提取到有效路径");
      return;
    }
    const isAbsolutePath = /^[A-Za-z]:\\/.test(dropped) || dropped.startsWith("/") || dropped.startsWith("\\\\");
    if (!isAbsolutePath) {
      log(`拖拽路径无效（非绝对路径）：${dropped}`);
      return;
    }

    setResourceImportTab("local");
    const info = await inspectDroppedPath(dropped);
    if (info.isDirectory && info.hasImportDirs) {
      activateLocalImportTab("repo");
      if (el.localRepoPathInput) {
        el.localRepoPathInput.value = dropped;
      }
      updateLocalRepoScanButtonState();
      log(`已识别为技能仓库目录：${dropped}`);
      submitLocalRepoScanForm();
      return;
    }

    activateLocalImportTab("single");
    if (el.localPathInput) {
      el.localPathInput.value = dropped;
    }
    localBatchImportContext = null;
    updateLocalImportButtonState();
    log(`已填入单技能导入路径：${dropped}`);
  };

  document.addEventListener("dragenter", onDragEnter);
  document.addEventListener("dragover", onDragOver);
  document.addEventListener("dragleave", onDragLeave);
  document.addEventListener("drop", onDrop);
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
  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    payload.rulesCanonicalValidation = Boolean(el.repoRulesCanonical && el.repoRulesCanonical.checked);
    const result = await api("/api/repo/scan", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    applyRepoScanResult(result.result, "GitLab 下载并扫描");
    log(`仓库扫描完成：${repoScanState.candidates.length} 项，已默认全选可选项（docs 如存在为必选）`);
  } catch (error) {
    const message = getErrorMessage(error);
    log(`仓库扫描失败：${message}`);
    el.repoScanMeta.textContent = `扫描失败：${message}`;
    await fallbackRepoScanByTerminalClone(payload, message);
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
  const optionalCandidateKeys = candidates
    .filter((item) => !REPO_REQUIRED_TYPES.has(item.type))
    .map((item) => item.key);
  repoScanState = {
    repoPath: result.repoPath || "",
    repoId: result.repoId || "",
    repoUrl: result.repoUrl || "",
    ref: result.ref || "",
    multiToolset: Boolean(result.multiToolset),
    rulesCanonicalValidation: result.rulesCanonicalValidation !== false,
    candidates,
    selectedKeys: new Set(optionalCandidateKeys),
  };
  setDocsWritebackProjectPath(repoScanState.repoPath, sourceLabel || "仓库扫描", { detectNow: true });

  const selectedCount = repoScanState.selectedKeys.size;
  const requiredCount = getRequiredRepoCandidateKeys(candidates).length;
  const modeText = repoScanState.multiToolset ? "多端工具集" : "标准模式";
  const rulesModeText = repoScanState.rulesCanonicalValidation ? "rules范式校验开" : "rules范式校验关";
  const sourceText = sourceLabel ? `来源：${sourceLabel} | ` : "";
  el.repoScanMeta.textContent =
    `${sourceText}仓库：${repoScanState.repoUrl || "(本地路径)"} | ` +
    `本地目录：${repoScanState.repoPath} | ` +
    `模式：${modeText}/${rulesModeText} | ` +
    `候选：${repoScanState.candidates.length} | ` +
    `已勾选：${selectedCount}${requiredCount > 0 ? ` | 必选：${requiredCount}` : ""}`;
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
    log(`本地技能仓库扫描完成：${repoScanState.candidates.length} 项，已默认全选可选项（docs 如存在为必选）`);
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
    if (type === "rules") {
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
  const picked = repoScanState.candidates.find((item) => item.key === key);
  if (picked && picked.type === "rules") {
    return;
  }

  if (target.checked) {
    repoScanState.selectedKeys.add(key);
  } else {
    repoScanState.selectedKeys.delete(key);
  }

  if (el.repoImportBtn) {
    el.repoImportBtn.disabled =
      repoScanState.selectedKeys.size === 0 && !hasRequiredRepoCandidates(repoScanState.candidates);
  }
}

function selectAllRepoCandidates() {
  const keys = repoScanState.candidates
    .filter((item) => !REPO_REQUIRED_TYPES.has(item.type))
    .map((item) => item.key);
  repoScanState.selectedKeys = new Set(keys);
  renderRepoCandidates();
  log(`已全选 ${repoScanState.selectedKeys.size} 项可选资源`);
}

function clearRepoCandidateSelection() {
  repoScanState.selectedKeys = new Set();
  renderRepoCandidates();
  log("已清空可选导入项（docs 如存在仍会导入）");
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
    setResourceImportTab("local");
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

  const selectedKeys = getEffectiveRepoSelectedKeys();
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
    if (result.result.docsImported) {
      const docsInfo = result.result.docsImported;
      log(
        `docs 目录已导入：${docsInfo.storePath}${docsInfo.replaced ? "（已覆盖原 docs 目录）" : ""}`,
      );
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

async function linkRulesByDefault(toolId, scopeLabel) {
  const payload = {
    toolId,
    types: ["rules"],
  };
  if (currentLinkScopePath) {
    payload.projectPath = currentLinkScopePath;
  }
  if (currentLinkProjectType) {
    payload.projectTypeHint = currentLinkProjectType;
  }
  try {
    const result = await api("/api/link/batch", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const summary = result.result || {};
    log(
      `rules 默认批量链接完成（${scopeLabel}）：尝试 ${summary.attempted || 0}，新建 ${summary.linked || 0}，已存在 ${summary.alreadyLinked || 0}，失败 ${(summary.failed || []).length}`,
    );
    if (summary.rulesCompanionNotice) {
      log(summary.rulesCompanionNotice);
    }
  } catch (error) {
    const message = getErrorMessage(error);
    if (message.includes("No rules resources found")) {
      log(`rules 默认批量链接跳过（${scopeLabel}）：${message}`);
      return;
    }
    log(`rules 默认批量链接失败（${scopeLabel}）：${message}`);
  }
}

function logLinkResult(result, scopeLabel) {
  if (result && result.mode === "hooks-batch") {
    log(
      `hooks 批量链接完成（${scopeLabel}）：尝试 ${result.attempted || 0}，新建 ${result.linked || 0}，已存在 ${result.alreadyLinked || 0}，失败 ${(result.failed || []).length}`,
    );
    if (result.config) {
      log(`hooks 配置文件已链接：${result.config.path}`);
    }
    return;
  }
  if (result && result.mode === "rules-batch") {
    log(
      `rules 批量链接完成（${scopeLabel}）：尝试 ${result.attempted || 0}，新建 ${result.linked || 0}，已存在 ${result.alreadyLinked || 0}，失败 ${(result.failed || []).length}`,
    );
    const companionFiles = result.companionFiles || [];
    if (companionFiles.length > 0) {
      log(`检测到源地址有配置文件和规则文件：${companionFiles.map((item) => item.name).join(", ")}，将跟随rules一起链接`);
    }
    return;
  }
  if (result && result.mapping && result.mapping.linkPath) {
    log(`链接成功（${scopeLabel}）：${result.mapping.linkPath}`);
    return;
  }
  log(`链接成功（${scopeLabel}）`);
}

async function onLinkSubmitSingle() {
  const form = el.linkForm;
  const done = setBusy(el.linkCreateBtn, "链接中...");

  try {
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const toolId = String(payload.toolId || "").trim();
    const selectedResourceIds = getSelectedResourceIds();
    if (selectedResourceIds.length === 0) {
      log("请至少选择一个资源");
      return;
    }

    const aliasNameRaw = String(payload.aliasName || "").trim();
    const aliasName = selectedResourceIds.length === 1 && aliasNameRaw ? aliasNameRaw : undefined;
    if (aliasNameRaw && selectedResourceIds.length > 1) {
      log("已选择多个资源，已忽略“别名”设置并按资源名链接");
    }

    const scopeLabel = currentLinkScopePath ? `项目 ${currentLinkScopePath}` : "全局";
    let successCount = 0;
    const failed = [];

    for (const resourceToken of selectedResourceIds) {
      const requestPayload = {
        resourceToken,
        toolId,
      };
      if (aliasName) {
        requestPayload.aliasName = aliasName;
      }
      if (currentLinkScopePath) {
        requestPayload.projectPath = currentLinkScopePath;
        if (currentLinkProjectType) {
          requestPayload.projectTypeHint = currentLinkProjectType;
        }
      }
      try {
        const result = await api("/api/link", {
          method: "POST",
          body: JSON.stringify(requestPayload),
        });
        logLinkResult(result.result, scopeLabel);
        successCount += 1;
      } catch (error) {
        const message = getErrorMessage(error);
        failed.push({ resourceId: resourceToken, error: message });
        log(`链接失败（${resourceToken}）：${message}`);
      }
    }

    if (selectedResourceIds.length > 1) {
      log(`多选链接完成（${scopeLabel}）：成功 ${successCount}，失败 ${failed.length}`);
    }
    if (failed.length > 0 && successCount === 0) {
      log("多选链接未成功，请检查上方错误日志");
    }
    if (successCount > 0 && currentLinkScopePath && currentBrowserScopePath !== currentLinkScopePath) {
      currentBrowserScopePath = currentLinkScopePath;
      renderScopeInputs();
      log(`已自动切换“工具目录浏览器”范围到当前链接项目：${currentLinkScopePath}`);
    }
    if (successCount > 0 || failed.length > 0) {
      await refreshOverview("auto");
    }
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
    const selectedResourceIds = new Set(getSelectedResourceIds());
    const getSourcePathByType = (typeValue) => {
      if (localBatchImportContext && localBatchImportContext.type === typeValue) {
        return localBatchImportContext.sourcePath;
      }
      if (!currentOverview) {
        return "";
      }
      const resource = (currentOverview.state.resources || []).find(
        (item) => selectedResourceIds.has(item.id) && item.type === typeValue,
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
    if (currentLinkScopePath) {
      payload.projectPath = currentLinkScopePath;
      if (currentLinkProjectType) {
        payload.projectTypeHint = currentLinkProjectType;
      }
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
    if ((summary.linked || 0) > 0 && currentLinkScopePath && currentBrowserScopePath !== currentLinkScopePath) {
      currentBrowserScopePath = currentLinkScopePath;
      renderScopeInputs();
      log(`已自动切换“工具目录浏览器”范围到当前链接项目：${currentLinkScopePath}`);
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
    await detectLinkProjectType(selected);
  } catch (error) {
    log(`选择目录失败：${getErrorMessage(error)}`);
  }
}

function onClearLinkScopeDirectory() {
  currentLinkScopePath = "";
  linkProjectDetectSeq += 1;
  linkProjectDetecting = false;
  currentLinkProjectType = "";
  currentLinkRulesBucket = "";
  renderScopeInputs();
  updateLinkRulesHint();
  updateLinkCreateButtonState();
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

async function onRemoveHubResource(resourceId, resourceType, resourceName) {
  const resourceToken = String(resourceId || "").trim();
  const typeValue = toPluralType(String(resourceType || "").trim());
  const displayName = String(resourceName || "").trim();
  if (!resourceToken || !typeValue) {
    log("移除失败：缺少资源标识，请刷新后重试");
    return;
  }
  if (hubRemoveBusy) {
    log("移除进行中，请稍候");
    return;
  }

  const ok = window.confirm(`是否将此${typeValue}移出中心仓库？`);
  if (!ok) {
    return;
  }

  hubRemoveBusy = true;
  try {
    const result = await api("/api/hub/remove-resource", {
      method: "POST",
      body: JSON.stringify({ resourceToken }),
    });
    const summary = result.result || {};
    const nameLabel = displayName || String(summary.resourceName || resourceToken);
    log(`已移出中心仓库：${typeValue}/${nameLabel}`);
    const removedLinks = Number(summary.removedLinks || 0);
    const deactivatedMappings = Number(summary.deactivatedMappings || 0);
    if (removedLinks > 0 || deactivatedMappings > 0) {
      log(`同步处理映射：停用 ${deactivatedMappings}，移除链接 ${removedLinks}`);
    }
    await refreshOverview("auto");
  } catch (error) {
    log(`移出中心仓库失败：${getErrorMessage(error)}`);
  } finally {
    hubRemoveBusy = false;
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

  if (el.terminalToggleBtn) {
    el.terminalToggleBtn.addEventListener("click", async () => {
      const nextOpen = !terminalOpen;
      if (nextOpen) {
        const started = await ensureTerminalStarted();
        if (!started) {
          return;
        }
      }
      setTerminalOpen(nextOpen);
    });
  }
  if (el.terminalCloseBtn) {
    el.terminalCloseBtn.addEventListener("click", () => {
      setTerminalOpen(false);
    });
  }
  if (el.terminalInputForm) {
    el.terminalInputForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!(el.terminalInput instanceof HTMLInputElement)) {
        return;
      }
      const command = el.terminalInput.value;
      if (!command.trim()) {
        return;
      }
      const started = await ensureTerminalStarted();
      if (!started) {
        return;
      }
      try {
        appendTerminalOutput(`$ ${command}\n`);
        await window.cowhubDesktop.terminalWrite(`${command}\n`);
      } catch (error) {
        appendTerminalOutput(`[write error] ${getErrorMessage(error)}\n`);
      } finally {
        el.terminalInput.value = "";
      }
    });
  }

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
  if (el.conflictTypeTabs) {
    el.conflictTypeTabs.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const tab = target.closest("[data-conflict-type]");
      if (!tab || !el.conflictTypeTabs.contains(tab)) {
        return;
      }
      selectedConflictType = tab.getAttribute("data-conflict-type") || "all";
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
  if (el.docsDetectBtn) {
    el.docsDetectBtn.addEventListener("click", () => {
      detectDocsWritebackChanges("manual");
    });
  }
  if (el.docsApplyBtn) {
    el.docsApplyBtn.addEventListener("click", () => {
      applyDocsWriteback();
    });
  }
  if (el.docsRemoteSyncBtn) {
    el.docsRemoteSyncBtn.addEventListener("click", () => {
      onDocsRemoteSync();
    });
  }
  if (el.remoteSyncCommitBtn) {
    el.remoteSyncCommitBtn.addEventListener("click", () => {
      onRemoteSyncCommit();
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
      updateLinkRulesHint();
    });
  }
  if (el.linkAllModeToggle) {
    el.linkAllModeToggle.addEventListener("change", syncLinkModeUI);
  }
  if (el.resourceImportTabs) {
    el.resourceImportTabs.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const btn = target.closest("[data-resource-import-tab]");
      if (!btn || !el.resourceImportTabs.contains(btn)) {
        return;
      }
      const tab = btn.getAttribute("data-resource-import-tab") || "gitlab";
      setResourceImportTab(tab);
    });
  }
  if (el.moduleNav) {
    el.moduleNav.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const btn = target.closest("[data-module-target]");
      if (!btn || !el.moduleNav.contains(btn)) {
        return;
      }
      const moduleKey = btn.getAttribute("data-module-target") || "overview";
      setActiveModule(moduleKey);
    });
  }
  window.addEventListener("resize", () => {
    updateModuleNavIndicator();
  });
  el.pathSetForm.addEventListener("submit", onPathSet);
  el.pathSetForm.addEventListener("input", updatePathSetButtonsState);
  el.pathSetForm.addEventListener("change", updatePathSetButtonsState);
  el.pathUnsetBtn.addEventListener("click", onPathUnset);
  el.rollbackBtn.addEventListener("click", onRollback);
  if (el.logDock) {
    el.logDock.addEventListener("click", () => {
      toggleLogDrawer();
    });
  }
  if (el.logDrawerCloseBtn) {
    el.logDrawerCloseBtn.addEventListener("click", () => {
      setLogDrawerExpanded(false);
    });
  }
  if (el.logDrawerBackdrop) {
    el.logDrawerBackdrop.addEventListener("click", () => {
      setLogDrawerExpanded(false);
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }
    if (terminalOpen) {
      setTerminalOpen(false);
      return;
    }
    if (isRepoHistoryOverlayVisible()) {
      closeRepoHistoryOverlay();
      return;
    }
    if (logDrawerExpanded) {
      setLogDrawerExpanded(false);
    }
    if (el.remoteSyncBanner && !el.remoteSyncBanner.hidden) {
      hideRemoteSyncBanner();
    }
  });
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
  if (el.toolScanList) {
    el.toolScanList.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const tab = target.closest("[data-hub-type]");
      if (tab && el.toolScanList.contains(tab)) {
        const nextType = tab.getAttribute("data-hub-type") || "skills";
        if (nextType !== activeHubType) {
          activeHubType = nextType;
          if (currentOverview && currentOverview.state) {
            renderHubStoreResources(currentOverview.state.resources || []);
          }
        }
        return;
      }
      const btn = target.closest(".hub-delete-btn");
      if (!btn || !el.toolScanList.contains(btn)) {
        return;
      }
      const resourceId = btn.getAttribute("data-resource-id") || "";
      const resourceType = btn.getAttribute("data-resource-type") || "";
      const resourceName = btn.getAttribute("data-resource-name") || "";
      onRemoveHubResource(resourceId, resourceType, resourceName);
    });
  }
  if (el.toolBrowserSelect) {
    el.toolBrowserSelect.addEventListener("change", () => {
      renderToolBrowser();
    });
  }
  if (el.toolBrowserTypeSelect) {
    el.toolBrowserTypeSelect.addEventListener("change", () => {
      renderToolBrowser();
    });
  }
  if (el.toolBrowserToolTabs && el.toolBrowserSelect) {
    el.toolBrowserToolTabs.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const btn = target.closest("[data-tool-id]");
      if (!btn || !el.toolBrowserToolTabs.contains(btn)) {
        return;
      }
      const next = btn.getAttribute("data-tool-id") || "cursor";
      if ("value" in el.toolBrowserSelect) {
        el.toolBrowserSelect.value = next;
      }
      renderToolBrowser();
    });
  }
  if (el.toolBrowserTypeTabs && el.toolBrowserTypeSelect) {
    el.toolBrowserTypeTabs.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const btn = target.closest("[data-type-id]");
      if (!btn || !el.toolBrowserTypeTabs.contains(btn)) {
        return;
      }
      const next = btn.getAttribute("data-type-id") || "skills";
      if ("value" in el.toolBrowserTypeSelect) {
        el.toolBrowserTypeSelect.value = next;
      }
      renderToolBrowser();
    });
  }
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

      setActiveModule("resource-import");
      setResourceImportTab("local");
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

    setActiveModule("resource-import");
    setResourceImportTab("local");
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
  docsWritebackProjectPath = loadDocsWritebackProjectPath();
  setLatestLogPreview("暂无日志");
  setLogDrawerExpanded(false);
  hideRemoteSyncBanner();
  setTerminalOpen(false);
  const serverSavedPath = await loadDocsWritebackProjectPathFromServer();
  if (serverSavedPath) {
    docsWritebackProjectPath = serverSavedPath;
    saveDocsWritebackProjectPath(serverSavedPath);
  } else if (docsWritebackProjectPath) {
    saveDocsWritebackProjectPathToServer(docsWritebackProjectPath);
  }
  renderRepoHistoryCount();
  syncDocsWritebackAutoTimer();
  renderDocsWritebackModule();
  if (docsWritebackProjectPath) {
    detectDocsWritebackGitEnv(docsWritebackProjectPath, { silent: true });
  }
  activateLocalImportTab("single");
  setResourceImportTab(activeResourceImportTab);
  bindEvents();
  setActiveModule(activeModule, false);
  syncLinkModeUI();
  updateActionButtonsState();
  if (docsWritebackProjectPath) {
    detectDocsWritebackChanges("auto");
  }
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
