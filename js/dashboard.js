document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".module-card").forEach(card => {
        card.addEventListener("click", () => {
            const moduleName = card.getAttribute("data-module");
            loadModule(moduleName);
        });
    });
});

function loadModule(moduleName) {
    const cards = document.getElementById("dashboard-cards");
    const content = document.getElementById("module-content");

    cards.style.display = "none";
    content.style.display = "block";
    content.innerHTML = "<p>Cargando módulo...</p>";

    fetch(`modules/${moduleName}/index.php`)
        .then(r => {
            if (!r.ok) throw new Error(r.statusText);
            return r.text();
        })
        .then(html => {
            content.innerHTML = `
                <button id="back-btn" style="margin-bottom:10px; padding:6px 12px; cursor:pointer;">← Volver</button>
                ${html}
            `;
            document.getElementById("back-btn").addEventListener("click", () => {
                content.style.display = "none";
                cards.style.display = "block";
                content.innerHTML = "";
            });
        })
        .catch(err => {
            content.innerHTML = `<p>Error al cargar el módulo: ${err.message}</p>`;
        });
}
