# -*- coding: utf-8 -*-
"""
修仙放置游戏 - 图片生成工具
生成 Logo、境界徽章、成就海报等
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from PIL import Image, ImageDraw, ImageFont
import os

# 输出目录
OUTPUT_DIR = r"E:\QClaw-Projects\cultivation-idle-game\generated_images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 颜色配置
COLORS = {
    "gold": (255, 215, 0),
    "blue": (74, 144, 226),
    "purple": (155, 89, 182),
    "red": (231, 76, 60),
    "green": (46, 204, 113),
    "cyan": (0, 206, 209),
    "orange": (255, 140, 0),
    "bg_dark": (26, 26, 46),
    "bg_card": (22, 33, 62),
    "text": (238, 238, 238),
    "text_dim": (170, 170, 170),
}

# 境界配置
REALMS = [
    {"name": "炼气境", "icon": "🌬️", "color": "cyan", "desc": "炼气入体，踏仙路"},
    {"name": "筑基境", "icon": "🏔️", "color": "green", "desc": "道基初铸，灵气化形"},
    {"name": "金丹境", "icon": "☀️", "color": "gold", "desc": "九转成丹，神识暴涨"},
    {"name": "元婴境", "icon": "👶", "color": "purple", "desc": "神魂出窍，第二生命"},
    {"name": "化神境", "icon": "⚡", "color": "orange", "desc": "羽化成仙，超脱凡尘"},
]


def hex_to_rgb(hex_color):
    """#RRGGBB 转 RGB"""
    h = hex_color.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def create_gradient(width, height, color1, color2, direction="vertical"):
    """创建渐变背景"""
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    
    if direction == "vertical":
        for y in range(height):
            ratio = y / height
            r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
            g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
            b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
            draw.line([(0, y), (width, y)], fill=(r, g, b))
    else:
        for x in range(width):
            ratio = x / width
            r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
            g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
            b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
            draw.line([(x, 0), (x, height)], fill=(r, g, b))
    
    return img


def rounded_rectangle(draw, xy, radius, fill, outline=None):
    """画圆角矩形"""
    x1, y1, x2, y2 = xy
    
    # 画主体矩形
    draw.rectangle([x1 + radius, y1, x2 - radius, y2], fill=fill, outline=outline)
    draw.rectangle([x1, y1 + radius, x2, y2 - radius], fill=fill, outline=outline)
    
    # 画四个角
    draw.pieslice([x1, y1, x1 + 2*radius, y1 + 2*radius], 180, 270, fill=fill, outline=outline)
    draw.pieslice([x2 - 2*radius, y1, x2, y1 + 2*radius], 270, 360, fill=fill, outline=outline)
    draw.pieslice([x1, y2 - 2*radius, x1 + 2*radius, y2], 90, 180, fill=fill, outline=outline)
    draw.pieslice([x2 - 2*radius, y2 - 2*radius, x2, y2], 0, 90, fill=fill, outline=outline)


def generate_logo():
    """生成游戏 Logo"""
    print("🎮 生成游戏 Logo...")
    
    width, height = 512, 512
    bg = create_gradient(width, height, COLORS["bg_dark"], (15, 15, 35), "vertical")
    draw = ImageDraw.Draw(bg)
    
    # 外圈装饰
    draw.ellipse([30, 30, 482, 482], outline=COLORS["gold"], width=3)
    draw.ellipse([40, 40, 472, 472], outline=COLORS["gold"], width=1)
    
    # 内圈光晕
    for i in range(5):
        alpha = 50 - i * 10
        r = 180 - i * 15
        draw.ellipse([256-r, 256-r, 256+r, 256+r], outline=(255, 215, 0, alpha))
    
    # 太极图案
    cx, cy = 256, 220
    r1 = 80
    
    # 阳鱼
    draw.ellipse([cx-r1, cy-r1, cx+r1, cy+r1], fill=COLORS["gold"])
    # 阴鱼眼
    draw.ellipse([cx-20, cy-20, cx+20, cy+20], fill=COLORS["bg_dark"])
    
    # 阴鱼
    cy2 = 310
    draw.ellipse([cx-r1, cy2-r1, cx+r1, cy2+r1], fill=COLORS["purple"])
    # 阳鱼眼
    draw.ellipse([cx-20, cy2-20, cx+20, cy2+20], fill=COLORS["bg_card"])
    
    # 分界线
    draw.arc([cx-r1, cy-r1, cx+r1, cy+r1], 0, 180, fill=COLORS["text"], width=2)
    draw.arc([cx-r1, cy2-r1, cx+r1, cy2+r1], 180, 360, fill=COLORS["text"], width=2)
    
    # 标题文字
    try:
        title_font = ImageFont.truetype("msyh.ttc", 48)
        subtitle_font = ImageFont.truetype("msyh.ttc", 24)
        desc_font = ImageFont.truetype("msyh.ttc", 18)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        desc_font = ImageFont.load_default()
    
    # 主标题
    draw.text((256, 380), "修仙放置", font=title_font, fill=COLORS["gold"], anchor="mm")
    draw.text((256, 435), "CULTIVATION IDLE", font=subtitle_font, fill=COLORS["text"], anchor="mm")
    draw.text((256, 470), "放置修仙 · 羽化成仙", font=desc_font, fill=COLORS["text_dim"], anchor="mm")
    
    # 保存
    path = os.path.join(OUTPUT_DIR, "game_logo.png")
    bg.save(path, "PNG")
    print(f"  ✅ 已保存: {path}")
    return path


def generate_realm_badge(realm):
    """生成境界徽章"""
    print(f"🏆 生成境界徽章: {realm['name']}...")
    
    width, height = 400, 400
    bg = create_gradient(width, height, COLORS["bg_dark"], COLORS["bg_card"], "vertical")
    draw = ImageDraw.Draw(bg)
    
    color = COLORS[realm["color"]]
    
    # 外圈光环
    for i in range(8, 0, -1):
        alpha = 30 - i * 3
        r = 170 - i * 5
        draw.ellipse([200-r, 200-r, 200+r, 200+r], outline=(*color, max(0, alpha)))
    
    # 主圆形
    draw.ellipse([50, 50, 350, 350], fill=color)
    draw.ellipse([60, 60, 340, 340], fill=COLORS["bg_dark"])
    draw.ellipse([70, 70, 330, 330], fill=(*color, 50), outline=color, width=2)
    
    # 境界图标（用文字模拟）
    icon = realm["icon"]
    try:
        icon_font = ImageFont.truetype("seguiemj.ttf", 120)
    except:
        icon_font = ImageFont.load_default()
    
    draw.text((200, 160), icon, font=icon_font, fill=color, anchor="mm")
    
    # 境界名称
    try:
        name_font = ImageFont.truetype("msyh.ttc", 42)
        desc_font = ImageFont.truetype("msyh.ttc", 20)
    except:
        name_font = ImageFont.load_default()
        desc_font = ImageFont.load_default()
    
    draw.text((200, 320), realm["name"], font=name_font, fill=COLORS["text"], anchor="mm")
    draw.text((200, 360), realm["desc"], font=desc_font, fill=COLORS["text_dim"], anchor="mm")
    
    # 保存
    filename = f"realm_{realm['name'].replace('境', '')}.png"
    path = os.path.join(OUTPUT_DIR, filename)
    bg.save(path, "PNG")
    print(f"  ✅ 已保存: {path}")
    return path


def generate_achievement_poster(achievement_name, achievement_desc, reward):
    """生成成就海报"""
    print(f"🎖️ 生成成就海报: {achievement_name}...")
    
    width, height = 600, 800
    bg = create_gradient(width, height, COLORS["bg_dark"], (25, 25, 55), "vertical")
    draw = ImageDraw.Draw(bg)
    
    # 顶部装饰
    draw.ellipse([150, -50, 450, 250], fill=COLORS["gold"])
    draw.ellipse([170, -30, 430, 230], fill=COLORS["bg_dark"])
    
    # 星星装饰
    for i, (x, y) in enumerate([(80, 100), (520, 100), (100, 300), (500, 300)]):
        draw.ellipse([x-5, y-5, x+5, y+5], fill=COLORS["gold"])
    
    # 成就边框
    rounded_rectangle(draw, [50, 250, 550, 720], 20, COLORS["bg_card"], COLORS["gold"])
    rounded_rectangle(draw, [60, 260, 540, 710], 15, COLORS["bg_dark"])
    
    # 成就图标
    try:
        trophy_font = ImageFont.truetype("seguiemj.ttf", 80)
        title_font = ImageFont.truetype("msyh.ttc", 36)
        desc_font = ImageFont.truetype("msyh.ttc", 22)
        reward_font = ImageFont.truetype("msyh.ttc", 20)
    except:
        trophy_font = ImageFont.load_default()
        title_font = ImageFont.load_default()
        desc_font = ImageFont.load_default()
        reward_font = ImageFont.load_default()
    
    # 奖杯图标
    draw.text((300, 320), "🏆", font=trophy_font, fill=COLORS["gold"], anchor="mm")
    
    # 标题
    draw.text((300, 420), "成就解锁", font=title_font, fill=COLORS["gold"], anchor="mm")
    
    # 成就名称
    draw.text((300, 490), achievement_name, font=title_font, fill=COLORS["text"], anchor="mm")
    
    # 成就描述
    draw.text((300, 550), achievement_desc, font=desc_font, fill=COLORS["text_dim"], anchor="mm")
    
    # 奖励
    draw.text((300, 620), f"奖励: {reward}", font=reward_font, fill=COLORS["green"], anchor="mm")
    
    # 底部游戏名
    draw.text((300, 750), "修仙放置游戏", font=desc_font, fill=COLORS["text_dim"], anchor="mm")
    
    # 保存
    filename = f"achievement_{achievement_name}.png"
    path = os.path.join(OUTPUT_DIR, filename)
    bg.save(path, "PNG")
    print(f"  ✅ 已保存: {path}")
    return path


def generate_share_card(realm_name, cultivation, spirit_stones, days):
    """生成分享卡片"""
    print(f"📱 生成分享卡片...")
    
    width, height = 600, 900
    bg = create_gradient(width, height, COLORS["bg_dark"], COLORS["bg_card"], "vertical")
    draw = ImageDraw.Draw(bg)
    
    # 顶部装饰光晕
    for i in range(10, 0, -1):
        alpha = 20 - i * 2
        r = 250 - i * 10
        draw.ellipse([300-r, 100-r, 300+r, 100+r], outline=(*COLORS["gold"], max(0, alpha)))
    
    # 主圆圈
    draw.ellipse([150, 30, 450, 330], fill=COLORS["purple"])
    draw.ellipse([165, 45, 435, 315], fill=COLORS["bg_dark"])
    
    # 境界图标
    realm_icon = "⚡"
    for r in REALMS:
        if r["name"] == realm_name:
            realm_icon = r["icon"]
            break
    
    try:
        icon_font = ImageFont.truetype("seguiemj.ttf", 100)
        title_font = ImageFont.truetype("msyh.ttc", 40)
        stat_font = ImageFont.truetype("msyh.ttc", 26)
        small_font = ImageFont.truetype("msyh.ttc", 20)
    except:
        icon_font = ImageFont.load_default()
        title_font = ImageFont.load_default()
        stat_font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    draw.text((300, 165), realm_icon, font=icon_font, fill=COLORS["gold"], anchor="mm")
    
    # 境界名
    draw.text((300, 380), realm_name, font=title_font, fill=COLORS["text"], anchor="mm")
    
    # 统计信息卡片
    rounded_rectangle(draw, [50, 420, 550, 600], 15, COLORS["bg_card"])
    
    stats = [
        ("📈 修为", format_num(cultivation)),
        ("💎 灵石", format_num(spirit_stones)),
        ("⏰ 修仙时长", f"{days} 天"),
    ]
    
    for i, (label, value) in enumerate(stats):
        y = 470 + i * 40
        draw.text((100, y), label, font=stat_font, fill=COLORS["text_dim"])
        draw.text((500, y), value, font=stat_font, fill=COLORS["gold"], anchor="rm")
    
    # 底部二维码占位
    draw.rectangle([225, 630, 375, 780], outline=COLORS["text_dim"], width=2)
    draw.text((300, 705), "扫码游玩", font=small_font, fill=COLORS["text_dim"], anchor="mm")
    
    # 游戏名
    draw.text((300, 850), "修仙放置游戏 v0.9", font=small_font, fill=COLORS["text_dim"], anchor="mm")
    draw.text((300, 875), "3308478445.github.io/cultivation-idle-game", font=small_font, fill=COLORS["blue"], anchor="mm")
    
    # 保存
    path = os.path.join(OUTPUT_DIR, "share_card.png")
    bg.save(path, "PNG")
    print(f"  ✅ 已保存: {path}")
    return path


def format_num(n):
    """格式化数字"""
    if n >= 100000000:
        return f"{n/100000000:.1f}亿"
    elif n >= 10000:
        return f"{n/10000:.1f}万"
    else:
        return str(n)


def main():
    print("=" * 50)
    print("🎮 修仙放置游戏 - 图片生成工具")
    print("=" * 50)
    
    # 生成 Logo
    generate_logo()
    print()
    
    # 生成境界徽章
    print("-" * 30)
    for realm in REALMS:
        generate_realm_badge(realm)
    print()
    
    # 生成成就海报示例
    print("-" * 30)
    generate_achievement_poster(
        "金丹初成",
        "突破至金丹境，九转丹成",
        "300 灵石 + 神秘功法"
    )
    generate_achievement_poster(
        "羽化成仙",
        "渡劫成功，化神飞升",
        "1000 灵石 + 神器碎片"
    )
    print()
    
    # 生成分享卡片示例
    print("-" * 30)
    generate_share_card("金丹境", 123456789, 88888, 66)
    print()
    
    print("=" * 50)
    print("🎉 所有图片生成完成！")
    print(f"📁 输出目录: {OUTPUT_DIR}")
    print("=" * 50)
    
    # 返回生成的文件列表
    files = [f for f in os.listdir(OUTPUT_DIR) if f.endswith('.png')]
    for f in sorted(files):
        print(f"  📷 {f}")


if __name__ == "__main__":
    main()
