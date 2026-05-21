"""Utilitaire LLM avec repli template si pas de clé API."""

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.config import get_settings


def get_chat_model() -> ChatOpenAI | None:
    settings = get_settings()
    if not settings.openai_api_key:
        return None
    return ChatOpenAI(model=settings.openai_model, api_key=settings.openai_api_key)


def generate_text(system: str, user: str, fallback: str) -> str:
    llm = get_chat_model()
    if llm is None:
        return fallback
    response = llm.invoke([SystemMessage(content=system), HumanMessage(content=user)])
    return response.content
