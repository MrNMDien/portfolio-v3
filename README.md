# Portfolio V3 — "The Performance Issue"

Portfolio dạng **tạp chí in cao cấp** về Nguyễn Minh Điền — Performance Marketing Leader.
Giấy ngà · mực ấm · vàng foil · serif Fraunces. Vite + GSAP/ScrollTrigger + Lenis.

## Chạy

```bash
npm install
npm run dev
```

Mở http://localhost:5175 (cổng cố định). Build: `npm run build` → `dist/`.

## Cấu trúc

| File | Vai trò |
|---|---|
| `DIRECTION.md` | Concept & design tokens — nguồn chân lý thiết kế |
| `CONTENT.md` | Toàn bộ nội dung chữ — sửa nội dung thì sửa ở đây trước |
| `MOTION.md` | Spec toàn bộ chuyển động |
| `index.html` | 9 spread: Bìa → Mục lục → Cover Story → Numbers → Playbook → Channels → Case Files → Pull Quote → Back Cover |
| `src/styles/` | tokens / base / sections / motion |
| `src/animations/` | 14 module: cover, reveals, contents, odometer, channels, figures, quote, backcover, foil, cursor, glow, lenis, core, index |

## Số liệu thật cần điền (giữ nguyên từ bản trước)

Tìm `<!-- TODO:` trong `index.html` (15 chỗ) — trên giao diện là gạch chân vàng `.tbd` (11 chỗ):
số năm chính xác · sĩ số team · 180+ tỷ/năm xác nhận · % ngân sách Meta · tốc độ test TikTok
· toàn bộ số 3 case · email cá nhân (đang tạm oad@ngocdung.com) · LinkedIn · Zalo · ảnh chân dung
(thay plate chữ ký MĐ ở Cover Story).

## Ba phiên bản đang tồn tại

| Bản | Folder | Cổng | Phong cách |
|---|---|---|---|
| v1 | `D:\Claude\Portfolio` | 5173 | Editorial cream/cam (DAS-inspired) |
| v2 | `D:\Claude\Portfolio-draft` | 5174 | v1 + charts + hero ROAS curve |
| **v3** | `D:\Claude\Portfolio-V3` | 5175 | **Tạp chí xa xỉ giấy/mực/vàng — bản mới nhất** |

## Deploy (khi chọn xong bản)

Đẩy folder bản chọn lên GitHub → Vercel (framework Vite, output `dist`) → gắn link CV/LinkedIn.
