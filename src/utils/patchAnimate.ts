// iOS 13's Web Animations API (Element.animate) is present from 13.4 but much
// stricter than iOS 14+: it throws a TypeError on easings/options it can't
// parse — notably the CSS linear() easing that motion libraries generate for
// springs, and options like composite/pseudoElement. Libraries call animate()
// outside try/catch, so the throw escapes and crashes the app.
//
// We wrap animate() defensively: when the native call throws, retry with
// sanitized arguments (force a basic easing, drop unsupported options); if it
// still throws, return a no-op animation so booting never dies. When the native
// call succeeds (iOS 14+ or supported args) it is a transparent passthrough.

type AnimateOptions = number | KeyframeAnimationOptions | undefined;

function sanitizeOptions(options: AnimateOptions): AnimateOptions {
  if (typeof options !== 'object' || options === null) return options;
  const copy: KeyframeAnimationOptions = { ...options };
  if (typeof copy.easing === 'string') copy.easing = 'linear';
  delete copy.composite;
  delete copy.pseudoElement;
  delete copy.iterationComposite;
  return copy;
}

function noopAnimation(): Animation {
  const noop = function (): void { };
  let resolveFinished: (animation: Animation) => void = () => { };
  const finished = new Promise<Animation>((resolve) => { resolveFinished = resolve; });
  const animation: Animation = {
    finished,
    ready: finished,
    playState: 'finished',
    currentTime: 0,
    startTime: 0,
    playbackRate: 1,
    pending: false,
    replaceState: 'active',
    timeline: null,
    effect: null,
    id: '',
    onfinish: null,
    oncancel: null,
    onremove: null,
    play: noop,
    pause: noop,
    finish: noop,
    cancel: noop,
    reverse: noop,
    persist: noop,
    commitStyles: noop,
    updatePlaybackRate: noop,
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: function (): boolean { return false; },
    overallProgress: null
  };
  resolveFinished(animation);
  return animation;
}

export function patchAnimate(): void {
  if (typeof window === 'undefined' || typeof Element === 'undefined') return;

  const proto = Element.prototype;
  const native = proto.animate;
  if (typeof native !== 'function') return;

  Object.defineProperty(proto, 'animate', {
    configurable: true,
    writable: true,
    value: function (
      this: Element,
      keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
      options?: number | KeyframeAnimationOptions,
    ) {
      try {
        return native.call(this, keyframes, options);
      } catch {
        try {
          return native.call(this, keyframes, sanitizeOptions(options));
        } catch {
          return noopAnimation();
        }
      }
    },
  });
}
