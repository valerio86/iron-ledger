"""Rasterise the plate icon to PNG (no PIL on this Mac). Same geometry as icons/icon.svg."""
import struct, zlib, sys

DARK, BLUE, LIGHT = (0x16, 0x19, 0x1C), (0x1D, 0x5F, 0xC4), (0xF3, 0xF4, 0xF2)

def color_at(x, y, maskable, scale=None):
    # coordinates in the 512 design space
    if not maskable:  # rounded square, r=112
        cx, cy = min(max(x, 112), 400), min(max(y, 112), 400)
        if (x - cx) ** 2 + (y - cy) ** 2 > 112 ** 2:
            return None
    s = scale or (0.8 if maskable else 1.0)  # keep the plate inside the maskable safe zone
    d = (((x - 256) ** 2 + (y - 256) ** 2) ** 0.5) / s
    if d <= 34: return LIGHT
    if 109 <= d <= 127: return LIGHT
    if d <= 176: return BLUE
    return DARK

def png(size, maskable, path, ss=4, scale=None):
    rows = []
    for py in range(size):
        row = bytearray([0])
        for px in range(size):
            acc = [0, 0, 0, 0]
            for sy in range(ss):
                for sx in range(ss):
                    x = (px + (sx + .5) / ss) * 512 / size
                    y = (py + (sy + .5) / ss) * 512 / size
                    c = color_at(x, y, maskable, scale)
                    if c:
                        acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2]; acc[3] += 1
            n = ss * ss
            a = acc[3]
            row += bytes([acc[0] // a, acc[1] // a, acc[2] // a, 255 * a // n] if a else [0, 0, 0, 0])
        rows.append(bytes(row))
    def chunk(t, d): return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    data = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(b"".join(rows), 9)) + chunk(b"IEND", b"")
    open(path, "wb").write(data)

out = sys.argv[1]
png(192, False, f"{out}/icon-192.png")
png(512, False, f"{out}/icon-512.png")
png(512, True, f"{out}/icon-maskable-512.png")
png(180, True, f"{out}/apple-touch-icon.png")  # iOS rounds corners itself, so full-bleed
png(1024, True, f"{out}/listing-1024.png", ss=2, scale=1.3)  # store/API listings (Strava): square, plate fills more
