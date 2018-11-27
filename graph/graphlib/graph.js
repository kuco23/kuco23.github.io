function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function getNorm(vec) {
  return Math.pow(Math.pow(vec[0], 2) + Math.pow(vec[1], 2), 0.5);
}

function Graph(context,
  node_color='black', edge_color='rgba(0, 0, 0, 0.5)',
  node_radius = 6, edge_width = 2) {

  this.context = context;
  this.node_color = node_color; this.edge_color = edge_color;
  this.node_radius = node_radius; this.edge_width = edge_width;
  this.node_placeholder_color = 'rgba(0, 0, 0, 0.2)';

  this.matrix = []

  this.nodeCreationMode = false;
  this.nodeSelectionMode = false;
  this.selectedNodeA = null;
  this.selectedNodeB = null;
  this.selection_color = 'red';

  this.algosAnimDelay = 1000;
  this.algosStartNode = null;
  this.algosSelectionNodeColor = 'purple';

  this.dfsMode = false;
  this.dfs_node_color = 'blue';
  this.dfs_forward_edge_color = 'lime';
  this.dfs_backtrack_edge_color = 'red';

  this.bfsMode = false;
  this.bfs_node_color = 'blue';
  this.bfs_forward_edge_color = 'lime';
  this.bfs_backtrack_edge_color = 'red';

  this.shortestDistMode = false;
  this.shortestDistSource = null;
  this.shortestDistSink = null;
  this.shortestDistEdgeColor = 'lime';

  // this is set to true during animation
  this.lockdown = false;

  function drawLine(context, x1, y1, x2, y2, linewidth, linecolor) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineWidth = linewidth;
    context.strokeStyle = linecolor;
    context.stroke();
  }
  function drawLineBetween(context, node1, node2, linewidth, linecolor) {
    drawLine(context, node1.x, node1.y,
      node2.x, node2.y, linewidth, linecolor);
  }
  function drawCircle(context, x, y, r, color, fill=true) {
    context.beginPath();
    context.arc(x, y, r, 0, 2 * Math.PI);
    if (fill) {
      context.fillStyle = color;
      context.fill();
    } else {
      context.strokeStyle = color;
      context.stroke();
    }
  }
  function Node(context, x, y, i, j, radius, color, placeholder_color) {
    this.context = context;
    this.x = x; this.y = y; this.radius = radius;
    this.i = i; this.j = j;
    this.color = color; this.placeholder_color = placeholder_color;
    this.neighbours = [];
    this.create = function(color=this.color) {
      drawCircle(this.context, this.x, this.y,
        this.radius, color, true);
    };
    this.delete = function() {
      this.context.clearRect(this.x - radius,
        this.y - radius, 2 * radius, 2 * radius);
      drawCircle(this.context, this.x, this.y,
        this.radius, this.placeholder_color);
    };
    this.create()
  }
  this.getPositionByIndex = function(i, j) {
    return [this.marginSideX + j * (this.node_margin + 2 * this.node_radius),
            this.marginSideY + i * (this.node_margin + 2 * this.node_radius)];
  };
  this.getIndexByPosition = function(x, y) { // O(1)
    let j = Math.round((x - this.marginSideX) / (this.node_margin + 2 * this.node_radius));
    let i = Math.round((y - this.marginSideY) / (this.node_margin + 2 * this.node_radius));
    let pos = this.getPositionByIndex(i, j);
    if (getNorm([x - pos[0], y - pos[1]]) <= this.node_radius * 3) {
      return [i, j];
    } return null;
  };
  this.clearNode = function(i, j) {
    if (0 <= i && i < this.matrix.length &&
    0 <= j && j < this.matrix[0].length &&
    this.matrix[i][j] !== null) {
      let node = this.matrix[i][j];
      this.matrix[i][j] = null;
      if (node == this.selectedNodeA) this.selectedNodeA = null;
      if (node == this.selectedNodeB) this.selctedNodeB = null;
      if (node == this.algosStartNode) this.algosStartNode = null;
      // delete the node from all the neighbours's neighbours lists
      for (let i = 0; i < node.neighbours.length; i++) {
        node.neighbours[i].neighbours.splice(node.neighbours[i].neighbours.indexOf(node), 1);
      }
      this.redraw();
    }
  };
  this.unselect = function() {
    if (this.selectedNodeA) {
      this.selectedNodeA.create();
      this.selectedNodeA = null;
    }
    if (this.selectedNodeB) {
      this.selectedNodeB.create();
      this.selectedNodeB = null;
    }
  }
  this.linkSelected = function() {
    if (this.selectedNodeA !== null && this.selectedNodeB !== null &&
    this.selectedNodeA.neighbours.indexOf(this.selectedNodeB) == -1) {
      this.selectedNodeA.neighbours.push(this.selectedNodeB);
      this.selectedNodeB.neighbours.push(this.selectedNodeA);
      drawLineBetween(this.context,
        this.selectedNodeA, this.selectedNodeB,
        this.edge_width, this.edge_color);
      this.unselect();
    }
  };
  this.unlinkSelected = function() {
    if (this.selectedNodeA !== null && this.selectedNodeB !== null) {
      let indA = this.selectedNodeA.neighbours.indexOf(this.selectedNodeB);
      let indB = this.selectedNodeB.neighbours.indexOf(this.selectedNodeA);
      if (indA == -1 || indB == -1) return null;
      this.selectedNodeA.neighbours.splice(indA, 1);
      this.selectedNodeB.neighbours.splice(indB, 1);
      this.redraw();
      this.unselect();
    }
  };
  this.handleClick = function(x, y) {
    let nodeIndex = this.getIndexByPosition(x, y);
    if (!nodeIndex || this.lockdown) return null;
    let i = nodeIndex[0]; let j = nodeIndex[1];
    let node = null; let free_space = null;
    if (this.matrix[i][j]) {
      node = this.matrix[i][j];
    } else {
      free_space = this.getPositionByIndex(i, j);
    }
    // save and mark the node that was selected
    if (this.nodeSelectionMode && node) {
      let color = null;
      if (this.selectedNodeA == node) {
        this.selectedNodeA = null;
        color = node.color;
      } else if (this.selectedNodeB == node) {
        this.selectedNodeB = null;
        color = node.color;
      } else if (this.selectedNodeA == null) {
        this.selectedNodeA = node;
        color = this.selection_color;
      } else if (this.selectedNodeB == null) {
        this.selectedNodeB = node;
        color = this.selection_color;
      } else {
        this.selectedNodeB.create();
        this.selectedNodeB = node;
        color = this.selection_color;
      }
      node.create(color);
    } else if (this.nodeCreationMode && free_space) {
      this.matrix[i][j] = new Node(this.context,
        free_space[0], free_space[1], i, j, this.node_radius,
        this.node_color, this.node_placeholder_color);
    } else if (this.nodeCreationMode && node) {
      this.clearNode(i, j); // one of two times where node is cleared
    } else if (this.dfsMode && node) {
      if (this.algosStartNode == node) {
        node.create();
        this.algosStartNode = null;
      } else {
        if (this.algosStartNode) this.algosStartNode.create();
        this.algosStartNode = node;
        node.create(this.algosSelectionNodeColor);
      }
    }
  };

  // this 'monkey patches' node with marked attribute and origin
  this.dfs = async function() {
    if (!this.algosStartNode) return null;
    this.lockdown = true;
    this.unselect(); // so there isn't much confusion
    this.algosStartNode.create();
    let stack = [this.algosStartNode];
    let root_tree = [null];
    while (stack.length) {
      let current_node = stack.splice(stack.length - 1, 1)[0];
      if (!current_node.marked) {
        // open current_node
        await sleep(this.algosAnimDelay);
        stack.push(current_node);
        root_tree.push(current_node);
        current_node.marked = true;
        for (let i = 0; i < current_node.neighbours.length; i++) {
          if (!current_node.neighbours[i].marked) {
            stack.push(current_node.neighbours[i]);
            current_node.neighbours[i].origin = current_node;
          }
        }
        current_node.create(this.dfs_node_color);
        if (current_node.origin) {
          drawLineBetween(this.context,
            current_node, current_node.origin,
            this.edge_width, this.dfs_forward_edge_color);
        }
      } else if (current_node == root_tree[root_tree.length - 1]) {
        // close current_node / backtrack
        await sleep(this.algosAnimDelay);
        root_tree.splice(root_tree.length - 1, 1);
        if (current_node.origin) {
          drawLineBetween(this.context,
            current_node, current_node.origin,
            this.edge_width, this.dfs_backtrack_edge_color);
          }
      } else {
        // cross edge
        undefined;
      }
    }
    this.lockdown = false;
    this.algosStartNode = null;
    this.cleanMonkeyPatch(['origin', 'marked']);
  };
  // finding the shortes path with bfs
  this.bfs = async function() {
    if (this.algosStartNode === null) return null;
    this.lockdown = true;
    this.unselect();
    this.algosStartNode.create(this.bfs_node_color);
    this.algosStartNode.distance = 0;
    let queue = [this.algosStartNode];
    while (queue.length) {
      let current_node = queue.splice(0, 1)[0];
      for (let i = 0; i < current_node.neighbours.length; i++) {
        let neighbour = current_node.neighbours[i];
        if (neighbour.distance === undefined) {
          await sleep(this.algosAnimDelay)
          neighbour.create(this.bfs_node_color);
          drawLineBetween(this.context, current_node, neighbour,
            this.edge_width, this.bfs_forward_edge_color);
          neighbour.distance = current_node.distance + 1;
          neighbour.parent = current_node;
          queue.push(neighbour);
        }
      }
    }
    this.lockdown = false;
    this.algosStartNode = null;
    this.cleanMonkeyPatch(['distance', 'parent']);
  };
  this.getShortestDistance = function() {
    if (!this.selectedNodeA || !this.selectedNodeB) return null;
    this.selectedNodeA.distance = 0;
    let queue = [this.selectedNodeA];
    while (queue.length) {
      let current_node = queue.splice(0, 1)[0];
      for (let i = 0; i < current_node.neighbours.length; i++) {
        let neighbour = current_node.neighbours[i];
        if (neighbour.distance === undefined) {
          neighbour.distance = current_node.distance + 1;
          neighbour.parent = current_node;
          queue.push(neighbour);
        }
      }
    }
    let stack = [this.selectedNodeB];
    while (true) {
      let current_node = stack[stack.length - 1].parent;
      stack.push(current_node);
      if (!current_node.parent) break;
    };
    for (let i = stack.length - 1; i > 0; i--) {
      drawLineBetween(this.context, stack[i], stack[i-1],
        this.edge_width, this.shortestDistEdgeColor);
    }
    this.cleanMonkeyPatch(['distance', 'parent']);
  };
  this.cleanMonkeyPatch = function(attrs) {
    for (let i = 0; i < this.matrix.length; i++) {
      for (let j = 0; j < this.matrix[0].length; j++) {
        if (this.matrix[i][j]) {
          for (let a = 0; a < attrs.length; a++) {
             this.matrix[i][j][attrs[a]] = undefined;
          }
        }
      }
    }
  };

  this.reset = function() {
    if (this.lockdown) return null;
    W = this.context.canvas.width; H = this.context.canvas.height;
    this.node_margin = 8 * this.node_radius;
    this.nodes_onX = Math.floor(W / (this.node_margin + 2 * this.node_radius));
    this.nodes_onY = Math.floor(H / (this.node_margin + 2 * this.node_radius));
    let space_leftX = W - (this.nodes_onX * (this.node_margin + 2 * this.node_radius));
    let space_leftY = H - (this.nodes_onY * (this.node_margin + 2 * this.node_radius));
    this.node_radius = node_radius;
    this.marginSideX = (this.node_margin + space_leftX) / 2;
    this.marginSideY = (this.node_margin + space_leftY) / 2;
    this.matrix = [];
    this.selectedNodeA = null;
    this.selectedNodeB = null;
    this.context.clearRect(0, 0, this.context.canvas.width,
      this.context.canvas.height);
    for (let i = 0; i < this.nodes_onY; i++) {
      this.matrix.push([]);
      for (let j = 0; j < this.nodes_onX; j++) {
        let posXY = this.getPositionByIndex(i, j);
        drawCircle(this.context, posXY[0], posXY[1], this.node_radius,
          this.node_placeholder_color, true);
        this.matrix[i].push(null);
      }
    }
  };
  this.redraw = function() {
    if (this.lockdown) return null;
    this.context.clearRect(0, 0, this.context.canvas.width,
      this.context.canvas.height);
    for (let i = 0; i < this.nodes_onY; i++) {
      for (let j = 0; j < this.nodes_onX; j++) {
        if (this.matrix[i][j] !== null) {
          let node = this.matrix[i][j];
          node.create();
          for (let k = 0; k < node.neighbours.length; k++) {
            let node2 = this.matrix[i][j].neighbours[k];
            drawLineBetween(this.context, node, node2,
              this.edge_width, this.edge_color);
          }
        } else {
          let pos = this.getPositionByIndex(i, j);
          drawCircle(this.context, pos[0], pos[1], this.node_radius,
            this.node_placeholder_color, true);
        }
      }
    }
    if (this.selectedNodeA) this.selectedNodeA.create(this.selection_color);
    if (this.selectedNodeB) this.selectedNodeB.create(this.selection_color);
    if (this.algosStartNode) this.algosStartNode.create(this.algosSelectionNodeColor);
  };
  this.reset();
}
