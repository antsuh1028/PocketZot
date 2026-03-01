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

  var TILE = 32; // px per sprite tile

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

  // Placeholder: state → color & emoji 

  //FIXME: remove when using real sprite sheet
  var PLACEHOLDER = {
    FALLING : { color: '#ff6b35', emoji: '😱' },
    LANDING : { color: '#ff6b35', emoji: '💥' },
    WALKING : { color: '#f0b429', emoji: '🐜' },
    IDLE    : { color: '#4caf50', emoji: '😴' },
    DRAGGED : { color: '#9c27b0', emoji: '😮' },
    THROWN  : { color: '#e91e63', emoji: '🌀' },
  };

  function Sprite(spriteUrl) {
    this.el         = null;
    this._spriteUrl = spriteUrl || null; // null = use placeholder
    this._frame     = 0;
    this._frameMsElapsed = 0;
    this._lastState = null;
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
      overflow      : 'hidden',
      borderRadius  : '10px',
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'center',
      fontSize      : '32px',
      boxShadow     : '0 3px 10px rgba(0,0,0,0.25)',
      transition    : 'background-color 0.08s',
      willChange    : 'transform, left, top', // GPU hint
    });

    if (this._spriteUrl) {
      el.style.backgroundImage  = 'url(' + this._spriteUrl + ')';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundColor  = 'transparent';
      el.style.boxShadow        = 'none';
      el.style.borderRadius     = '0';
    }

    this.el = el;
    document.body.appendChild(el);
  };

  Sprite.prototype.unmount = function () {
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this.el = null;
  };

  /**
   * update(x, y, state, direction, dt)
   * Called every animation frame.
   */
  Sprite.prototype.update = function (x, y, state, direction, dt) {
    if (!this.el) return;

    // Position via left/top (GPU-composited with will-change)
    this.el.style.left = Math.round(x) + 'px';
    this.el.style.top  = Math.round(y) + 'px';

    // Horizontal flip
    this.el.style.transform = direction < 0 ? 'scaleX(-1)' : 'scaleX(1)';

    if (this._spriteUrl) {
      this._advanceFrame(state, dt);
    } else {
      this._renderPlaceholder(state);
    }
  };

  Sprite.prototype._renderPlaceholder = function (state) {
    var p = PLACEHOLDER[state] || PLACEHOLDER.IDLE;
    this.el.style.backgroundColor = p.color;
    this.el.textContent = p.emoji;
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