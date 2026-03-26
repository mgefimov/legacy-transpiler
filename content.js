(function () {
  const loadPromises = new Map();
  const patched = new Set();
  let execChain = Promise.resolve();

  async function loadCode(src = "") {
    if (src.includes("intercom")) return [];
    if (loadPromises.has(src)) {
      await loadPromises.get(src);
      return [];
    }
    const promise = (async () => {
      const r = await fetch(src);
      const code = await r.text();
      return patchCode(src, code);
    })();
    loadPromises.set(src, promise);
    return promise;
  }

  const resolveModule = (source = "") => {
    const BASE_URL =
      "https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1";
    if (!source.startsWith("./")) {
      return source;
    }
    return `${BASE_URL}/${source.replace(/^\.\//, "")}`;
  };

  async function patchCode(src, code) {
    if (patched.has(src)) return [];
    patched.add(src);

    const scripts = [];

    const staticImportModule = async (source = "") => {
      if (!source.startsWith("./")) {
        return source;
      }

      const fullSrc = resolveModule(source);
      const importedScripts = await loadCode(fullSrc);
      scripts.push(...importedScripts);
      return fullSrc;
    };
    try {
      const patchedScript = await window.LegacyTranspiler.transpile(code, {
        minify: true,
        resolveModule,
        src,
        staticImportModule,
      });
      scripts.push(patchedScript);
    } catch (e) {
      console.warn("[patchCode] failed to transpile", src, e.message);
      scripts.push(code);
    }
    return scripts;
  }

  function enqueueExecution(scripts) {
    execChain = execChain.then(() => {
      scripts.forEach((s) => {
        window.webkit.messageHandlers.patchScript.postMessage(s);
      });
    });
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.tagName === "SCRIPT" && node.src) {
          node.type = "javascript/blocked";
          const src = node.src;
          if (!window.LegacyTranspiler._moduleExports) {
            window.LegacyTranspiler._moduleExports = {};
          }
          if (!window.LegacyTranspiler._import) {
            window.LegacyTranspiler._import = (source) => {
              console.log("_import", source);
              const resolvedSource = resolveModule(source);
              return import(resolvedSource);
            };
          }
          loadCode(src).then((scripts) => {
            enqueueExecution(scripts);
          });
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
