function abrirJuego(ruta) {

    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        card.style.pointerEvents = "none";
    });

    document.body.style.opacity = "0.95";

    setTimeout(() => {
        window.location.href = ruta;
    }, 200);
}
