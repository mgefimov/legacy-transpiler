'use strict';
(async function () {
  const {dT: r, dU: s} = window.LegacyTranspiler._moduleExports["https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/index-CnEMqild.js"];
  function t(r, s) {
    return Object.keys(s).reduce(function (t, e) {
      e.startsWith(r) && (t[e.substr(r.length)] = s[e]);
      return t;
    }, {});
  }
  function e(e, a) {
    var i = document.createElement("a");
    i.href = a;
    var n = i.search.slice(1).split("&").reduce(function (s, t) {
      var e = t.split("="), a = e[0], i = e[1];
      return (s[a] = r(i), s);
    }, {}), u = [], d = n.ajs_uid, o = n.ajs_event, j = n.ajs_aid, _ = s(e.options.useQueryString) ? e.options.useQueryString : {}, v = _.aid, c = void 0 === v ? /.+/ : v, p = _.uid, f = void 0 === p ? /.+/ : p;
    if (j) {
      var y = Array.isArray(n.ajs_aid) ? n.ajs_aid[0] : n.ajs_aid;
      c.test(y) && e.setAnonymousId(y);
    }
    if (d) {
      var m = Array.isArray(n.ajs_uid) ? n.ajs_uid[0] : n.ajs_uid;
      if (f.test(m)) {
        var l = t("ajs_trait_", n);
        u.push(e.identify(m, l));
      }
    }
    if (o) {
      var A = Array.isArray(n.ajs_event) ? n.ajs_event[0] : n.ajs_event, h = t("ajs_prop_", n);
      u.push(e.track(A, h));
    }
    return Promise.all(u);
  }
  window.LegacyTranspiler._moduleExports["https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/c6a992d55-DtDdxlil.js"] = {
    queryString: e
  };
})();
