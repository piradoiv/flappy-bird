function Flappy() {
    var location = createVector(width / 4, height / 2);
    var speed = createVector(0, 0);
    var acceleration = createVector(0, 0);
    var bird = assets.bird;
    var sprites = bird.sprites;
    var gravity = createVector(0, 0.15);

    this.flap = function() {
        if (status == 'game over') {
            status = 'playing';
            setup();
        }

        if (!canFlap) {
            return false;
        }

        if (location.y <= 0) {
            return false;
        }

        if (speed.mag() > 0) {
            speed.mult(0);
        }

        acceleration.add(createVector(0, -3));
    }

    this.update = function() {
        speed.add(acceleration);
        speed.add(gravity);
        speed.limit(3);
        acceleration.mult(0);

        if (location.y > height - 111 - 11) {
            location.y = height - 111 - 11;
            speed.mult(0);
            gameOver();
        }

        location.add(speed);
    }

    this.draw = function() {
        var sprite = sprites[frameCount % 3];
        if (speed.y > 1) {
            sprite = sprites[0];
        }
        push();
        translate(location.x, location.y);
        rotate(map(speed.y, -3, 3, -0.9, 0.9));
        image(img, -bird.w / 2, -bird.h / 2, bird.w, bird.h, sprite.x, sprite.y, bird.w, bird.h);
        pop();

        if (debug) {
            var b = this.bounds();
            push();
            noFill();
            stroke(0, 0, 255);
            rect(b.left, b.top, b.right - b.left, b.bottom - b.top);
            pop();
        }
    }

    this.bounds = function() {
        return {
            left: location.x - bird.w / 8,
            right: location.x + bird.w / 8,
            top: location.y - bird.h / 8,
            bottom: location.y + bird.h / 8
        };
    }

    this.pos = function() {
        return location;
    }
}

