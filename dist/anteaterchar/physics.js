/*
*TUNING CONSTANTS:
 *   GRAVITY          acceleration per frame (px/frame²)
 *   TERMINAL_VEL     max fall speed
 *   WALK_SPEED       horizontal walk speed
 *   FRICTION         velocity damping when landing after a throw
 *   THROW_AIR_DAMP   velocity multiplier per frame while airborne after throw
 *   MAX_THROW_SPEED  caps release velocity so it doesn't fly off screen
 *   BOUNCE_FACTOR    how much vertical velocity bounces off floor (0 = no bounce)
 */

var PZPhysics = (function () {
  var GRAVITY         = 0.25;
  var TERMINAL_VEL    = 20;
  var WALK_SPEED      = 0.5;
  var FRICTION        = 0.80;
  var THROW_AIR_DAMP  = 0.97;
  var MAX_THROW_SPEED = 22;
  var BOUNCE_FACTOR   = 0.28;
  var BOUNCE_STOP     = 1.2; // vy below this → stop bouncing

  /**
   * PhysicsBody
   * Tracks position, velocity, and flags for one mascot instance.
   */

  function PhysicsBody(x, y, w, h) {
    this.x        = x;
    this.y        = y;
    this.vx       = 0;
    this.vy       = 0;
    this.w        = w || 64;
    this.h        = h || 64;
    this.onGround = false;
    this.thrown   = false;
  }

  /**
   * step(body, viewportW, viewportH, state)
   *
   * Advance physics by one frame.
   * Does NOT mutate velocity for WALKING — the state machine does that.
   * Does NOT mutate anything while DRAGGED.
   */
  PhysicsBody.prototype.step = function (viewportW, viewportH, isDragging) {
    if (isDragging) return this;

    // Gravity
    if (!this.onGround) {
      this.vy = Math.min(this.vy + GRAVITY, TERMINAL_VEL);
    }

    // Air damping when thrown
    if (this.thrown) {
      this.vx *= THROW_AIR_DAMP;
      this.vy *= THROW_AIR_DAMP;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Collision
    var floorY = viewportH - this.h;

    // Floor
    if (this.y >= floorY) {
      this.y = floorY;
      if (this.thrown) {
        var bounced = -this.vy * BOUNCE_FACTOR;
        if (Math.abs(bounced) < BOUNCE_STOP) {
          this.vy = 0;
          this.thrown = false;
        } else {
          this.vy = bounced;
        }
        this.vx *= FRICTION;
      } else {
        this.vy = 0;
      }
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // Left wall
    if (this.x < 0) {
      this.x = 0;
      if (this.thrown) this.vx = Math.abs(this.vx) * 0.5;
    }

    // Right wall
    if (this.x + this.w > viewportW) {
      this.x = viewportW - this.w;
      if (this.thrown) this.vx = -Math.abs(this.vx) * 0.5;
    }

    // Ceiling
    if (this.y < 0) {
      this.y = 0;
      if (this.vy < 0) this.vy = Math.abs(this.vy) * 0.3;
    }

    return this;
  };

  /**
   * applyWalkVelocity(body, direction)
   * Sets vx for walking. direction: 1 = right, -1 = left.
   */
  PhysicsBody.prototype.applyWalkVelocity = function (direction) {
    this.vx = WALK_SPEED * direction;
    this.vy = 0;
  };

  /**
   * applyThrow(body, vx, vy)
   * Launches the body with the given velocity (from drag release).
   */
  PhysicsBody.prototype.applyThrow = function (vx, vy) {
    this.vx = Math.max(-MAX_THROW_SPEED, Math.min(MAX_THROW_SPEED, vx));
    this.vy = Math.max(-MAX_THROW_SPEED, Math.min(MAX_THROW_SPEED, vy));
    this.thrown   = true;
    this.onGround = false;
  };

  return { PhysicsBody: PhysicsBody };
})();
