"""Router de resumen solicitado por la Tarea Semana 2.

La implementación existente está en reportes.py porque el proyecto actual
incluye varios reportes. Se reexporta el mismo router para no duplicar rutas.
"""
from app.routers.reportes import router

__all__ = ["router"]
