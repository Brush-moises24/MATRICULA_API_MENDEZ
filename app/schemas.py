"""Compatibilidad: los esquemas principales viven en app.esquemas.

Se conserva este módulo para no romper los routers y clientes existentes.
"""
from app.esquemas import *  # noqa: F401,F403
