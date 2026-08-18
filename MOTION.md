# MOTION V3 — "Bản in đang được in ra" (Phase 2)

Cảm giác tổng: sang trọng, thong thả có chủ đích — như lật một cuốn tạp chí dày, mực còn
thơm. Khối lớn 0.6–1s; micro-interaction vẫn nhanh 0.15–0.3s. Stagger thưa. Agent thực thi
load `transitions-dev` + `transitions-polish` để align token khi spec không nói cụ thể.
`prefers-reduced-motion`: tắt Lenis/parallax/typewriter/shimmer, mọi reveal thành fade 150ms,
số hiện thẳng giá trị cuối, Fig hiện full-drawn.

## Kiến trúc
- `src/animations/index.js` init: lenis → cover (boot) → khi cover xong: reveals, rules,
  odometer, stack, parallax, figs, cursor, running-head, foil
- Mỗi module 1 file. ScrollTrigger + Lenis pattern chuẩn. `ScrollTrigger.refresh()` sau
  `document.fonts.ready`. Failsafe cover 2.5s.

## 1. Cover mở màn (một cảnh liền mạch, KHÔNG màn che riêng)
1. Nền giấy hiện sẵn. Masthead `THE PERFORMANCE ISSUE — № 01 / 2026` gõ **typewriter**
   (caret mảnh, ~28ms/ký tự, âm sắc đều — không random quá đà)
2. Thước kẻ đôi dưới masthead **tự vẽ** scaleX 0→1, 0.7s `power3.inOut`
3. Title `NGUYỄN MINH ĐIỀN` dựng từng dòng bằng **ink-reveal**: clip-path inset từ dưới +
   blur(6px)→0 + y 24px→0, 0.9s/dòng, stagger 0.12s — cảm giác mực thấm lên giấy
4. Cover line italic + 3 cover lines phụ: fade-up nhẹ sau title 0.2s
5. Progress `đang in… %` mono đếm theo tải thật (min 1.2s, max 2.5s) rồi fade
6. Kết: **một hairline gold quét ngang màn** 140ms duy nhất (dấu "máy in chạy xong") —
   không shutter, không che phủ

## 2. Từ vựng reveal dùng toàn trang
- `data-ink-reveal`: clip-path inset(100% 0 0 0)→0 + blur 6→0 + y 24→0, 0.8s `power3.out`,
  1 lần, trigger 78% viewport. Headline serif dùng cái này — KHÔNG split từng chữ
  (giữ nguyên chữ tiếng Việt, tránh vỡ dấu, và khác hẳn vibe bản cũ)
- `data-rule-draw`: thước kẻ đôi scaleX 0→1 từ trái, 0.7s, kèm khoảng delay 60ms giữa 2 nét
- `data-type`: typewriter cho caption/mono nhỏ (chỉ chạy khi vào view, ≤40 ký tự)
- Body/đoạn: fade-up 0.6s dịu, stagger 0.1s — thưa, sang
- Drop cap: hiện cùng đoạn nhưng thêm scale 0.92→1 + gold từ từ đậm (0.9s)

## 3. Mục lục
- Từng dòng: fade-up stagger 0.08s; **leader dots vẽ dần** (mask width 0→100%) sau khi
  dòng hiện, 0.5s; số trang cuối cùng mới hiện (nhịp: tên → chấm chấm chạy → số)
- Hover: tên nghiêng italic (variation/font-style transition qua opacity swap 0.2s),
  số trang đổi gold, translate-x 6px cả dòng 0.25s
- Click: Lenis scrollTo anchor 1.2s `power3.inOut`

## 4. Numbers — odometer thanh lịch
- Mỗi hàng: thước kẻ đôi vẽ trước, số **đếm lên kiểu odometer** 1.6s `power2.out`
  (snap số nguyên, tabular-nums; 04/05 giữ pad 2 chữ số), đơn vị gold fade sau 0.25s,
  chú thích VN fade-up cuối
- Stagger giữa 4 hàng 0.15s. Chỉ chạy 1 lần

## 5. Playbook
- Số La Mã gold: ink-reveal; tên bước small-caps: fade-up; hàng hover: nền `--paper-deep`
  lan từ trái (scaleX origin left 0.3s) + số La Mã nhích 4px

## 6. Channels — sticky-stack "lật chương" (desktop ≥1024px)
- Mỗi `.stack__card` pin chồng: thẻ sau trượt từ dưới đè lên thẻ trước (translateY 100%→0
  scrub), thẻ trước bị đè thì scale 0.97 + dim nhẹ (brightness .96) — cảm giác chồng trang giấy
- Tên kênh serif của thẻ đang vào: ink-reveal khi thẻ chiếm ≥50% viewport
- Mobile/tablet: không pin — thẻ dọc thường, fade-up
- `gsap.matchMedia`, `invalidateOnRefresh`, resize hai chiều phải sạch

## 7. Case Files + Fig draw-on
- Header mono `CASE FILE Nº 0x`: typewriter ngắn; tít serif: ink-reveal; 3 cột: fade-up
  stagger 0.1s
- **Fig. 01–03 draw-on** khi plate vào 75% viewport, 1 lần, 1.2–1.6s:
  - Fig 01: grid hairline fade → area SPEND wipe scaleX trái→phải (gold nhạt .16) →
    line ROAS stroke-dash vẽ ngang → labels fade
  - Fig 02: cột scaleY mọc từ 0 stagger 0.06s → line share vẽ → label `0%` + `TIKTOK SHARE ↗`
  - Fig 03: khung wireframe vẽ nét (dash) → 4 khối số fade → sparkline vẽ stagger 0.12s →
    donut arc quét → chấm LIVE bắt đầu pulse 2.4s sine vô hạn
- Corner marks (✕ 4 góc plate): vẽ 4 nét nhỏ 0.3s trước khi Fig chạy — chi tiết "dập khuôn in"
- Plate parallax `data-parallax`: hình trôi ±6% scrub, chỉ desktop

## 8. Pull Quote (spread mực)
- Nền ink phủ bằng **wipe dọc từ trên** (clip-path 0.9s `power3.inOut`) khi section vào
- Ngoặc kép gold khổng lồ: scale 0.9→1 + fade 0.8s; câu quote: ink-reveal từng DÒNG
  (0.9s, stagger 0.15s); tên tác giả mono: typewriter cuối

## 9. Back Cover
- Headline ink-reveal; email display: fade-up + hairline gold dưới email **vẽ** khi vào;
  colophon 2 cột: fade-up stagger 0.12s
- Hover email: **foil shimmer** — gradient sweep gold chạy qua chữ đúng 1 lần 0.8s
  (background-clip:text, không lặp vô hạn), underline dày lên

## 10. Foil shimmer (dùng chung, RẤT tiết chế)
- Chỉ trên: email contact, số trang mục lục hover, đơn vị gold ở Numbers (1 lần khi
  odometer xong). Sweep 0.8s, 1 lần/lần hover — không bao giờ loop

## 11. Cursor "ĐỌC" (desktop pointer:fine)
- Mặc định: chấm mực 6px `--ink`, theo chuột lerp 0.14, không vòng ngoài
- Hover element tương tác (a, button, .toc__row, .case, email): chấm nở thành **vòng mảnh
  36px chứa chữ "ĐỌC" serif italic 10px** xoay -8°, 0.25s `back.out(1.4)`; rời ra thu về chấm
- Trên spread ink (Quote): chấm/vòng đổi sang giấy. Ẩn hoàn toàn touch device
- KHÔNG magnetic (khác bản cũ)

## 12. Toàn cục
- Running head: đổi tên section theo scroll (scroll-spy qua ScrollTrigger), đổi bằng
  swap fade 0.25s; folio số trang đổi cùng nhịp (001→006)
- Quầng sáng gold hero: scale thở 1↔1.04, opacity .05↔.07, 12s sine yoyo vô hạn — pause khi
  tab ẩn
- KHÔNG scroll progress bar (bản cũ có — bỏ, tạp chí không cần)
- Lenis lerp 0.09 (nặng tay hơn chút — chất giấy dày), anchor 1.2s
- Không animation chạy lại khi scroll ngược (trừ parallax/scrub/pulse)

## QA Phase 2
1. 60fps (chỉ transform/opacity/clip-path/stroke-dash; blur chỉ lúc reveal, không blur scrub)
2. reduced-motion đầy đủ như đầu file
3. Refresh giữa trang + resize desktop↔mobile: stack/trigger sạch (matchMedia revert)
4. Typewriter không vỡ dấu tiếng Việt (gõ theo ký tự đã compose NFC, không tách dấu)
5. `npm run build` pass, console sạch
