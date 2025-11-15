import random

# Lista de asignaturas
asignaturas = [
    "CBS00439", "CBS00505", "CBS00506", "CBS00437", "CBS00440",
    "CBS00441", "CBS00102", "CBS00512", "CBS00513", "CBS00443",
    # ... aquí pones toda la lista completa
]

# Configuración del generador
ANIOS = [2022, 2023]
PERIODOS = ["1", "2"]

def generar_registro(codigo, anio, periodo, base):
    """
    Genera datos realistas para una asignatura.
    """
    # Variación semestral (entre -5 y +8 estudiantes)
    matriculados = max(10, base + random.randint(-5, 8))
    
    # Tasas razonables
    aprobados = int(matriculados * random.uniform(0.60, 0.80))
    reprobados = int(matriculados * random.uniform(0.10, 0.25))
    cancelaciones = int(matriculados * random.uniform(0.03, 0.10))
    reingresos = random.randint(0, 3)
    tinterna = random.randint(0, 2)
    texterna = random.randint(0, 2)

    return f"""
INSERT INTO matriculas_historicas
(codigo_asignatura, anio, periodo, matriculados, aprobados, reprobados, cancelaciones, reingresos, transferencia_interna, transferencia_externa)
VALUES
('{codigo}', {anio}, '{periodo}', {matriculados}, {aprobados}, {reprobados}, {cancelaciones}, {reingresos}, {tinterna}, {texterna});
""".strip(), matriculados


print("-- GENERADOR DE MATRÍCULAS HISTÓRICAS --\n")

for codigo in asignaturas:
    # Matrícula base inicial entre 25 y 70
    base_matricula = random.randint(25, 70)

    for anio in ANIOS:
        for periodo in PERIODOS:
            insert_sql, base_matricula = generar_registro(codigo, anio, periodo, base_matricula)
            print(insert_sql)
            print()
