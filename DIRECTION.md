# V3 — DIRECTION: "THE PERFORMANCE ISSUE" (tạp chí cao cấp)

Bản thiết kế mới hoàn toàn — không kế thừa quyết định thị giác nào từ các bản trước.
Concept: portfolio là **một số tạp chí in cao cấp viết về Nguyễn Minh Điền** — kiểu cover
story trên tạp chí kinh doanh xa xỉ (chất Fortune cover story × tạp chí thời trang cao cấp).
Người xem là CEO: ấn tượng đến từ sự SANG TRỌNG CÓ HỆ THỐNG — trang trí giàu nhưng mọi chi
tiết đều là "đồ nghề" của tạp chí thật (mục lục, số trang, chú thích hình, thước kẻ đôi),
không phải hoa lá vô nghĩa.

Ba từ khóa: **LUXURIOUS · EDITORIAL · CRAFTED**. Cấm tuyệt đối: glassmorphism, gradient tím,
particle, stock photo, emoji, template-look.

## Tokens

```css
--paper:      #F7F3EA;  /* giấy ngà ấm — không trắng gắt */
--paper-deep: #EFE7D7;  /* giấy trầm cho spread xen kẽ */
--ink:        #1A1713;  /* mực ấm, không #000 */
--ink-soft:   #6B6459;
--gold:       #A98136;  /* vàng foil — chỉ cho chữ LỚN, nét trang trí, drop cap */
--gold-deep:  #7A5A1E;  /* vàng trầm — cho chữ nhỏ/label cần đạt AA trên giấy */
--line:       rgba(26,23,19,.16);
--radius: 0;            /* vuông tuyệt đối — chất bản in */
```

- Trang trí đặc trưng: **thước kẻ đôi** (double rule — 2 hairline cách nhau 3px) mở đầu mỗi
  section; **corner marks** (dấu góc crop-mark ✕ 4 góc các "plate" hình); nền giấy có
  texture noise mịn .03 + vết gân giấy rất nhẹ.
- Đảo nền 2 lần có chủ đích: spread Quote nền `--ink` chữ giấy; Numbers dùng `--paper-deep`.
- Vàng gold xuất hiện ~5% diện tích — foil chứ không phải sơn tràn.

## Typography (bắt buộc hỗ trợ tiếng Việt — verify chữ "Điền, nghề, tăng trưởng")

- **Display: Fraunces** (Google Fonts, subset latin+vietnamese, weight 400–600, DÙNG NHIỀU
  italic — linh hồn của chất tạp chí). Fallback nếu thiếu glyph VN: Playfair Display → Lora.
- **Body: Be Vietnam Pro** 400/500, line-height 1.7, măng-sét đoạn đầu có **drop cap**
  Fraunces 3 dòng màu gold.
- **Meta/folio: IBM Plex Mono** 400 — số trang, chú thích hình, running head.
- Headline spread: `clamp(2.8rem, 8vw, 7.5rem)` Fraunces; kicker small-caps letterspaced.
- Nghệ thuật chữ: mix roman + *italic* trong cùng headline (1–2 từ nhấn italic gold).

## Cấu trúc trang — như lật một cuốn tạp chí (9 "spread")

1. **BÌA (preloader → cover, một thể liền)** — Nền giấy. Masthead nhỏ gõ dần kiểu máy chữ:
   `THE PERFORMANCE ISSUE — №01 / 2026`. Thước kẻ đôi tự vẽ ngang. Rồi title bìa serif
   khổng lồ dựng lên từng dòng: “NGUYỄN MINH ĐIỀN” + cover line italic:
   *“The man behind 15 billion a month”* + 3 cover lines nhỏ góc phải (như tít phụ bìa
   tạp chí: “Numbers first — trang 002”, “Bốn kênh, một quy trình — 004”, “Ba hồ sơ chiến
   dịch — 005”). Progress đọc là “đang in… %” mono góc dưới. Failsafe 2.5s. Bìa CHÍNH LÀ hero.
2. **MỤC LỤC — CONTENTS** — bảng mục lục thật: 6 dòng (Cover Story / Numbers / Playbook /
   Channels / Case Files / Contact), mỗi dòng: số thứ tự mono — tên serif — leader dots
   chấm chấm — “số trang” (002…006). Mỗi dòng là anchor nav thật. Hover: dòng nghiêng
   italic + số trang gold. Đây vừa là trang trí vừa là điều hướng chính.
3. **COVER STORY — 001 (Profile)** — spread mở bài: kicker small-caps, headline serif
   “Young enough to move fast. Trusted with *15B+*.”, body VN bắt đầu bằng drop cap gold,
   3 dòng định vị thành 3 “tít xen” (crosshead) có thước kẻ đôi. Cột phải: “chân dung”
   plate 3:4 có corner marks + chú thích mono `PLATE I — HCMC, 2026` (placeholder mỹ thuật:
   khối ink với chữ ký MĐ serif italic lớn — KHÔNG gradient cam kiểu cũ).
4. **NUMBERS — 002** — nền `--paper-deep`. Tiêu đề “Numbers don’t need adjectives.”
   4 con số dàn như **bảng biểu niên giám**: numeral serif KHỔNG LỒ (Fraunces, có thể
   old-style figures), đơn vị gold, chú thích VN mono phải; hàng ngăn bằng thước kẻ đôi.
   Số đếm lên khi vào view (odometer thanh lịch, không giật).
5. **PLAYBOOK — 003 (Method)** — “Big budgets don’t forgive guesswork.” 4 bước đánh số
   La Mã (I. II. III. IV.) serif gold + tên bước small-caps + 1 câu VN. Chất danh mục
   quy tắc trong tạp chí luật/tài chính cổ điển.
6. **CHANNELS — 004** — 4 kênh như 4 “chuyên mục” của tờ báo: mỗi mục 1 spread mini
   sticky-stack (thẻ sau trượt đè thẻ trước như lật trang): tên kênh serif cực lớn chiếm
   nửa trái (META. / TIKTOK. / DATA. / TEAM.), nửa phải body VN + 1 chỉ số mono gold
   + số trang folio góc. Cảm giác lật chương.
7. **CASE FILES — 005** — 3 hồ sơ như 3 bài feature: header mono `CASE FILE Nº 01 — META`,
   tít serif, 3 đoạn Bối cảnh/Cách làm/Kết quả, và **1 hình minh họa “Fig. 0x” ink-on-paper**
   (chart vẽ nét mực + fill gold nhạt, corner marks + caption mono). NGUYÊN TẮC GIỮ NGUYÊN:
   chart chỉ có hình dạng + label chữ (SPEND, ROAS, T1…T6, 0%…), KHÔNG số bịa; chỗ chờ số
   thật là gạch chân gold `.tbd`.
8. **PULL QUOTE — spread đảo mực** — nền `--ink`, dấu ngoặc kép serif gold khổng lồ, câu:
   “Chạy ads thì dễ. Chạy có lãi ở quy mô 15 tỷ mỗi tháng — đó mới là nghề.” chữ giấy,
   vài từ *italic gold*. Trang để chụp màn hình.
9. **BACK COVER — 006 (Contact)** — như bìa sau + colophon: “Let’s talk numbers.” serif,
   email cỡ display (mailto), LinkedIn/Zalo `.tbd`, rồi khối colophon mono nhỏ 2 cột:
   (Typefaces: Fraunces · Be Vietnam Pro · IBM Plex Mono / Printed digitally in HCMC /
   © 2026 Nguyễn Minh Điền). Chất "trang cuối tạp chí" — chi tiết khiến dân thiết kế gật gù.

Xuyên suốt: **running head** mono nhỏ sticky mép trên (tên issue trái — section hiện tại phải,
đổi theo scroll) + **folio số trang** mép dưới góc phải đếm theo section (001–006). Hai chi
tiết này thay thế header/nav truyền thống (vẫn giữ 1 nút menu mở mục lục overlay cho mobile
và truy cập nhanh).

## Ngôn ngữ chuyển động — "bản in đang được in ra"

- Từ vựng chính: **ink-wipe reveal** (chữ hiện như mực thấm — clip-path + blur nhẹ),
  **rule draw** (thước kẻ tự vẽ), **typewriter** (masthead, caption), **odometer serif**
  (numbers), **plate parallax** (hình trôi chậm trong khung), **page-lift** (sticky-stack
  channels), foil shimmer RẤT tiết chế trên chữ gold khi hover (gradient sweep 1 lần).
- Nhịp: thong thả sang trọng hơn bản cũ một bậc (0.6–1s cho khối lớn) nhưng micro-interaction
  vẫn nhanh (0.15–0.3s). Stagger thưa. KHÔNG dùng lại vũ khí chính bản cũ (word-mask stagger
  hàng loạt, shutter cam, cursor magnetic tròn).
- Cursor: chấm mực nhỏ + khi hover link biến thành **chữ “ĐỌC” serif italic** trong vòng
  mảnh (mang chất báo chí; desktop pointer:fine only).
- Lenis giữ làm hạ tầng. `prefers-reduced-motion` đầy đủ.

## Quy trình skill (thứ tự anh Điền chốt — mọi agent thực thi phải load theo thứ tự này)

1. `impeccable` → 2. `frontend-design` → 3. `design-taste-frontend` → 4. `ui-ux-pro-max`
→ 5. `transitions-dev` (+ `transitions-polish` khi audit)

## Kỹ thuật

- Vite vanilla JS + GSAP/ScrollTrigger + Lenis. Port dev **5175** (`strictPort: true`).
- Cấu trúc: `src/styles/{tokens,base,sections}.css`, `src/animations/*.js` từng module.
- Nội dung chữ: theo `CONTENT.md` trong folder này (đã điều chỉnh cho concept tạp chí).
  Giữ mọi đánh dấu TODO dạng comment HTML, hiển thị `.tbd` gạch gold.
- Nghiệm thu: build pass, console sạch, contrast AA (gold-deep cho chữ nhỏ trên giấy),
  tiếng Việt đúng dấu cả 3 font (soi "Điền, nghề, ầ ễ ộ ứ"), reduced-motion,
  375/768/1280, 60fps, semantic HTML + focus-visible.
