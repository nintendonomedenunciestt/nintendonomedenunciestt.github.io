const soul = document.getElementById("soul");
const arena = document.getElementById("arena");
const hpText = document.getElementById("hp");
const message = document.getElementById("message");

let hp = 100;

let soulX = 290;
let soulY = 190;

const speed = 5;
const keys = {};

let gameRunning = true;

document.addEventListener("keydown", e => {
    keys[e.key] = true;
});

document.addEventListener("keyup", e => {
    keys[e.key] = false;
});

function moveSoul() {
    if (!gameRunning) return;

    if (keys["ArrowLeft"] || keys["a"]) soulX -= speed;
    if (keys["ArrowRight"] || keys["d"]) soulX += speed;
    if (keys["ArrowUp"] || keys["w"]) soulY -= speed;
    if (keys["ArrowDown"] || keys["s"]) soulY += speed;

    soulX = Math.max(0, Math.min(580, soulX));
    soulY = Math.max(0, Math.min(380, soulY));

    soul.style.left = soulX + "px";
    soul.style.top = soulY + "px";

    requestAnimationFrame(moveSoul);
}

moveSoul();

function createBone() {
    if (!gameRunning) return;

    const bone = document.createElement("div");
    bone.classList.add("bone");

    const x = Math.random() * 580;

    bone.style.left = x + "px";
    bone.style.top = "-80px";

    arena.appendChild(bone);

    let y = -80;

    const interval = setInterval(() => {
        if (!gameRunning) {
            clearInterval(interval);
            return;
        }

        y += 4;
        bone.style.top = y + "px";

        const boneRect = bone.getBoundingClientRect();
        const soulRect = soul.getBoundingClientRect();

        if (
            boneRect.left < soulRect.right &&
            boneRect.right > soulRect.left &&
            boneRect.top < soulRect.bottom &&
            boneRect.bottom > soulRect.top
        ) {
            hp -= 1;
            hpText.textContent = hp;

            if (hp <= 0) {
                loseGame();
            }
        }

        if (y > 450) {
            bone.remove();
            clearInterval(interval);
        }

    }, 16);
}

function loseGame() {
    gameRunning = false;
    message.textContent = "GAME OVER";
}

function winGame() {
    gameRunning = false;
    message.textContent = "¡Has sobrevivido a Sans!";
}

const attackSpawner = setInterval(() => {
    if (!gameRunning) {
        clearInterval(attackSpawner);
        return;
    }

    createBone();

}, 500);

setTimeout(() => {
    if (gameRunning) {
        winGame();
    }
}, 30000);
