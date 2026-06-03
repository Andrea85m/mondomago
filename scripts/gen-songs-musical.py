#!/usr/bin/env python3
"""
Generate musical instrumental song files for MondoMago.
Produces pure synthesized multi-layer tracks (melody + bass + rhythm).
No TTS voice — melody IS the earworm for each world.

Each world: 8 lines × 4 seconds = 32s total loop.
Structure: AABABAA — lines 0 and 6 share melody (earworm callback).

Usage:
  python3 scripts/gen-songs-musical.py          # skip existing
  python3 scripts/gen-songs-musical.py --force  # regenerate all
"""

import sys
import numpy as np
from scipy import signal as sci_signal
from pathlib import Path
import lameenc

SAMPLE_RATE = 44100
LINE_DURATION = 4.0           # seconds per line
AUDIO_DIR = Path("public/audio")
FORCE = "--force" in sys.argv

# ── Note frequency table ──────────────────────────────────────────────────────
_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

def _midi_to_freq(midi):
    return 440.0 * 2.0 ** ((midi - 69) / 12.0)

NOTES: dict[str, float] = {'R': 0.0}
for _oct in range(2, 8):
    for _i, _n in enumerate(_NOTE_NAMES):
        NOTES[f'{_n}{_oct}'] = _midi_to_freq((_oct + 1) * 12 + _i)

# ── Synthesis ─────────────────────────────────────────────────────────────────

def synth_tone(note: str, duration: float, amp: float = 0.7, timbre: str = 'bell') -> np.ndarray:
    freq = NOTES.get(note, 0.0)
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0.0, duration, n, endpoint=False)

    if freq == 0.0:
        return np.zeros(n)

    wave = np.zeros(n)

    if timbre == 'bell':
        # Glockenspiel: bright fundamental + harmonics, fast percussive decay
        params = [(1, 1.00, 1.8), (2, 0.70, 3.0), (3, 0.40, 5.0),
                  (5, 0.20, 8.0), (7, 0.08, 12.0)]
        for h, a, d in params:
            wave += a * np.sin(2 * np.pi * freq * h * t) * np.exp(-d * t)

    elif timbre == 'marimba':
        params = [(1, 1.00, 3.0), (4, 0.45, 7.0), (10, 0.15, 14.0)]
        for h, a, d in params:
            wave += a * np.sin(2 * np.pi * freq * h * t) * np.exp(-d * t)

    elif timbre == 'piano':
        params = [(1, 1.00, 1.2), (2, 0.50, 2.5), (3, 0.25, 4.0), (4, 0.12, 6.0)]
        for h, a, d in params:
            wave += a * np.sin(2 * np.pi * freq * h * t) * np.exp(-d * t)
        # Soft attack
        attack = min(int(0.015 * SAMPLE_RATE), n)
        wave[:attack] *= np.linspace(0.0, 1.0, attack)

    elif timbre == 'horn':
        # Warm brass: sustained with soft attack, rich harmonics
        for h, a in [(1, 1.00), (2, 0.80), (3, 0.55), (4, 0.30), (5, 0.12)]:
            wave += a * np.sin(2 * np.pi * freq * h * t)
        env = np.exp(-0.6 * t)
        attack = min(int(0.06 * SAMPLE_RATE), n)
        env[:attack] *= np.linspace(0.0, 1.0, attack)
        wave *= env

    elif timbre == 'synth':
        # Electronic saw-like + vibrato
        vib = 0.004 * np.sin(2 * np.pi * 5.5 * t)
        phase = 2 * np.pi * freq * t + vib * freq
        for h in range(1, 7):
            wave += (1.0 / h) * np.sin(h * phase)
        wave *= np.exp(-0.5 * t)
        attack = min(int(0.01 * SAMPLE_RATE), n)
        wave[:attack] *= np.linspace(0.0, 1.0, attack)

    elif timbre == 'bass':
        for h, a in [(1, 1.00), (2, 0.35), (3, 0.12)]:
            wave += a * np.sin(2 * np.pi * freq * h * t) * np.exp(-1.2 * h * t)
        attack = min(int(0.012 * SAMPLE_RATE), n)
        wave[:attack] *= np.linspace(0.0, 1.0, attack)

    elif timbre == 'kick':
        # Synthesised kick: pitch-swept sine with noise
        freq_env = freq * np.exp(-18 * t)
        phase = np.cumsum(2 * np.pi * freq_env / SAMPLE_RATE)
        wave = np.sin(phase) * np.exp(-7 * t)
        noise = np.random.randn(n) * 0.15
        wave += noise * np.exp(-20 * t)

    elif timbre == 'clap':
        noise = np.random.randn(n)
        wave = noise * np.exp(-25 * t)

    max_v = np.max(np.abs(wave))
    if max_v > 0:
        wave /= max_v
    return wave * amp


def seq_to_audio(notes: list, durations: list, timbre: str, amp: float = 0.7) -> np.ndarray:
    """Concatenate a note sequence into a single array."""
    chunks = [synth_tone(n, d, amp=amp, timbre=timbre) for n, d in zip(notes, durations)]
    return np.concatenate(chunks)


def add_reverb(audio: np.ndarray, delay_ms: float = 28.0, decay: float = 0.38) -> np.ndarray:
    delay_n = int(delay_ms / 1000.0 * SAMPLE_RATE)
    out = audio.copy()
    if delay_n < len(audio):
        tail_len = len(audio) - delay_n
        out[delay_n:] += audio[:tail_len] * decay
        # second echo
        if 2 * delay_n < len(audio):
            tail_len2 = len(audio) - 2 * delay_n
            out[2 * delay_n:] += audio[:tail_len2] * (decay * 0.4)
    return out


def fade_in_out(audio: np.ndarray, fade_s: float = 0.06) -> np.ndarray:
    n = int(fade_s * SAMPLE_RATE)
    n = min(n, len(audio) // 4)
    audio = audio.copy()
    audio[:n] *= np.linspace(0.0, 1.0, n)
    audio[-n:] *= np.linspace(1.0, 0.0, n)
    return audio


def mix_tracks(tracks: list[tuple[np.ndarray, float]]) -> np.ndarray:
    """Mix list of (audio, gain) tuples, zero-padded to max length."""
    max_len = max(len(a) for a, _ in tracks)
    out = np.zeros(max_len)
    for audio, gain in tracks:
        out[:len(audio)] += audio * gain
    return out


def normalize(audio: np.ndarray, peak: float = 0.88) -> np.ndarray:
    m = np.max(np.abs(audio))
    return audio / m * peak if m > 0 else audio


def to_mp3(audio: np.ndarray) -> bytes:
    audio = np.clip(normalize(audio), -1.0, 1.0)
    pcm = (audio * 32767).astype(np.int16)
    enc = lameenc.Encoder()
    enc.set_bit_rate(128)
    enc.set_in_sample_rate(SAMPLE_RATE)
    enc.set_channels(1)
    enc.set_quality(2)
    return enc.encode(pcm.tobytes()) + enc.flush()


# ── World-specific musical configurations ────────────────────────────────────
#
# Each world defines:
#   bpm           : tempo
#   melody_timbre : instrument for the main melodic voice
#   bass_timbre   : instrument for the harmonic bass
#   reverb        : (delay_ms, decay) — more for open spaces
#   melodies      : list of 8 note-strings (5 notes each = 4 seconds at bpm)
#                   Lines 0 and 6 SHARE the same melody → earworm callback
#   bass_patterns : list of 8 bass note-strings (3 notes each)
#   rhythm        : True/False — add subtle kick+clap
#
# Duration template for 5-note melody at any BPM (each line = 4.0s):
#   beat = 60/bpm seconds
#   notes: [beat, beat, beat, beat, 2*beat]  (q q q q h)
#   but we scale so total = 4.0s exactly
#   e.g. 90 bpm → beat=0.667 → [0.667,0.667,0.667,0.667,1.333]=4.001≈4.0s ✓

def _durations(bpm: float) -> list[float]:
    """5-note durations that sum to LINE_DURATION."""
    beat = 60.0 / bpm
    raw = [beat, beat, beat, beat, 2 * beat]
    total = sum(raw)
    scale = LINE_DURATION / total
    return [r * scale for r in raw]


def _bass_durations(bpm: float) -> list[float]:
    """3-note bass durations summing to LINE_DURATION."""
    beat = 60.0 / bpm
    raw = [2 * beat, beat, beat]
    total = sum(raw)
    scale = LINE_DURATION / total
    return [r * scale for r in raw]


WORLDS = {

    # ── FORESTA ── glockenspiel, C major pentatonic, bright + airy
    'foresta': dict(
        bpm=90, melody_timbre='bell', bass_timbre='piano', rhythm=False,
        reverb=(30, 0.42),
        melodies=[
            'C5 E5 G5 E5 C5',   # 0 ← HOOK
            'D5 E5 G5 A5 G5',   # 1
            'G5 E5 D5 C5 G4',   # 2
            'A5 G5 E5 G5 A5',   # 3
            'C5 D5 E5 G5 E5',   # 4 (counting feel)
            'E5 G5 A5 G5 E5',   # 5
            'C5 E5 G5 E5 C5',   # 6 ← SAME AS 0 — earworm
            'G5 E5 D5 C5 C5',   # 7 (resolution)
        ],
        bass_patterns=[
            'C3 G3 C3', 'C3 G3 A3', 'G3 E3 C3', 'A3 G3 A3',
            'C3 G3 C3', 'E3 G3 A3', 'C3 G3 C3', 'G3 E3 C3',
        ],
    ),

    # ── OCEANO ── marimba, G major pentatonic, wave-like rolling feel
    'oceano': dict(
        bpm=80, melody_timbre='marimba', bass_timbre='marimba', rhythm=False,
        reverb=(35, 0.50),
        melodies=[
            'G4 B4 D5 B4 G4',   # 0 ← HOOK
            'A4 B4 D5 E5 D5',   # 1
            'D5 B4 A4 G4 D4',   # 2
            'E5 D5 B4 A4 B4',   # 3
            'G4 A4 B4 D5 B4',   # 4
            'B4 D5 E5 D5 B4',   # 5
            'G4 B4 D5 B4 G4',   # 6 ← SAME AS 0
            'E5 D5 B4 G4 G4',   # 7
        ],
        bass_patterns=[
            'G3 D4 G3', 'G3 D4 A3', 'D3 G3 D3', 'A3 D4 A3',
            'G3 D4 G3', 'D4 G3 A3', 'G3 D4 G3', 'D3 G3 D3',
        ],
    ),

    # ── GIARDINO ── bells, F major, gentle staccato
    'giardino': dict(
        bpm=88, melody_timbre='bell', bass_timbre='piano', rhythm=False,
        reverb=(22, 0.35),
        melodies=[
            'F5 A5 C5 A5 F5',   # 0 ← HOOK
            'G5 A5 C5 D5 C5',   # 1
            'C5 A4 G4 F4 C5',   # 2
            'D5 C5 A4 G4 A4',   # 3
            'F4 G4 A4 C5 A4',   # 4
            'A4 C5 D5 C5 A4',   # 5
            'F5 A5 C5 A5 F5',   # 6 ← SAME AS 0
            'C5 A4 G4 F4 F4',   # 7
        ],
        bass_patterns=[
            'F3 C4 F3', 'F3 C4 G3', 'C3 F3 C3', 'G3 C4 G3',
            'F3 C4 F3', 'C3 G3 A3', 'F3 C4 F3', 'C3 F3 C3',
        ],
    ),

    # ── CASTELLO ── horn, G major, march heroic
    'castello': dict(
        bpm=100, melody_timbre='horn', bass_timbre='horn', rhythm=True,
        reverb=(40, 0.45),
        melodies=[
            'G4 B4 D5 B4 G4',   # 0 ← HOOK
            'A4 B4 D5 E5 D5',   # 1
            'D5 B4 A4 G4 B4',   # 2
            'E5 D5 B4 G4 G4',   # 3
            'G4 A4 B4 D5 B4',   # 4
            'B4 D5 E5 D5 B4',   # 5
            'G4 B4 D5 B4 G4',   # 6 ← SAME AS 0
            'D5 B4 A4 G4 G4',   # 7
        ],
        bass_patterns=[
            'G3 D4 G3', 'G3 D4 A3', 'D3 G3 D3', 'G3 D4 G3',
            'G3 D4 G3', 'D4 G3 A3', 'G3 D4 G3', 'D3 G3 G3',
        ],
    ),

    # ── MERCATO ── piano, C major, upbeat energetic
    'mercato': dict(
        bpm=112, melody_timbre='piano', bass_timbre='bass', rhythm=True,
        reverb=(16, 0.28),
        melodies=[
            'C5 E5 G5 E5 C5',   # 0 ← HOOK
            'G4 C5 E5 G5 E5',   # 1
            'E5 G5 A5 G5 E5',   # 2
            'A5 G5 E5 C5 E5',   # 3
            'C5 D5 E5 G5 E5',   # 4 (counting rhythm)
            'E5 D5 C5 G4 C5',   # 5
            'C5 E5 G5 E5 C5',   # 6 ← SAME AS 0
            'G5 E5 D5 C5 C5',   # 7
        ],
        bass_patterns=[
            'C3 G3 C3', 'G2 C3 G3', 'C3 G3 A3', 'A3 G3 E3',
            'C3 G3 C3', 'E3 G3 C3', 'C3 G3 C3', 'G3 E3 C3',
        ],
    ),

    # ── BIBLIOTECA ── piano, A minor, lyrical flowing
    'biblioteca': dict(
        bpm=82, melody_timbre='piano', bass_timbre='piano', rhythm=False,
        reverb=(24, 0.32),
        melodies=[
            'A4 C5 E5 C5 A4',   # 0 ← HOOK
            'G4 A4 C5 E5 D5',   # 1
            'E5 D5 C5 A4 C5',   # 2
            'C5 D5 E5 A4 G4',   # 3
            'A4 G4 A4 C5 E5',   # 4
            'E5 D5 C5 A4 A4',   # 5
            'A4 C5 E5 C5 A4',   # 6 ← SAME AS 0
            'C5 A4 G4 A4 A4',   # 7
        ],
        bass_patterns=[
            'A3 E3 A3', 'A3 E3 G3', 'E3 A3 E3', 'G3 E3 A3',
            'A3 E3 A3', 'E3 G3 A3', 'A3 E3 A3', 'E3 A3 A3',
        ],
    ),

    # ── GALASSIA ── synth, D minor, spacey mysterious
    'galassia': dict(
        bpm=96, melody_timbre='synth', bass_timbre='synth', rhythm=False,
        reverb=(50, 0.55),
        melodies=[
            'D5 F5 A5 F5 D5',   # 0 ← HOOK
            'A5 G5 F5 D5 A4',   # 1
            'F5 A5 C5 A4 F4',   # 2
            'C5 A4 G4 F4 A4',   # 3
            'D5 E5 F5 A5 F5',   # 4
            'A5 F5 E5 D5 F5',   # 5
            'D5 F5 A5 F5 D5',   # 6 ← SAME AS 0
            'A5 G5 F5 D5 D5',   # 7
        ],
        bass_patterns=[
            'D3 A3 D3', 'D3 A3 G3', 'A2 D3 A3', 'G3 D3 A3',
            'D3 A3 D3', 'A3 F3 D3', 'D3 A3 D3', 'A2 D3 D3',
        ],
    ),

    # ── VULCANO ── synth, E minor, powerful driving
    'vulcano': dict(
        bpm=116, melody_timbre='synth', bass_timbre='bass', rhythm=True,
        reverb=(18, 0.30),
        melodies=[
            'E5 G5 B4 G5 E5',   # 0 ← HOOK
            'B4 A4 G4 E4 B4',   # 1
            'G4 B4 D5 B4 G4',   # 2
            'A4 G4 E4 D4 E4',   # 3
            'E4 G4 A4 B4 A4',   # 4
            'B4 A4 G4 E4 G4',   # 5
            'E5 G5 B4 G5 E5',   # 6 ← SAME AS 0
            'B4 G4 E4 D4 E4',   # 7
        ],
        bass_patterns=[
            'E3 B3 E3', 'E3 B2 G3', 'B2 E3 B3', 'G3 E3 B3',
            'E3 B3 E3', 'B2 G3 A3', 'E3 B3 E3', 'B2 E3 E3',
        ],
    ),

    # ── LABORATORIO ── synth + bell, C major, digital precise
    'laboratorio': dict(
        bpm=122, melody_timbre='bell', bass_timbre='synth', rhythm=True,
        reverb=(12, 0.22),
        melodies=[
            'C5 E5 G5 E5 C5',   # 0 ← HOOK
            'G5 A5 G5 E5 C5',   # 1
            'E5 G5 A5 G5 E5',   # 2
            'A5 G5 E5 C5 G4',   # 3
            'C5 D5 E5 G5 A5',   # 4
            'A5 G5 E5 D5 C5',   # 5
            'C5 E5 G5 E5 C5',   # 6 ← SAME AS 0
            'G5 E5 D5 C5 C5',   # 7
        ],
        bass_patterns=[
            'C3 G3 C3', 'G3 C3 G3', 'E3 G3 A3', 'A3 G3 E3',
            'C3 G3 C3', 'A3 G3 C3', 'C3 G3 C3', 'G3 E3 C3',
        ],
    ),
}

# ── Line generator ────────────────────────────────────────────────────────────

def generate_line(world: str, line_idx: int, cfg: dict) -> np.ndarray:
    bpm = cfg['bpm']
    mel_durations = _durations(bpm)
    bas_durations = _bass_durations(bpm)

    mel_notes = cfg['melodies'][line_idx].split()
    bas_notes = cfg['bass_patterns'][line_idx].split()

    # Melody layer
    melody = seq_to_audio(mel_notes, mel_durations, timbre=cfg['melody_timbre'], amp=0.82)

    # Bass layer (slightly lower amplitude)
    bass_amp = 0.40 if cfg['bass_timbre'] in ('piano', 'bell') else 0.45
    bass = seq_to_audio(bas_notes, bas_durations, timbre=cfg['bass_timbre'], amp=bass_amp)

    # Ensure same length (pad to LINE_DURATION)
    target_n = int(SAMPLE_RATE * LINE_DURATION)
    def pad(a: np.ndarray) -> np.ndarray:
        if len(a) < target_n:
            return np.pad(a, (0, target_n - len(a)))
        return a[:target_n]

    melody = pad(melody)
    bass = pad(bass)

    tracks: list[tuple[np.ndarray, float]] = [(melody, 1.0), (bass, 1.0)]

    # Optional rhythm layer (kick + clap)
    if cfg.get('rhythm', False):
        beat_n = int(60.0 / bpm * SAMPLE_RATE)
        n_total = target_n
        kick_sig = np.zeros(n_total)
        clap_sig = np.zeros(n_total)
        for beat in range(int(n_total / beat_n) + 1):
            pos = beat * beat_n
            k = synth_tone('E2', 0.18, amp=0.70, timbre='kick')
            if pos + len(k) <= n_total:
                kick_sig[pos:pos+len(k)] += k
            if beat % 2 == 1:
                c = synth_tone('R', 0.08, amp=0.50, timbre='clap')
                c = synth_tone('A4', 0.08, amp=0.40, timbre='clap')  # snappy clap
                if pos + len(c) <= n_total:
                    clap_sig[pos:pos+len(c)] += c
        tracks.append((kick_sig, 0.55))
        tracks.append((clap_sig, 0.35))

    # Mix all tracks
    out = mix_tracks(tracks)

    # Apply reverb
    delay_ms, decay = cfg['reverb']
    out = add_reverb(out, delay_ms=delay_ms, decay=decay)

    # Subtle fade in/out
    out = fade_in_out(out, fade_s=0.05)

    return out


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    total = sum(len(cfg['melodies']) for cfg in WORLDS.values())
    generated = 0
    skipped = 0

    print(f"\nGenerating {total} musical song files ({('FORCE' if FORCE else 'skip existing')})…")
    print(f"Sample rate: {SAMPLE_RATE}Hz | Duration per line: {LINE_DURATION}s\n")

    for world, cfg in WORLDS.items():
        n_lines = len(cfg['melodies'])
        print(f"  [{world}] bpm={cfg['bpm']} timbre={cfg['melody_timbre']}")
        for i in range(n_lines):
            path = AUDIO_DIR / f"song_{world}_{i}.mp3"
            if path.exists() and not FORCE:
                skipped += 1
                print(f"    skip  song_{world}_{i}.mp3")
                continue

            audio = generate_line(world, i, cfg)
            mp3_bytes = to_mp3(audio)
            path.write_bytes(mp3_bytes)
            kb = len(mp3_bytes) // 1024
            print(f"    gen   song_{world}_{i}.mp3  {kb}kB  [{cfg['melodies'][i]}]")
            generated += 1

    print(f"\n✅  {generated} generated, {skipped} skipped  ({generated + skipped}/{total} total)")
    print(f"Output: {AUDIO_DIR.resolve()}")


if __name__ == "__main__":
    main()
