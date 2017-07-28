        var cheight = 8 * window.innerHeight / 10;
        var cwidth = 8 * window.innerWidth / 10;
        var rgoal = 200;
        var ggoal = 200;
        var bgoal = 200;
        var rvalue = 200;
        var gvalue = 200;
        var bvalue = 200;
        var angle = 0;
        var xpos = 20;
        var ypos = 20;
        var direction = "forward";
        var paused = false;
        var run;
        var dArray = [];
        var backupds = [];
        var boxArray = [];
        var wormTail = [];
        var currentMap;
        var dead = false;
        var c = document.createElement("canvas");
        c.id = "canvas";
        c.style.width = cwidth + "px";
        c.style.height = cheight + "px";
        c.style.top = window.innerHeight / 10 + "px";
        c.style.left = window.innerWidth / 10 + "px";
        c.width = cwidth * 2;
        c.height = cheight * 2;
        document.body.appendChild(c);
        var ctx = c.getContext("2d");
        function calc(max, min) {
            return Math.ceil(Math.random() * (max - min) + min);
        };
        function keyDown(e) {
            if (e.which === 37) direction = "left";
            else if (e.which === 39) direction = "right";
            if (e.which === 82) {
                if (paused) {
                    ctx.putImageData(currentMap, 0, 0);
                    dArray = backupds;
                    xpos = 20;
                    ypos = 20;
                    angle = 0;
                    paused = false;
                    dead = false;
                }
            }
            if (e.which === 84) {
                if (paused) {
                    paused = false;
                }
                else {
                    paused = true;
                }
            }
        };
        function keyUp() {
            direction = "forward";
        };
        function isColor(data, i, r, g, b) {
            if (data[i] === r &&
                data[i + 1] === g &&
                data[i + 2] === b &&
                data[i + 3] === 255)
                return true;
            else return false;
        };
        function move(dir) {
            if (dir === "left") angle -= 0.08;
            else if (dir === "right") angle += 0.08;
            ypos += Math.sin(angle) * 5;
            xpos += Math.cos(angle) * 5;
            var newX = xpos;
            var newY = ypos;
            if (wormTail.length > 30) {
                wormTail.shift();
                wormTail.shift();
            }
            wormTail.push(newX);
            wormTail.push(newY);
        };
        function emptySquare(sx, sy, sw, sh) {
            var squares = ctx.getImageData(sx, sy, sw, sh).data;
            for (var i = 0; i < squares.length; i += 4) {
                if (squares[i] === 0 &&
                    squares[i + 1] === 0 &&
                    squares[i + 2] === 0 &&
                    squares[i + 3] === 255) {
                    return false;
                }
            }
            return true;
        };
        function deathAnim() {

            if (wormTail.length > 1) {
                wormTail.shift();
                wormTail.shift();
            }
            else if (wormTail.length > 0) wormTail.shift();
            else paused = true;
        };
        function Diamond(width, height) {
            this.xpos;
            this.ypos;
            this.width = width;
            this.height = height;
        };
        Diamond.prototype.position = function () {
            var possibleX = calc(cwidth * 2 - 40, 40);
            var possibleY = calc(cheight * 2 - 40, 40);
            while (!emptySquare(possibleX - 15, possibleY - 15, this.width + 30, this.height + 30)) {
                possibleX = calc(cwidth * 2 - 40, 40);
                possibleY = calc(cheight * 2 - 40, 40);
            }
            this.xpos = possibleX;
            this.ypos = possibleY;
        };
        Diamond.prototype.draw = function () {
            ctx.shadowColor = "white";
            ctx.fillStyle = "white";
            ctx.shadowBlur = 15;
            ctx.fillRect(this.xpos, this.ypos, this.width, this.height);
        };
        function clearDiamonds() {
            var backuparray = [];
            if (dArray.length === 0) {
                paused = true;
                angle = 0;
                xpos = 20;
                ypos = 20;
                setTimeout(init, 1000);
            }
            for (var i = 0; i < dArray.length; i++) {
                if (!(xpos < dArray[i].xpos + dArray[i].width + 15 &&
                    xpos > dArray[i].xpos - 15 &&
                    ypos < dArray[i].ypos + dArray[i].height + 15 &&
                    ypos > dArray[i].ypos - 15))
                    backuparray.push(dArray[i]);
            };
            if (backuparray.length < dArray.length)
                drawMap(boxArray, dArray, wormTail);
            dArray = backuparray;
        };
        function diamonds() {
            for (var i = 0; i < 15; i++) {
                var diamond = new Diamond(15, 15);
                diamond.position();
                dArray.push(diamond);
                backupds.push(diamond);
            }
        };
        function newSquare(unusedArea) {
            var sw = calc(cwidth / 2, 40);
            var sh = calc(cheight / 2, 40);
            var sx = calc(cwidth * 2 - sw - 40, 100);
            var sy = calc(cheight * 2 - sh - 40, 100);
            var area = sh * sw;
            ctx.fillStyle = "black";
            ctx.shadowColor = "black";
            ctx.shadowBlur = 10;
            if (unusedArea > 0) {
                if (emptySquare(sx - 45, sy - 45, sw + 90, sh + 90)) {
                    boxArray.push(sx);
                    boxArray.push(sy);
                    boxArray.push(sw);
                    boxArray.push(sh);
                    ctx.fillRect(sx, sy, sw, sh);
                    newSquare(unusedArea - area);
                } else newSquare(unusedArea);
            } else {
                diamonds();
                currentMap = ctx.getImageData(0, 0, cwidth * 2, cheight * 2);
            }
        };
        function edges() {
            if (xpos > cwidth * 2 - 5) {
                dead = true;
            }
            if (xpos < 5) {
                dead = true;
            }
            if (ypos > cheight * 2 - 5) {
                dead = true;
            }
            if (ypos < 5) {
                dead = true;
            }
            var front = ctx.getImageData(xpos + Math.cos(angle) * 12, ypos + Math.sin(angle) * 12, 1, 1).data;
            var left = ctx.getImageData(xpos + Math.cos(angle + Math.PI / 2) * 12, ypos + Math.sin(angle + Math.PI / 2) * 12, 1, 1).data;
            var right = ctx.getImageData(xpos + Math.cos(angle - Math.PI / 2) * 12, ypos + Math.sin(angle - Math.PI / 2) * 12, 1, 1).data;
            checkPixel(front);
            checkPixel(left);
            checkPixel(right);
        };
        function colorbg() {
            if (rvalue === rgoal && gvalue === ggoal && bvalue === bgoal) {
                rgoal = calc(230, 40);
                ggoal = calc(230, 40);
                bgoal = calc(230, 40);
            }
            if (rvalue < rgoal) rvalue += 1;
            else if (rvalue > rgoal) rvalue -= 1;
            if (gvalue < ggoal) gvalue += 1;
            else if (gvalue > ggoal) gvalue -= 1;
            if (bvalue < bgoal) bvalue += 1;
            else if (bvalue > bgoal) bvalue -= 1;
            return "rgb(" + rvalue + "," + gvalue + "," + bvalue + ")";
        };
        function randomMove() {
            var r = Math.random();
            if (r < 0.5) direction = "right";
            else direction = "left";
        };
        function ellipse(clear) {
            ctx.fillStyle = clear;
            ctx.strokeStyle = clear;
            ctx.shadowColor = "black";
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(xpos, ypos, 10, 0, 2 * Math.PI);
            ctx.fill();
        }
        function checkPixel(side) {
            for (var i = 0; i < side.length; i += 4) {
                if (side[i] === 0 &&
                    side[i + 1] === 0 &&
                    side[i + 2] === 0 &&
                    side[i + 3] === 255) {
                    dead = true;
                }
            }
        };
        function drawObstacle(x, y, w, h) {
            ctx.fillStyle = "black";
            ctx.shadowColor = "black";
            ctx.shadowBlur = 10;
            ctx.fillRect(x, y, w, h);
        };
        function drawDiamond(x, y, w, h) {
            ctx.fillStyle = "white";
            ctx.shadowColor = "white";
            ctx.shadowBlur = 15;
            ctx.fillRect(x, y, w, h);
        };
        function drawWorm(x, y, r) {
            ctx.fillStyle = "black";
            ctx.shadowColor = "black";
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, 2 * Math.PI);
            ctx.fill();
        };
        function drawMap(obstacles, diamonds, tail) {
            ctx.fillStyle = colorbg();
            ctx.fillRect(0, 0, cwidth * 2, cheight * 2);
            for (var i = 0; i < obstacles.length; i += 4) {
                drawObstacle(obstacles[i], obstacles[i + 1], obstacles[i + 2], obstacles[i + 3]);
            }
            for (var i = 0; i < diamonds.length; i++) {
                drawDiamond(diamonds[i].xpos, diamonds[i].ypos, 15, 15);
            }
            for (var i = 0; i < tail.length; i += 2) {
                drawWorm(tail[i], tail[i + 1], 10);
            }
        };
        document.addEventListener("keydown", keyDown);
        document.addEventListener("keyup", keyUp);
        function runGame() {
            run = setInterval(function () {
                if (!paused) {
                    if (!dead) {
                    clearDiamonds();
                    edges();
                    drawMap(boxArray, dArray, wormTail);
                    move(direction);
                    } else {
                        deathAnim();
                        drawMap(boxArray, dArray, wormTail);
                    }
                }
            }, 27);
        };
        function init() {
            cheight = 8 * window.innerHeight / 10;
            cwidth = 8 * window.innerWidth / 10;
            rgoal, ggoal, bgoal, rvalue, gvalue, bvalue = 200;
            direction = "forward";
            angle = 0;
            xpos, ypos = 20;
            run, currentMap;
            dArray, backupds, boxArray, wormTail = [];
            dead, paused = false;
            clearInterval(run);
            ctx.clearRect(0, 0, cwidth * 2, cheight * 2);
            newSquare(cwidth * cheight);
            ellipse("black");
            paused = false;
            setTimeout(function () {
                angle = 0;
                xpos = 20;
                ypos = 20;
                drawMap(boxArray, dArray, wormTail);
                runGame();
            }, 1000);
        };
        init();
