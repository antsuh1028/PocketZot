/**
 * WHEN SPRITE SHEET IS DONE:
 *   1. Put it at:  anteaterchar/assets/anteater.png  (ext root)
 *   2. Set SPRITE_URL below using the URL passed in from the content script
 *   3. Fill in the FRAMES map with { x, y } pixel offsets into the sheet (if one sheet, unless we do straight images?)
 *   4. Remove the placeholder emoji/color logic
 *
 * sprite sheet convention (based on shimeji)
 *   Each tile = TILE_SIZE × TILE_SIZE px (default 64)
 *   Row 0: Fall    (2 frames)
 *   Row 1: Land    (1 frame)
 *   Row 2: Walk    (4 frames — right-facing; left handled by CSS scaleX(-1))
 *   Row 3: Idle    (2 frames)
 *   Row 4: Dragged (1 frame)
 *   Row 5: Thrown  (1 frame)
 */


var PZSprite = (function () {

  var TILE = 88; // px per sprite tile

  // Map state name → array of { x, y } frame offsets in the sprite sheet
  //lined up for clarity
  var FRAMES = {
    FALLING : [{ x: 0,        y: 0 },        { x: TILE,     y: 0 }],
    LANDING : [{ x: TILE * 2, y: 0 }],
    WALKING : [{ x: 0,        y: TILE },     { x: TILE, y: TILE },
               { x: TILE * 2, y: TILE },     { x: TILE * 3, y: TILE }],
    IDLE    : [{ x: 0,        y: TILE * 2 }, { x: TILE, y: TILE * 2 }],
    DRAGGED : [{ x: 0,        y: TILE * 3 }],
    THROWN  : [{ x: TILE,     y: TILE * 3 }],
  };

  var FRAME_MS = {
    FALLING : 130,
    LANDING : 180,
    WALKING : 110,
    IDLE    : 450,
    DRAGGED : 999,
    THROWN  : 999,
  };

  var ASSETS = 'dist/anteaterchar/assets/';

  //FIXME: remove when using real sprite sheet
  var PLACEHOLDER = {
    FALLING : { image: ASSETS + 'Falling rotate -45 degree.png' },
    LANDING : { image: ASSETS + 'Plop.png' },
    WALKING : {
      walkLeft  : ASSETS + 'WALK LEFT.png',
      walkRight : ASSETS + 'WALK RIGHT.png',
    },
    IDLE    : { image: ASSETS + 'Idle State.png' },
    DRAGGED : {
      dragImages: {
        grab  : ASSETS + 'Grab State.png',
        left  : ASSETS + 'Drag Left.png',
        right : ASSETS + 'Drag Right.png',
      },
    },
    THROWN  : {
      throwImages: {
        left  : ASSETS + 'Drag Left.png',
        right : ASSETS + 'Drag Right.png',
      },
    },
  };

  function Sprite(spriteUrl) {
    this.el         = null;
    this._spriteUrl = spriteUrl || null; // null = use placeholder
    this._frame     = 0;
    this._frameMsElapsed = 0;
    this._lastState = null;
  }
  
  function resolveAssetPath(p) {
    if (!p) return p;
    if (/^(?:https?:|data:|chrome-extension:)/i.test(p)) return p;
    if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function') {
      try {
        var url = chrome.runtime.getURL(p);
        return url;
      } catch (e) { /* fallthrough */ }
    }
    try { return new URL(p, location.href).href; } catch (e) { return p; }
  }

  Sprite.prototype.mount = function () {
    if (this.el) return;

    var el = document.createElement('div');
    el.id = 'pocketzot-mascot';

    Object.assign(el.style, {
      position      : 'fixed',
      zIndex        : '2147483647',
      width         : TILE + 'px',
      height        : TILE + 'px',
      pointerEvents : 'auto',
      cursor        : 'grab',
      userSelect    : 'none',
      overflow      : 'visible',
      borderRadius  : '0',
      border        : 'none',
      outline       : 'none',
      boxShadow     : 'none',
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'center',
      fontSize      : '32px',
      backgroundColor: 'transparent',
      willChange    : 'transform, left, top', // GPU hint
    });

    if (this._spriteUrl) {
      el.style.backgroundImage  = 'url(' + this._spriteUrl + ')';
      el.style.backgroundRepeat = 'no-repeat';
    }

    this._hatEl = document.createElement('div');
    this._hatEl.id = 'pocketzot-hat';
    this._hatEl.style.cssText = 'position:absolute;top:-25px;left:50%;transform:translateX(-50%);width:100%;height:100%;pointer-events:none;display:flex;align-items:flex-start;justify-content:center;';
    el.appendChild(this._hatEl);
    this.el = el;
    document.body.appendChild(el);
    this._updateHatOverlay();
    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      var self = this;
      chrome.storage.onChanged.addListener(function (changes, area) {
        if (area === 'local' && changes.pocketzot_equipped_hat) self._updateHatOverlay();
      });
    }
  };

  Sprite.prototype._updateHatOverlay = function () {
    if (!this._hatEl) return;
    if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
    var self = this;
    chrome.storage.local.get('pocketzot_equipped_hat', function (data) {
      var hat = data && data.pocketzot_equipped_hat;
      self._hatEl.innerHTML = '';
      if (hat && hat.image_url) {
        var img = document.createElement('img');
        img.src = resolveAssetPath(hat.image_url);
        img.style.cssText = 'max-width:120%;max-height:80px;object-fit:contain;transform-origin:bottom center;';
        self._hatEl.appendChild(img);
      }
    });
  };

  Sprite.prototype.unmount = function () {
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this.el = null;
  };

  /**
   * update(x, y, state, direction, dt, body)
   * Called every animation frame. body optional (for THROWN velocity/rotation).
   */
  Sprite.prototype.update = function (x, y, state, direction, dt, body) {
    if (!this.el) return;

    // Position via left/top (GPU-composited with will-change)
    this.el.style.left = Math.round(x) + 'px';
    this.el.style.top  = Math.round(y) + 'px';

    // Transform: DRAGGED = none; FALLING = none; THROWN = rotate by velocity arc; else horizontal flip
    if (state === 'DRAGGED' || state === 'FALLING') {
      this.el.style.transform = 'none';
    } else if (state === 'THROWN' && body) {
      var vx = body.vx || 0;
      var vy = body.vy || 0;
      // Angle of velocity vector — follows the arc as it flies
      var angleRad = Math.atan2(vy, vx);
      var angleDeg = angleRad * (180 / Math.PI);
      this.el.style.transform = 'rotate(' + angleDeg + 'deg)';
    } else {
      // Images face left; walking right needs scaleX(-1) to face right
      this.el.style.transform = direction > 0 ? 'scaleX(-1)' : 'scaleX(1)';
    }

    if (this._spriteUrl) {
      this._advanceFrame(state, dt);
    } else {
      if (state === 'WALKING' || state === 'MOUSE_GRAB') {
        this._walkFootMsElapsed = (this._walkFootMsElapsed || 0) + dt;
        if (this._walkFootMsElapsed >= 500) {
          this._walkFootMsElapsed = 0;
          this._walkFoot = (this._walkFoot === 0 ? 1 : 0);
        }
        if (this._walkFoot === undefined) this._walkFoot = 0;
      } else {
        this._walkFootMsElapsed = 0;
        this._walkFoot = 0;
      }
      this._renderPlaceholder(state, direction, body);
    }
  };

  Sprite.prototype._renderPlaceholder = function (state, direction, body) {
    var p = PLACEHOLDER[state] || (state === 'MOUSE_GRAB' ? PLACEHOLDER.WALKING : null) || PLACEHOLDER.IDLE;
    // no background color — show PNG transparency
    this.el.style.backgroundColor = 'transparent';

    // DRAGGED: pick image by movement direction (no transform; images already oriented)
    // THROWN: pick image by throw direction (vx)
    // WALKING: alternate walk left / walk right every 500ms (foot forward); transform flips for right direction
    var img = p.image;
    if ((state === 'WALKING' || state === 'MOUSE_GRAB') && p && p.walkLeft && p.walkRight) {
      img = this._walkFoot ? p.walkRight : p.walkLeft;
    } else if (state === 'DRAGGED' && p.dragImages) {
      img = direction > 0 ? p.dragImages.right : (direction < 0 ? p.dragImages.left : p.dragImages.grab);
    } else if (state === 'THROWN' && p.throwImages && body) {
      var vx = body.vx || 0;
      img = vx >= 0 ? p.throwImages.right : p.throwImages.left;
    }

    if (img) {
      // show an image instead of an emoji (resolve path for extension/page)
      var url = resolveAssetPath(img);
      this.el.style.backgroundImage = 'url("' + url + '")';
      this.el.style.backgroundRepeat = 'no-repeat';
      this.el.style.backgroundPosition = 'center';
      this.el.style.backgroundSize = 'contain';
      this.el.textContent = '';
    } else {
      // clear any previous placeholder image and show emoji
      this.el.style.backgroundImage = 'none';
      this.el.textContent = p.emoji || '';
    }
  };

  Sprite.prototype._advanceFrame = function (state, dt) {
    var frames = FRAMES[state] || FRAMES.IDLE;
    var dur    = FRAME_MS[state] || 200;

    // Reset when state changes
    if (state !== this._lastState) {
      this._lastState       = state;
      this._frame           = 0;
      this._frameMsElapsed  = 0;
    }

    this._frameMsElapsed += dt;
    if (this._frameMsElapsed >= dur) {
      this._frameMsElapsed = 0;
      this._frame = (this._frame + 1) % frames.length;
    }

    var f = frames[this._frame];
    this.el.style.backgroundPosition = '-' + f.x + 'px -' + f.y + 'px';
  };

  return { Sprite: Sprite };
})();

