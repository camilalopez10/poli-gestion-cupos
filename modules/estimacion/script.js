document.getElementById("form-estimacion").addEventListener("submit", async (e) => {
  e.preventDefault();
  const params = new URLSearchParams(new FormData(e.target));

  const res = await fetch("modules/estimacion/calcular.php?" + params);
  const data = await res.json();

  const div = document.getElementById("resultado");
  if (data.error) {
    div.innerHTML = `<p style="color:red;">${data.error}</p>`;
    return;
  }

  div.innerHTML = `
    <h3>Resultado</h3>
    <p><b>Asignatura:</b> ${data.asignatura}</p>
    <p><b>Año:</b> ${data.anio}</p>
    <p><b>Período:</b> ${data.periodo}</p>
    <p><b>Matriculados Previos:</b> ${data.matriculados_previos}</p>
    <p><b>Cupos Estimados:</b> ${data.cupos_calculados}</p>
  `;

  const ctx = document.getElementById("graficoCupos").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Matriculados", "Cupos Estimados"],
      datasets: [{
        label: "Comparativa",
        data: [data.matriculados_previos, data.cupos_calculados],
        backgroundColor: ["#2E7D32", "#81C784"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
});
