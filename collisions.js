// Create a collision handler function
function handleCollisions(event) {
  const pairs = event.pairs;

  pairs.forEach((pair) => {
    const bodyA = pair.bodyA;
    const bodyB = pair.bodyB;

    const colorA = bodyA.render.fillStyle;
    const colorB = bodyB.render.fillStyle;
    var replicator = null;

    [bodyA, bodyB].forEach((element) => {
      if (isReplicator(element)) {
        replicator = element;
      }
    });

    // Check if the collision involves blob pairs that should be connected
    if (
      colorA === colorB &&
      isReplicator(bodyA) !== isReplicator(bodyB) &&
      countBlobConnections(replicator) <= checkReplicatorConnection(replicator)
    ) {
      const replicatorPosition = replicator.position;
      const otherBodyPosition =
        replicator === bodyA ? bodyB.position : bodyA.position;

      // Calculate the angle of the direction vector
      const angle = Matter.Vector.angle(replicatorPosition, otherBodyPosition);

      // Determine which side of the replicator the other body is on based on the angle
      let side = null;
      if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
        side = "right";
      } else if (angle >= Math.PI / 4 && angle < (3 * Math.PI) / 4) {
        side = "bottom";
      } else if (angle >= (3 * Math.PI) / 4 || angle < -(3 * Math.PI) / 4) {
        side = "left";
      } else {
        side = "top";
      }

      if (side == "top") {
        const constraint = Constraint.create({
          bodyA: bodyA,
          bodyB: bodyB,
          length: 60,
          stiffness: 0.8,
        });
        World.add(world, constraint);
        chainConstraints.push(constraint);
      }
    }
  });
}

function checkReplicatorConnection(replicator) {
  if (
    replicator.render.fillStyle === "red" ||
    replicator.render.fillStyle === "yellow"
  ) {
    return 1;
  } else {
    return 2; // Change to 2 to allow a maximum of two connections for other replicators
  }
}

// Function to generate allowed connections
// Function to generate allowed connections based on vicinity
function generateAllowedConnections(colors) {
  const allowedConnections = [];

  // Generate connections for adjacent colors
  for (let i = 0; i < colors.length - 1; i++) {
    allowedConnections.push({ color1: colors[i], color2: colors[i + 1] });
    allowedConnections.push({ color1: colors[i + 1], color2: colors[i] });
  }

  return allowedConnections;
}

// Function to check if two colors should be connected
function shouldConnect(colorA, colorB) {
  // Check if the pair of colors is in the allowed connections
  return allowedConnections.some(
    (connection) =>
      (connection.color1 === colorA && connection.color2 === colorB) ||
      (connection.color1 === colorB && connection.color2 === colorA)
  );
}
function isReplicator(body) {
  return replicators.some((replicator) => replicator.includes(body));
}
// Function to count the number of connections for a blob
function countBlobConnections(blob) {
  return chainConstraints.filter(
    (constraint) => constraint.bodyA === blob || constraint.bodyB === blob
  ).length;
}
