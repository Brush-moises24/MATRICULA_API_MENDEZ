"""Funciones de seguridad usadas por la autenticación.

La tarea de Semana 2 pide separar contraseñas y token de la API principal.
Esta versión conserva el mismo algoritmo didáctico que ya usaba el proyecto,
por lo que los usuarios existentes siguen funcionando.
"""
import hashlib


def hash_clave(clave: str) -> str:
    """Genera el hash SHA-256 de una contraseña (fines didácticos)."""
    return hashlib.sha256(clave.encode("utf-8")).hexdigest()
