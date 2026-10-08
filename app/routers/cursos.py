"""Router de cursos solicitado por la Tarea Semana 2.

En el modelo actual de la API, el recurso equivalente a "Curso" se llama
"Asignatura". Reexportamos su router para conservar exactamente los mismos
endpoints, validaciones y reglas de negocio sin duplicar código.
"""
from app.routers.asignaturas import router

__all__ = ["router"]
