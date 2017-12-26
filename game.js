var img,
    assets,
    bg,
    flappy,
    tubes,
    score,
    debug,
    status,
    buffer,
    transparency,
    canFlap,
    targetHeightDiff,
    targetDistance,
    neuron,
    population,
    flapTimer,
    gameOverTimer;

function preload() {
    img = loadImage('flappy-assets.png');

    assets = {
        backgroundDay: {
            x: 0,
            y: 0,
            w: 287,
            h: 511
        },
        backgroundNight: {
            x: 292,
            y: 0,
            w: 287,
            h: 511
        },
        platform: {
            x: 584,
            y: 0,
            w: 335,
            h: 111,
        },
        bird: {
            w: 33,
            h: 23,
            sprites: [
                {x: 230, y: 762},
                {x: 230, y: 814},
                {x: 230, y: 866}
            ]
        },
        tubeUpDown: {
            x: 112,
            y: 646,
            w: 51,
            h: 319
        },
        tubeDownUp: {
            x: 168,
            y: 646,
            w: 51,
            h: 319
        },
        score: {
            w: 24,
            h: 35,
            digits: [
                {x: 992, y: 120},
                {x: 272, y: 910},
                {x: 584, y: 320},
                {x: 612, y: 320},
                {x: 640, y: 320},
                {x: 668, y: 320},
                {x: 584, y: 368},
                {x: 612, y: 368},
                {x: 640, y: 368},
                {x: 668, y: 368},
            ]
        },
        gameOver: {
            x: 790,
            y: 118,
            w: 191,
            h: 41
        },
        logo: {
            x: 702,
            y: 183,
            w: 177,
            h: 46
        },
        tap: {
            x: 584,
            y: 182,
            w: 113,
            h: 97
        }
    };

    population = [];
}

function setup() {
    frameRate(60);
    createCanvas(287, 511);
    buffer = createGraphics(width, height);
    flappy = new Flappy();
    tubes = [];
    transparency = 0;
    score = 0;
    debug = false;
    canFlap = true;
    loop();
}

function draw() {
    if (!neuron) {
        neuron = new Perceptron;
    }
    bg = assets.backgroundDay;
    image(img, 0, 0, bg.w, bg.h, bg.x, bg.y, bg.w, bg.h);
    var scores = false;

    if (frameCount % 180 == 0) {
        var y = random(-100, assets.tubeUpDown.h - 150);
        var tubeUp = new Tube(y + 230, false);
        var tubeDown = new Tube(y - 230, true);

        tubes.push(tubeUp);
        tubes.push(tubeDown);
    }


    for (var i = tubes.length - 1; i >= 0; i--) {
        var tub = tubes[i];
        if (tub.offScreen()) {
            tubes.splice(i, 1);
            continue;
        }

        if (tub.pos().x <= flappy.pos().x - assets.bird.w * 0.5 && tub.score()) {
            scores = true;
        }

        if (intersects(flappy.bounds(), tub.bounds())) {
            gameOver();
        }

        tub.update();
        tub.draw();
    }

    targetHeightDiff = -1;
    targetDistance = -1;
    for (var i = 0; i < tubes.length; i += 2) {
        if (targetDistance != -1 && targetHeightDiff != -1) {
            continue;
        }

        var tub = tubes[i];
        var d = tub.pos().x - flappy.pos().x;

        if (d > -assets.bird.w * 0.5) {
            targetHeightDiff = tub.bounds().top - flappy.bounds().top - 80;
            targetDistance = d;
        }
    }

    var shouldFlap = neuron.think([targetHeightDiff, targetDistance, 1]);
    if (shouldFlap) {
        flappy.flap();
    }

    if (scores === true) {
      score += 1;
    }

    var p = assets.platform;
    var px = -(frameCount % 48);
    image(img, px, height - p.h, p.w, p.h, p.x, p.y, p.w, p.h);

    flappy.update();
    flappy.draw();

    if (debug && targetHeightDiff) {
        text(targetHeightDiff, 25, 30);
    }

    if (debug && targetDistance) {
        text(targetDistance, 25, 60);
    }

    push();
    var textSize = assets.score.w * str(score).length;
    translate((width / 2) - (textSize / 2), 15);
    for (var i = 0; i < str(score).length; i++) {
        if (i > 0) {
            translate(assets.score.w, 0);
        }

        var digit = assets.score.digits[str(score)[i]];
        image(img, 0, 0, assets.score.w, assets.score.h, digit.x, digit.y, assets.score.w, assets.score.h);
    }
    pop();

    if (status == 'game over') {
        push();
        translate(width / 2 - assets.logo.w / 2, height / 2 - assets.logo.h / 2 - 150);
        image(img, 0, 0, assets.logo.w, assets.logo.h, assets.logo.x, assets.logo.y, assets.logo.w, assets.logo.h);
        pop();

        push();
        translate(width / 2 - assets.gameOver.w / 2, (height / 2 - assets.gameOver.h / 2) - 100);
        image(img, 0, 0, assets.gameOver.w, assets.gameOver.h, assets.gameOver.x, assets.gameOver.y, assets.gameOver.w, assets.gameOver.h);
        pop();

        push();
        translate(width / 2 - assets.tap.w / 2, height - assets.tap.h * 2 - 100);
        image(img, 0, 0, assets.tap.w, assets.tap.h, assets.tap.x, assets.tap.y, assets.tap.w, assets.tap.h);
        pop();
    }
}

function gameOver() {
    status = 'game over';
    canFlap = false;
    noLoop();

    var dna = neuron.getWeights();
    if (score > 0 && dna != [0, 0, 0]) {
        population.push({dna: neuron.getWeights(), score: score});
    }
    weights = nextGeneration();
    neuron = new Perceptron(weights, 0.01 + (1 / (population.length + 5)));

    clearTimeout(gameOverTimer);
    gameOverTimer = setTimeout(function() {
        canFlap = true;
        flappy.flap();
    }, 2000);
}

function keyPressed() {
    if (keyCode == UP_ARROW) {
        flappy.flap();
    }

    if (keyCode == 68) {
        debug = !debug;
    }
}

function mousePressed() {
    flappy.flap();
}

function intersects(a, b) {
    return (
        a.left < b.right &&
        a.right > b.left &&
        a.top < b.bottom &&
        a.bottom > b.top
    );
}

function nextGeneration() {
    if (population.length < 2) {
        return [random(-1, 1), random(-1, 1), random(-1, 1)];
    }

    var weights = [];
    var parents = [];
    var record = 0;

    for (var i = 0; i < population.length; i++) {
        var current = population[i];
        if (current.score > record) {
            record = current.score;
        }
    }

    var currentLoop = 0;
    while (parents.length != 2) {
        currentLoop++;
        var current = population[floor(random(population.length))];
        var ns = current.score / (record + 0.01);

        if (ns < random()) {
            parents.push(current.dna);
            continue;
        }

        if (currentLoop > 5000) {
            parents.push([random(-1, 1), random(-1, 1), random(-1, 1)]);
            continue;
        }
    }

    for (var i = 0; i < parents[0].length; i++) {
        weights[i] = parents[round(random())][i];
        if (random() < 0.02) {
            weights[i] = random(-1, 1);
        }
    }

    return weights;
}

