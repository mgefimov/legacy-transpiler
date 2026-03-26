(function () {
  const loaded = new Set();
  const patched = new Set();
  async function loadCode(src = "") {
    //console.log("loadCode", src);
    if (src.includes("intercom") || loaded.has(src)) {
      //console.log("skipped", src);
      return [];
    }
    loaded.add(src);
    const r = await fetch(src);
    const code = await r.text();
    const res = await patchCode(src, code);
    //console.log("loaded", src);
    return res;
  }

  const resolveModule = (source = "") => {
    const BASE_URL =
      "https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1";
    // const BASE_URL = "http://192.168.1.136:3000";
    //console.log('resolveModule', source)
    if (!source.startsWith("./")) {
      return source;
    }
    return `${BASE_URL}/${source.replace(/^\.\//, "")}`;
  };

  async function patchCode(src, code) {
    //console.log("patch", src);
    if (patched.has(src)) {
      //console.log("skip patch", src);
      return [];
    }
    patched.add(src);

    const scripts = [];

    const staticImportModule = async (source = "") => {
      //console.log("staticImportModule", source);
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
    //console.log("patched", src);
    return scripts;
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
            scripts.forEach((patched) => {
              window.webkit.messageHandlers.patchScript.postMessage(patched);
            });
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
