from threading import Lock
from typing import Optional

from models.agents import StartupState


class StartupMemoryStore:
    """
    Simple thread-safe in-memory storage for FOUNDry startup workflows.

    Hackathon MVP only:
    data disappears when the FastAPI server restarts.
    """

    def __init__(self):
        self._startups: dict[str, StartupState] = {}
        self._lock = Lock()

    def save(
        self,
        state: StartupState,
    ) -> StartupState:
        """
        Create or replace a startup state.
        """

        with self._lock:
            self._startups[state.id] = state

        return state

    def get(
        self,
        startup_id: str,
    ) -> Optional[StartupState]:
        """
        Retrieve a startup workflow by ID.
        """

        with self._lock:
            return self._startups.get(startup_id)

    def delete(
        self,
        startup_id: str,
    ) -> bool:
        """
        Delete a startup workflow.
        """

        with self._lock:
            if startup_id not in self._startups:
                return False

            del self._startups[startup_id]

        return True

    def all(
        self,
    ) -> list[StartupState]:
        """
        Return all startup workflows.
        """

        with self._lock:
            return list(self._startups.values())


startup_store = StartupMemoryStore()