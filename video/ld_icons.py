"""Flat song icons drawn with simple shapes (no image assets).

draw_icon(name, size) -> RGBA PIL image. Unknown names fall back to "music".
Everything is drawn on a 100x100 unit grid at 6x, then downsampled for clean edges.
"""
from PIL import Image, ImageDraw
import math

INK = (30, 42, 58)
CORAL = (242, 107, 79)
MARI = (245, 184, 61)
INDIGO = (61, 76, 140)
WHITE = (255, 255, 255)
CORAL_L = (249, 185, 170)
MARI_L = (251, 222, 158)
INDIGO_L = (176, 186, 228)
GREEN = (92, 170, 120)
GREEN_D = (64, 135, 92)
GREY = (205, 214, 224)
PINK = (246, 160, 160)

S = 6  # scale


class Pen:
    def __init__(self):
        self.im = Image.new("RGBA", (100 * S, 100 * S), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.im)

    def _b(self, *xy):
        return [v * S for v in xy]

    def E(self, x0, y0, x1, y1, c):          # ellipse by box
        self.d.ellipse(self._b(x0, y0, x1, y1), fill=c)

    def C(self, x, y, r, c):                  # circle
        self.E(x - r, y - r, x + r, y + r, c)

    def R(self, x0, y0, x1, y1, c, r=0):     # (rounded) rectangle
        self.d.rounded_rectangle(self._b(x0, y0, x1, y1), radius=r * S, fill=c)

    def P(self, pts, c):                      # polygon
        self.d.polygon([(x * S, y * S) for x, y in pts], fill=c)

    def L(self, pts, c, w):                   # polyline
        self.d.line([(x * S, y * S) for x, y in pts], fill=c, width=int(w * S), joint="curve")
        for x, y in (pts[0], pts[-1]):
            self.C(x, y, w / 2.0, c)

    def A(self, x0, y0, x1, y1, a0, a1, c, w):  # arc
        self.d.arc(self._b(x0, y0, x1, y1), a0, a1, fill=c, width=int(w * S))

    def eyes(self, x1, x2, y, r=3.2):
        for x in (x1, x2):
            self.C(x, y, r, INK)
            self.C(x + r * 0.35, y - r * 0.35, r * 0.33, WHITE)

    def smile(self, x, y, w=8, c=INK, t=2.2):
        self.A(x - w / 2, y - w / 2, x + w / 2, y + w / 2, 20, 160, c, t)

    def cheeks(self, x1, x2, y, r=3.5):
        self.C(x1, y, r, CORAL_L)
        self.C(x2, y, r, CORAL_L)


def star_pts(cx, cy, r1, r2, n=5, rot=-90):
    pts = []
    for i in range(n * 2):
        r = r1 if i % 2 == 0 else r2
        a = math.radians(rot + i * 180.0 / n)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


# ---------------------------------------------------------------- icons
def i_star(p):
    p.P(star_pts(50, 53, 44, 20), MARI)
    p.eyes(42, 58, 52, 3.5)
    p.smile(50, 58, 9)
    p.cheeks(36, 64, 61, 3)


def i_music(p):
    p.R(36, 18, 43, 70, INK, 2)
    p.R(72, 10, 79, 62, INK, 2)
    p.P([(36, 18), (79, 10), (79, 24), (36, 32)], INK)
    p.E(18, 60, 44, 80, CORAL)
    p.E(54, 52, 80, 72, CORAL)


def i_sheep(p):
    wool = [(26, 50), (38, 38), (54, 36), (68, 46), (64, 62), (46, 66), (30, 62), (48, 50)]
    p.R(32, 64, 39, 90, INK, 3)
    p.R(56, 64, 63, 90, INK, 3)
    for (x, y) in wool:                      # soft grey rim so white wool reads on a light background
        p.C(x, y, 18.5, GREY)
    for (x, y) in wool:
        p.C(x, y, 16, WHITE)
    p.E(58, 30, 72, 40, INK)                  # ear
    p.E(66, 26, 96, 60, INK)
    for x in (75, 87):                        # white eyes on the dark face
        p.C(x, 40, 4.2, WHITE)
        p.C(x + 0.8, 40.5, 2.2, INK)
    p.C(81, 51, 2.4, PINK)
    p.C(10, 50, 7, GREY)
    p.C(10, 50, 5, WHITE)


def i_cake(p):
    p.R(16, 52, 84, 86, CORAL, 6)
    p.R(16, 52, 84, 62, WHITE, 5)
    for x in (28, 44, 60, 76):
        p.C(x, 63, 4, WHITE)
    p.R(22, 34, 78, 54, MARI_L, 5)
    p.R(22, 34, 78, 40, WHITE, 3)
    p.R(47, 14, 53, 34, INDIGO_L, 2)
    p.E(45, 4, 55, 16, MARI)
    p.E(48, 8, 52, 14, WHITE)
    p.R(10, 84, 90, 90, GREY, 3)


def i_bear(p):
    p.C(26, 26, 12, INDIGO)
    p.C(74, 26, 12, INDIGO)
    p.C(26, 26, 6, INDIGO_L)
    p.C(74, 26, 6, INDIGO_L)
    p.E(14, 18, 86, 88, INDIGO)
    p.E(34, 52, 66, 80, INDIGO_L)
    p.E(44, 54, 56, 62, INK)
    p.eyes(37, 63, 44, 3.6)
    p.smile(50, 66, 10)


def i_bird(p):
    p.E(16, 26, 84, 86, MARI)
    p.E(30, 50, 64, 80, MARI_L)
    p.P([(80, 50), (96, 56), (80, 62)], CORAL)
    p.P([(18, 50), (2, 40), (8, 62)], MARI)
    p.P([(44, 26), (50, 10), (56, 26)], CORAL)
    p.eyes(60, 72, 46, 3.4)
    p.R(38, 84, 42, 96, CORAL, 1)
    p.R(56, 84, 60, 96, CORAL, 1)


def i_moon(p):
    p.C(50, 50, 40, MARI)
    p.C(70, 38, 34, (0, 0, 0, 0))
    p.d.ellipse([(70 - 34) * S, (38 - 34) * S, (70 + 34) * S, (38 + 34) * S], fill=(0, 0, 0, 0))
    p.C(30, 50, 3, INK)
    p.smile(34, 62, 8)
    for (x, y, r) in [(80, 74, 5), (88, 20, 3), (66, 88, 3)]:
        p.P(star_pts(x, y, r * 1.6, r * 0.7), MARI_L)


def i_sun(p):
    for i in range(12):
        a = math.radians(i * 30)
        p.L([(50 + 32 * math.cos(a), 50 + 32 * math.sin(a)),
             (50 + 46 * math.cos(a), 50 + 46 * math.sin(a))], MARI, 6)
    p.C(50, 50, 28, MARI)
    p.eyes(41, 59, 46, 3.4)
    p.smile(50, 56, 12)
    p.cheeks(34, 66, 58, 3.5)


def i_heart(p):
    p.C(33, 38, 20, CORAL)
    p.C(67, 38, 20, CORAL)
    p.P([(14, 44), (86, 44), (50, 86)], CORAL)
    p.C(32, 32, 6, CORAL_L)


def i_duck(p):
    p.E(10, 44, 80, 86, MARI)
    p.C(64, 34, 20, MARI)
    p.P([(80, 34), (98, 40), (80, 46)], CORAL)
    p.E(24, 54, 56, 74, MARI_L)
    p.eyes(66, 66, 30, 3.4)
    p.E(4, 84, 96, 94, INDIGO_L)


def i_fish(p):
    p.P([(18, 50), (2, 30), (2, 70)], CORAL)
    p.E(14, 26, 88, 74, CORAL)
    p.P([(44, 28), (60, 14), (64, 30)], CORAL_L)
    for x in (40, 52):
        p.A(x - 8, 36, x + 8, 64, 300, 60, CORAL_L, 3)
    p.eyes(72, 72, 44, 4)
    p.smile(80, 56, 6)


def i_frog(p):
    p.C(30, 30, 14, GREEN)
    p.C(70, 30, 14, GREEN)
    p.E(10, 30, 90, 86, GREEN)
    p.C(30, 30, 8, WHITE)
    p.C(70, 30, 8, WHITE)
    p.C(31, 31, 4, INK)
    p.C(71, 31, 4, INK)
    p.A(26, 44, 74, 74, 20, 160, INK, 3)
    p.cheeks(24, 76, 60, 5)
    p.E(28, 70, 72, 86, (140, 205, 160))


def cat_or_dog(p, body, ear, dog=False):
    if dog:
        p.E(8, 22, 32, 66, ear)
        p.E(68, 22, 92, 66, ear)
    else:
        p.P([(16, 44), (22, 8), (46, 28)], body)
        p.P([(84, 44), (78, 8), (54, 28)], body)
        p.P([(22, 36), (25, 18), (38, 30)], ear)
        p.P([(78, 36), (75, 18), (62, 30)], ear)
    p.E(14, 20, 86, 88, body)
    p.eyes(37, 63, 50, 3.8)
    p.E(45, 58, 55, 65, INK if dog else CORAL)
    p.A(40, 58, 50, 72, 20, 160, INK, 2.2)
    p.A(50, 58, 60, 72, 20, 160, INK, 2.2)
    if not dog:
        for s in (-1, 1):
            p.L([(50 + s * 16, 64), (50 + s * 36, 60)], INK, 1.6)
            p.L([(50 + s * 16, 68), (50 + s * 36, 70)], INK, 1.6)
    else:
        p.E(42, 70, 58, 84, CORAL)


def i_cat(p):
    cat_or_dog(p, MARI, CORAL_L)


def i_dog(p):
    cat_or_dog(p, (214, 170, 120), (150, 104, 70), dog=True)


def i_pig(p):
    p.P([(18, 32), (22, 10), (40, 24)], PINK)
    p.P([(82, 32), (78, 10), (60, 24)], PINK)
    p.E(12, 18, 88, 88, (250, 190, 190))
    p.E(34, 52, 66, 76, PINK)
    p.C(44, 64, 3.4, INK)
    p.C(56, 64, 3.4, INK)
    p.eyes(36, 64, 42, 3.4)


def i_cow(p):
    p.E(4, 26, 26, 42, WHITE)
    p.E(74, 26, 96, 42, WHITE)
    p.P([(26, 20), (20, 4), (34, 16)], MARI)
    p.P([(74, 20), (80, 4), (66, 16)], MARI)
    p.E(18, 14, 82, 86, WHITE)
    p.E(22, 20, 44, 44, INK)
    p.E(26, 58, 74, 88, PINK)
    p.C(40, 72, 3.4, INK)
    p.C(60, 72, 3.4, INK)
    p.eyes(38, 62, 46, 3.4)


def i_spider(p):
    for s in (-1, 1):
        for k, y in enumerate((44, 54, 64, 74)):
            p.L([(50 + s * 18, y), (50 + s * 34, y - 12 + k * 2), (50 + s * 44, y + 6)], INK, 3.4)
    p.L([(50, 0), (50, 30)], GREY, 1.5)
    p.E(28, 34, 72, 84, INK)
    p.eyes(42, 58, 52, 4.5)
    p.C(42, 52, 3, WHITE)
    p.C(58, 52, 3, WHITE)
    p.C(43, 53, 1.8, INK)
    p.C(59, 53, 1.8, INK)
    p.smile(50, 64, 10, WHITE)


def i_boat(p):
    p.R(48, 14, 52, 64, INK, 1)
    p.P([(54, 16), (54, 58), (84, 58)], CORAL)
    p.P([(46, 24), (46, 58), (22, 58)], MARI)
    p.P([(10, 64), (90, 64), (78, 82), (22, 82)], INDIGO)
    p.A(4, 82, 30, 96, 180, 360, INDIGO_L, 3)
    p.A(36, 82, 62, 96, 180, 360, INDIGO_L, 3)
    p.A(68, 82, 94, 96, 180, 360, INDIGO_L, 3)


def i_bus(p):
    p.R(8, 22, 92, 76, MARI, 10)
    for x in (16, 36, 56):
        p.R(x, 30, x + 16, 46, WHITE, 3)
    p.R(76, 30, 88, 58, WHITE, 3)
    p.R(8, 56, 92, 60, CORAL)
    p.C(28, 78, 10, INK)
    p.C(72, 78, 10, INK)
    p.C(28, 78, 4, GREY)
    p.C(72, 78, 4, GREY)


def i_car(p):
    p.P([(28, 46), (38, 26), (66, 26), (78, 46)], CORAL)
    p.P([(36, 44), (42, 31), (51, 31), (51, 44)], WHITE)
    p.P([(55, 44), (55, 31), (63, 31), (71, 44)], WHITE)
    p.R(8, 44, 92, 70, CORAL, 10)
    p.C(28, 72, 10, INK)
    p.C(72, 72, 10, INK)
    p.C(28, 72, 4, GREY)
    p.C(72, 72, 4, GREY)
    p.C(86, 52, 3, MARI)


def i_train(p):
    p.R(10, 40, 62, 76, INDIGO, 4)
    p.R(52, 18, 88, 76, CORAL, 5)
    p.R(60, 26, 80, 42, WHITE, 3)
    p.R(18, 24, 30, 40, INK, 2)
    p.R(14, 18, 34, 24, INK, 2)
    for x in (24, 48, 74):
        p.C(x, 80, 9, INK)
        p.C(x, 80, 3.4, GREY)
    p.C(22, 10, 5, GREY)
    p.C(32, 6, 4, GREY)


def i_bell(p):
    p.C(50, 12, 6, MARI)
    p.P([(22, 72), (30, 36), (50, 16), (70, 36), (78, 72)], MARI)
    p.E(26, 20, 74, 60, MARI)
    p.R(14, 68, 86, 78, MARI, 5)
    p.C(50, 84, 8, CORAL)
    p.E(34, 30, 42, 50, MARI_L)


def i_flower(p):
    p.R(47, 54, 53, 96, GREEN, 2)
    p.E(52, 66, 76, 78, GREEN)
    for i in range(6):
        a = math.radians(i * 60)
        p.C(50 + 20 * math.cos(a), 38 + 20 * math.sin(a), 14, CORAL)
    p.C(50, 38, 13, MARI)
    p.eyes(45, 55, 36, 2.2)
    p.smile(50, 41, 6, INK, 1.6)


def i_tree(p):
    p.R(42, 58, 58, 92, (150, 104, 70), 3)
    p.C(50, 36, 28, GREEN)
    p.C(28, 50, 18, GREEN)
    p.C(72, 50, 18, GREEN)
    p.C(40, 30, 10, (130, 200, 150))
    p.C(36, 52, 4, CORAL)
    p.C(64, 34, 4, CORAL)
    p.C(62, 58, 4, CORAL)


def i_house(p):
    p.R(18, 44, 82, 90, MARI_L, 3)
    p.P([(8, 48), (50, 10), (92, 48)], CORAL)
    p.R(42, 62, 58, 90, INDIGO, 3)
    p.R(24, 54, 36, 66, WHITE, 2)
    p.R(64, 54, 76, 66, WHITE, 2)
    p.R(66, 14, 76, 34, INK, 1)


def i_apple(p):
    p.C(36, 56, 26, CORAL)
    p.C(64, 56, 26, CORAL)
    p.E(22, 54, 78, 92, CORAL)
    p.R(48, 16, 53, 34, INK, 2)
    p.E(54, 14, 76, 26, GREEN)
    p.E(28, 42, 38, 56, CORAL_L)


def i_crown(p):
    p.P([(12, 76), (12, 30), (32, 52), (50, 18), (68, 52), (88, 30), (88, 76)], MARI)
    p.R(12, 70, 88, 82, MARI, 2)
    for x, c in ((30, CORAL), (50, INDIGO), (70, CORAL)):
        p.C(x, 66, 5, c)
    for x, y in ((12, 28), (50, 16), (88, 28)):
        p.C(x, y, 5, MARI)


def i_rain(p):
    p.C(34, 40, 16, INDIGO_L)
    p.C(56, 32, 20, INDIGO_L)
    p.C(74, 44, 14, INDIGO_L)
    p.R(20, 40, 86, 58, INDIGO_L, 9)
    for x, y in ((30, 70), (52, 78), (74, 70), (40, 90), (64, 92)):
        p.P([(x, y - 9), (x - 5, y), (x + 5, y)], INDIGO)
        p.C(x, y + 1, 5, INDIGO)


def i_snowflake(p):
    for i in range(6):
        a = math.radians(i * 60 - 90)
        x1, y1 = 50 + 40 * math.cos(a), 50 + 40 * math.sin(a)
        p.L([(50, 50), (x1, y1)], INDIGO, 6)
        for s in (-1, 1):
            b = a + s * math.radians(40)
            mx, my = 50 + 24 * math.cos(a), 50 + 24 * math.sin(a)
            p.L([(mx, my), (mx + 12 * math.cos(b), my + 12 * math.sin(b))], INDIGO, 5)
    p.C(50, 50, 8, INDIGO_L)


def i_ball(p):
    p.C(50, 50, 40, CORAL)
    p.d.pieslice([10 * S, 10 * S, 90 * S, 90 * S], 200, 270, fill=MARI)
    p.d.pieslice([10 * S, 10 * S, 90 * S, 90 * S], 20, 90, fill=MARI)
    p.d.pieslice([10 * S, 10 * S, 90 * S, 90 * S], 110, 160, fill=INDIGO)
    p.d.pieslice([10 * S, 10 * S, 90 * S, 90 * S], 290, 340, fill=INDIGO)
    p.C(50, 50, 10, WHITE)


def i_clock(p):
    p.C(26, 18, 12, CORAL)
    p.C(74, 18, 12, CORAL)
    p.C(50, 54, 40, CORAL)
    p.C(50, 54, 32, WHITE)
    for i in range(12):
        a = math.radians(i * 30)
        p.C(50 + 26 * math.cos(a), 54 + 26 * math.sin(a), 1.8, INK)
    p.L([(50, 54), (50, 34)], INK, 4)
    p.L([(50, 54), (64, 62)], INK, 4)
    p.C(50, 54, 4, CORAL)


def i_gift(p):
    p.R(14, 42, 86, 90, CORAL, 4)
    p.R(10, 32, 90, 46, CORAL_L, 4)
    p.R(45, 32, 55, 90, MARI)
    p.E(26, 14, 50, 34, MARI)
    p.E(50, 14, 74, 34, MARI)
    p.E(34, 20, 46, 30, CORAL_L)
    p.E(54, 20, 66, 30, CORAL_L)


def i_butterfly(p):
    p.E(8, 12, 50, 54, CORAL)
    p.E(50, 12, 92, 54, CORAL)
    p.E(16, 48, 50, 86, MARI)
    p.E(50, 48, 84, 86, MARI)
    p.C(28, 32, 7, CORAL_L)
    p.C(72, 32, 7, CORAL_L)
    p.R(45, 20, 55, 84, INK, 5)
    p.L([(48, 22), (38, 6)], INK, 2)
    p.L([(52, 22), (62, 6)], INK, 2)


def i_bee(p):
    p.E(28, 8, 52, 40, (225, 236, 248))
    p.E(48, 8, 72, 40, (225, 236, 248))
    p.E(14, 30, 86, 86, MARI)
    p.R(38, 30, 48, 86, INK)
    p.R(60, 34, 68, 82, INK)
    p.C(26, 52, 3.4, INK)
    p.smile(26, 62, 7)
    p.P([(86, 58), (98, 54), (86, 64)], INK)


def i_mouse(p):
    p.C(28, 30, 18, GREY)
    p.C(72, 30, 18, GREY)
    p.C(28, 30, 10, PINK)
    p.C(72, 30, 10, PINK)
    p.E(20, 30, 80, 88, GREY)
    p.eyes(40, 60, 56, 3.4)
    p.C(50, 70, 4, CORAL)
    for s in (-1, 1):
        p.L([(50 + s * 10, 72), (50 + s * 32, 68)], INK, 1.5)


def i_elephant(p):
    p.E(2, 20, 40, 70, INDIGO_L)
    p.E(60, 20, 98, 70, INDIGO_L)
    p.E(20, 14, 80, 74, (150, 162, 210))
    p.R(42, 56, 58, 90, (150, 162, 210), 8)
    p.E(8, 28, 32, 60, PINK)
    p.E(68, 28, 92, 60, PINK)
    p.eyes(38, 62, 42, 3.4)


def i_monkey(p):
    brown, light = (170, 116, 76), (236, 200, 160)
    p.C(18, 46, 12, brown)
    p.C(82, 46, 12, brown)
    p.C(18, 46, 6, light)
    p.C(82, 46, 6, light)
    p.C(50, 46, 34, brown)
    p.E(30, 34, 50, 62, light)
    p.E(50, 34, 70, 62, light)
    p.E(30, 50, 70, 80, light)
    p.eyes(42, 58, 46, 3.2)
    p.smile(50, 66, 12)


def i_horse(p):
    body = (196, 140, 96)
    p.R(22, 8, 40, 66, (110, 70, 44), 9)          # mane behind the head
    p.P([(36, 18), (40, 0), (50, 16)], body)
    p.P([(56, 16), (64, 0), (68, 20)], body)
    p.R(30, 10, 70, 80, body, 18)
    p.E(30, 54, 76, 94, (236, 200, 160))
    p.C(46, 80, 2.8, INK)
    p.C(60, 80, 2.8, INK)
    p.eyes(42, 60, 38, 3.4)
    p.R(40, 6, 54, 20, (110, 70, 44), 6)          # forelock


def i_farm(p):
    p.R(16, 42, 84, 90, CORAL, 3)
    p.P([(10, 46), (50, 12), (90, 46)], (200, 80, 60))
    p.R(38, 58, 62, 90, WHITE, 2)
    p.L([(38, 58), (62, 90)], CORAL, 3)
    p.L([(62, 58), (38, 90)], CORAL, 3)
    p.R(42, 30, 58, 42, WHITE, 2)
    p.R(0, 88, 100, 96, GREEN, 3)


def i_drum(p):
    p.L([(18, 8), (44, 34)], (150, 104, 70), 5)
    p.L([(82, 8), (56, 34)], (150, 104, 70), 5)
    p.R(14, 40, 86, 84, CORAL, 8)
    p.E(14, 30, 86, 52, WHITE)
    p.E(14, 72, 86, 94, CORAL)
    for x in (24, 50, 76):
        p.L([(x, 50), (x + 12 if x < 76 else x - 12, 82)], MARI, 3)
    p.R(14, 76, 86, 82, MARI)


ICONS = {k[2:]: v for k, v in globals().items() if k.startswith("i_")}


def draw_icon(name, size):
    p = Pen()
    ICONS.get(name, i_music)(p)
    return p.im.resize((size, size), Image.LANCZOS)


def has_icon(name):
    return name in ICONS
