import httpx
from app.config import settings

BASE_URL = "https://graph.facebook.com/v21.0"


async def _post(payload: dict) -> dict:
    url = f"{BASE_URL}/{settings.meta_wa_phone_number_id}/messages"
    headers = {"Authorization": f"Bearer {settings.meta_wa_token}", "Content-Type": "application/json"}
    async with httpx.AsyncClient() as client:
        r = await client.post(url, json=payload, headers=headers)
        r.raise_for_status()
        return r.json()


def _normalize_phone(phone: str) -> str:
    digits = "".join(c for c in phone if c.isdigit())
    if not digits.startswith("55"):
        digits = "55" + digits
    return digits


async def send_template(phone: str, template_name: str, variables: dict) -> str:
    components = []
    if variables:
        params = [{"type": "text", "text": str(v)} for v in variables.values()]
        components.append({"type": "body", "parameters": params})

    payload = {
        "messaging_product": "whatsapp",
        "to": _normalize_phone(phone),
        "type": "template",
        "template": {
            "name": template_name,
            "language": {"code": "pt_BR"},
            "components": components,
        },
    }
    result = await _post(payload)
    return result.get("messages", [{}])[0].get("id", "")


async def send_text(phone: str, text: str) -> str:
    payload = {
        "messaging_product": "whatsapp",
        "to": _normalize_phone(phone),
        "type": "text",
        "text": {"body": text},
    }
    result = await _post(payload)
    return result.get("messages", [{}])[0].get("id", "")
