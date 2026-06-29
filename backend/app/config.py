import os

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./englishworld.db")

# Audio
AUDIO_DIR = os.path.join(os.path.dirname(__file__), "..", "audio")

# Game settings
INITIAL_COINS = 50
INITIAL_LEVEL = 1
COMBO_BONUS_THRESHOLD = 5
COMBO_DOUBLE_THRESHOLD = 10

# Pet decay
PET_DECAY_INTERVAL_HOURS = 6
PET_DECAY_RATE = 5.0
PET_MAX_DECAY_CYCLES = 4

# Review intervals in days
REVIEW_INTERVALS = [1, 3, 7, 14, 30]
REVIEW_MAX_STAGE = 5
REVIEW_BONUS_COIN_MULTIPLIER = 1.5
REVIEW_AUTO_TRIGGER_COUNT = 5
