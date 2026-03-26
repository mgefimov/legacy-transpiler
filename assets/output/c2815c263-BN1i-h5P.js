'use strict';
(async function () {
  const {j: e, ah: a, M: c, r: t, ai: s, aj: d, ak: f, a5: i, Y: b, u: r, J: n} = window.LegacyTranspiler._moduleExports["https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/vendor-C66HWFe4.js"];
  const {aD: o, C: l, J: x, by: u, cS: p, fZ: m, c: h, ei: j, bs: g, f_: w, f$: _, p: y, g0: v, g1: C, f2: N, g2: k, b_: S, fN: A, be: L, P: z, g3: O, g4: M, g5: R, ej: E, f3: $, fL: P, o: T} = window.LegacyTranspiler._moduleExports["https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/index-D27vslQQ.js"];
  const {_: q} = window.LegacyTranspiler._moduleExports["https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/tree-sitter-BRUsc_bS.js"];
  const {u: I} = window.LegacyTranspiler._moduleExports["https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/c6b9e36fd-iaB1lBu_.js"];
  const {A: B} = window.LegacyTranspiler._moduleExports["https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/c4e248ddc-DkMUJCJy.js"];
  const U = {
    "ac6871a2-35d6-4328-ba77-9e9be5c9993b": "f7347722-1c2a-4161-bc39-dc7cdf18d134",
    "0e6f226e-70b0-418d-a03c-77ba65e4ba14": "7ee4281a-fb3f-43ef-b73f-9290b666d323",
    "1b5ec996-4e2c-4a96-8fca-02b08ad0a11e": "03f0aa3b-10a5-41be-97ee-2d3dc63957c9",
    "c33e575f-5228-4058-aa78-a998bad7ec71": "54712751-5505-4766-a641-7805e747ba4d",
    "66739932-5e3f-45b6-adaa-9748c5133e49": "d97d3176-6ef1-45ff-a8b0-2a710af24cd8",
    "c9e8652f-1804-4903-a1d1-111c85a054e4": "d7605d97-cac1-4170-9df8-4a418a2a621e",
    "5480d43e-8c79-4ff8-accb-331dd18474d5": "825b28b3-de1d-4672-ba0d-ba36f048f215",
    "9a8fce38-ab3b-4b7d-a088-a5e970174a17": "f10e0521-431a-4251-8542-9db1fe6b12cf",
    "5b2cefd8-56e3-4dfa-9bbd-009b73203ace": "3e8b55fc-9c84-4b81-9eed-6cd910d04c7b",
    "9d2fe22e-d126-4d86-a30e-9e6a912df70e": "7d813aa1-7bd0-4c65-b431-6d9e9a7a6333",
    "f03a4c44-7001-41f7-af36-93c3332e4f87": "d336c35b-9e40-4888-a4e6-2f08f0653e9e",
    "b7b2fa37-a173-4bf5-8a12-8bc4c2de2807": "0a292874-6d79-4984-a1e9-0b3ec842ad19",
    "9a273750-0698-43dc-a786-a312013a8ef5": "c970fa22-fdb8-46f3-b656-a768e39a5d97",
    "2c91cdd9-168a-4d97-aa36-2e0eb13ab828": "e9fcf5a1-3cd8-46e8-92b1-e4256ca97e53",
    "9d238552-2f95-44a0-a9e0-84b2d8c14093": "555fb3a8-4ed3-4feb-99e3-a9e7bf9dc647",
    "2af221b6-367f-4b4f-9fe9-25710f5f8feb": "996f3b99-fe2d-41f0-9ce2-15e3eb2a05b8",
    "25a43927-935c-4a2a-af92-4c210970e851": "a11e86a7-1a7c-4671-9250-82ead75b5e16",
    "de47f141-a1bb-4e9a-81ee-09cdfb5316a3": "e2c8a086-e3c1-4c29-b571-b68bd7b9dbdd",
    "bc57bf10-cb8d-45fc-8195-b46c34fa57ec": "a8df28b4-a7eb-4b48-b590-4e238bc18a08",
    "ba9cb443-c559-4e4f-a6fb-7281a0fbb3b1": "138c683a-bb67-435b-8bcd-21a197cdef30",
    "f080f347-e4e6-4c26-9f2c-353ef1aa82c7": "133c8f75-15ff-4989-917f-6e3fa49be80a",
    "badc0925-329c-4ac6-968f-6e3e2d561d26": "1c5e8b25-01c3-455c-ac2a-411c785350ec",
    "fe21310a-20f8-4801-8249-8f3a814c4962": "3c9b7e58-cbf9-4fe8-8b16-5a521bc79766",
    "1e716a42-1465-4a47-8b15-ceb2a9d021b9": "a3c3430d-2d07-4ff2-af97-b92312c2c887",
    "3d81ba29-d1ad-4e9b-b58e-3e0f46ba8afd": "4e01b210-2e62-48fb-bdac-eade6221669d",
    "f0ae5ea8-7bb8-478e-91c2-f8b9f383ae81": "acb45ef5-69f5-436f-b4d9-b16c681257bb",
    "fc64414e-76db-4876-8531-6e9794e4b1be": "965f5b25-1947-4c67-b10c-35cf0ea78f69",
    "c4ad8ebe-1b70-4b9d-8687-1987dc719edf": "deb7ae35-d01c-4025-9f9d-aa9799632d58",
    "dcc8728e-4925-4c50-9418-a259f9a67342": "931cf4b4-99f0-486d-b260-d656b8d39406",
    "2c85cf8a-4f5e-4f89-af3c-e177bc5327ea": "5fb1644e-b5fc-4d84-b317-33a896c4744b",
    "5a70b8ed-c95d-4783-aad5-cd06fe0c66eb": "8ef72de9-2d67-4389-b0eb-a52e709a8fb0",
    "ef17943a-a65c-40b8-979f-1e91b3400575": "3ce87eec-406e-45ec-9337-407fff8e1fe5",
    "b367b675-ad40-4770-8bcd-0859975c18be": "1605a2bc-6779-4d9f-9152-e735aa089ae3",
    "be6430eb-3710-447c-a8b6-da40792ed790": "404ecc1f-e419-49ee-a47b-a20b275a2d93",
    "1da5aaf2-b3ae-40f4-8058-311a7396baa6": "9c519e50-c3a2-43e0-97d6-6577f4a3957a",
    "3ec41265-5446-4a9f-b53a-49057a76e5a6": "9e4a9b60-8a50-4c22-9f5c-8b1accea5667",
    "3fab54a6-cfc3-4acf-b86f-eccd34931ee2": "fb5b8344-2180-4844-be5a-8fd669f107a8",
    "27e36ad3-716b-4504-bfe8-5fb46ef5ca07": "267da5bb-795f-4281-9c66-37d5850d5f67",
    "e18e1879-d8ec-46e3-a1ea-efab49bfbdb9": "e89a7b90-90d8-4c22-b81d-7c82acf2b207",
    "a36033d5-0838-4f73-8d85-3f2213f1ffb8": "5b7f4d64-243f-44c2-8b3a-30fd9455f191",
    "83bb8762-9c07-474c-b53c-e0fe83654881": "f4cb2f8c-3b4f-472c-bae7-69036ae4f9a9",
    "f3ec9231-ffe4-4656-92d1-fcfce0e93f8e": "8389aa45-aaa3-4723-b2c4-b9a41f1d49b1",
    "8eda3673-93a5-4ce0-bb0d-44d51430853b": "7e3d3dc0-90ed-4a90-a92b-0f53f570c416",
    "7d9ae635-3bdf-429d-a24d-708828434b0a": "47d5427d-c9fe-4a1f-b7a4-6e856ce3ea46",
    "379c977a-a0ec-463a-b32e-4a5f8d09f242": "422ff676-0454-4d65-b4fb-f4cb2bb95ff5",
    "d614489b-3198-4859-a46d-8b7fe4f9e2f4": "83584789-d247-4846-8719-6eaeaae52060",
    "18ace4c3-9eae-4af5-a38e-73b37a4d2131": "4faac9bf-e468-42c0-a6e1-2ba13b47e625",
    "1bac6e8e-4691-4731-ab2f-bdb085d34918": "0ef87da9-3387-4a41-b71b-a988cb8af4ad",
    "523c0153-9db3-4402-a231-f02df2dc6829": "a260e2f5-e936-45f5-8a6b-56fbf9054697",
    "8c30cbda-0f6d-41af-8f00-088d59c53afa": "33c651d7-53b8-432d-b4b0-3d8411078d2c",
    "34806888-7a22-4cba-b6a7-444ee7d15113": "9e66145e-46ba-4c98-a369-214a4b45083e",
    "0f4e84bc-b6c1-4f73-b9c6-b497bafdc3d5": "cd7fb376-1a07-449a-a23c-9b313dbcf0de",
    "acf0e4fd-aaa1-4e5e-9c30-1082baec917f": "fa119b94-124d-4381-acff-98ef9438c243",
    "fe5137b3-bfca-4e56-8b80-4e3b4a633356": "6a6ccf47-5bc7-4957-bb0f-7b6aeb6fa5e3",
    "0e4e981d-9e3a-4a78-98e3-9b097ceac955": "5b41be86-2ed0-45ae-83eb-5a3dd76e1687",
    "fcf69e9b-25d3-4423-ab42-9841a277d099": "edd57a69-f464-4fca-b1c6-2ddf607e72bd",
    "fa226ec6-4af3-49e1-841c-873f9aa87464": "786048b9-fa71-4e18-9f70-3bc0ef132017",
    "90adb753-badb-4e98-be47-a5ae4d3ae7b0": "6ad3ebf4-6c6c-4d69-b7a4-ae0a4fc1b620"
  }, D = new Set(Object.values(U));
  function F(e) {
    return U[e] || e;
  }
  function Y(e) {
    const a = F(e);
    return D.has(a);
  }
  async function J(e, a) {
    const c = await (async function (e) {
      if (!Y(e)) return null;
      const a = F(e);
      try {
        const e = await q(() => window.LegacyTranspiler._import(`./${a}.ts`), [], "https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/c2815c263-BN1i-h5P.js");
        return e[`GALLERY_TRANSLATIONS_${a.replace(/-/g, "_").toUpperCase()}`] || e.default || null;
      } catch (c) {
        return null;
      }
    })(e);
    return c && (c[a] || c["en-US"]) || null;
  }
  const K = "/* LOCALE_PLACEHOLDER_START */";
  const X = (e, a) => (e => {
    if ("undefined" == typeof window || window === window.top) return e;
    const a = new URL(e);
    return (a.searchParams.set("utm_source", "embedded_artifact"), a.searchParams.set("utm_medium", "iframe"), a.searchParams.set("utm_campaign", "artifact_frame"), a.toString());
  })(`${e}/remixv2?uuid=${a}`), V = ({isOpen: t, onClose: s, remixUrl: d, onRemixClick: f}) => e.jsx(o, {
    modalSize: "md",
    isOpen: t,
    onClose: s,
    children: e.jsxs("div", {
      className: "text-text-400 flex flex-col gap-6 pt-2 leading-relaxed",
      children: [e.jsxs("div", {
        className: "flex flex-col gap-2",
        children: [e.jsxs("h4", {
          className: "text-text-100 font-heading flex items-center gap-2",
          children: [e.jsx(a, {
            size: 28,
            weight: "light",
            className: "mb-1"
          }), e.jsx(c, {
            defaultMessage: "Customize Artifact",
            id: "J90k8xwxXE"
          })]
        }), e.jsx("p", {
          className: "text-text-300 pr-4",
          children: e.jsx(c, {
            defaultMessage: "Take this Artifact with you in a new chat with Claude and evolve it with your own unique spin.",
            id: "r2Qwbqbb9d"
          })
        }), e.jsx("p", {
          children: e.jsx(c, {
            defaultMessage: "Customizing an Artifact requires a Claude.ai account.",
            id: "nqpr0hOeKE"
          })
        })]
      }), e.jsxs("div", {
        className: "flex justify-end gap-2",
        children: [e.jsx(l, {
          variant: "secondary",
          onClick: s,
          children: e.jsx(c, {
            defaultMessage: "Cancel",
            id: "47FYwba+bI"
          })
        }), e.jsx(l, {
          href: d,
          target: "undefined" != typeof window && window === window.top ? "_self" : "_blank",
          variant: "primary",
          onLinkClick: f,
          children: e.jsx(c, {
            defaultMessage: "Customize this Artifact",
            id: "t8LDMCebfq"
          })
        })]
      })]
    })
  }), H = {
    blobStoreProjectId: "proj-published-artifacts-wj9p",
    blobStoreBucket: "prod_published_artifacts",
    blobStorageMode: "gcs",
    parentOrigin: "claude.ai",
    parentScheme: "https"
  }, {parentOrigin: Z, parentScheme: G} = H;
  function Q({artifactId: a, artifact: r}) {
    const {account: n} = x(), o = $(), P = u(), T = p();
    t.useEffect(() => {
      m();
    }, []);
    const q = I(), U = F(a), D = q.find(e => e.id === U), {didCopy: Y, copyToClipboard: J} = h(), K = r.type === j.Text, [H, Q] = t.useState(!1), [W, ee] = g("hasSeenRemixModal", !1), [ae, ce] = t.useState(!0), te = t.useRef(null), se = w({
      artifactContext: {
        uuid: a,
        type: "published_artifact"
      }
    }), de = _({
      artifactContext: {
        uuid: a,
        type: "published_artifact"
      }
    }), fe = t.useMemo(() => ({
      claudeComplete: se,
      storage: de
    }), [se, de]), {track: ie} = y(), be = t.useCallback(() => {
      ce(!1);
    }, []), re = t.useCallback(() => {
      ie({
        event_key: "artifact.interaction.click",
        artifact_id: a
      });
    }, [a, ie]), ne = X(`${G}://${Z}`, a);
    if (!D) return v();
    const oe = () => {
      ie({
        event_key: "artifact.studio.remix",
        artifact_id: a
      });
    };
    return n ? o ? e.jsxs(e.Fragment, {
      children: [e.jsxs("div", {
        className: T ? "flex-1 overflow-y-auto min-h-0" : void 0,
        children: [e.jsx(k, {
          narrow: !0,
          large: !0,
          children: e.jsxs(S, {
            href: "/artifacts",
            className: " text-text-200 hover:text-text-000 flex items-center gap-1 font-base",
            children: [e.jsx(s, {
              size: 16
            }), e.jsx(c, {
              defaultMessage: "Back",
              id: "cyR7KhiuaU"
            })]
          })
        }), e.jsxs(A, {
          narrow: !0,
          children: [e.jsxs("div", {
            className: "flex items-center mb-4 font-base",
            children: [e.jsx("div", {
              className: "w-6 h-6 rounded-full flex items-center justify-center mr-2 bg-bg-000 border-0.5 border-border-300",
              children: e.jsx(B, {
                size: 12
              })
            }), e.jsx(c, {
              defaultMessage: "Anthropic",
              id: "LftgYRq5hB"
            })]
          }), e.jsxs("div", {
            className: "flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8",
            children: [e.jsxs("div", {
              children: [e.jsx("h1", {
                className: "font-xl-bold mb-1",
                children: D.name
              }), e.jsx("p", {
                className: "text-text-500 font-base",
                children: D.description
              })]
            }), W ? e.jsx(l, {
              href: ne,
              target: P ? "_self" : "_blank",
              variant: "primary",
              prepend: e.jsx(d, {
                size: 16
              }),
              onLinkClick: oe,
              children: e.jsx(c, {
                defaultMessage: "Customize",
                id: "TXpOBiuxud"
              })
            }) : e.jsx(l, {
              type: "button",
              variant: "primary",
              onClick: () => {
                (oe(), ee(!0), Q(!0));
              },
              prepend: e.jsx(d, {
                size: 16
              }),
              children: e.jsx(c, {
                defaultMessage: "Customize",
                id: "TXpOBiuxud"
              })
            })]
          }), e.jsxs("div", {
            className: "border border-border-300 rounded-lg mb-8 w-full h-[550px] flex flex-col overflow-hidden",
            children: [e.jsxs("div", {
              className: "flex items-center justify-end border-b border-border-300 p-1 bg-bg-200",
              children: [ae ? e.jsx("div", {
                className: "flex h-8 w-8 items-center justify-center",
                children: e.jsx(L, {
                  size: "sm"
                })
              }) : e.jsx(z, {
                tooltipContent: "Refresh",
                children: e.jsx(l, {
                  variant: "ghost",
                  size: "icon_xs",
                  onClick: () => {
                    (ce(!0), te.current?.refresh());
                  },
                  children: e.jsx(f, {
                    size: 16
                  })
                })
              }), e.jsx(z, {
                tooltipContent: "Open in new tab",
                children: e.jsx("span", {
                  children: e.jsx(l, {
                    variant: "ghost",
                    size: "icon_xs",
                    href: D.link || `https://claude.ai/public/artifacts/${a}${P ? "?open_in_browser=1" : ""}`,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "ml-1",
                    children: e.jsx(i, {
                      size: 16
                    })
                  })
                })
              })]
            }), e.jsx(O, {
              isOpen: !0,
              content: r.content,
              type: r.type,
              language: r.language,
              showRaw: K,
              isCurrentStreaming: !1,
              zoom: .75,
              richSandboxRef: te,
              onSandboxConfirmation: be,
              richSandboxCapabilities: fe,
              onTrackInteraction: re,
              artifactContext: {
                uuid: a,
                type: "published_artifact"
              },
              ArtifactMcpModal: M
            })]
          }), D.startingPrompt && e.jsxs("div", {
            className: "grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20",
            children: [e.jsxs("div", {
              className: "lg:col-span-9",
              children: [e.jsx("h2", {
                className: "font-large-bold mb-4 text-text-300",
                children: e.jsx(c, {
                  defaultMessage: "About",
                  id: "g5pX+amkR+"
                })
              }), e.jsxs("div", {
                className: "bg-bg-200 p-5 rounded-lg border-0.5 border-border-300",
                children: [e.jsxs("div", {
                  className: "flex items-center justify-between mb-2",
                  children: [e.jsx("h3", {
                    className: "font-large-bold text-text-300",
                    children: e.jsx(c, {
                      defaultMessage: "Starting prompt",
                      id: "25qqVnl36a"
                    })
                  }), e.jsx(z, {
                    tooltipContent: "Copy prompt",
                    children: e.jsx(l, {
                      variant: "ghost",
                      size: "icon_sm",
                      onClick: async () => {
                        (ie({
                          event_key: "artifact.studio.copy_prompt",
                          artifact_id: a
                        }), await J(D.startingPrompt));
                      },
                      children: e.jsx(R, {
                        didCopy: Y,
                        size: 16
                      })
                    })
                  })]
                }), e.jsx("div", {
                  className: "text-text-300 text-sm font-base",
                  children: e.jsx(E, {
                    text: D.startingPrompt,
                    unsafeAllowNavigationWithoutConfirmation: !1
                  })
                })]
              })]
            }), e.jsxs("div", {
              className: "lg:col-span-3",
              children: [e.jsx("h2", {
                className: "font-large-bold mb-4 text-text-300",
                children: e.jsx(c, {
                  defaultMessage: "Keep learning",
                  id: "xbqZcP1mj3"
                })
              }), D.chatId && e.jsx("div", {
                className: "mb-2",
                children: e.jsx(l, {
                  variant: "secondary",
                  append: e.jsx(b, {
                    size: 16
                  }),
                  href: `https://claude.ai/share/${D.chatId}${P ? "?open_in_browser=1" : ""}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  onLinkClick: () => {
                    ie({
                      event_key: "artifact.studio.view_full_chat",
                      artifact_id: a
                    });
                  },
                  children: e.jsx(c, {
                    defaultMessage: "View full chat",
                    id: "+ABFbc1tiw"
                  })
                })
              }), e.jsx(l, {
                variant: "secondary",
                append: e.jsx(b, {
                  size: 16
                }),
                href: "https://support.anthropic.com/articles/11649427-use-artifacts-to-visualize-and-create-ai-apps-without-ever-writing-a-line-of-code",
                target: "_blank",
                rel: "noopener noreferrer",
                children: e.jsx(c, {
                  defaultMessage: "Artifacts guide",
                  id: "fcduYRp+tF"
                })
              })]
            })]
          })]
        })]
      }), e.jsx(V, {
        isOpen: H,
        onClose: () => Q(!1),
        remixUrl: ne
      })]
    }) : e.jsx(N, {}) : e.jsx(C, {
      to: "/"
    });
  }
  function W() {
    const a = P().id, {locale: c} = r(), t = n({
      queryKey: ["spa_inspiration_artifact", {
        artifactId: a,
        locale: c
      }],
      queryFn: async () => {
        const e = await fetch(`/public/artifacts/${a}/json`);
        if (!e.ok) throw new Error(`Artifact fetch failed: ${e.status}`);
        const t = await e.json();
        return (async function (e, a, c) {
          if ("en-US" === c || !Y(e)) return a;
          const t = await J(e, c);
          if (!t) return a;
          if (!a.content.match(/const\s+TRANSLATIONS\s*=\s*(\{[\s\S]*?\});/)) return a;
          let s = a.content;
          if ("es-ES" !== c) {
            const e = s.indexOf(K), a = s.indexOf("/* LOCALE_PLACEHOLDER_END */");
            if (-1 !== e && -1 !== a) {
              const d = s.substring(0, e + 30), f = s.substring(a);
              s = d + `\n  "${c}": ${JSON.stringify(t, null, 4)}\n  ` + f;
            }
          }
          return (s = s.replace(new RegExp((String.raw)`const\s+appLocale\s*=\s*'\{\{APP_LOCALE\}\}';`), `const appLocale = '${c}';`), {
            ...a,
            content: s
          });
        })(a, t, c);
      },
      enabled: Boolean(a),
      staleTime: 1 / 0
    });
    return t.isError ? e.jsx(N, {}) : t.isLoading || !t.data ? e.jsx(T, {}) : e.jsx(Q, {
      artifactId: a,
      artifact: t.data
    });
  }
  window.LegacyTranspiler._moduleExports["https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/c2815c263-BN1i-h5P.js"] = {
    ArtifactsInspirationRoute: W
  };
})();
