'use strict';
(async function () {
  const {c8: t} = window.LegacyTranspiler._moduleExports["https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/index-CnEMqild.js"];
  function e(e, n, r, o) {
    var i = this;
    return e ? ((e instanceof Element ? [e] : ("toArray" in e) ? e.toArray() : e).forEach(function (e) {
      e.addEventListener("click", function (u) {
        var c, a, s = n instanceof Function ? n(e) : n, f = r instanceof Function ? r(e) : r, l = e.getAttribute("href") || e.getAttributeNS("http://www.w3.org/1999/xlink", "href") || e.getAttribute("xlink:href") || (null === (c = e.getElementsByTagName("a")[0]) || void 0 === c ? void 0 : c.getAttribute("href")), h = t(i.track(s, f, null != o ? o : {}), null !== (a = i.settings.timeout) && void 0 !== a ? a : 500);
        (function (t, e) {
          return !("_blank" !== t.target || !e);
        })(e, l) || (function (t) {
          var e = t;
          return !!(e.ctrlKey || e.shiftKey || e.metaKey || e.button && 1 == e.button);
        })(u) || l && (u.preventDefault ? u.preventDefault() : u.returnValue = !1, h.catch(console.error).then(function () {
          window.location.href = l;
        }).catch(console.error));
      }, !1);
    }), this) : this;
  }
  function n(e, n, r, o) {
    var i = this;
    return e ? (e instanceof HTMLFormElement && (e = [e]), e.forEach(function (e) {
      if (!(e instanceof Element)) throw new TypeError("Must pass HTMLElement to trackForm/trackSubmit.");
      var u = function (u) {
        var c;
        u.preventDefault ? u.preventDefault() : u.returnValue = !1;
        var a = n instanceof Function ? n(e) : n, s = r instanceof Function ? r(e) : r;
        t(i.track(a, s, null != o ? o : {}), null !== (c = i.settings.timeout) && void 0 !== c ? c : 500).catch(console.error).then(function () {
          e.submit();
        }).catch(console.error);
      }, c = window.jQuery || window.Zepto;
      c ? c(e).submit(u) : e.addEventListener("submit", u, !1);
    }), this) : this;
  }
  window.LegacyTranspiler._moduleExports["https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/c6fceefc5-QSkN9uce.js"] = {
    form: n,
    link: e
  };
})();
