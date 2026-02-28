/**
 * Mascot controller. Wires physics, sprite, and drag together.
 * Plain JS — no imports. Depends on: physics.js, stateMachine.js,
 *            sprite.js, dragController.js (all loaded before this).
 *
 * Usage (from messageListener.js):
 *   var pet = new window.PZAnteater({ spriteUrl: '...' });
 *   pet.spawn();
 *   pet.despawn();
 */

(function () {

  var STATES = PZStateMachine.STATES;
  var DIR    = PZStateMachine.DIR;

  /**
   * @param {object} opts
   * @param {string} [opts.spriteUrl]  — URL to the sprite sheet PNG (when we have it)
   * @param {number} [opts.spawnX]     — initial x position (default: center)
   * @param {number} [opts.spawnY]     — initial y position (default: -64, above screen)
   */
  function Anteater(opts) {
    opts = opts || {};
    this._spriteUrl = opts.spriteUrl || null;
    this._spawnX    = opts.spawnX    != null ? opts.spawnX : Math.floor(window.innerWidth / 2 - 32);
    this._spawnY    = opts.spawnY    != null ? opts.spawnY : -64;

    this._body   = null;
    this._fsm    = null;
    this._sprite = null;
    this._drag   = null;

    this._rafId    = null;
    this._lastTime = null;
    this._active   = false;
  }

  Anteater.prototype.spawn = function () {
    if (this._active) return;
    this._active = true;

    // Build physics body
    this._body = new PZPhysics.PhysicsBody(this._spawnX, this._spawnY);

    // Build state machine
    this._fsm = new PZStateMachine.StateMachine();

    // Build sprite (DOM element)
    this._sprite = new PZSprite.Sprite(this._spriteUrl);
    this._sprite.mount();

    // Attach drag controller after sprite is in the DOM
    this._drag = new PZDrag.DragController(this._sprite.el, this._body, this._fsm);
    this._drag.attach();

    // Start game loop ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    this._lastTime = performance.now();
    this._rafId = requestAnimationFrame(this._loop.bind(this));

    console.log('anteater spawned');
  };

  Anteater.prototype.despawn = function () {
    if (!this._active) return;
    this._active = false;

    if (this._rafId !== null) cancelAnimationFrame(this._rafId);
    if (this._drag)   this._drag.detach();
    if (this._sprite) this._sprite.unmount();

    this._body   = null;
    this._fsm    = null;
    this._sprite = null;
    this._drag   = null;
    this._rafId  = null;

    console.log('anteater despawned');
  };

  Anteater.prototype.isActive = function () {
    return this._active;
  };

  // Game Loop ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  Anteater.prototype._loop = function (timestamp) {
    if (!this._active) return;

    // Cap dt to 50ms to avoid spiral-of-death after tab sleep/resume
    var dt = Math.min(timestamp - this._lastTime, 50);
    this._lastTime = timestamp;

    this._tick(dt);
    this._rafId = requestAnimationFrame(this._loop.bind(this));
  };

  Anteater.prototype._tick = function (dt) {
    var body = this._body;
    var fsm  = this._fsm;
    var vw   = window.innerWidth;
    var vh   = window.innerHeight;
    var isDragging = (fsm.state === STATES.DRAGGED);

    // 1. Advance state machine
    fsm.update(dt, body);

    // 2. Apply locomotion velocity based on current state
    if (fsm.state === STATES.WALKING) {
      body.applyWalkVelocity(fsm.direction);
    } else if (fsm.state === STATES.LANDING || fsm.state === STATES.IDLE) {
      body.vx = 0;
      // Keep vy = 0 only if on ground — ground resolution handles it otherwise
      if (body.onGround) body.vy = 0;
    }
    // FALLING / THROWN: gravity + integration handled by physics.step()
    // DRAGGED: drag controller sets body.x/y directly, physics.step() is no-op

    // 3. Step physics
    body.step(vw, vh, isDragging);

    // 4. Render
    this._sprite.update(body.x, body.y, fsm.state, fsm.direction, dt);
  };

  // Expose globally
  window.PZAnteater = Anteater;
})();