const suits = ["♠", "♥", "♦", "♣"];

const values = [
    "A", "2", "3", "4", "5", "6",
    "7", "8", "9", "10", "J", "Q", "K"
];

let deck = [];
let stock = [];
let waste = [];
let tableau = [];
let foundations = [[], [], [], []];
let draggedStack = null;

const tableauElement = document.getElementById("tableau");
const stockElement = document.getElementById("stock");
const wasteElement = document.getElementById("waste");

function createDeck() {

    deck = [];

    suits.forEach(suit => {

        values.forEach((value, index) => {

            deck.push({
                suit,
                value,
                rank: index + 1,
                color:
                    suit === "♥" || suit === "♦"
                        ? "red"
                        : "black",
                faceUp: false
            });

        });

    });

}

function shuffle(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] =
            [array[j], array[i]];
    }

}

function startGame() {

    document
        .getElementById("winScreen")
        .classList
        .add("hidden");

    createDeck();

    shuffle(deck);

    stock = [...deck];

    waste = [];

    foundations = [[], [], [], []];

    tableau = [];

    for (let col = 0; col < 7; col++) {

        tableau[col] = [];

        for (let row = 0; row <= col; row++) {

            const card = stock.pop();

            if (row === col) {
                card.faceUp = true;
            }

            tableau[col].push(card);

        }

    }

    render();

}

function isValidStack(cards) {

    if (cards.length <= 1) return true;

    for (let i = 0; i < cards.length - 1; i++) {

        const current = cards[i];
        const next = cards[i + 1];

        if (!current.faceUp || !next.faceUp) {
            return false;
        }

        if (current.color === next.color) {
            return false;
        }

        if (current.rank !== next.rank + 1) {
            return false;
        }

    }

    return true;

}

function createCardElement(card, columnIndex = null, cardIndex = null) {

    const div = document.createElement("div");

    div.classList.add("card");

    if (card.faceUp) {

        div.draggable = true;

        if (card.color === "red") {
            div.classList.add("red");
        }

        div.innerHTML = `
            <div>${card.value}</div>
            <div>${card.suit}</div>
        `;

        div.addEventListener("dragstart", e => {

            div.classList.add("dragging");

            if (columnIndex !== null) {

                const stack =
                    tableau[columnIndex]
                        .slice(cardIndex);

                if (!isValidStack(stack)) {

                    e.preventDefault();
                    return;

                }

                draggedStack = {
                    source: "tableau",
                    columnIndex,
                    cardIndex
                };

            } else {

                draggedStack = {
                    source: "waste",
                    card
                };

            }

            e.dataTransfer.setData("text/plain", "drag");

        });

        div.addEventListener("dragend", () => {
            div.classList.remove("dragging");
        });

        div.addEventListener("dblclick", () => {

            autoMoveToFoundation(card);

        });

    } else {

        div.classList.add("back");
        div.innerHTML = "🂠";

    }

    return div;

}

function render() {

    renderTableau();
    renderWaste();
    renderFoundations();

}

function renderTableau() {

    tableauElement.innerHTML = "";

    tableau.forEach((column, colIndex) => {

        const columnDiv =
            document.createElement("div");

        columnDiv.className = "column";

        columnDiv.addEventListener(
            "dragover",
            e => e.preventDefault()
        );

        columnDiv.addEventListener(
            "drop",
            e => {

                e.preventDefault();

                moveStack(colIndex);

            }
        );

        column.forEach((card, cardIndex) => {

            const cardDiv =
                createCardElement(
                    card,
                    colIndex,
                    cardIndex
                );

            cardDiv.style.top =
                (cardIndex * 30) + "px";

            columnDiv.appendChild(cardDiv);

        });

        tableauElement.appendChild(columnDiv);

    });

}

function renderWaste() {

    wasteElement.innerHTML = "";

    if (!waste.length) return;

    wasteElement.appendChild(
        createCardElement(
            waste[waste.length - 1]
        )
    );

}

function renderFoundations() {

    document
        .querySelectorAll(".foundation")
        .forEach((foundationDiv, index) => {

            foundationDiv.innerHTML = "";

            foundationDiv.addEventListener(
                "dragover",
                e => e.preventDefault()
            );

            foundationDiv.addEventListener(
                "drop",
                e => {

                    e.preventDefault();

                    moveToFoundation(index);

                }
            );

            const foundation =
                foundations[index];

            if (foundation.length) {

                foundationDiv.appendChild(
                    createCardElement(
                        foundation[
                            foundation.length - 1
                        ]
                    )
                );

            }

        });

}

stockElement.addEventListener(
    "click",
    () => {

        if (stock.length) {

            const card = stock.pop();

            card.faceUp = true;

            waste.push(card);

        } else {

            while (waste.length) {

                const card = waste.pop();

                card.faceUp = false;

                stock.unshift(card);

            }

        }

        render();

    }
);

function moveStack(targetColumnIndex) {

    if (!draggedStack) return;

    if (draggedStack.source === "waste") {

        moveWasteCardToColumn(
            draggedStack.card,
            targetColumnIndex
        );

        return;

    }

    const sourceColumn =
        tableau[
            draggedStack.columnIndex
        ];

    const movingCards =
        sourceColumn.slice(
            draggedStack.cardIndex
        );

    if (!isValidStack(movingCards)) {
        return;
    }

    const firstCard = movingCards[0];

    const targetColumn =
        tableau[targetColumnIndex];

    let validMove = false;

    if (targetColumn.length === 0) {

        validMove =
            firstCard.rank === 13;

    } else {

        const targetCard =
            targetColumn[
                targetColumn.length - 1
            ];

        validMove =
            targetCard.faceUp &&
            targetCard.color !== firstCard.color &&
            targetCard.rank === firstCard.rank + 1;

    }

    if (!validMove) return;

    sourceColumn.splice(
        draggedStack.cardIndex,
        movingCards.length
    );

    targetColumn.push(...movingCards);

    revealCards();

    render();

}

function moveWasteCardToColumn(card, columnIndex) {

    const column =
        tableau[columnIndex];

    let valid = false;

    if (column.length === 0) {

        valid = card.rank === 13;

    } else {

        const top =
            column[column.length - 1];

        valid =
            top.faceUp &&
            top.color !== card.color &&
            top.rank === card.rank + 1;

    }

    if (!valid) return;

    waste.pop();

    column.push(card);

    render();

}

function moveToFoundation(index) {

    let card = null;

    if (
        draggedStack &&
        draggedStack.source === "waste"
    ) {

        card = draggedStack.card;

        if (
            canMoveToFoundation(
                card,
                foundations[index]
            )
        ) {

            waste.pop();

            foundations[index].push(card);

        }

    } else if (
        draggedStack &&
        draggedStack.source === "tableau"
    ) {

        const sourceColumn =
            tableau[
                draggedStack.columnIndex
            ];

        if (
            draggedStack.cardIndex !==
            sourceColumn.length - 1
        ) {
            return;
        }

        card =
            sourceColumn[
                draggedStack.cardIndex
            ];

        if (
            canMoveToFoundation(
                card,
                foundations[index]
            )
        ) {

            sourceColumn.pop();

            foundations[index].push(card);

            revealCards();

        }

    }

    render();

    checkVictory();

}

function canMoveToFoundation(card, foundation) {

    if (foundation.length === 0) {

        return card.rank === 1;

    }

    const top =
        foundation[
            foundation.length - 1
        ];

    return (
        card.suit === top.suit &&
        card.rank === top.rank + 1
    );

}

function autoMoveToFoundation(card) {

    for (let i = 0; i < 4; i++) {

        if (
            canMoveToFoundation(
                card,
                foundations[i]
            )
        ) {

            removeCard(card);

            foundations[i].push(card);

            revealCards();

            render();

            checkVictory();

            return;

        }

    }

}

function removeCard(card) {

    tableau.forEach(column => {

        const index =
            column.findIndex(c =>
                c.suit === card.suit &&
                c.rank === card.rank
            );

        if (index !== -1) {
            column.splice(index, 1);
        }

    });

    const wasteIndex =
        waste.findIndex(c =>
            c.suit === card.suit &&
            c.rank === card.rank
        );

    if (wasteIndex !== -1) {
        waste.splice(wasteIndex, 1);
    }

}

function revealCards() {

    tableau.forEach(column => {

        if (column.length) {

            column[
                column.length - 1
            ].faceUp = true;

        }

    });

}

function checkVictory() {

    const total =
        foundations.reduce(
            (sum, foundation) =>
                sum + foundation.length,
            0
        );

    if (total === 52) {

        document
            .getElementById("winScreen")
            .classList
            .remove("hidden");

    }

}

document
    .getElementById("nuevoJuego")
    .addEventListener(
        "click",
        startGame
    );

startGame();
