import os
import pytest
from doc_chat_api.settings import Settings


def test_settings_loads_from_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DATABASE_URL", "postgresql://u:p@h:5432/d")
    monkeypatch.setenv("DOCUMENTS_BUCKET", "my-bucket")
    s = Settings()
    assert s.database_url == "postgresql://u:p@h:5432/d"
    assert s.documents_bucket == "my-bucket"
    assert s.aws_region == "us-east-1"  # default
    assert s.bedrock_model_id.startswith("us.anthropic.claude")  # default
