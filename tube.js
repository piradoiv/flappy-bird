function Tube(y, inv) {
    var tube = inv == true ? assets.tubeUpDown : assets.tubeDownUp;
    var location = createVector(width, y);
    var invert = inv;
    var scored = false;

    this.invert = invert;

    this.update = function() {
        location.x -= 1;
    }

    this.bounds = function(extra) {
        if (extra === true) {
            extra = invert == true ? 20 : -20;
        } else {
            extra = 0;
        }

        return {
            left: location.x,
            right: location.x + tube.w,
            top: location.y + extra,
            bottom: location.y + tube.h + extra
        };
    }

    this.draw = function() {
        push();
        translate(location.x, location.y);
        image(img, 0, 0, tube.w, tube.h, tube.x, tube.y, tube.w, tube.h);
        pop();

        if (debug) {
            var b = this.bounds();
            push();
            stroke(255, 0, 0);
            noFill();
            rect(b.left, b.top, b.right - b.left, b.bottom - b.top);
            pop();
        }
    }

    this.offScreen = function() {
        return location.x + tube.w < 0;
    }

    this.pos = function() {
        return location;
    }

    this.score = function() {
        if (!this.scored) {
            this.scored = true;
            return true;
        }

        return false;
    }
}


