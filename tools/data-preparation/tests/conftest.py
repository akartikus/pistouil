import json
from pathlib import Path

import pytest

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.fixture
def types():
    return json.loads((FIXTURES / "place-types.json").read_text())


@pytest.fixture
def extract_path():
    return FIXTURES / "fuveau-mini.osm"
