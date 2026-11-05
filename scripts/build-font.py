# Turns a RuneStar TTF into the game's woff2: keeps Latin-1 and maps the few characters our text uses that the font lacks.
#   python3 scripts/build-font.py <in.ttf> <out.woff2>
import sys
from fontTools.subset import Subsetter, Options
from fontTools.ttLib import TTFont

src, dst = sys.argv[1:3]
f = TTFont(src)
for table in f['cmap'].tables:
    if not table.isUnicode():
        continue
    c = table.cmap
    for missing, like in {0x2212: 0x2d, 0x2013: 0x2d, 0x2019: 0x27}.items():  # minus and en dash as hyphen, ’ as '
        if missing not in c and like in c:
            c[missing] = c[like]
dot = f['glyf']['periodcentered']  # the font's · is one high pixel and reads like an apostrophe: make it 2×2 at mid-height
w, h, x0, y0 = dot.xMax - dot.xMin, dot.yMax - dot.yMin, dot.xMin, dot.yMin
dot.coordinates = type(dot.coordinates)([(1 + (x - x0) * 2 // w, 3 + (y - y0) * 2 // h) for x, y in dot.coordinates])
dot.recalcBounds(f['glyf'])
f['hmtx']['periodcentered'] = (4, 1)
opts = Options(); opts.layout_features = ['*']; opts.notdef_outline = True
s = Subsetter(opts); s.populate(unicodes=[*range(0x20, 0x7f), *range(0xa0, 0x100), 0x2212, 0x2013, 0x2019]); s.subset(f)
f.flavor = 'woff2'; f.save(dst)
