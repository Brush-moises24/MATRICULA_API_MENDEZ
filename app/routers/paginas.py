"""Páginas HTML del sistema académico."""
from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import FileResponse

router = APIRouter(tags=["Páginas"])
CARPETA_FRONTEND = Path(__file__).resolve().parents[2] / "frontend"


@router.get("/pagina", include_in_schema=False)
def pagina_principal():
    """Entrega la misma página HTML que usa el frontend principal."""
    return FileResponse(CARPETA_FRONTEND / "index.html")
