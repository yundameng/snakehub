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
  localPathInput: document.getElementById("localPathInput"),
  rollbackBtn: document.getElementById("rollbackBtn"),
  repoScanForm: document.getElementById("repoScanForm"),
  repoScanMeta: document.getElementById("repoScanMeta"),
  repoCandidates: document.getElementById("repoCandidates"),
  repoSelectAllBtn: document.getElementById("repoSelectAllBtn"),
  repoClearBtn: document.getElementById("repoClearBtn"),
  repoImportBtn: document.getElementById("repoImportBtn"),
  repoMultiToolset: document.getElementById("repoMultiToolset"),
  repoTargetPath: document.getElementById("repoTargetPath"),
  repoClearDirBtn: document.getElementById("repoClearDirBtn"),
  localImportForm: document.getElementById("localImportForm"),
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
let currentBrowserScopePath = "";
let currentLinkScopePath = "";
let repoScanState = {
  repoPath: "",
  repoId: "",
  repoUrl: "",
  ref: "",
  multiToolset: false,
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

function setRepoActionButtonsEnabled(enabled) {
  if (el.repoSelectAllBtn) el.repoSelectAllBtn.disabled = !enabled;
  if (el.repoClearBtn) el.repoClearBtn.disabled = !enabled;
  if (el.repoImportBtn) el.repoImportBtn.disabled = !enabled;
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
  if (typeValue === "agents") return "agent";
  if (typeValue === "commands") return "command";
  return typeValue;
}

function toPluralType(typeValue) {
  if (typeValue === "skill" || typeValue === "skills") return "skills";
  if (typeValue === "hook" || typeValue === "hooks") return "hooks";
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

function log(message) {
  const ts = new Date().toLocaleTimeString();
  el.eventLog.textContent = `[${ts}] ${message}\n${el.eventLog.textContent}`.slice(0, 12000);
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
  const order = ["skills", "commands", "hooks", "agents"];
  const grouped = {
    skills: [],
    commands: [],
    hooks: [],
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
              <span class="mono">${escapeHtml(item.name)}</span>
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
  if (resources.length === 0) {
    el.resourceSelect.innerHTML = `<option value="">（当前无可链接资源）</option>`;
    updateLinkCreateButtonState();
    return;
  }

  el.resourceSelect.innerHTML = resources
    .map((r) => `<option value="${r.id}">${r.name}（${r.type}）</option>`)
    .join("");
  updateLinkCreateButtonState();
}

function typeSortOrder(type) {
  if (type === "skills") return 0;
  if (type === "commands") return 1;
  if (type === "hooks") return 2;
  if (type === "agents") return 3;
  return 99;
}

function renderRepoCandidates() {
  const { candidates, selectedKeys } = repoScanState;
  if (!candidates || candidates.length === 0) {
    el.repoCandidates.innerHTML = `<div class="asset-empty">尚未扫描到可导入项</div>`;
    setRepoActionButtonsEnabled(false);
    return;
  }

  const grouped = new Map();
  for (const item of candidates) {
    const list = grouped.get(item.type) || [];
    list.push(item);
    grouped.set(item.type, list);
  }

  const sections = [...grouped.entries()]
    .sort((a, b) => typeSortOrder(a[0]) - typeSortOrder(b[0]))
    .map(([type, list]) => {
      list.sort((x, y) => x.relativePath.localeCompare(y.relativePath));
      const rows = list
        .map((item) => {
          const checked = selectedKeys.has(item.key) ? "checked" : "";
          return `
            <label class="repo-item">
              <input type="checkbox" class="repo-candidate-check" data-key="${escapeHtml(item.key)}" ${checked} />
              <span class="repo-item-body">
                <span class="mono">${escapeHtml(item.name)}</span>
                <span class="asset-path">${escapeHtml(item.relativePath)}</span>
              </span>
            </label>
          `;
        })
        .join("");

      return `
        <section class="repo-group">
          <div class="repo-group-title">${type}（${list.length}）</div>
          <div class="repo-group-list">${rows}</div>
        </section>
      `;
    })
    .join("");

  el.repoCandidates.innerHTML = `<div class="repo-grid">${sections}</div>`;
  if (el.repoSelectAllBtn) el.repoSelectAllBtn.disabled = false;
  if (el.repoClearBtn) el.repoClearBtn.disabled = false;
  if (el.repoImportBtn) el.repoImportBtn.disabled = selectedKeys.size === 0;
}

function groupAssetsByType(assets) {
  const map = {
    skills: [],
    hooks: [],
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
    return;
  }

  if (!tool.detected) {
    el.toolBrowserMeta.textContent = `${tool.toolName}（${tool.toolId}）当前未检测到。`;
    el.toolBrowserContent.innerHTML = "";
    toolBrowserPickMap = new Map();
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
  const showItemPickButton = selectedType !== "hooks";
  const selectedTypeLabel = typeText[selectedType] || selectedType;
  el.toolBrowserMeta.textContent =
    `${tool.toolName}（${tool.toolId}）` +
    ` · 当前筛选：${selectedTypeLabel}` +
    ` · 目录：${pathHint || "无路径信息"}`;

  const nextPickMap = new Map();
  const items = list
    .map((asset, index) => {
      const pickKey = `${selectedToolId}:${selectedType}:${index}`;
      nextPickMap.set(pickKey, asset);
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
      const mergeConflictId = mergeConflictIdByAssetKey.get(assetKey);
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
            <span class="mono">${escapeHtml(asset.name)}</span>${statusTag}
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

  el.toolBrowserContent.innerHTML = `
    <article class="browser-col">
      <div class="browser-type-head">
        <h3>${selectedType}（${list.length}）</h3>
        <button
          type="button"
          class="asset-pick-btn type-dir-pick-btn"
          data-type="${escapeHtml(selectedType)}"
          data-tool-id="${escapeHtml(selectedToolId)}"
          data-type-dir-path="${escapeHtml(selectedTypePath)}"
          title="填入“从本地路径导入”并按该类型启用批量导入/批量链接"
          ${selectedTypePath ? "" : "disabled"}
        >
          ->
        </button>
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
  renderPaths(paths);
  buildConflictRecords();
  renderToolBrowser();
  renderConflictModule();
  renderWizard(state, scan);
  renderScopeInputs();
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

  const uriList = dt.getData("text/uri-list");
  if (uriList) {
    const first = uriList
      .split(/\r?\n/)
      .map((x) => x.trim())
      .find((x) => x && !x.startsWith("#"));
    if (first && first.startsWith("file://")) {
      try {
        const url = new URL(first);
        return normalizeDroppedPath(decodeURIComponent(url.pathname));
      } catch {
        return "";
      }
    }
  }

  const plain = dt.getData("text/plain").trim();
  return normalizeDroppedPath(plain);
}

function bindDnD() {
  const zone = el.localDropZone;

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
    el.localPathInput.value = dropped;
    log(`已捕获拖拽路径：${dropped}`);
  });
}

async function onRepoScanSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type=submit]");
  const done = setBusy(button, "下载并扫描中...");

  try {
    const payload = Object.fromEntries(new FormData(form).entries());
    const result = await api("/api/repo/scan", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    repoScanState = {
      repoPath: result.result.repoPath,
      repoId: result.result.repoId,
      repoUrl: result.result.repoUrl,
      ref: result.result.ref || "",
      multiToolset: Boolean(result.result.multiToolset),
      candidates: result.result.candidates || [],
      selectedKeys: new Set((result.result.candidates || []).map((item) => item.key)),
    };

    const selectedCount = repoScanState.selectedKeys.size;
    const modeText = repoScanState.multiToolset ? "多端工具集" : "标准模式";
    el.repoScanMeta.textContent =
      `仓库：${repoScanState.repoUrl || "(本地路径)"} | ` +
      `本地目录：${repoScanState.repoPath} | ` +
      `模式：${modeText} | ` +
      `候选：${repoScanState.candidates.length} | ` +
      `已勾选：${selectedCount}`;
    renderRepoCandidates();
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
      }),
    });
    const imported = result.result.imported || [];
    const reused = imported.filter((x) => x.reused).length;
    const created = imported.length - reused;
    log(`导入中心仓库完成：新增 ${created}，复用 ${reused}，总计 ${imported.length}`);
    if (result.result.hooksSnapshot) {
      log(`hooks 配置与目录结构已归档：${result.result.hooksSnapshot.snapshotDir}`);
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
    const isBatchByType =
      Boolean(localBatchImportContext) &&
      localBatchImportContext.type === payloadType &&
      localBatchImportContext.sourcePath === payloadSourcePath;

    if (isHooksType || isBatchByType) {
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
    log("请至少选择一个类型（skills/commands/hooks/agents）");
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
    const payload = {
      toolId,
      types: selectedTypes,
    };
    if (includesHooks) {
      let hooksSourcePath = "";
      if (localBatchImportContext && localBatchImportContext.type === "hooks") {
        hooksSourcePath = localBatchImportContext.sourcePath;
      } else if (currentOverview && el.resourceSelect) {
        const resource = (currentOverview.state.resources || []).find(
          (item) => item.id === el.resourceSelect.value && item.type === "hooks",
        );
        if (resource) {
          hooksSourcePath = resource.sourcePath;
        }
      }

      if (!hooksSourcePath) {
        log("批量链接 hooks 需要来源 hooks 目录。请先在浏览器中选择一个 hooks 条目或使用类型箭头填充。");
        return;
      }
      payload.hooksSourcePath = hooksSourcePath;
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
  try {
    const result = await api("/api/rollback", {
      method: "POST",
      body: JSON.stringify({}),
    });
    log(`回滚成功：${result.result.rolledBackOperationId}`);
    await refreshOverview("auto");
  } catch (error) {
    log(`回滚失败：${getErrorMessage(error)}`);
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
  el.localImportForm.addEventListener("submit", onLocalImport);
  el.localImportForm.addEventListener("input", updateLocalImportButtonState);
  el.localImportForm.addEventListener("change", updateLocalImportButtonState);
  const localTypeSelect = el.localImportForm.querySelector('select[name="type"]');
  if (localTypeSelect) {
    localTypeSelect.addEventListener("change", () => {
      localBatchImportContext = null;
    });
  }
  if (el.localPathInput) {
    el.localPathInput.addEventListener("input", () => {
      localBatchImportContext = null;
    });
  }
  el.gitForm.addEventListener("submit", onGitImport);
  el.gitForm.addEventListener("input", updateGitImportButtonsState);
  el.gitForm.addEventListener("change", updateGitImportButtonsState);
  el.gitListBtn.addEventListener("click", onGitList);
  el.linkForm.addEventListener("submit", onLinkCreate);
  el.linkForm.addEventListener("input", updateLinkCreateButtonState);
  el.linkForm.addEventListener("change", updateLinkCreateButtonState);
  if (el.linkAllModeToggle) {
    el.linkAllModeToggle.addEventListener("change", syncLinkModeUI);
  }
  el.pathSetForm.addEventListener("submit", onPathSet);
  el.pathSetForm.addEventListener("input", updatePathSetButtonsState);
  el.pathSetForm.addEventListener("change", updatePathSetButtonsState);
  el.pathUnsetBtn.addEventListener("click", onPathUnset);
  el.rollbackBtn.addEventListener("click", onRollback);
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
      if (!typeValue || !dirPath) {
        log("选择失败：当前类型目录不可用，请刷新后重试");
        return;
      }

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
