function Perceptron(dna = null, mutationRate = -1) {
    var weights = [random(-1, 1), random(-1, 1), random(-1, 1)];
    if (dna) {
        for (var i = 0; i < dna.length; i++) {
            weights[i] = dna[i];
            if (random(1) < mutationRate) {
                weights[i] = dna[i] += random(-0.05, 0.05);
            }
        }
    }

    this.think = function(inputs) {
        var sum = 0;
        for (var i = 0; i < inputs.length; i++) {
            sum += inputs[i] * weights[i];
        }

        return this.activation(sum);
    }

    this.activation = function(input) {
        return input > 0.06;
    }

    this.getWeights = function() {
        return weights;
    }
}

